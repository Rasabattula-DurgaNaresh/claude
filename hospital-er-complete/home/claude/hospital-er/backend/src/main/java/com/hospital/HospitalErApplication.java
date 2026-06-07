package com.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Hospital Emergency Room Management System
 *
 * Multithreading Concepts Demonstrated:
 *  1. PriorityBlockingQueue   — Triage queue (critical patients first)
 *  2. ThreadPoolExecutor      — Doctor assignment worker pool
 *  3. ReentrantReadWriteLock  — Bed management (many readers, exclusive writers)
 *  4. CompletableFuture       — Async lab result processing pipeline
 *  5. ScheduledExecutorService — Vital sign monitor (every 3 seconds)
 *  6. AtomicInteger           — Patient counters, bed counters
 *  7. ConcurrentHashMap       — Active admission tracking
 *  8. CountDownLatch          — ER startup readiness check
 *  9. Semaphore               — Critical care bed access control
 * 10. volatile                — ER shutdown/status flags
 * 11. BlockingQueue           — Lab test request queue
 * 12. Phaser                  — Multi-phase patient discharge process
 * 13. ForkJoinPool            — Parallel statistics computation
 * 14. ThreadLocal             — Per-thread audit context
 * 15. CopyOnWriteArrayList    — Alert listener registry
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class HospitalErApplication {
    public static void main(String[] args) {
        SpringApplication.run(HospitalErApplication.class, args);
    }
}