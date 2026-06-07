import React, { useContext, useEffect, useState } from 'react'
import { WsContext } from '../shared/Layout'
import { marketApi, orderApi } from '../../utils/api'
import { TrendingUp, TrendingDown, Activity, Zap, Clock, Server } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const fmt = (n, d=2) => n != null ? Number(n).toFixed(d) : '—'
const fmtVol = (n) => n > 1e6 ? (n/1e6).toFixed(2)+'M' : n > 1e3 ? (n/1e3).toFixed(0)+'K' : n

function TickRow({ tick }) {
  const pos = Number(tick.changePct) >= 0
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', alignItems:'center', padding:'0.55rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.1s' }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <div>
        <span style={{ fontWeight:600, color:'#e2eaf3' }}>{tick.symbol}</span>
        <span style={{ color:'#556070', marginLeft:'0.5rem', fontSize:'10px' }}>{tick.exchange}</span>
      </div>
      <div style={{ textAlign:'right', fontWeight:600 }}>₹{fmt(tick.ltp)}</div>
      <div style={{ textAlign:'right', color: pos ? '#00d487' : '#ff4d6b', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.3rem' }}>
        {pos ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
        {pos?'+':''}{fmt(tick.changeAmt)} ({pos?'+':''}{fmt(tick.changePct)}%)
      </div>
      <div style={{ textAlign:'right', color:'#556070' }}>{fmtVol(tick.volume)}</div>
      <div style={{ textAlign:'right', color:'#556070', fontSize:'11px' }}>
        {tick.bid ? `${fmt(tick.bid)} / ${fmt(tick.ask)}` : '—'}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { ticks, trades, stats, connected } = useContext(WsContext)
  const [engineStats, setEngineStats] = useState(null)
  const [mktStats, setMktStats] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    orderApi.engineStats().then(r => setEngineStats(r.data)).catch(()=>{})
    marketApi.getStats().then(r => setMktStats(r.data)).catch(()=>{})
  }, [])

  // Build history from incoming trades
  useEffect(() => {
    if (trades.length > 0) {
      setHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), trades: trades.length }].slice(-30))
    }
  }, [trades.length])

  const displayStats = stats || engineStats

  return (
    <div style={{ padding:'1.5rem', display:'grid', gap:'1.25rem' }}>
      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.75rem' }}>
        {[
          ['Queue Depth',    displayStats?.queueDepth ?? '—',  Activity, '#4a9eff'],
          ['Orders Matched', displayStats?.ordersMatched ?? '—', Zap, '#00d487'],
          ['Orders Received',displayStats?.ordersReceived ?? '—', Server, '#f5a623'],
          ['Symbols Tracked',displayStats?.symbolsTracked ?? ticks.length, TrendingUp, '#00d487'],
          ['Trades (Live)',   trades.length, Clock, '#ff4d6b'],
        ].map(([label, value, Icon, color]) => (
          <div key={label} className="card" style={{ padding:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontSize:'10px', color:'#556070', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>{label}</p>
                <p style={{ fontSize:'1.5rem', fontWeight:700, fontFamily:'Syne', color:'#e2eaf3' }}>{value}</p>
              </div>
              <div style={{ padding:'0.4rem', borderRadius:'6px', background:`${color}15` }}>
                <Icon size={14} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.25rem' }}>
        {/* Market watch */}
        <div className="card">
          <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#556070' }}>Market Watch</h3>
            <span style={{ fontSize:'10px', color: connected ? '#00d487' : '#556070' }}>● {connected?'LIVE':'STATIC'}</span>
          </div>
          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', padding:'0.4rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            {['SYMBOL','LTP','CHANGE','VOLUME','BID / ASK'].map(h=>(
              <div key={h} style={{ fontSize:'10px', color:'#556070', textTransform:'uppercase', letterSpacing:'0.06em', textAlign: h==='SYMBOL'?'left':'right' }}>{h}</div>
            ))}
          </div>
          {ticks.length > 0 ? ticks.map(t=><TickRow key={t.symbol} tick={t} />) : (
            <div style={{ padding:'2rem', textAlign:'center', color:'#556070' }}>Connecting to market feed...</div>
          )}
        </div>

        {/* Live trade tape */}
        <div className="card">
          <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#556070' }}>Trade Tape</h3>
          </div>
          <div style={{ overflowY:'auto', maxHeight:'380px' }}>
            {trades.length === 0 ? (
              <div style={{ padding:'2rem', textAlign:'center', color:'#556070' }}>Waiting for trades...</div>
            ) : trades.map((t, i) => (
              <div key={i} className="fade" style={{ padding:'0.5rem 0.75rem', borderBottom:'1px solid rgba(255,255,255,0.03)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <span style={{ fontWeight:600, color:'#e2eaf3', marginRight:'0.4rem' }}>{t.symbol}</span>
                  <span style={{ fontSize:'10px', color:'#556070' }}>{t.quantity} @ ₹{fmt(t.price)}</span>
                </div>
                <span style={{ fontSize:'10px', color:'#00d487' }}>FILLED</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thread Distribution */}
      {displayStats && (
        <div className="card" style={{ padding:'1rem' }}>
          <h3 style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#556070', marginBottom:'0.75rem' }}>Engine Metrics</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
            {[
              ['Rejected Orders', displayStats.ordersRejected, '#ff4d6b'],
              ['DB Semaphore Available', displayStats.availablePermits, '#00d487'],
              ['Queue Depth', displayStats.queueDepth, '#4a9eff'],
              ['Symbols', displayStats.symbolsTracked, '#f5a623'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.25rem', fontWeight:700, fontFamily:'Syne', color }}>{val ?? '—'}</div>
                <div style={{ fontSize:'10px', color:'#556070', marginTop:'0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}