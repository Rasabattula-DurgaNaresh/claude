import React, { useEffect, useState } from 'react'
import { dashApi, triageApi } from '../../utils/api'
import { Cpu, Zap, RefreshCw } from 'lucide-react'

const CONCEPTS = [
  ['PriorityBlockingQueue','TriageService','Patients sorted by ESI triage level (1=Critical first). take() blocks efficiently when queue empty — no spin-waste. Multiple triage nurses add concurrently.'],
  ['ThreadPoolExecutor (multiple)','ThreadPoolConfig','5 dedicated pools: triage(Async), doctor-assign, lab, vital-monitor, alert-broadcast. Each tuned for its workload type.'],
  ['ReentrantReadWriteLock','BedManagementService','Many concurrent reads (availability checks), exclusive writes (bed assignment). WriteLock prevents double-booking race condition.'],
  ['Semaphore (per ward)','BedManagementService','Per-ward access control — max N concurrent bed operations. Fair semaphore: FIFO prevents starvation under peak load.'],
  ['CompletableFuture pipeline','LabService','orderTest → simulate processing → parse result → check critical → save + broadcast. Parallel with allOf() for multiple tests.'],
  ['ScheduledExecutorService','VitalMonitorService','scheduleAtFixedRate(3s): vital signs. scheduleAtFixedRate(30s): sepsis screening. scheduleAtFixedRate(60s): discharge check.'],
  ['Phaser (multi-phase)','VitalMonitorService','Discharge coordination: Phase 0 verify labs → Phase 1 generate summaries → Phase 2 notify → Phase 3 release bed.'],
  ['AtomicInteger / AtomicLong','Multiple Services','Lock-free counters: patientsAdmitted, vitalsRecorded, testsCompleted, criticalResults. Readable from any thread.'],
  ['ConcurrentHashMap','TriageService, BedMgmt','Active admission registry (fast lookup). Bed state cache (reduces Oracle round-trips). computeIfAbsent is atomic.'],
  ['CopyOnWriteArrayList','AlertService','WebSocket connection registry. Lock-free iteration on every alert broadcast (high read). COW on add/remove (low write).'],
  ['CountDownLatch','TriageService','Startup barrier: wait for all N triage workers to start before accepting first patient. Also used for atomic settlement in labs.'],
  ['volatile','TriageService','accepting flag: written by shutdown(), read by all consumer threads. Guarantees visibility without locking.'],
  ['ThreadLocal<TriageContext>','TriageService','Per-triage-thread audit context. No parameter passing needed. MUST remove() in finally to prevent memory leak in pooled threads.'],
  ['@Async("triagePool")','OrderService (TriageController)','REST thread returns HTTP 202 immediately. @Async runs admitPatient on triagePool — non-blocking REST endpoint.'],
  ['ForkJoinPool','(planned stats)','Parallel ER statistics computation across all active admissions. RecursiveTask splits list for work-stealing across all CPU cores.'],
]

export default function Threads() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    dashApi.getSummary().then(r => setSummary(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }
  useEffect(() => { load(); const iv = setInterval(load, 3000); return () => clearInterval(iv) }, [])

  const tq = summary?.triageQueue || {}
  const al = summary?.alerts || {}
  const vm = summary?.vitals || {}
  const lb = summary?.labs || {}

  return (
    <div style={{ padding:'1.5rem', display:'grid', gap:'1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:800 }}>Multithreading Monitor</h1>
          <p style={{ fontSize:'11px', color:'#405850' }}>Real-time view of all 15 Java concurrency concepts in action</p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={12} className={loading?'pulse':''}/> Refresh</button>
      </div>

      {/* Live metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem' }}>
        {[
          ['Queue Depth',    tq.queueSize,         '#0099ff',  'BlockingQueue.size()'],
          ['Patients Admitted', tq.admitted,        '#00c896',  'AtomicInteger.get()'],
          ['Vitals Recorded',  vm.vitalsRecorded,   '#ffaa00',  'ScheduledExec (3s)'],
          ['Critical Results', lb.criticalResults,  '#ff3b5c',  'CompletableFuture'],
        ].map(([l,v,c,sub]) => (
          <div key={l} className="card" style={{ padding:'0.875rem' }}>
            <div style={{ fontSize:'10px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.3rem' }}>{l}</div>
            <div style={{ fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:800, color:c }}>{v ?? '—'}</div>
            <div style={{ fontSize:'9px', color:'#405850', fontFamily:'monospace', marginTop:'0.25rem' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Thread info */}
      {summary?.threadInfo && (
        <div className="card" style={{ padding:'1rem', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Outfit', fontSize:'1.8rem', fontWeight:800, color:'#00c896' }}>{summary.threadInfo.activeThreads}</div>
            <div style={{ fontSize:'10px', color:'#405850' }}>Active JVM Threads</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Outfit', fontSize:'1.8rem', fontWeight:800, color:'#0099ff' }}>{summary.threadInfo.availableProcessors}</div>
            <div style={{ fontSize:'10px', color:'#405850' }}>CPU Cores</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'monospace', fontSize:'11px', color:'#ffaa00', wordBreak:'break-all' }}>{summary.threadInfo.currentThread}</div>
            <div style={{ fontSize:'10px', color:'#405850' }}>REST Handler Thread</div>
          </div>
        </div>
      )}

      {/* Concepts table */}
      <div className="card">
        <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(0,200,150,0.08)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Cpu size={14} color="#00c896" />
          <h3 style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#405850' }}>
            {CONCEPTS.length} Concurrency Concepts
          </h3>
        </div>
        {CONCEPTS.map(([name, location, desc], i) => (
          <div key={name} style={{ display:'grid', gridTemplateColumns:'200px 200px 1fr', gap:'1rem', alignItems:'start', padding:'0.75rem 1rem', borderBottom:'1px solid rgba(0,200,150,0.04)', transition:'background 0.1s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,200,150,0.02)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
              <Zap size={10} color="#00c896" />
              <span style={{ fontWeight:600, color:'#d4e8e0', fontSize:'12px' }}>{name}</span>
            </div>
            <code style={{ fontSize:'10px', color:'#0099ff', background:'rgba(0,153,255,0.08)', padding:'0.1rem 0.4rem', borderRadius:'3px', fontFamily:'monospace' }}>
              {location}
            </code>
            <span style={{ fontSize:'11px', color:'#405850', lineHeight:1.5 }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}