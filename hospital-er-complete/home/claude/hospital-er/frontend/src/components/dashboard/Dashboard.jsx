import React, { useContext, useEffect, useState } from 'react'
import { WsCtx } from '../shared/Layout'
import { dashApi, triageApi, bedApi } from '../../utils/api'
import { Activity, AlertTriangle, BedDouble, Users, Cpu, Clock, Heart, Thermometer } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

const triageLabels = { 1:'IMMEDIATE',2:'EMERGENT',3:'URGENT',4:'LESS-URGENT',5:'NON-URGENT' }
const triageColors = { 1:'#ff3b5c',2:'#ffaa00',3:'#0099ff',4:'#00c896',5:'#405850' }

const Metric = ({ label, value, sub, color, icon: Icon, pulse }) => (
  <div className="card" style={{ padding:'1rem', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:0, right:0, width:'60px', height:'60px', borderRadius:'0 8px 0 60px', background:`${color}08` }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <div style={{ fontSize:'10px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.4rem' }}>{label}</div>
        <div style={{ fontFamily:'Outfit', fontSize:'1.8rem', fontWeight:800, color, lineHeight:1 }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize:'10px', color:'#405850', marginTop:'0.3rem' }}>{sub}</div>}
      </div>
      <div style={{ padding:'0.4rem', borderRadius:'6px', background:`${color}15` }} className={pulse?'pulse':''}>
        <Icon size={16} color={color} strokeWidth={2} />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const { alerts, stats, connected } = useContext(WsCtx)
  const [summary, setSummary] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [statusData, setStatusData] = useState([])
  const [recentAlerts, setRecentAlerts] = useState([])

  useEffect(() => {
    dashApi.getSummary().then(r => setSummary(r.data)).catch(()=>{})
    dashApi.getDoctors().then(r => setDoctors(r.data || [])).catch(()=>{})
    triageApi.statusSummary().then(r => setStatusData(r.data || [])).catch(()=>{})
  }, [])

  const s = stats || summary
  const triage = s?.triageQueue || {}
  const beds   = s?.bedStats || {}
  const crit   = s?.criticalUnacked || 0

  const statusChartData = statusData.map(r => ({ name: String(r[0]).replace('_',' '), count: Number(r[1]) }))
  const latestAlerts = alerts.length > 0 ? alerts : recentAlerts

  return (
    <div style={{ padding:'1.5rem', display:'grid', gap:'1rem' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontFamily:'Outfit', fontSize:'1.5rem', fontWeight:800, color:'#d4e8e0' }}>ER Command Center</h1>
          <p style={{ fontSize:'11px', color:'#405850', marginTop:'0.2rem' }}>
            {connected ? '● LIVE' : '○ OFFLINE'} — {new Date().toLocaleString()}
          </p>
        </div>
        {crit > 0 && (
          <div className="critical-flash" style={{ padding:'0.5rem 1rem', borderRadius:'6px', background:'rgba(255,59,92,0.15)', border:'1px solid rgba(255,59,92,0.4)', color:'#ff3b5c', fontSize:'12px', fontWeight:700 }}>
            ⚠ {crit} CRITICAL ALERTS UNACKNOWLEDGED
          </div>
        )}
      </div>

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.75rem' }}>
        <Metric label="Active Patients"   value={s?.activePatients ?? triage.activeAdmissions}  color="#00c896" icon={Users}    />
        <Metric label="Queue Depth"       value={triage.queueSize}                               color="#0099ff" icon={Clock}   pulse={triage.queueSize > 5} />
        <Metric label="Critical in Queue" value={triage.criticalInQueue}                          color="#ff3b5c" icon={Heart}   pulse={triage.criticalInQueue > 0} />
        <Metric label="Beds Available"    value={beds.available}                                  color="#00c896" icon={BedDouble} />
        <Metric label="Critical Alerts"   value={crit}                                            color="#ff3b5c" icon={AlertTriangle} pulse={crit > 0} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
        {/* Status breakdown */}
        <div className="card" style={{ padding:'1rem' }}>
          <h3 style={{ fontSize:'11px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'1rem' }}>Patient Status</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusChartData} layout="vertical">
                <XAxis type="number" tick={{fill:'#405850',fontSize:9}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fill:'#405850',fontSize:9}} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{background:'#0c1820',border:'1px solid rgba(0,200,150,0.15)',borderRadius:'6px',color:'#d4e8e0',fontSize:'11px'}} />
                <Bar dataKey="count" radius={3}>
                  {statusChartData.map((e,i)=><Cell key={i} fill={e.name.includes('CRITICAL')||e.name.includes('TRIAGE')? '#ff3b5c' : '#00c896'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'#405850' }}>No data</div>}
        </div>

        {/* Doctor status */}
        <div className="card" style={{ padding:'1rem' }}>
          <h3 style={{ fontSize:'11px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'1rem' }}>Medical Staff</h3>
          <div style={{ overflowY:'auto', maxHeight:'200px' }}>
            {doctors.map(d => (
              <div key={d.doctorId} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid rgba(0,200,150,0.06)' }}>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:600, color:'#d4e8e0' }}>{d.fullName}</div>
                  <div style={{ fontSize:'10px', color:'#405850' }}>{d.specialization} · {d.shift}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span className={`badge badge-${d.status==='AVAILABLE'?'ok':d.status==='BUSY'?'warn':'err'}`}>{d.status}</span>
                  <div style={{ fontSize:'10px', color:'#405850', marginTop:'0.2rem' }}>{d.currentLoad}/{d.maxPatients} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live alerts */}
        <div className="card" style={{ padding:'1rem' }}>
          <h3 style={{ fontSize:'11px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'1rem' }}>Live Alerts</h3>
          <div style={{ overflowY:'auto', maxHeight:'200px' }}>
            {latestAlerts.length === 0 ? (
              <div style={{ padding:'1rem', textAlign:'center', color:'#405850' }}>No recent alerts</div>
            ) : latestAlerts.slice(0,10).map((a, i) => (
              <div key={i} className="fade" style={{ padding:'0.4rem 0', borderBottom:'1px solid rgba(0,200,150,0.05)', display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                <span className={`badge badge-${a.severity?.toLowerCase()}`}>{a.severity?.substring(0,4)}</span>
                <div style={{ fontSize:'11px', color:'#405850', lineHeight:1.4 }}>{String(a.message||'').substring(0,60)}...</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thread stats */}
      {s?.threadInfo && (
        <div className="card" style={{ padding:'1rem' }}>
          <h3 style={{ fontSize:'11px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.75rem' }}>JVM Thread State</h3>
          <div style={{ display:'flex', gap:'2rem' }}>
            {[['Active Threads', s.threadInfo.activeThreads, '#00c896'],
              ['CPU Cores', s.threadInfo.availableProcessors, '#0099ff'],
              ['Processing Thread', s.threadInfo.currentThread?.split('-')[0], '#ffaa00']
            ].map(([l,v,c]) => (
              <div key={l}>
                <div style={{ fontSize:'1.2rem', fontWeight:800, fontFamily:'Outfit', color:c }}>{v}</div>
                <div style={{ fontSize:'10px', color:'#405850' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}