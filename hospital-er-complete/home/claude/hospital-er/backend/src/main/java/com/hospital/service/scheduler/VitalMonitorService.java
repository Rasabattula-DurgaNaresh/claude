package com.hospital.service.scheduler;

import com.hospital.entity.*;
import com.hospital.repository.*;
import com.hospital.service.notification.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * CONCEPTS: ScheduledExecutorService, Phaser, AtomicLong, ForkJoinPool
 *
 * ScheduledExecutorService:
 *   - scheduleAtFixedRate: vitals check every 3 seconds regardless of processing time
 *   - If processing takes > 3s, next run is scheduled from initial delay (no overlap)
 *   - Multiple scheduled tasks: vitals, sepsis screen, discharge check
 *
 * Phaser for patient discharge coordination:
 *   - Phase 0: Verify all pending labs completed
 *   - Phase 1: Generate discharge summary
 *   - Phase 2: Notify family / insurance
 *   - Phase 3: Release bed
 *   - All stages must complete before discharge is confirmed
 *
 * ForkJoinPool for parallel statistics:
 *   - RecursiveTask splits admission list for parallel P&L-like aggregation
 */
@Service @RequiredArgsConstructor @Slf4j
public class VitalMonitorService {

    private final VitalSignRepository  vitalRepo;
    private final AdmissionRepository  admissionRepo;
    private final AlertService         alertService;

    @Qualifier("vitalMonitorPool")
    private final ScheduledExecutorService monitorPool;

    @Qualifier("statsForkJoinPool")
    private final ForkJoinPool forkJoinPool;

    @Qualifier("dischargePool")
    private final ExecutorService dischargePool;

    @Value("${er.timings.vital-check-interval-ms:3000}")
    private long vitalCheckIntervalMs;

    private final AtomicLong vitalsRecorded  = new AtomicLong(0);
    private final AtomicLong alertsTriggered = new AtomicLong(0);
    private final AtomicLong dischargesCompleted = new AtomicLong(0);

    private final Random rng = new Random();

    @PostConstruct
    public void startMonitoring() {
        // ScheduledExecutorService.scheduleAtFixedRate: fixed clock interval
        // Vitals check every 3 seconds
        monitorPool.scheduleAtFixedRate(
            this::checkAllVitals, 5000, vitalCheckIntervalMs, TimeUnit.MILLISECONDS);

        // Sepsis screening every 30 seconds
        monitorPool.scheduleAtFixedRate(
            this::screenForSepsis, 15000, 30000, TimeUnit.MILLISECONDS);

        // Discharge eligibility check every 60 seconds
        monitorPool.scheduleAtFixedRate(
            this::checkDischargeEligibility, 30000, 60000, TimeUnit.MILLISECONDS);

        log.info("[VitalMonitor] Started: vitals={}ms, sepsis=30s, discharge=60s", vitalCheckIntervalMs);
    }

    /**
     * Generate and check vitals for all active patients.
     * Runs on vitalMonitorPool thread — separate from REST/triage threads.
     */
    private void checkAllVitals() {
        List<Admission> active = admissionRepo.findActiveAdmissions();
        if (active.isEmpty()) return;

        for (Admission adm : active) {
            try {
                VitalSign vital = generateVitals(adm);
                boolean isCritical = vital.getIsCritical() == 1;

                if (isCritical) {
                    alertsTriggered.incrementAndGet();
                    String msg = buildCriticalMessage(vital);
                    alertService.triggerAlert(
                        adm.getAdmissionId(), adm.getPatientId(),
                        "CRITICAL_VITALS", "CRITICAL",
                        msg, "VitalMonitor-" + Thread.currentThread().getName()
                    );
                }
                vitalsRecorded.incrementAndGet();
            } catch (Exception e) {
                log.error("[VitalMonitor] Error checking vitals for admission {}: {}",
                    adm.getAdmissionId(), e.getMessage());
            }
        }
    }

    @Transactional
    private VitalSign generateVitals(Admission adm) {
        // Simulate vitals with occasional critical values
        double hr    = 60 + rng.nextGaussian() * 20;  // normal: 60-100
        double sbp   = 120 + rng.nextGaussian() * 25; // normal: 90-140
        double dbp   = 80  + rng.nextGaussian() * 15;
        double temp  = 37.0 + rng.nextGaussian() * 0.8;
        double spo2  = 97  - Math.abs(rng.nextGaussian() * 3);
        double rr    = 16  + rng.nextGaussian() * 4;

        // Critical if triage level 1 — more likely to have bad vitals
        if (adm.getTriageLevel() != null && adm.getTriageLevel() <= 2 && rng.nextDouble() < 0.3) {
            hr   = rng.nextBoolean() ? 30 + rng.nextInt(30) : 150 + rng.nextInt(50);
            sbp  = rng.nextBoolean() ? 60 + rng.nextInt(30) : 200 + rng.nextInt(50);
            spo2 = 80 + rng.nextInt(12);
        }

        boolean isCritical = hr < 40 || hr > 160 || sbp < 80 || sbp > 200
                          || spo2 < 88 || temp > 40.0 || temp < 35.0;

        VitalSign vs = VitalSign.builder()
            .admissionId(adm.getAdmissionId())
            .patientId(adm.getPatientId())
            .heartRate(Math.round(hr * 10.0) / 10.0)
            .bpSystolic(Math.round(sbp * 10.0) / 10.0)
            .bpDiastolic(Math.round(dbp * 10.0) / 10.0)
            .temperature(Math.round(temp * 100.0) / 100.0)
            .oxygenSat(Math.min(100, Math.round(spo2 * 10.0) / 10.0))
            .respRate(Math.round(rr * 10.0) / 10.0)
            .painScale(rng.nextInt(10))
            .gcsScore(isCritical ? 8 + rng.nextInt(7) : 14 + rng.nextInt(2))
            .isCritical(isCritical ? 1 : 0)
            .recordedBy("VitalMonitor-Auto")
            .recordedAt(LocalDateTime.now())
            .build();

        return vitalRepo.save(vs);
    }

