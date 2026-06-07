import React, { useEffect, useState } from 'react'
import { marketApi, orderApi } from '../../utils/api'
import { Cpu, RefreshCw, Zap } from 'lucide-react'

export default function Threads() {
  const [threadStats, setThreadStats] = useState([])
  const [engineStats, setEngineStats] = useState(null)
  const [loading, setLoading]         = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [ts, es] = await Promise.all([marketApi.getByThread(), orderApi.engineStats()])
      setThreadStats(ts.data || [])
      setEngineStats(es.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const maxTrades = Math.max(...threadStats.map(r => Number(r[1])), 1)

  const concepts = [
    ['BlockingQueue', 'LinkedBlockingQueue(100,000)', 'Order ingestion pipeline — zero-copy hand-off between REST and matcher threads'],
    ['ReentrantLock (Fair)', 'ReentrantLock(true)', 'Order book critical section — FIFO ordering prevents starvation'],
    ['StampedLock', 'tryOptimisticRead()', 'Market depth reads — near-zero overhead, falls back to readLock on collision'],
    ['volatile', 'volatile BigDecimal lastTradePrice', 'LTP written by matcher thread, read by ALL broadcast threads without locking'],
    ['AtomicLong', 'AtomicLong ORDER_SEQ', 'Lock-free order reference generation — CAS instruction, no synchronized block'],
    ['ConcurrentHashMap', 'ConcurrentHashMap<String,OrderBook>', 'Symbol registry — 16-segment locking, non-blocking reads'],
    ['CompletableFuture', 'supplyAsync → thenRunAsync', 'Async settlement pipeline: match → persist trade → update positions → broadcast'],
    ['CountDownLatch', 'CountDownLatch(2)', 'Settlement atomicity: both buyer & seller position updates must complete before finalizing'],
    ['Semaphore', 'Semaphore(8, fair=true)', 'DB connection throttle — max 8 concurrent Oracle writes under burst load'],
    ['ForkJoinPool', 'RecursiveTask<BigDecimal>', 'Parallel P&L computation — splits position array, work-stealing across all CPU cores'],
    ['ScheduledExecutorService', 'scheduleAtFixedRate(500ms)', 'Market data feed — price ticks every 500ms, Oracle snapshots every 10s'],
    ['CopyOnWriteArrayList', 'CopyOnWriteArrayList<String>', 'WebSocket subscriber registry — lock-free iteration on every tick'],
    ['ThreadLocal', 'ThreadLocal<MatcherContext>', 'Per-thread performance metrics — no sharing, no synchronization needed'],
    ['@Async', '@Async("orderIngestionPool")', 'Spring @Async on placeOrderAsync — runs on dedicated thread pool, non-blocking REST'],
    ['Semaphore (startup)', 'CountDownLatch(N)', 'Engine startup barrier — waits for all N consumer threads before accepting orders'],
  ]

  return (
    <div style={{ padding:'1.5rem', display:'grid', gap:'1.25rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontSize:'1.4rem', fontWeight:800 }}>Multithreading Monitor</h1>
          <p style={{ color:'#556070', fontSize:'11px', marginTop:'0.25rem' }}>Real-time view of concurrency concepts in action</p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={12}/> {loading?'Loading...':'Refresh'}</button>
      </div>

      {/* Engine state */}
      {engineStats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'0.75rem' }}>
          {[
            ['Queue Depth',     engineStats.queueDepth,       '#4a9eff', 'BlockingQueue'],
            ['Orders Matched',  engineStats.ordersMatched,    '#00d487', 'ReentrantLock'],
            ['Orders Received', engineStats.ordersReceived,   '#f5a623', '@Async Pool'],
            ['Rejected',        engineStats.ordersRejected,   '#ff4d6b', 'Back-pressure'],
            ['Symbols',         engineStats.symbolsTracked,   '#00d487', 'ConcurrentHashMap'],
            ['DB Semaphore',    engineStats.availablePermits, '#4a9eff', 'Semaphore Permits'],
          ].map(([label, value, color, concept]) => (
            <div key={label} className="card" style={{ padding:'0.875rem' }}>
              <div style={{ fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
              <div style={{ fontFamily:'Syne', fontSize:'1.3rem', fontWeight:800, color, marginBottom:'0.2rem' }}>{value ?? '—'}</div>
              <div style={{ fontSize:'10px', color:'#556070' }}>{concept}</div>
            </div>
          ))}
        </div>
      )}

      {/* Thread distribution chart */}
      {threadStats.length > 0 && (
        <div className="card" style={{ padding:'1.25rem' }}>
          <h3 style={{ fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#556070', marginBottom:'1rem' }}>
            Trade Distribution by Thread (ConcurrentHashMap + ReentrantLock)
          </h3>
          {threadStats.map((row, i) => {
            const name    = row[0] || 'unknown'
            const count   = Number(row[1])
            const pct     = (count / maxTrades * 100).toFixed(1)
            const colors  = ['#00d487','#4a9eff','#f5a623','#ff4d6b','#a855f7','#06b6d4','#f97316','#ec4899']
            const color   = colors[i % colors.length]
            return (
              <div key={name} style={{ marginBottom:'0.6rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.2rem', fontSize:'11px' }}>
                  <span style={{ fontFamily:'monospace', color:'#e2eaf3' }}>{name}</span>
                  <span style={{ color:'#556070' }}>{count.toLocaleString()} trades ({pct}%)</span>
                </div>
                <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'3px', transition:'width 0.4s ease' }} />
                </div>
              </div>
            )
          })}
          <p style={{ fontSize:'10px', color:'#556070', marginTop:'0.75rem' }}>
            ↑ Ideal distribution: roughly equal across all matching threads (ReentrantLock fairness in action)
          </p>
        </div>
      )}

      {/* Concurrency concept reference */}
      <div className="card">
        <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Cpu size={14} color="#00d487" />
          <h3 style={{ fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#556070' }}>
            {concepts.length} Concurrency Concepts in This Project
          </h3>
        </div>
        <div style={{ display:'grid', gap:'0' }}>
          {concepts.map(([name, api, desc], i) => (
            <div key={name} style={{ display:'grid', gridTemplateColumns:'180px 260px 1fr', gap:'1rem', alignItems:'start', padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.12s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
                  <Zap size={10} color="#00d487" />
                  <span style={{ fontWeight:600, color:'#e2eaf3', fontSize:'12px' }}>{name}</span>
                </div>
              </div>
              <code style={{ fontSize:'10px', color:'#4a9eff', background:'rgba(74,158,255,0.08)', padding:'0.15rem 0.4rem', borderRadius:'4px', fontFamily:'monospace' }}>
                {api}
              </code>
              <span style={{ fontSize:'11px', color:'#556070', lineHeight:1.5 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}