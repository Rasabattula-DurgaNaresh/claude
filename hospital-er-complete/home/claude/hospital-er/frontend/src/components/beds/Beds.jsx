import React, { useEffect, useState } from 'react'
import { bedApi } from '../../utils/api'
import { BedDouble, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const wardColors = { CRITICAL:'#ff3b5c', TRAUMA:'#ffaa00', GENERAL:'#00c896', ISOLATION:'#b44fff', TRIAGE:'#0099ff' }
const statusStyle = (s) => ({
  AVAILABLE:   { bg:'#00c89612', border:'rgba(0,200,150,0.3)',  text:'#00c896' },
  OCCUPIED:    { bg:'#ff3b5c12', border:'rgba(255,59,92,0.3)',  text:'#ff3b5c' },
  CLEANING:    { bg:'#ffaa0012', border:'rgba(255,170,0,0.3)',  text:'#ffaa00' },
  MAINTENANCE: { bg:'#40585012', border:'rgba(64,88,80,0.3)',   text:'#405850' },
}[s] || { bg:'rgba(255,255,255,0.03)', border:'rgba(0,200,150,0.08)', text:'#405850' })

export default function Beds() {
  const [stats, setStats]   = useState(null)
  const [beds,  setBeds]    = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [sr, br] = await Promise.all([bedApi.getStats(), bedApi.getAllBeds()])
      setStats(sr.data)
      setBeds(br.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load(); const iv = setInterval(load, 8000); return () => clearInterval(iv) }, [])

  const byWard = beds.reduce((acc, b) => {
    if (!acc[b.ward]) acc[b.ward] = []
    acc[b.ward].push(b)
    return acc
  }, {})

  const releaseBed = async (bedId) => {
    try { await bedApi.releaseBed(bedId); toast.success('Bed released'); load() }
    catch { toast.error('Failed to release') }
  }

  return (
    <div style={{ padding:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <div>
          <h1 style={{ fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:800 }}>Bed Management</h1>
          <p style={{ fontSize:'11px', color:'#405850' }}>ReentrantReadWriteLock — concurrent reads, exclusive writes</p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={12}/></button>
      </div>

      {/* Summary */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1rem' }}>
          {[['Total Beds', stats.totalBeds, '#405850'],['Available', stats.available, '#00c896'],['Occupied', stats.occupied, '#ff3b5c'],['Assignments', stats.totalAssignments, '#0099ff']].map(([l,v,c]) => (
            <div key={l} className="card" style={{ padding:'0.875rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'10px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.25rem' }}>{l}</div>
                <div style={{ fontFamily:'Outfit', fontSize:'1.6rem', fontWeight:800, color:c }}>{v}</div>
              </div>
              <BedDouble size={20} color={c} strokeWidth={1.5} style={{ opacity:0.4 }} />
            </div>
          ))}
        </div>
      )}

      {/* Beds by ward */}
      {Object.entries(byWard).map(([ward, wardBeds]) => {
        const wc = wardColors[ward] || '#405850'
        const available = wardBeds.filter(b => b.status === 'AVAILABLE').length
        return (
          <div key={ward} style={{ marginBottom:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:wc }} />
              <h3 style={{ fontFamily:'Outfit', fontSize:'13px', fontWeight:700, color:wc }}>{ward}</h3>
              <span style={{ fontSize:'10px', color:'#405850' }}>{available}/{wardBeds.length} available</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:'0.5rem' }}>
              {wardBeds.map(bed => {
                const ss = statusStyle(bed.status)
                return (
                  <div key={bed.bedId}
                    style={{ padding:'0.75rem', borderRadius:'8px', background:ss.bg, border:`1px solid ${ss.border}`, cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                    <div style={{ fontSize:'13px', fontWeight:700, fontFamily:'Outfit', color:ss.text }}>{bed.bedNumber}</div>
                    <div style={{ fontSize:'10px', color:ss.text, marginTop:'0.2rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>{bed.status}</div>
                    {bed.status === 'OCCUPIED' && bed.patientId && (
                      <div style={{ fontSize:'9px', color:'#405850', marginTop:'0.3rem' }}>Pt #{bed.patientId}</div>
                    )}
                    {bed.status === 'OCCUPIED' && (
                      <button className="btn" style={{ marginTop:'0.4rem', width:'100%', justifyContent:'center', fontSize:'9px', padding:'0.2rem', background:'rgba(255,59,92,0.1)', color:'#ff3b5c', border:'none' }}
                        onClick={() => releaseBed(bed.bedId)}>RELEASE</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}