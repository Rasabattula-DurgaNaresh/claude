package com.stockengine.service.matching;

import com.stockengine.entity.StockOrder;
import com.stockengine.service.settlement.SettlementService;
import com.stockengine.service.notification.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * CONCEPTS: BlockingQueue, ConcurrentHashMap, CountDownLatch, Semaphore, ThreadLocal
 *
 * The Matching Engine is the heart of the system.
 *
 * BlockingQueue (LinkedBlockingQueue):
 *   - Orders arrive from REST/WebSocket threads → put() into queue (blocks if full)
 *   - Consumer threads → take() from queue (blocks if empty — efficient, no spin)
 *   - Decouples producers (REST threads) from consumers (matching threads)
 *   - Natural back-pressure: REST clients slow down when engine is busy
 *
 * ConcurrentHashMap<symbol, OrderBook>:
 *   - One OrderBook per symbol, stored in a thread-safe map
 *   - computeIfAbsent: atomic check-then-insert (no race condition)
 *
 * Semaphore:
 *   - Limits concurrent DB saves to settlementPoolSize
 *   - Prevents DB connection pool exhaustion under burst load
 *
 * ThreadLocal<EngineContext>:
 *   - Each matching thread has its own performance metrics context
 *   - No sharing = no synchronization needed
 *
 * CountDownLatch:
 *   - Ensures all N consumer threads are running before accepting orders
 */
@Service
@Slf4j
public class MatchingEngine {

    private final SettlementService   settlementService;
    private final NotificationService notificationService;
    private final ExecutorService     matchingPool;

    @Value("${engine.queues.order-queue-capacity:100000}")
    private int orderQueueCapacity;

    // BlockingQueue: the core producer-consumer hand-off point
    private LinkedBlockingQueue<StockOrder> orderQueue;

    // ConcurrentHashMap: symbol → OrderBook (one book per symbol)
    private final ConcurrentHashMap<String, OrderBook> orderBooks = new ConcurrentHashMap<>();

    // volatile: read by health-check threads, written by shutdown/startup
    private volatile boolean running = false;

    // AtomicLong: lock-free counters readable from any thread
    private final AtomicLong ordersReceived  = new AtomicLong(0);
    private final AtomicLong ordersMatched   = new AtomicLong(0);
    private final AtomicLong ordersRejected  = new AtomicLong(0);
    private final AtomicLong totalTradeValue = new AtomicLong(0);

    // Semaphore: limit concurrent settlement saves (max = settlementPool size)
    private final Semaphore settlementSemaphore = new Semaphore(8, true);

    // ThreadLocal: per-thread metrics (no sharing needed)
    private static final ThreadLocal<MatcherContext> THREAD_CTX = ThreadLocal.withInitial(MatcherContext::new);

    // CountDownLatch: wait for ALL consumer threads before opening gate
    private CountDownLatch startupLatch;

    public MatchingEngine(
            SettlementService settlementService,
            NotificationService notificationService,
            @Qualifier("matchingPool") ExecutorService matchingPool) {
        this.settlementService   = settlementService;
        this.notificationService = notificationService;
        this.matchingPool        = matchingPool;
    }

    @PostConstruct
    public void start() throws InterruptedException {
        orderQueue    = new LinkedBlockingQueue<>(orderQueueCapacity);
        int consumers = Runtime.getRuntime().availableProcessors();
        startupLatch  = new CountDownLatch(consumers);
        running       = true;  // volatile write — visible to all threads

        log.info("[Engine] Starting {} consumer threads...", consumers);

        for (int i = 0; i < consumers; i++) {
            matchingPool.submit(this::consumeOrders);
        }

        // Wait until all consumers are ready (CountDownLatch)
        boolean allReady = startupLatch.await(10, TimeUnit.SECONDS);
        log.info("[Engine] {} — {} consumers ready",
                allReady ? "READY" : "PARTIAL", consumers);
    }

