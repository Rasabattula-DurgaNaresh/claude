package com.stockengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Stock Market Order Processing Engine
 *
 * Key threading concepts demonstrated:
 *  1. ThreadPoolTaskExecutor       — order ingestion pool
 *  2. ScheduledExecutorService     — market data feed (every 500ms)
 *  3. BlockingQueue                — order pipeline (producer-consumer)
 *  4. ReentrantLock                — order book critical section
 *  5. StampedLock                  — optimistic reads on market data
 *  6. volatile                     — circuit breaker flags
 *  7. AtomicLong/AtomicInteger     — order ID generation, counters
 *  8. ConcurrentHashMap            — symbol → OrderBook registry
 *  9. CompletableFuture            — async settlement pipeline
 * 10. ForkJoinPool                 — parallel P&L computation
 * 11. CountDownLatch               — engine startup barrier
 * 12. Semaphore                    — DB connection throttle
 * 13. CopyOnWriteArrayList         — WebSocket subscriber list
 * 14. ThreadLocal                  — per-thread execution context
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class StockEngineApplication {
    public static void main(String[] args) {
        SpringApplication.run(StockEngineApplication.class, args);
    }
}