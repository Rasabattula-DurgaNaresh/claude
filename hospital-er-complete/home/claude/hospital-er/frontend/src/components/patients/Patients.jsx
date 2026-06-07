import React, { useEffect, useState } from 'react'
import { triageApi } from '../../utils/api'
import { RefreshCw, Activity } from 'lucide-react'

const triageColors = {1:'#ff3b5c',2:'#ffaa00',3:'#0099ff',4:'#00c896',5:'#405850'}
const triageLabels = {1:'IMMEDIATE',2:'EMERGENT',3:'URGENT',4:'LESS-URGENT',5:'NON-URGENT'}

const statusColor = (s) => {
  if (['IN_TRIAGE','IN_TREATMENT'].includes(s)) return '#00c896'
  if (['WAITING_TRIAGE','WAITING_BED','WAITING_DOCTOR'].includes(s)) return '#ffaa00'
  if (['DISCHARGED','ADMITTED'].includes(s)) return '#405850'
  return '#0099ff'
}

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [qStats, setQStats]     = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [pr, qr] = await Promise.all([triageApi.getActive(), triageApi.queueStats()])
      setPatients(pr.data || [])
      setQStats(qr.data)
    } catch {}
    finally { setLoading(false) }
  }
  useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv) }, [])

  return (
    <div style={{ padding:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <div>
          <h1 style={{ fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:800 }}>Active Patients</h1>
          <p style={{ fontSize:'11px', color:'#405850', marginTop:'0.2rem' }}>{patients.length} in ER — sorted by triage priority</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          {qStats && (
            <div style={{ fontSize:'11px', color:'#405850', textAlign:'right' }}>
              <div>Queue: <span style={{ color:'#00c896' }}>{qStats.queueSize}</span> | Critical: <span style={{ color:'#ff3b5c' }}>{qStats.criticalInQueue}</span></div>
              <div>Processed: {qStats.processed} / Admitted: {qStats.admitted}</div>
            </div>
          )}
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={12} className={loading?'pulse':''}/></button>
        </div>
      </div>

      <div className="card">
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(0,200,150,0.08)' }}>
              {['REF','TRIAGE','STATUS','COMPLAINT','ARRIVAL','BED','DOCTOR','THREAD'].map(h => (
                <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'9px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'#405850' }}>Loading...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'#405850' }}>No active patients</td></tr>
            ) : patients.map(p => {
              const tc = triageColors[p.triageLevel] || '#405850'
              return (
                <tr key={p.admissionId} style={{ borderBottom:'1px solid rgba(0,200,150,0.04)', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(0,200,150,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'0.6rem 0.75rem', fontFamily:'monospace', color:'#405850', fontSize:'11px' }}>{p.admissionRef}</td>
                  <td style={{ padding:'0.6rem 0.75rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <div style={{ width:'20px', height:'20px', borderRadius:'4px', background:`${tc}20`, border:`1px solid ${tc}40`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'11px', color:tc }}>{p.triageLevel}</div>
                      <span style={{ fontSize:'10px', color:tc }}>{triageLabels[p.triageLevel]}</span>
                    </div>
                  </td>
                  <td style={{ padding:'0.6rem 0.75rem' }}>
                    <span style={{ fontSize:'10px', fontWeight:700, color: statusColor(p.status), background:`${statusColor(p.status)}15`, padding:'2px 6px', borderRadius:'3px' }}>
                      {String(p.status).replace(/_/g,' ')}
                    </span>
                  </td>
                  <td style={{ padding:'0.6rem 0.75rem', color:'#d4e8e0', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.chiefComplaint}</td>
                  <td style={{ padding:'0.6rem 0.75rem', color:'#405850', fontSize:'11px' }}>
                    {p.arrivalTime ? new Date(p.arrivalTime).toLocaleTimeString() : '—'}
                  </td>
                  <td style={{ padding:'0.6rem 0.75rem', color: p.bedId ? '#00c896' : '#405850', fontSize:'11px' }}>{p.bedId || '—'}</td>
                  <td style={{ padding:'0.6rem 0.75rem', color: p.assignedDoctorId ? '#0099ff' : '#405850', fontSize:'11px' }}>{p.assignedDoctorId || '—'}</td>
                  <td style={{ padding:'0.6rem 0.75rem', color:'#405850', fontSize:'10px', fontFamily:'monospace' }}>
                    {p.processingThread ? p.processingThread.substring(0,12) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}