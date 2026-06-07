package com.hospital.service.bed;

import com.hospital.entity.*;
import com.hospital.repository.*;
import com.hospital.service.notification.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.*;
import java.util.stream.Collectors;

/**
 * CONCEPTS: ReentrantReadWriteLock, Semaphore, ConcurrentHashMap, AtomicInteger
 *
 * ReentrantReadWriteLock:
 *   - Multiple threads can READ bed availability concurrently (no blocking)
 *   - ONLY ONE thread can WRITE (assign/release a bed) at a time
 *   - Writers wait for all readers to finish; readers wait for active writer
 *   - Perfect for bed management: status checked constantly, modified rarely
 *   - readLock().lock()  → many nurses checking availability simultaneously
 *   - writeLock().lock() → ONE doctor assigning a bed at a time
 *
 * Semaphore (per ward):
 *   - CriticalCareSemaphore(4): max 4 threads accessing critical care simultaneously
 *   - Prevents all 8 doctors from racing to assign the same bed
 *   - Fair semaphore: FIFO ordering for waiting threads
 *
 * ConcurrentHashMap<bedId, BedState>:
 *   - In-memory cache of bed status (DB is source of truth)
 *   - Avoids DB round-trip for every availability check
 */
@Service @RequiredArgsConstructor @Slf4j
public class BedManagementService {

    private final BedRepository       bedRepo;
    private final AdmissionRepository admissionRepo;
    private final AlertService        alertService;

    // ReentrantReadWriteLock: many readers (availability checks), one writer (assignment)
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock(true); // fair
    private final Lock readLock  = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();

    // Per-ward semaphores: limit concurrent access to critical wards
    private final Map<String, Semaphore> wardSemaphores = new ConcurrentHashMap<>();

    // In-memory bed state cache (reduced DB pressure)
    private final ConcurrentHashMap<Long, BedState> bedCache = new ConcurrentHashMap<>();

    // AtomicInteger counters
    private final AtomicInteger availableBeds  = new AtomicInteger(0);
    private final AtomicInteger occupiedBeds   = new AtomicInteger(0);
    private final AtomicInteger totalAssignments = new AtomicInteger(0);

    @PostConstruct
    public void init() {
        // Per-ward semaphores (fair = true: FIFO prevents starvation)
        wardSemaphores.put("CRITICAL",  new Semaphore(2, true)); // max 2 simultaneous critical bed ops
        wardSemaphores.put("TRAUMA",    new Semaphore(2, true));
        wardSemaphores.put("GENERAL",   new Semaphore(6, true));
        wardSemaphores.put("ISOLATION", new Semaphore(2, true));
        wardSemaphores.put("TRIAGE",    new Semaphore(4, true));

        // Load beds into cache
        bedRepo.findAll().forEach(bed -> {
            bedCache.put(bed.getBedId(), new BedState(
                bed.getBedId(), bed.getBedNumber(), bed.getWard(),
                bed.getStatus(), bed.getPatientId()));
        });

        updateCounters();
        log.info("[BedMgmt] Initialized: {} beds cached ({} available)",
            bedCache.size(), availableBeds.get());
    }

    /**
     * Check bed availability — uses ReadLock (concurrent reads allowed).
     * Multiple nurses can check simultaneously without blocking each other.
     */
    public List<BedState> getAvailableBeds(String ward) {
        readLock.lock();  // ACQUIRE read lock — multiple threads can hold this
        try {
            return bedCache.values().stream()
                .filter(b -> "AVAILABLE".equals(b.status()))
                .filter(b -> ward == null || ward.equals(b.ward()))
                .collect(Collectors.toList());
        } finally {
            readLock.unlock();  // ALWAYS release
        }
    }

