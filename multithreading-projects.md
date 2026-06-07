# Java Multithreading — Real-Time Projects

> Production-grade projects covering core concurrency patterns used in industry

---

## Project 1 — Real-Time Stock Price Aggregator

**Concept:** Multiple threads fetch prices from different exchanges simultaneously. A shared aggregator merges and publishes the best bid/ask.

**Patterns:** `ExecutorService`, `CompletableFuture.allOf`, `ConcurrentHashMap`, `BlockingQueue`

```java
@Service
public class StockAggregatorService {

    private final ExecutorService executor =
        Executors.newFixedThreadPool(10);

    private final ConcurrentHashMap<String, Double> priceMap =
        new ConcurrentHashMap<>();

    public Map<String, Double> fetchAllPrices(List<String> symbols) {
        List<CompletableFuture<Void>> futures = symbols.stream()
            .map(symbol -> CompletableFuture.runAsync(() -> {
                double price = exchangeClient.fetchPrice(symbol); // simulated
                priceMap.put(symbol, price);
            }, executor))
            .collect(Collectors.toList());

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .join(); // wait for all exchanges

        return Collections.unmodifiableMap(priceMap);
    }
}
```

**Key Concepts:** Thread pool sizing, non-blocking joins, thread-safe map updates.

---

## Project 2 — Order Processing Pipeline (Producer-Consumer)

**Concept:** Orders arrive on a queue; multiple consumer threads process them concurrently. Uses `LinkedBlockingQueue` as the shared buffer.

**Patterns:** Producer-Consumer, `BlockingQueue`, `AtomicInteger`, graceful shutdown

```java
public class OrderPipeline {

    private final BlockingQueue<Order> queue =
        new LinkedBlockingQueue<>(1000); // bounded buffer

    private final AtomicInteger processedCount = new AtomicInteger(0);
    private volatile boolean running = true;

    // Producer — called by REST controller
    public void submitOrder(Order order) throws InterruptedException {
        queue.put(order); // blocks if queue full — back-pressure!
    }

    // Consumer thread
    @PostConstruct
    public void startConsumers() {
        int threads = Runtime.getRuntime().availableProcessors();
        for (int i = 0; i < threads; i++) {
            Thread.ofVirtual().start(() -> {  // Java 21 virtual threads
                while (running || !queue.isEmpty()) {
                    try {
                        Order order = queue.poll(1, TimeUnit.SECONDS);
                        if (order != null) {
                            processOrder(order);
                            processedCount.incrementAndGet();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
        }
    }

    @PreDestroy
    public void shutdown() {
        running = false; // signal consumers to drain and exit
    }
}
```

**Key Concepts:** Bounded queue for back-pressure, volatile flag for shutdown, virtual threads (Java 21).

---

## Project 3 — Parallel Report Generator

**Concept:** A report consists of 5 sections (sales, inventory, HR, finance, ops). Each section is fetched from a different service. All run in parallel; results are merged when all complete.

**Patterns:** `CompletableFuture.thenCombine`, `thenApply`, timeout handling

```java
@Service
public class ReportService {

    public Report generateReport(String month) {
        CompletableFuture<SalesData>     sales     = fetchAsync(salesService::get, month);
        CompletableFuture<InventoryData> inventory = fetchAsync(inventoryService::get, month);
        CompletableFuture<HrData>        hr        = fetchAsync(hrService::get, month);
        CompletableFuture<FinanceData>   finance   = fetchAsync(financeService::get, month);

        return CompletableFuture
            .allOf(sales, inventory, hr, finance)
            .thenApply(v -> Report.builder()
                .sales(sales.join())
                .inventory(inventory.join())
                .hr(hr.join())
                .finance(finance.join())
                .generatedAt(Instant.now())
                .build())
            .orTimeout(10, TimeUnit.SECONDS)       // fail fast
            .exceptionally(ex -> Report.partial()) // fallback
            .join();
    }

    private <T> CompletableFuture<T> fetchAsync(
            Function<String, T> fn, String month) {
        return CompletableFuture
            .supplyAsync(() -> fn.apply(month), executor)
            .orTimeout(5, TimeUnit.SECONDS);
    }
}
```

**Key Concepts:** Fan-out/fan-in pattern, per-task timeouts, partial result fallback.

---

## Project 4 — Rate Limiter (Token Bucket)

**Concept:** A shared rate limiter allows max N requests per second across all threads. Uses `Semaphore` + a scheduled refill thread.

**Patterns:** `Semaphore`, `ScheduledExecutorService`, thread-safe token management

