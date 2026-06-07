import React, { useContext, useEffect, useState } from 'react'
import { WsCtx } from '../shared/Layout'
import { alertApi } from '../../utils/api'
import toast from 'react-hot-toast'
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react'

const severityIcon = { CRITICAL:'🔴', HIGH:'🟠', MEDIUM:'🟡', LOW:'🟢' }

export default function AlertsPage() {
  const { alerts: liveAlerts } = useContext(WsCtx)
  const [unacked, setUnacked]   = useState([])
  const [stats,   setStats]     = useState(null)
  const [tab,     setTab]       = useState('live')

  useEffect(() => {
    alertApi.getUnacked().then(r => setUnacked(r.data.content || [])).catch(()=>{})
    alertApi.getStats().then(r => setStats(r.data)).catch(()=>{})
  }, [])

  const ack = async (alertId) => {
    try {
      await alertApi.acknowledge(alertId, 'ER-Nurse')
      toast.success('Alert acknowledged')
      setUnacked(prev => prev.filter(a => a.alertId !== alertId))
    } catch { toast.error('Failed') }
  }

  const displayAlerts = tab === 'live' ? liveAlerts : unacked

  return (
    <div style={{ padding:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <div>
          <h1 style={{ fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:800 }}>Alert Center</h1>
          <p style={{ fontSize:'11px', color:'#405850' }}>CopyOnWriteArrayList broadcast — WebSocket push via alertPool</p>
        </div>
        {stats && (
          <div style={{ fontSize:'11px', color:'#405850', textAlign:'right' }}>
            <div>Total: {stats.totalAlerts} | Critical: <span style={{ color:'#ff3b5c' }}>{stats.criticalAlerts}</span></div>
            <div>WS Connections: {stats.connections}</div>
          </div>
        )}
      </div>

      <div style={{ display:'flex', gap:'0.4rem', marginBottom:'1rem' }}>
        {[['live','Live Feed (' + liveAlerts.length + ')'],['unacked','Unacknowledged (' + unacked.length + ')']].map(([id,label])=>(
          <button key={id} className={`btn ${tab===id?'btn-primary':'btn-ghost'}`} onClick={()=>setTab(id)} style={{ fontSize:'11px' }}>{label}</button>
        ))}
      </div>

      <div style={{ display:'grid', gap:'0.4rem' }}>
        {displayAlerts.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center', color:'#405850' }}>
            <Bell size={32} style={{ margin:'0 auto 0.5rem', opacity:0.3 }} />
            <div>No alerts</div>
          </div>
        ) : displayAlerts.map((a, i) => {
          const sev = a.severity?.toUpperCase()
          return (
            <div key={a.alertId || i} className={`card fade ${sev==='CRITICAL'?'critical-flash':''}`}
              style={{ padding:'0.875rem 1rem', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'0.75rem', alignItems:'start',
                borderColor: sev==='CRITICAL'?'rgba(255,59,92,0.3)':sev==='HIGH'?'rgba(255,170,0,0.2)':'var(--border)' }}>
              <div style={{ marginTop:'0.15rem' }}>{severityIcon[sev] || '⚪'}</div>
              <div>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.3rem' }}>
                  <span className={`badge badge-${sev?.toLowerCase()}`}>{sev}</span>
                  <span style={{ fontSize:'11px', color:'#405850' }}>{a.alertType?.replace(/_/g,' ')}</span>
                  {a.admissionId && <span style={{ fontSize:'10px', color:'#405850' }}>• ADM #{a.admissionId}</span>}
                </div>
                <div style={{ fontSize:'12px', color:'#d4e8e0', lineHeight:1.5 }}>{a.message}</div>
                <div style={{ fontSize:'10px', color:'#405850', marginTop:'0.3rem', display:'flex', gap:'1rem' }}>
                  <span>Thread: {a.triggeredBy || a.thread || '—'}</span>
                  <span>{a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : ''}</span>
                </div>
              </div>
              <div>
                {!a.isAcknowledged && a.alertId && (
                  <button className="btn btn-ghost" style={{ padding:'0.3rem 0.6rem', fontSize:'10px' }} onClick={()=>ack(a.alertId)}>
                    <CheckCircle size={11}/> ACK
                  </button>
                )}
                {a.isAcknowledged && <span style={{ fontSize:'10px', color:'#00c896' }}>✓ acked</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}