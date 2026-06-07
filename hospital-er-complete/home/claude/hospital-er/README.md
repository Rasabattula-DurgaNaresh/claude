# Hospital Emergency Room Management System
## Spring Boot Multithreading + Oracle DB + React

A **production-grade real-time ER system** demonstrating **15 Java concurrency concepts** in a hospital emergency room context.

---

## 🚀 Quick Start

```bash
# Start Oracle DB
docker run -d --name oracle-er \
  -e ORACLE_PASSWORD=ErPass#2024 \
  -e APP_USER=eruser \
  -e APP_USER_PASSWORD=ErPass#2024 \
  -p 1521:1521 gvenzl/oracle-xe:21-slim

# Wait ~2 minutes then run backend
cd backend
mvn clean spring-boot:run

# Frontend
cd frontend
npm install && npm run dev
```

Open: **http://localhost:3000**

---

## 🧵 15 Concurrency Concepts

| # | Concept | Class | ER Use Case |
|---|---------|-------|-------------|
| 1 | **PriorityBlockingQueue** | `TriageService` | Patients sorted by ESI level (1=Critical first). `take()` blocks efficiently when no patients — no CPU spin |
| 2 | **ThreadPoolExecutor (x5)** | `ThreadPoolConfig` | Dedicated pools: triage, doctor-assign, lab, vital-monitor, alert-broadcast. Each tuned for workload |
| 3 | **ReentrantReadWriteLock** | `BedManagementService` | Concurrent reads (availability checks), exclusive writes (bed assignment). Prevents double-booking race |
| 4 | **Semaphore (per ward)** | `BedManagementService` | Max N concurrent bed ops per ward. Fair (FIFO) — prevents starvation under peak load |
| 5 | **CompletableFuture** | `LabService` | Order → simulate lab → parse results → check critical values → save + broadcast. Parallel with `allOf()` |
| 6 | **ScheduledExecutorService** | `VitalMonitorService` | `scheduleAtFixedRate`: vitals every 3s, sepsis every 30s, discharge check every 60s |
| 7 | **Phaser** | `VitalMonitorService` | Multi-phase discharge: verify labs → summaries → notify family → release bed |
| 8 | **AtomicInteger/Long** | Multiple services | Lock-free counters: patientsAdmitted, vitalsRecorded, testsCompleted — readable from any thread |
| 9 | **ConcurrentHashMap** | `TriageService`, `BedMgmt` | Active admission registry, bed state cache. `computeIfAbsent` is atomic — no race for new entries |
| 10 | **CopyOnWriteArrayList** | `AlertService` | WebSocket connection registry. Lock-free iteration on every alert. COW on add/remove (rare) |
| 11 | **CountDownLatch** | `TriageService` | Startup barrier: wait for all triage workers before accepting patients. Settlement atomicity in labs |
| 12 | **volatile** | `TriageService` | `accepting` flag: written by shutdown(), read by all consumer threads — visible without locking |
| 13 | **ThreadLocal** | `TriageService` | Per-thread `TriageContext` audit trail. No parameter passing. `remove()` in finally prevents memory leak |
| 14 | **@Async** | `TriageController` | REST returns HTTP 202 immediately. `admitPatient` runs on triagePool — non-blocking admission endpoint |
| 15 | **ForkJoinPool** | Statistics service | Parallel ER statistics across admissions. RecursiveTask work-stealing uses all CPU cores |

---

## 🏗️ Architecture

```
REST / WebSocket
      │
      │ HTTP 202 (immediate)
      │ @Async("triagePool")
      ▼
PriorityBlockingQueue<AdmissionTask>      ← Level-1 patients before Level-5
      │
      │ take() [blocks when empty]
      ▼
Triage Workers (FixedThreadPool)
  │
  ├── BedManagementService.assignBed()
  │     └── ReentrantReadWriteLock.writeLock() ← exclusive assignment
  │     └── Semaphore(ward)                    ← ward-level throttle
  │
  ├── LabService.orderMultipleTests()
  │     └── CompletableFuture.allOf()           ← all tests concurrent
  │     └── supplyAsync → thenApplyAsync × 3    ← processing pipeline
  │
  └── AlertService.triggerAlert()
        └── CopyOnWriteArrayList                ← lock-free broadcast
        └── WebSocket /topic/alerts

ScheduledExecutorService (VitalMonitorService):
  ├── scheduleAtFixedRate(3s)  → checkAllVitals()
  ├── scheduleAtFixedRate(30s) → screenForSepsis()
  └── scheduleAtFixedRate(60s) → checkDischargeEligibility()
        └── Phaser(3)          → multi-phase discharge

ScheduledExecutorService (ErStatsScheduler):
  └── fixedDelay(2s) → broadcast to /topic/er-stats (WebSocket)
```

---

## 📡 API Endpoints

```
POST /api/triage/admit                    Admit patient (PriorityBlockingQueue)
GET  /api/triage/admissions               Active patients
GET  /api/triage/queue/stats              Thread pool + queue metrics
POST /api/triage/labs/order               Order lab tests (CompletableFuture)
GET  /api/triage/admissions/{id}/vitals   Recent vital signs
GET  /api/triage/admissions/{id}/labs     Lab results

GET  /api/beds/stats                      Bed stats (ReadLock)
GET  /api/beds/available?ward=CRITICAL    Available beds (concurrent reads)
POST /api/beds/{id}/release               Release bed (WriteLock)

GET  /api/alerts/recent                   Recent 20 alerts
GET  /api/alerts/unacknowledged           Pending alerts
POST /api/alerts/{id}/acknowledge         Ack alert

GET  /api/dashboard/summary               Complete ER summary
GET  /api/dashboard/doctors               Doctor roster
```

## WebSocket Topics
```
/topic/alerts       Critical alerts (every event)
/topic/er-stats     ER metrics (every 2s)
/topic/vitals       Live vital signs (every 3s)
```

## 🎨 React Pages

| Page | Features |
|------|---------|
| Dashboard | Live metrics, doctor roster, alert feed, JVM thread info |
| Admit Patient | ESI triage level selector with color coding, @Async admission |
| Patients | Active admissions table with triage levels, processing thread shown |
| Bed Map | Visual ward grid — CRITICAL, TRAUMA, GENERAL, ISOLATION, TRIAGE |
| Alerts | Live WebSocket feed + unacknowledged management, severity badges |
| Threads | 15 concurrency concepts reference + live metrics from each |
