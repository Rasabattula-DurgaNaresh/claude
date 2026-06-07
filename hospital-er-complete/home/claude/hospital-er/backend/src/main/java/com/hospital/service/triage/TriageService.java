package com.hospital.service.triage;

import com.hospital.dto.AdmitPatientRequest;
import com.hospital.entity.*;
import com.hospital.repository.*;
import com.hospital.service.bed.BedManagementService;
import com.hospital.service.notification.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

/**
 * CONCEPTS: PriorityBlockingQueue, ThreadLocal, AtomicInteger, volatile, CountDownLatch
 *
 * PriorityBlockingQueue:
 *   - Orders patients by TRIAGE LEVEL (1=Critical, 5=Non-urgent)
 *   - Thread-safe: multiple triage nurses add patients concurrently
 *   - BlockingQueue semantics: consumer threads BLOCK when empty (no spin-waste)
 *   - Priority ensures level-1 patients ALWAYS served before level-5
 *
 * ThreadLocal<AuditContext>:
 *   - Each triage thread carries its own audit trail
 *   - No parameter passing needed through the call stack
 *   - MUST be cleared in finally to prevent memory leak in pooled threads
 *
 * AtomicInteger counters:
 *   - patientsAdmitted, patientsProcessed: lock-free increment
 *   - Readable from any thread (metrics/dashboard)
 *
 * CountDownLatch:
 *   - ER startup: wait for all services (DB, beds, doctors) to be ready
 *   - All triage workers signal readiness before first patient accepted
 */
@Service @RequiredArgsConstructor @Slf4j
public class TriageService {

    private final AdmissionRepository admissionRepo;
    private final PatientRepository   patientRepo;
    private final DoctorRepository    doctorRepo;
    private final BedManagementService bedService;
    private final AlertService        alertService;

    @Qualifier("triagePool")
    private final Executor triagePool;

    @Value("${er.queues.triage-capacity:500}")
    private int triageQueueCapacity;

    /**
     * PriorityBlockingQueue: patients sorted by triageLevel (1=highest priority).
     * Comparator: lower level = higher priority = served first.
     */
    private PriorityBlockingQueue<AdmissionTask> triageQueue;

    // volatile: written by shutdown(), read by consumer loops
    private volatile boolean accepting = false;

    // AtomicInteger: lock-free, readable from any thread
    private final AtomicInteger patientsAdmitted   = new AtomicInteger(0);
    private final AtomicInteger patientsProcessed  = new AtomicInteger(0);
    private final AtomicInteger criticalInQueue     = new AtomicInteger(0);

    // ConcurrentHashMap: active admissions in memory (fast lookup)
    private final ConcurrentHashMap<Long, AdmissionTask> activeAdmissions = new ConcurrentHashMap<>();

    // ThreadLocal: per-triage-thread audit context
    private static final ThreadLocal<TriageContext> TRIAGE_CTX =
        ThreadLocal.withInitial(() -> new TriageContext());

    // CountDownLatch: startup gate — ensures ER ready before accepting patients
    private CountDownLatch startupLatch;

    @PostConstruct
    public void startTriageSystem() throws InterruptedException {
        triageQueue = new PriorityBlockingQueue<>(
            triageQueueCapacity,
            Comparator.comparingInt(AdmissionTask::triageLevel)  // 1 first
                      .thenComparing(AdmissionTask::arrivalTime) // FIFO within same level
        );

        int workers = Runtime.getRuntime().availableProcessors() / 2;
        startupLatch = new CountDownLatch(workers);
        accepting = true;

        // Start consumer threads
        for (int i = 0; i < workers; i++) {
            triagePool.execute(this::triageWorkerLoop);
        }

        // Wait for all workers to start (CountDownLatch)
        boolean ready = startupLatch.await(15, TimeUnit.SECONDS);
        log.info("[Triage] System {} — {} workers running", ready ? "READY" : "PARTIAL_STARTUP", workers);
    }

    /**
     * Consumer loop — runs on each triage worker thread.
     * PriorityBlockingQueue.take() blocks when queue empty — zero CPU waste.
     */
    private void triageWorkerLoop() {
        TriageContext ctx = TRIAGE_CTX.get();
        ctx.threadName = Thread.currentThread().getName();
        startupLatch.countDown();  // Signal: this thread is ready

        log.info("[{}] Triage worker started", ctx.threadName);

        while (accepting || !triageQueue.isEmpty()) {
            try {
                // take() BLOCKS until a patient arrives — efficient wait
                AdmissionTask task = triageQueue.poll(500, TimeUnit.MILLISECONDS);
                if (task == null) continue;

                ctx.patientsHandled++;
                ctx.currentPatient = task.admissionRef();
                long startNs = System.nanoTime();

                processTriage(task, ctx);

                long latencyMs = (System.nanoTime() - startNs) / 1_000_000;
                ctx.totalLatencyMs += latencyMs;
                patientsProcessed.incrementAndGet();

                if (task.triageLevel() == 1) criticalInQueue.decrementAndGet();

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("[{}] Triage processing error: {}", TRIAGE_CTX.get().threadName, e.getMessage(), e);
            }
        }

        log.info("[{}] Stopping — processed {} patients, avg {}ms",
            ctx.threadName, ctx.patientsHandled,
            ctx.patientsHandled > 0 ? ctx.totalLatencyMs / ctx.patientsHandled : 0);
        TRIAGE_CTX.remove();  // CRITICAL: prevent memory leak in thread pools
    }