    /**
     * Consumer loop — runs on each matching thread.
     * BlockingQueue.take() blocks efficiently when queue is empty (no spin-wait).
     */
    private void consumeOrders() {
        MatcherContext ctx = THREAD_CTX.get();
        ctx.threadName = Thread.currentThread().getName();
        startupLatch.countDown();  // signal this thread is ready

        log.info("[{}] Consumer started", ctx.threadName);

        while (running || !orderQueue.isEmpty()) {
            try {
                // take() BLOCKS here until order is available — zero CPU waste
                StockOrder order = orderQueue.poll(200, TimeUnit.MILLISECONDS);
                if (order == null) continue;  // timeout → check running flag

                ctx.ordersProcessed++;
                long startNs = System.nanoTime();

                processOrder(order, ctx);

                ctx.totalLatencyNs += System.nanoTime() - startNs;

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        log.info("[{}] Consumer stopping — processed {} orders, avg latency {}µs",
                ctx.threadName, ctx.ordersProcessed,
                ctx.ordersProcessed > 0 ? ctx.totalLatencyNs / ctx.ordersProcessed / 1000 : 0);
        THREAD_CTX.remove(); // MUST clear to avoid memory leaks in thread pools
    }

    private void processOrder(StockOrder order, MatcherContext ctx) {
        // computeIfAbsent: atomic — no race condition for new symbols
        OrderBook book = orderBooks.computeIfAbsent(
            order.getSymbol(), OrderBook::new);

        Optional<MatchResult> result = book.addAndMatch(order);
        ordersReceived.incrementAndGet();

        result.ifPresent(match -> {
            ordersMatched.incrementAndGet();
            match.setMatchedAt(java.time.LocalDateTime.now());

            // Async settlement via CompletableFuture
            CompletableFuture
                .runAsync(() -> {
                    // Semaphore: max N concurrent DB saves
                    try {
                        settlementSemaphore.acquire();
                        settlementService.settle(match);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        settlementSemaphore.release();
                    }
                }, matchingPool)
                .thenRunAsync(() ->
                    notificationService.broadcastTrade(match), matchingPool)
                .exceptionally(ex -> {
                    log.error("[Engine] Settlement failed: {}", ex.getMessage());
                    return null;
                });

            ctx.tradesExecuted++;
        });
    }

    /**
     * Submit order from REST/WebSocket thread.
     * Non-blocking offer — returns false if queue full (client gets 503).
     */
    public boolean submitOrder(StockOrder order) {
        boolean accepted = orderQueue.offer(order);
        if (!accepted) {
            ordersRejected.incrementAndGet();
            log.warn("[Engine] Queue full! Order {} rejected", order.getOrderRef());
        }
        return accepted;
    }

    public Map<String, Object> getEngineStats() {
        return Map.of(
            "running",         running,
            "queueDepth",      orderQueue.size(),
            "ordersReceived",  ordersReceived.get(),
            "ordersMatched",   ordersMatched.get(),
            "ordersRejected",  ordersRejected.get(),
            "symbolsTracked",  orderBooks.size(),
            "availablePermits",settlementSemaphore.availablePermits()
        );
    }

    public Map<String, Object> getBookStats(String symbol) {
        OrderBook book = orderBooks.get(symbol.toUpperCase());
        if (book == null) return Map.of("error", "Symbol not found");
        return Map.of(
            "symbol",           book.getSymbol(),
            "bestBid",          book.getBestBid(),
            "bestAsk",          book.getBestAsk(),
            "buyDepth",         book.getBuyDepth(),
            "sellDepth",        book.getSellDepth(),
            "lastTradePrice",   book.getLastTradePrice(),
            "totalVolume",      book.getTotalVolume(),
            "matchedOrders",    book.getMatchedOrderCount(),
            "marketDepth",      book.getMarketDepth(5)
        );
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        log.info("[Engine] Shutting down — draining {} orders", orderQueue.size());
        running = false;  // volatile write — consumer threads see this immediately
        Thread.sleep(2000);
        matchingPool.shutdown();
        matchingPool.awaitTermination(10, TimeUnit.SECONDS);
        log.info("[Engine] Shutdown complete");
    }

    /** Per-thread context — stored in ThreadLocal, no sharing needed */
    private static class MatcherContext {
        String threadName;
        long   ordersProcessed = 0;
        long   tradesExecuted  = 0;
        long   totalLatencyNs  = 0;
    }
}