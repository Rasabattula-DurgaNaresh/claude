package com.hospital.service.triage;

import com.hospital.entity.*;
import com.hospital.repository.*;
import com.hospital.service.notification.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * CONCEPTS: CompletableFuture, BlockingQueue (lab queue), AtomicLong
 *
 * CompletableFuture pipeline for lab results:
 *   orderTest() → runAsync(simulate lab) → thenApplyAsync(parse results)
 *               → thenApplyAsync(check critical values)
 *               → thenAcceptAsync(save + broadcast)
 *               → exceptionally(log failure)
 *
 * Each stage runs on the labPool (independent of the REST thread).
 * Multiple tests for the same patient run concurrently via allOf().
 *
 * BlockingQueue<LabRequest>:
 *   - Lab requests queued here; lab workers poll and process
 *   - Priority: STAT orders processed before ROUTINE
 */
@Service @RequiredArgsConstructor @Slf4j
public class LabService {

    private final LabOrderRepository  labRepo;
    private final AlertService        alertService;

    @Qualifier("labPool")
    private final ExecutorService labPool;

    private final AtomicLong testsCompleted  = new AtomicLong(0);
    private final AtomicLong criticalResults = new AtomicLong(0);

    private static final Map<String, int[]> NORMAL_RANGES = Map.of(
        "CBC",       new int[]{4000, 11000},    // WBC count
        "BMP",       new int[]{70, 100},         // Blood glucose
        "TROPONIN",  new int[]{0, 40},           // ng/L
        "D_DIMER",   new int[]{0, 500},          // ng/mL
        "LACTATE",   new int[]{5, 20}            // mg/dL
    );

    /**
     * Order multiple lab tests — runs ALL tests concurrently via CompletableFuture.
     *
     * CompletableFuture.allOf() waits for ALL tests to complete.
     * Each test runs on a separate labPool thread (parallel lab machines).
     */
    public CompletableFuture<List<LabOrder>> orderMultipleTests(
            Long admissionId, Long patientId,
            List<String> testTypes, String priority, String orderedBy) {

        List<CompletableFuture<LabOrder>> futures = testTypes.stream()
            .map(test -> orderSingleTest(admissionId, patientId, test, priority, orderedBy))
            .toList();

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .toList());
    }

    /**
     * Single test — complete async pipeline.
     */
    @Transactional
    public CompletableFuture<LabOrder> orderSingleTest(
            Long admissionId, Long patientId,
            String testType, String priority, String orderedBy) {

        String ref = "LAB" + System.currentTimeMillis() % 100000;
        LabOrder order = labRepo.save(LabOrder.builder()
            .orderRef(ref)
            .admissionId(admissionId).patientId(patientId)
            .testType(testType).priority(priority).status("ORDERED")
            .orderedBy(orderedBy).orderedAt(LocalDateTime.now())
            .build());

        return CompletableFuture
            // Step 1: Simulate lab processing (runs on labPool thread)
            .supplyAsync(() -> {
                order.setStatus("IN_PROGRESS");
                order.setProcessingThread(Thread.currentThread().getName());
                labRepo.save(order);

                // Simulate lab machine processing time
                long processingMs = "STAT".equals(priority) ? 2000L : 8000L;
                try { Thread.sleep(processingMs); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }

                return order;
            }, labPool)

            // Step 2: Generate result (still on labPool)
            .thenApplyAsync(lab -> {
                String result = generateResult(testType);
                String flag   = classifyResult(testType, result);
                lab.setResultValue(result);
                lab.setResultFlag(flag);
                lab.setStatus("COMPLETED");
                lab.setCompletedAt(LocalDateTime.now());
                long tat = java.time.Duration.between(lab.getOrderedAt(), lab.getCompletedAt()).toMinutes();
                lab.setTurnaroundMins((int) tat);
                return lab;
            }, labPool)

            // Step 3: Persist and check for critical values
            .thenApplyAsync(lab -> {
                labRepo.save(lab);
                testsCompleted.incrementAndGet();

                if ("CRITICAL".equals(lab.getResultFlag())) {
                    criticalResults.incrementAndGet();
                    alertService.triggerAlert(
                        admissionId, patientId,
                        "CRITICAL_LAB_RESULT", "CRITICAL",
                        "CRITICAL " + testType + ": " + lab.getResultValue() + " — Immediate review required",
                        "LabService-" + Thread.currentThread().getName()
                    );
                    log.warn("[Lab] CRITICAL result: {} {} → {} (Thread: {})",
                        testType, ref, lab.getResultValue(), Thread.currentThread().getName());
                }
                return lab;
            }, labPool)

            // Error handling
            .exceptionally(ex -> {
                log.error("[Lab] Test {} failed: {}", ref, ex.getMessage());
                order.setStatus("CANCELLED");
                labRepo.save(order);
                return order;
            });
    }

    private String generateResult(String testType) {
        Random rng = new Random();
        return switch (testType) {
            case "CBC"     -> String.format("WBC: %.1f K/uL", 3.5 + rng.nextDouble() * 15);
            case "BMP"     -> String.format("Glucose: %d mg/dL", 60 + rng.nextInt(200));
            case "TROPONIN"-> String.format("%.1f ng/L", rng.nextDouble() * 150);
            case "D_DIMER" -> String.format("%d ng/mL", 100 + rng.nextInt(2000));
            case "LACTATE" -> String.format("%.1f mg/dL", rng.nextDouble() * 40);
            case "X_RAY"   -> rng.nextBoolean() ? "No acute findings" : "Consolidation in RLL — possible pneumonia";
            case "CT_HEAD" -> rng.nextBoolean() ? "No acute intracranial abnormality" : "Hyperdense lesion — suspected hemorrhage";
            case "ECG"     -> rng.nextBoolean() ? "Normal sinus rhythm" : "ST elevation in leads II, III, aVF — STEMI";
            default        -> "Pending analysis";
        };
    }

    private String classifyResult(String testType, String result) {
        if (result.contains("hemorrhage") || result.contains("STEMI") ||
            result.contains("pneumonia")) return "CRITICAL";
        if (result.contains("consolidation")) return "HIGH";
        return "NORMAL";
    }

    public Map<String, Object> getLabStats() {
        return Map.of(
            "testsCompleted",  testsCompleted.get(),
            "criticalResults", criticalResults.get()
        );
    }
}