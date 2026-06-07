# Stock Market Order Processing Engine
## Spring Boot + Multithreading + Oracle DB + React

A **production-grade** real-time stock trading platform demonstrating **15 Java concurrency concepts** in a single cohesive application.

---

## 🚀 Quick Start

```bash
# 1. Start Oracle DB
docker run -d --name oracle-xe \
  -e ORACLE_PASSWORD=StockPass#2024 \
  -e APP_USER=stockuser \
  -e APP_USER_PASSWORD=StockPass#2024 \
  -p 1521:1521 gvenzl/oracle-xe:21-slim

# Wait ~2 min then:

# 2. Backend
cd backend
mvn clean spring-boot:run

# 3. Frontend
cd frontend
npm install && npm run dev
```

Open: http://localhost:3000

---

## 🧵 Concurrency Concepts Demonstrated

| # | Concept | Class | Purpose |
|---|---------|-------|---------|
| 1 | **BlockingQueue** | `MatchingEngine` | Order ingestion pipeline (producer-consumer) |
| 2 | **ReentrantLock (fair)** | `OrderBook` | Order book critical section, FIFO matching |
| 3 | **StampedLock** | `OrderBook` | Optimistic reads for bid/ask (zero-overhead) |
| 4 | **volatile** | `OrderBook`, `MatchingEngine` | LTP cross-thread visibility without locking |
| 5 | **AtomicLong** | `MatchingEngine`, `OrderService` | Lock-free order ID generation, counters |
| 6 | **ConcurrentHashMap** | `MatchingEngine`, `MarketDataService` | Thread-safe symbol registry (segment locking) |
| 7 | **CompletableFuture** | `MatchingEngine` | Async match → settle → broadcast pipeline |
| 8 | **CountDownLatch** | `MatchingEngine`, `SettlementService` | Startup barrier + atomic settlement |
| 9 | **Semaphore** | `MatchingEngine` | DB connection throttle (max 8 concurrent) |
| 10 | **ForkJoinPool** | `PnlService` | Parallel P&L via RecursiveTask (work-stealing) |
| 11 | **ScheduledExecutorService** | `MarketDataService` | 500ms price ticks, 10s Oracle snapshots |
| 12 | **CopyOnWriteArrayList** | `NotificationService` | WebSocket subscriber list (lock-free reads) |
| 13 | **ThreadLocal** | `MatchingEngine` | Per-thread performance metrics context |
| 14 | **@Async (ExecutorService)** | `OrderService` | Non-blocking REST → thread pool hand-off |
| 15 | **Multiple Thread Pools** | `ThreadPoolConfig` | Dedicated pools: matching, settlement, market, notification, ForkJoin |

---

## 🏗️ Architecture

```
REST / WebSocket
      │
      │ @Async("orderIngestionPool")
      ▼
LinkedBlockingQueue<StockOrder>      ← BlockingQueue: back-pressure
      │
      │ take() [blocks when empty]
      ▼
Matcher Threads (FixedPool)
  │
  │  OrderBook.addAndMatch()
  │  └── ReentrantLock(fair) ← exclusive during matching
  │  └── StampedLock         ← optimistic reads for depth
  │  └── volatile lastTradePrice ← written here, read everywhere
  │
  ├── CompletableFuture → SettlementService
  │     └── CountDownLatch(2) ← buyer + seller positions settle concurrently
  │     └── Semaphore(8)      ← max 8 concurrent Oracle writes
  │
  └── CompletableFuture → NotificationService
        └── CopyOnWriteArrayList ← WebSocket broadcast (lock-free)

ScheduledExecutorService → MarketDataService (every 500ms)
  └── ConcurrentHashMap<symbol, MarketTickDto> ← live price cache
  └── AtomicLong tickCount ← lock-free metric

ForkJoinPool → PnlService
  └── RecursiveTask<BigDecimal> ← parallel P&L across positions
```

---

## 📡 API Endpoints

```
POST /api/orders                         Place order
DELETE /api/orders/{id}?clientId=...     Cancel order
GET  /api/orders?clientId=ACC001         Order history (paginated)
GET  /api/orders/open?clientId=ACC001    Open orders
GET  /api/orders/engine/stats            Thread pool metrics
GET  /api/orders/engine/book/{symbol}    Order book + market depth

GET  /api/market/ticks                   All live ticks
GET  /api/market/ticks/{symbol}          Single symbol
GET  /api/market/trades/{symbol}         Trade history
GET  /api/market/trades/threads          Trade count by thread
GET  /api/market/stats                   Market statistics

GET  /api/accounts                       All accounts
GET  /api/accounts/{clientId}            Account details
GET  /api/accounts/{clientId}/positions  Positions
GET  /api/accounts/{clientId}/portfolio  P&L (ForkJoinPool)
GET  /api/accounts/{clientId}/trades     Trade history
```

## WebSocket Topics

```
/topic/market-data    Live price ticks (every 500ms)
/topic/trades         Trade executions (real-time)
/topic/engine-stats   Engine metrics (every 2s)
```