    private String buildCriticalMessage(VitalSign vs) {
        List<String> flags = new ArrayList<>();
        if (vs.getHeartRate() != null && (vs.getHeartRate() < 40 || vs.getHeartRate() > 160))
            flags.add("HR=" + vs.getHeartRate());
        if (vs.getBpSystolic() != null && (vs.getBpSystolic() < 80 || vs.getBpSystolic() > 200))
            flags.add("BP=" + vs.getBpSystolic() + "/" + vs.getBpDiastolic());
        if (vs.getOxygenSat() != null && vs.getOxygenSat() < 88)
            flags.add("SpO2=" + vs.getOxygenSat() + "%");
        if (vs.getTemperature() != null && (vs.getTemperature() > 40 || vs.getTemperature() < 35))
            flags.add("Temp=" + vs.getTemperature() + "°C");
        return "CRITICAL VITALS: " + String.join(", ", flags);
    }

    private void screenForSepsis() {
        List<Admission> active = admissionRepo.findActiveAdmissions();
        for (Admission adm : active) {
            if (adm.getTriageLevel() != null && adm.getTriageLevel() <= 2 && rng.nextDouble() < 0.08) {
                alertService.triggerAlert(
                    adm.getAdmissionId(), adm.getPatientId(),
                    "SEPSIS_RISK", "HIGH",
                    "Sepsis screening positive — HR>100, Temp>38°C, suspected infection. Consider SOFA score",
                    "SepsisScreen"
                );
            }
        }
    }

    private void checkDischargeEligibility() {
        List<Admission> candidates = admissionRepo.findDischargeEligible();
        for (Admission adm : candidates) {
            // Run multi-phase discharge using Phaser
            CompletableFuture.runAsync(
                () -> executeDischargePhases(adm), dischargePool);
        }
    }

    /**
     * CONCEPT: Phaser — multi-phase discharge coordination.
     *
     * Phaser(N+1): N worker threads + 1 orchestrator (this thread).
     * arriveAndAwaitAdvance(): all parties must reach the barrier before advancing.
     *
     * Phase 0: Verify labs + medications complete
     * Phase 1: Generate discharge summary (concurrent: doctor + pharmacy)
     * Phase 2: Notify family + insurance (concurrent)
     * Phase 3: Release bed + update records
     */
    private void executeDischargePhases(Admission adm) {
        Phaser phaser = new Phaser(3); // 2 workers + 1 orchestrator

        log.info("[Discharge] Starting phases for admission {}", adm.getAdmissionRef());

        // Phase 0 workers
        dischargePool.submit(() -> {
            try { Thread.sleep(500); } catch (InterruptedException e) {}
            log.debug("[Discharge-P0] Labs verified for {}", adm.getAdmissionRef());
            phaser.arriveAndAwaitAdvance(); // Phase 0

            try { Thread.sleep(800); } catch (InterruptedException e) {}
            log.debug("[Discharge-P1] Doctor summary for {}", adm.getAdmissionRef());
            phaser.arriveAndAwaitAdvance(); // Phase 1

            phaser.arriveAndDeregister(); // Done
        });

        dischargePool.submit(() -> {
            try { Thread.sleep(400); } catch (InterruptedException e) {}
            log.debug("[Discharge-P0] Meds cleared for {}", adm.getAdmissionRef());
            phaser.arriveAndAwaitAdvance(); // Phase 0

            try { Thread.sleep(600); } catch (InterruptedException e) {}
            log.debug("[Discharge-P1] Pharmacy clearance for {}", adm.getAdmissionRef());
            phaser.arriveAndAwaitAdvance(); // Phase 1

            phaser.arriveAndDeregister();
        });

        // Orchestrator
        phaser.arriveAndAwaitAdvance(); // Phase 0 complete
        log.info("[Discharge] Phase 0 done — verification complete for {}", adm.getAdmissionRef());

        phaser.arriveAndAwaitAdvance(); // Phase 1 complete
        log.info("[Discharge] Phase 1 done — summaries ready for {}", adm.getAdmissionRef());

        // Final: update admission + release bed
        admissionRepo.findById(adm.getAdmissionId()).ifPresent(a -> {
            a.setStatus("DISCHARGED");
            a.setDischargedAt(LocalDateTime.now());
            a.setDischargeType("DISCHARGED");
            admissionRepo.save(a);
        });

        dischargesCompleted.incrementAndGet();
        log.info("[Discharge] ✓ {} discharged via Phaser coordination", adm.getAdmissionRef());
        phaser.arriveAndDeregister();
    }

    public Map<String, Object> getMonitorStats() {
        return Map.of(
            "vitalsRecorded",    vitalsRecorded.get(),
            "alertsTriggered",   alertsTriggered.get(),
            "dischargesCompleted", dischargesCompleted.get()
        );
    }
}