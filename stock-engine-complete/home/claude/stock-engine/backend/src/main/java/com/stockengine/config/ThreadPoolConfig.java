package com.stockengine.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.util.concurrent.*;

/**
 * CONCEPT: Thread Pool Configuration
 *
 * Multiple dedicated thread pools — each tuned for its workload type:
 *
 *  orderIngestionPool  → I/O-bound, large pool (receives orders from REST/WebSocket)
 *  matchingPool        → CPU-bound, coreCount threads (order matching per symbol)
 *  settlementPool      → DB-bound, moderate pool (persist trades to Oracle)
 *  marketDataPool      → Periodic, small pool (price tick broadcast)
 *  notificationPool    → WebSocket push, tiny pool
 *
 * Spring @Async methods run on asyncExecutor (orderIngestionPool).
 */
@Configuration
public class ThreadPoolConfig implements AsyncConfigurer {

    @Value("${engine.threads.matching-pool-size:8}")   private int matchingPoolSize;
    @Value("${engine.threads.settlement-pool-size:4}") private int settlementPoolSize;
    @Value("${engine.threads.market-data-pool-size:3}")private int marketDataPoolSize;
    @Value("${engine.threads.notification-pool-size:2}")private int notificationPoolSize;

    /**
     * Primary async executor — handles order ingestion from REST/WebSocket.
     * Unbounded queue: orders never get dropped, but latency can grow.
     */
    @Bean(name = "orderIngestionPool")
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(10);
        exec.setMaxPoolSize(50);
        exec.setQueueCapacity(10_000);
        exec.setThreadNamePrefix("OrderIngestion-");
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(30);
        exec.initialize();
        return exec;
    }

    /**
     * Matching engine pool — one thread per symbol partition.
     * Fixed pool: prevents context-switching overhead on CPU-bound matching.
     */
    @Bean("matchingPool")
    public ExecutorService matchingPool() {
        return Executors.newFixedThreadPool(matchingPoolSize, r -> {
            Thread t = new Thread(r);
            t.setName("Matcher-" + t.getId());
            t.setDaemon(true);
            return t;
        });
    }

    /**
     * Settlement pool — persists trades to Oracle in parallel.
     * Cached: scales up under burst, scales down when idle.
     */
    @Bean("settlementPool")
    public ExecutorService settlementPool() {
        return new ThreadPoolExecutor(
            settlementPoolSize, settlementPoolSize * 2,
            60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(50_000),
            r -> {
                Thread t = new Thread(r, "Settler-" + System.nanoTime() % 10000);
                t.setDaemon(true);
                return t;
            },
            new ThreadPoolExecutor.CallerRunsPolicy() // back-pressure to caller
        );
    }

    /**
     * Market data pool — scheduled broadcasts via ScheduledExecutorService.
     */
    @Bean("marketDataPool")
    public ScheduledExecutorService marketDataPool() {
        return Executors.newScheduledThreadPool(marketDataPoolSize, r -> {
            Thread t = new Thread(r, "MarketFeed-" + System.nanoTime() % 1000);
            t.setDaemon(true);
            return t;
        });
    }

    /**
     * Notification pool — WebSocket broadcast threads.
     * CopyOnWriteArrayList of subscribers is iterated here (lock-free reads).
     */
    @Bean("notificationPool")
    public ExecutorService notificationPool() {
        return Executors.newFixedThreadPool(notificationPoolSize, r -> {
            Thread t = new Thread(r, "Notifier-" + System.nanoTime() % 100);
            t.setDaemon(true);
            return t;
        });
    }

    /**
     * ForkJoinPool — parallel P&L computation across all positions.
     * Work-stealing: idle threads steal tasks from busy ones.
     */
    @Bean("pnlForkJoinPool")
    public ForkJoinPool pnlForkJoinPool() {
        return new ForkJoinPool(Runtime.getRuntime().availableProcessors());
    }

    /**
     * Spring's task scheduler for @Scheduled methods.
     */
    @Bean("taskScheduler")
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(4);
        scheduler.setThreadNamePrefix("Scheduler-");
        scheduler.setDaemon(true);
        scheduler.initialize();
        return scheduler;
    }
}