    @Transactional
    private void processTriage(AdmissionTask task, TriageContext ctx) {
        // Update admission status
        admissionRepo.findByAdmissionRef(task.admissionRef()).ifPresent(adm -> {
            adm.setStatus("IN_TRIAGE");
            adm.setTriageTime(LocalDateTime.now());
            adm.setProcessingThread(ctx.threadName);
            admissionRepo.save(adm);

            activeAdmissions.put(adm.getAdmissionId(), task);

            // Auto-trigger critical alert for level 1
            if (task.triageLevel() == 1) {
                alertService.triggerAlert(
                    adm.getAdmissionId(), adm.getPatientId(),
                    "CODE_CRITICAL", "CRITICAL",
                    "IMMEDIATE ATTENTION: " + task.patientName() + " — " + task.chiefComplaint(),
                    ctx.threadName
                );
            }

            // Assign bed based on triage level
            String ward = switch (task.triageLevel()) {
                case 1 -> "CRITICAL";
                case 2 -> "TRAUMA";
                case 3 -> "GENERAL";
                default -> "GENERAL";
            };
            bedService.assignBed(adm.getAdmissionId(), adm.getPatientId(), ward);

            log.info("[{}] Triaged: {} Level-{} → {}", ctx.threadName,
                task.patientName(), task.triageLevel(), ward);
        });
    }

    /**
     * Admit patient — adds to PriorityBlockingQueue.
     * Called from REST thread; queue ensures FIFO within same priority.
     * @Async: runs on triagePool, REST thread returns immediately.
     */
    @Async("triagePool")
    @Transactional
    public void admitPatient(AdmitPatientRequest req) {
        // Create/find patient
        Patient patient = patientRepo.findByMrn(req.getMrn())
            .orElseGet(() -> patientRepo.save(Patient.builder()
                .mrn(req.getMrn())
                .fullName(req.getFullName())
                .dateOfBirth(req.getDateOfBirth())
                .gender(req.getGender())
                .bloodType(req.getBloodType())
                .contactPhone(req.getContactPhone())
                .allergies(req.getAllergies())
                .chronicConditions(req.getChronicConditions())
                .createdAt(LocalDateTime.now())
                .build()));

        String ref = "ER" + String.format("%06d", patientsAdmitted.incrementAndGet())
                   + LocalDateTime.now().getYear() % 100;

        Admission adm = Admission.builder()
            .admissionRef(ref)
            .patientId(patient.getPatientId())
            .chiefComplaint(req.getChiefComplaint())
            .triageLevel(req.getTriageLevel())
            .status("WAITING_TRIAGE")
            .arrivalTime(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        adm = admissionRepo.save(adm);

        // Add to priority queue — immediate for level 1
        AdmissionTask task = new AdmissionTask(
            adm.getAdmissionId(), ref, patient.getPatientId(),
            patient.getFullName(), req.getChiefComplaint(),
            req.getTriageLevel(), adm.getArrivalTime()
        );

        boolean queued = triageQueue.offer(task);
        if (!queued) {
            adm.setStatus("WAITING_TRIAGE");
            admissionRepo.save(adm);
            log.warn("[Triage] Queue full! Patient {} waiting in overflow", ref);
        }

        if (req.getTriageLevel() == 1) criticalInQueue.incrementAndGet();

        log.info("[Triage] Admitted: {} {} Level-{} | Queue size: {}",
            ref, patient.getFullName(), req.getTriageLevel(), triageQueue.size());
    }

    public Map<String, Object> getQueueStats() {
        return Map.of(
            "queueSize",       triageQueue.size(),
            "admitted",        patientsAdmitted.get(),
            "processed",       patientsProcessed.get(),
            "criticalInQueue", criticalInQueue.get(),
            "accepting",       accepting,
            "activeAdmissions",activeAdmissions.size()
        );
    }

    @PreDestroy
    public void shutdown() {
        log.info("[Triage] Shutting down — {} patients in queue", triageQueue.size());
        accepting = false;
    }

    /** Per-thread context stored in ThreadLocal */
    private static class TriageContext {
        String threadName;
        String currentPatient;
        int    patientsHandled = 0;
        long   totalLatencyMs  = 0;
    }

    /** Priority queue element — implements Comparable via PBQ comparator */
    public record AdmissionTask(
        Long admissionId, String admissionRef, Long patientId,
        String patientName, String chiefComplaint,
        int triageLevel, java.time.LocalDateTime arrivalTime
    ) {}
}