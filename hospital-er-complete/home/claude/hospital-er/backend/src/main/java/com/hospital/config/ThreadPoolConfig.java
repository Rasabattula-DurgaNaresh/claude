package com.hospital.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.*;

/**
 * CONCEPT: Multiple Dedicated Thread Pools
 *
 * Each ER workflow stage gets its own tuned pool:
 *
 *  triagePool     — processes incoming patients from PriorityBlockingQueue
 *                   Fixed size = prevents overwhelming triage staff simulation
 *
 *  doctorPool     — assigns available doctors to triaged patients
 *                   CallerRunsPolicy: if pool full, calling thread does the work
 *                   (back-pressure to REST thread — natural rate limiting)
 *
 *  labPool        — processes lab test requests asynchronously
 *                   Larger pool: lab has many parallel machines
 *
 *  vitalMonitor   — ScheduledExecutorService for periodic vital checks
 *                   Small fixed pool: runs on timer, not user-driven
 *
 *  alertPool      — broadcasts critical alerts to WebSocket clients
 *                   CopyOnWriteArrayList of listeners iterated here
 *
 *  dischargePool  — multi-phase patient discharge coordination (Phaser)
 */
@Configuration
public class ThreadPoolConfig implements AsyncConfigurer {

    @Value("${er.threads.triage-workers:4}")    private int triageWorkers;
    @Value("${er.threads.doctor-pool-size:8}")  private int doctorPoolSize;
    @Value("${er.threads.lab-pool-size:6}")     private int labPoolSize;
    @Value("${er.threads.alert-pool-size:2}")   private int alertPoolSize;

    /**
     * Primary async pool — handles patient intake.
     * Bounded queue ensures back-pressure; CallerRunsPolicy for overflow.
     */
    @Bean(name = "triagePool")
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(triageWorkers);
        exec.setMaxPoolSize(triageWorkers * 2);
        exec.setQueueCapacity(500);
        exec.setThreadNamePrefix("Triage-");
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(60);
        exec.initialize();
        return exec;
    }

    /**
     * Doctor assignment pool — fixed, prevents over-scheduling.
     */
    @Bean("doctorPool")
    public ExecutorService doctorPool() {
        return new ThreadPoolExecutor(
            doctorPoolSize, doctorPoolSize,
            0L, TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>(200),
            r -> { Thread t = new Thread(r, "DocAssign-" + System.nanoTime()%1000); t.setDaemon(true); return t; },
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }

    /**
     * Lab pool — larger, simulates parallel lab machines.
     * Uses PriorityBlockingQueue internally for STAT vs ROUTINE ordering.
     */
    @Bean("labPool")
    public ExecutorService labPool() {
        return Executors.newFixedThreadPool(labPoolSize, r -> {
            Thread t = new Thread(r, "Lab-" + System.nanoTime()%1000);
            t.setDaemon(true);
            return t;
        });
    }

    /**
     * Vital monitor — ScheduledExecutorService fires every 3 seconds.
     */
    @Bean("vitalMonitorPool")
    public ScheduledExecutorService vitalMonitorPool() {
        return Executors.newScheduledThreadPool(3, r -> {
            Thread t = new Thread(r, "VitalMonitor-" + System.nanoTime()%100);
            t.setDaemon(true);
            return t;
        });
    }

    /**
     * Alert pool — broadcasts to WebSocket subscribers.
     */
    @Bean("alertPool")
    public ExecutorService alertPool() {
        return Executors.newFixedThreadPool(alertPoolSize, r -> {
            Thread t = new Thread(r, "AlertBroadcast-" + System.nanoTime()%100);
            t.setDaemon(true);
            return t;
        });
    }

    /**
     * ForkJoinPool — parallel ER statistics computation.
     */
    @Bean("statsForkJoinPool")
    public ForkJoinPool statsForkJoinPool() {
        return new ForkJoinPool(Runtime.getRuntime().availableProcessors());
    }

    /**
     * Discharge pool — multi-phase patient discharge (Phaser).
     */
    @Bean("dischargePool")
    public ExecutorService dischargePool() {
        return Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "Discharge-" + System.nanoTime()%100);
            t.setDaemon(true);
            return t;
        });
    }
}