    /**
     * Assign bed — uses WriteLock (exclusive) + Ward Semaphore.
     *
     * Two-level locking:
     *  1. Ward Semaphore: max N threads operating on this ward at once
     *  2. WriteLock: only 1 thread modifying bed state at a time
     *
     * This prevents the classic "double-booking" race condition:
     *  Thread A checks: bed 3 is available → Thread B checks: bed 3 is available
     *  Thread A assigns bed 3 → Thread B also tries to assign bed 3 → CONFLICT!
     *  With WriteLock: Thread B is blocked until Thread A completes assignment.
     */
    @Transactional
    public Optional<Bed> assignBed(Long admissionId, Long patientId, String ward) {
        Semaphore wardSem = wardSemaphores.getOrDefault(ward, wardSemaphores.get("GENERAL"));

        try {
            // Semaphore.tryAcquire: don't wait too long — try other wards
            if (!wardSem.tryAcquire(3, TimeUnit.SECONDS)) {
                log.warn("[BedMgmt] Ward {} semaphore timeout for admission {}", ward, admissionId);
                return Optional.empty();
            }

            writeLock.lock();  // EXCLUSIVE write lock — no readers while writing
            try {
                // Find available bed in requested ward
                Optional<Bed> bedOpt = bedRepo.findFirstAvailableByWard(ward);
                if (bedOpt.isEmpty()) {
                    log.warn("[BedMgmt] No beds available in ward {} for admission {}", ward, admissionId);
                    alertService.triggerAlert(admissionId, patientId, "NO_BED_AVAILABLE", "HIGH",
                        "No available beds in " + ward + " — patient may need redirection", "BedMgmt");
                    return Optional.empty();
                }

                Bed bed = bedOpt.get();
                bed.setStatus("OCCUPIED");
                bed.setPatientId(patientId);
                bed.setAssignedAt(LocalDateTime.now());
                bedRepo.save(bed);

                // Update admission
                admissionRepo.findById(admissionId).ifPresent(adm -> {
                    adm.setBedId(bed.getBedId());
                    adm.setBedAssignedAt(LocalDateTime.now());
                    adm.setStatus("WAITING_DOCTOR");
                    adm.setUpdatedAt(LocalDateTime.now());
                    admissionRepo.save(adm);
                });

                // Update in-memory cache — under write lock
                bedCache.put(bed.getBedId(), new BedState(
                    bed.getBedId(), bed.getBedNumber(), ward, "OCCUPIED", patientId));

                // AtomicInteger updates
                availableBeds.decrementAndGet();
                occupiedBeds.incrementAndGet();
                totalAssignments.incrementAndGet();

                log.info("[BedMgmt] Assigned {} ({}) → Admission {} | Thread: {}",
                    bed.getBedNumber(), ward, admissionId, Thread.currentThread().getName());

                return Optional.of(bed);

            } finally {
                writeLock.unlock();  // ALWAYS release write lock
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Optional.empty();
        } finally {
            wardSem.release();  // ALWAYS release semaphore
        }
    }

    /**
     * Release bed — WriteLock for state update.
     */
    @Transactional
    public void releaseBed(Long bedId) {
        writeLock.lock();
        try {
            bedRepo.findById(bedId).ifPresent(bed -> {
                bed.setStatus("CLEANING");
                bed.setPatientId(null);
                bed.setAssignedAt(null);
                bedRepo.save(bed);
                bedCache.put(bedId, new BedState(
                    bedId, bed.getBedNumber(), bed.getWard(), "CLEANING", null));
                occupiedBeds.decrementAndGet();
                log.info("[BedMgmt] Released bed {} → CLEANING", bed.getBedNumber());
            });
        } finally {
            writeLock.unlock();
        }

        // Schedule bed → AVAILABLE after cleaning (simulated)
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(5000); // 5s cleaning time
                writeLock.lock();
                try {
                    bedRepo.findById(bedId).ifPresent(bed -> {
                        bed.setStatus("AVAILABLE");
                        bedRepo.save(bed);
                        bedCache.put(bedId, new BedState(
                            bedId, bed.getBedNumber(), bed.getWard(), "AVAILABLE", null));
                        availableBeds.incrementAndGet();
                    });
                } finally {
                    writeLock.unlock();
                }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });
    }

    private void updateCounters() {
        long avail = bedCache.values().stream().filter(b -> "AVAILABLE".equals(b.status())).count();
        long occup = bedCache.values().stream().filter(b -> "OCCUPIED".equals(b.status())).count();
        availableBeds.set((int) avail);
        occupiedBeds.set((int) occup);
    }

    public Map<String, Object> getBedStats() {
        readLock.lock();
        try {
            Map<String, Long> byWard = bedCache.values().stream()
                .collect(Collectors.groupingBy(BedState::ward, Collectors.counting()));
            Map<String, Long> byStatus = bedCache.values().stream()
                .collect(Collectors.groupingBy(BedState::status, Collectors.counting()));
            return Map.of(
                "totalBeds",       bedCache.size(),
                "available",       availableBeds.get(),
                "occupied",        occupiedBeds.get(),
                "totalAssignments",totalAssignments.get(),
                "byWard",          byWard,
                "byStatus",        byStatus,
                "allBeds",         new ArrayList<>(bedCache.values())
            );
        } finally {
            readLock.unlock();
        }
    }

    public record BedState(Long bedId, String bedNumber, String ward, String status, Long patientId) {}
}