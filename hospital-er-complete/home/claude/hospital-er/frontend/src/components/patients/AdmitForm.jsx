import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { triageApi } from '../../utils/api'
import { UserPlus, AlertCircle } from 'lucide-react'

const TRIAGE_LEVELS = [
  { level:1, label:'IMMEDIATE',   desc:'Life-threatening — cardiac arrest, respiratory failure',  color:'#ff3b5c' },
  { level:2, label:'EMERGENT',    desc:'High risk — chest pain, altered consciousness, major trauma', color:'#ffaa00' },
  { level:3, label:'URGENT',      desc:'Stable but needs prompt care — severe pain, high fever', color:'#0099ff' },
  { level:4, label:'LESS URGENT', desc:'Semi-urgent — minor injuries, mild pain',                color:'#00c896' },
  { level:5, label:'NON-URGENT',  desc:'Walk-in — chronic issues, prescription refills',         color:'#405850' },
]

const COMPLAINTS = ['Chest Pain','Shortness of Breath','Trauma / Fall','Abdominal Pain','Altered Mental Status','Stroke Symptoms','Fever / Sepsis','Seizure','Drug Overdose','Allergic Reaction','Back Pain','Headache','Nausea/Vomiting','Wound Care','Other']

export default function AdmitForm() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    mrn:'', fullName:'', dateOfBirth:'', gender:'MALE', bloodType:'',
    contactPhone:'', allergies:'', chronicConditions:'',
    chiefComplaint:'Chest Pain', triageLevel:3
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await triageApi.admit({ ...form, mrn: form.mrn || 'MRN' + Date.now() % 1000000 })
      toast.success('Patient admitted to triage queue!')
      nav('/patients')
    } catch(err) {
      toast.error(err.response?.data?.message || 'Admission failed')
    } finally { setLoading(false) }
  }

  const tl = TRIAGE_LEVELS.find(t => t.level === form.triageLevel)

  return (
    <div style={{ padding:'1.5rem', maxWidth:'760px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
        <UserPlus size={20} color="#00c896" />
        <div>
          <h1 style={{ fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:800 }}>Admit Patient</h1>
          <p style={{ fontSize:'11px', color:'#405850' }}>Added to PriorityBlockingQueue by triage level — @Async returns immediately</p>
        </div>
      </div>

      {/* Triage level selector */}
      <div className="card" style={{ padding:'1rem', marginBottom:'1rem' }}>
        <div style={{ fontSize:'10px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.75rem' }}>Triage Level (ESI)</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.4rem' }}>
          {TRIAGE_LEVELS.map(t => (
            <button key={t.level} type="button" onClick={() => setForm(f=>({...f,triageLevel:t.level}))}
              style={{
                padding:'0.75rem 0.5rem', borderRadius:'6px', border:'none', cursor:'pointer',
                background: form.triageLevel===t.level ? `${t.color}20` : 'rgba(0,200,150,0.03)',
                borderWidth:'1px', borderStyle:'solid',
                borderColor: form.triageLevel===t.level ? t.color : 'rgba(0,200,150,0.08)',
                transition:'all 0.15s', textAlign:'center',
              }}>
              <div style={{ fontFamily:'Outfit', fontSize:'1.2rem', fontWeight:800, color: t.color }}>{t.level}</div>
              <div style={{ fontSize:'9px', fontWeight:700, color: t.color, letterSpacing:'0.05em' }}>{t.label}</div>
            </button>
          ))}
        </div>
        {tl && (
          <div style={{ marginTop:'0.75rem', padding:'0.5rem 0.75rem', borderRadius:'6px', background:`${tl.color}10`, border:`1px solid ${tl.color}30` }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <AlertCircle size={12} color={tl.color} />
              <span style={{ fontSize:'11px', color: tl.color }}>{tl.desc}</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display:'grid', gap:'0.75rem' }}>
        <div className="card" style={{ padding:'1rem' }}>
          <div style={{ fontSize:'10px', color:'#405850', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.75rem' }}>Patient Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>FULL NAME *</label>
              <input placeholder="Patient full name" value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))} style={{ width:'100%' }} required />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>DATE OF BIRTH *</label>
              <input type="date" value={form.dateOfBirth} onChange={e=>setForm(f=>({...f,dateOfBirth:e.target.value}))} style={{ width:'100%' }} required />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>GENDER</label>
              <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} style={{ width:'100%' }}>
                {['MALE','FEMALE','OTHER'].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>BLOOD TYPE</label>
              <select value={form.bloodType} onChange={e=>setForm(f=>({...f,bloodType:e.target.value}))} style={{ width:'100%' }}>
                {['','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>PHONE</label>
              <input placeholder="+91..." value={form.contactPhone} onChange={e=>setForm(f=>({...f,contactPhone:e.target.value}))} style={{ width:'100%' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>ALLERGIES</label>
              <input placeholder="Penicillin, NSAIDs..." value={form.allergies} onChange={e=>setForm(f=>({...f,allergies:e.target.value}))} style={{ width:'100%' }} />
            </div>
          </div>
          <div style={{ marginTop:'0.75rem' }}>
            <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>CHIEF COMPLAINT *</label>
            <select value={form.chiefComplaint} onChange={e=>setForm(f=>({...f,chiefComplaint:e.target.value}))} style={{ width:'100%' }}>
              {['Chest Pain','Shortness of Breath','Trauma / Fall','Abdominal Pain','Altered Mental Status','Stroke Symptoms','Fever / Sepsis','Seizure','Drug Overdose','Allergic Reaction','Back Pain','Headache','Nausea/Vomiting','Wound Care','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginTop:'0.75rem' }}>
            <label style={{ display:'block', fontSize:'10px', color:'#405850', marginBottom:'0.25rem' }}>CHRONIC CONDITIONS</label>
            <input placeholder="Hypertension, Diabetes, CAD..." value={form.chronicConditions} onChange={e=>setForm(f=>({...f,chronicConditions:e.target.value}))} style={{ width:'100%' }} />
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ justifyContent:'center', padding:'0.85rem', fontSize:'13px', opacity:loading?0.7:1 }}>
          {loading ? 'Admitting...' : `⚡ Admit as Level-${form.triageLevel} — Queue to PriorityBlockingQueue`}
        </button>
      </form>
    </div>
  )
}