```java
public class TokenBucketRateLimiter {

    private final Semaphore tokens;
    private final int maxTokens;
    private final ScheduledExecutorService scheduler =
        Executors.newSingleThreadScheduledExecutor();

    public TokenBucketRateLimiter(int requestsPerSecond) {
        this.maxTokens = requestsPerSecond;
        this.tokens    = new Semaphore(requestsPerSecond);

        // Refill tokens every second
        scheduler.scheduleAtFixedRate(this::refill,
            1, 1, TimeUnit.SECONDS);
    }

    public boolean tryAcquire() {
        return tokens.tryAcquire(); // non-blocking
    }

    public void acquire() throws InterruptedException {
        tokens.acquire();           // blocking
    }

    private void refill() {
        int deficit = maxTokens - tokens.availablePermits();
        if (deficit > 0) tokens.release(deficit);
    }
}

// Usage in filter/interceptor
@Component
public class ApiRateLimitFilter implements HandlerInterceptor {

    private final TokenBucketRateLimiter limiter =
        new TokenBucketRateLimiter(100); // 100 req/sec

    @Override
    public boolean preHandle(HttpServletRequest req,
            HttpServletResponse res, Object handler) throws Exception {
        if (!limiter.tryAcquire()) {
            res.setStatus(429);
            return false;
        }
        return true;
    }
}
```

**Key Concepts:** `Semaphore` as a counting lock, background refill, non-blocking vs blocking acquire.

---

## Project 5 — Cache with Read-Write Lock

**Concept:** A shared in-memory cache. Many threads read concurrently; writes are exclusive. `ReentrantReadWriteLock` allows concurrent reads but serialises writes.

**Patterns:** `ReentrantReadWriteLock`, cache-aside pattern, TTL eviction

```java
public class ThreadSafeCache<K, V> {

    private final Map<K, CacheEntry<V>>  store = new HashMap<>();
    private final ReentrantReadWriteLock lock  = new ReentrantReadWriteLock();
    private final long ttlMs;

    public ThreadSafeCache(long ttlMs) { this.ttlMs = ttlMs; }

    public Optional<V> get(K key) {
        lock.readLock().lock();           // multiple readers OK
        try {
            CacheEntry<V> entry = store.get(key);
            if (entry == null || entry.isExpired()) return Optional.empty();
            return Optional.of(entry.value());
        } finally {
            lock.readLock().unlock();
        }
    }

    public void put(K key, V value) {
        lock.writeLock().lock();          // exclusive write
        try {
            store.put(key, new CacheEntry<>(value,
                System.currentTimeMillis() + ttlMs));
        } finally {
            lock.writeLock().unlock();
        }
    }

    public V getOrLoad(K key, Supplier<V> loader) {
        Optional<V> cached = get(key);
        if (cached.isPresent()) return cached.get();

        V value = loader.get();  // load outside the lock
        put(key, value);
        return value;
    }

    record CacheEntry<V>(V value, long expiresAt) {
        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }
}
```

**Key Concepts:** Read-write lock maximises read concurrency, write exclusivity prevents corruption, TTL entry record.

---

## Project 6 — Parallel File Processor

**Concept:** Process a large CSV (millions of rows) by splitting it into chunks and processing each chunk on a separate thread. Results are merged using `ConcurrentLinkedQueue`.

**Patterns:** `ForkJoinPool`, `RecursiveTask`, parallel streams, work stealing

```java
public class ParallelCsvProcessor {

    private final ForkJoinPool pool =
        new ForkJoinPool(Runtime.getRuntime().availableProcessors());

    public ProcessingResult process(Path filePath) throws Exception {
        List<String> lines = Files.readAllLines(filePath);

        return pool.submit(() ->
            lines.parallelStream()
                 .filter(line -> !line.startsWith("#"))  // skip comments
                 .map(this::parseLine)
                 .filter(Objects::nonNull)
                 .collect(Collectors.groupingByConcurrent(
                     Record::category,
                     Collectors.counting()))
        ).get();
    }

    // RecursiveTask for divide-and-conquer on large datasets
    static class ChunkTask extends RecursiveTask<Long> {
        private static final int THRESHOLD = 10_000;
        private final List<String> lines;
        private final int lo, hi;

        @Override
        protected Long compute() {
            if (hi - lo <= THRESHOLD) {
                return processChunk(lines.subList(lo, hi)); // base case
            }
            int mid = (lo + hi) / 2;
            ChunkTask left  = new ChunkTask(lines, lo, mid);
            ChunkTask right = new ChunkTask(lines, mid, hi);
            left.fork();                    // async
            return right.compute()          // current thread
                 + left.join();             // wait for left
        }
    }
}
```

**Key Concepts:** Work-stealing `ForkJoinPool`, divide-and-conquer with `RecursiveTask`, `parallelStream` with custom pool.

---

## Project 7 — Distributed Task Scheduler

**Concept:** Schedule recurring tasks (like Quartz but simpler). Each task runs on its own thread. Supports cron-like delay, task cancellation, and missed-execution tracking.

**Patterns:** `ScheduledExecutorService`, `Future`, cancellation, `AtomicLong`

```java
@Service
public class TaskSchedulerService {

    private final ScheduledExecutorService scheduler =
        Executors.newScheduledThreadPool(20);

    private final ConcurrentHashMap<String, ScheduledFuture<?>> tasks =
        new ConcurrentHashMap<>();

    private final AtomicLong executionCount = new AtomicLong(0);

    public void schedule(String taskId, Runnable task,
            long initialDelay, long period, TimeUnit unit) {

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(
            () -> {
                try {
                    task.run();
                    executionCount.incrementAndGet();
                } catch (Exception e) {
                    log.error("Task {} failed: {}", taskId, e.getMessage());
                    // continues scheduling — doesn't cancel on error
                }
            },
            initialDelay, period, unit
        );

        tasks.put(taskId, future);
    }

    public boolean cancel(String taskId) {
        ScheduledFuture<?> future = tasks.remove(taskId);
        return future != null && future.cancel(false); // don't interrupt running
    }

    public Map<String, Boolean> getStatus() {
        return tasks.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> !e.getValue().isCancelled()
                      && !e.getValue().isDone()
            ));
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        scheduler.shutdown();
        scheduler.awaitTermination(30, TimeUnit.SECONDS);
    }
}
```

**Key Concepts:** `scheduleAtFixedRate` vs `scheduleWithFixedDelay`, error isolation per task, graceful shutdown with drain.

---

## Project 8 — Thread-Safe Notification Dispatcher

**Concept:** Events arrive from multiple producers. A dispatcher routes each event to registered listeners by type. Listeners run in parallel per event.

**Patterns:** `CopyOnWriteArrayList`, `CompletableFuture`, event fan-out, thread-safe listener registration

```java
@Component
public class EventDispatcher {

    // CopyOnWriteArrayList — safe for concurrent iteration + rare writes
    private final ConcurrentHashMap<Class<?>, CopyOnWriteArrayList<EventListener<?>>>
        listenerMap = new ConcurrentHashMap<>();

    private final ExecutorService executor =
        Executors.newVirtualThreadPerTaskExecutor(); // Java 21

    public <T> void register(Class<T> eventType, EventListener<T> listener) {
        listenerMap.computeIfAbsent(eventType,
            k -> new CopyOnWriteArrayList<>()).add(listener);
    }

    @SuppressWarnings("unchecked")
    public <T> CompletableFuture<Void> dispatch(T event) {
        List<EventListener<?>> listeners =
            listenerMap.getOrDefault(event.getClass(), List.of());

        List<CompletableFuture<Void>> futures = listeners.stream()
            .map(listener -> CompletableFuture.runAsync(() -> {
                try {
                    ((EventListener<T>) listener).onEvent(event);
                } catch (Exception e) {
                    log.error("Listener failed for event {}: {}",
                        event.getClass().getSimpleName(), e.getMessage());
                }
            }, executor))
            .collect(Collectors.toList());

        return CompletableFuture.allOf(
            futures.toArray(new CompletableFuture[0]));
    }
}

// Usage
dispatcher.register(OrderCreatedEvent.class, event -> {
    emailService.sendConfirmation(event.getCustomerEmail());
});
dispatcher.register(OrderCreatedEvent.class, event -> {
    inventoryService.reserve(event.getProductId(), event.getQty());
});

dispatcher.dispatch(new OrderCreatedEvent(order))
    .thenRun(() -> log.info("All listeners notified"));
```

**Key Concepts:** `CopyOnWriteArrayList` for safe concurrent listener access, virtual thread per listener, isolated error handling.

---

## Common Pitfalls & Fixes

| Pitfall | Symptom | Fix |
|---|---|---|
| Shared mutable state | Race conditions, wrong results | Use `AtomicXxx`, `ConcurrentHashMap`, or synchronize |
| `synchronized` on wrong object | Still seeing races | Synchronize on the shared resource, not `this` |
| Thread pool too small | Requests queued, high latency | Size pool = CPU cores × (1 + wait/compute ratio) |
| Thread pool too large | OOM, context-switch overhead | Use virtual threads (Java 21) for I/O-bound tasks |
| Forgetting `shutdown()` | JVM never exits | Always call `shutdown()` + `awaitTermination()` in `@PreDestroy` |
| Catching `InterruptedException` silently | Thread never stops | Re-interrupt: `Thread.currentThread().interrupt()` |
| Using `HashMap` in multi-threaded code | `ConcurrentModificationException` | Use `ConcurrentHashMap` |
| Blocking inside `parallelStream` | Thread starvation in common pool | Use custom `ForkJoinPool` for blocking ops |

---

## Thread Pool Sizing Formula

```
For CPU-bound tasks:   threads = CPU cores
For I/O-bound tasks:   threads = CPU cores × (1 + avg_wait_time / avg_cpu_time)
For mixed workloads:   start with 2× CPU cores, measure and tune

Java 21+: prefer virtual threads for ALL I/O-bound work
Executors.newVirtualThreadPerTaskExecutor()
```

---

*Java 17+ · Spring Boot 3.x · Java 21 Virtual Threads*
