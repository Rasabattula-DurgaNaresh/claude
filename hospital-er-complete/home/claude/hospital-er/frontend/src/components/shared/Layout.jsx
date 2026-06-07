import React, { createContext, useContext } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Activity, Users, BedDouble, Bell, Cpu, UserPlus, Heart } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'
export const WsCtx = createContext({})

const Nav = ({ to, icon: Icon, label, count }) => (
  <NavLink to={to} style={({ isActive }) => ({
    display:'flex', alignItems:'center', gap:'0.5rem',
    padding:'0.5rem 0.75rem', borderRadius:'6px', textDecoration:'none',
    fontSize:'11px', fontWeight:600, letterSpacing:'0.04em',
    color: isActive ? '#00c896' : '#405850',
    background: isActive ? 'rgba(0,200,150,0.08)' : 'transparent',
    borderLeft: isActive ? '2px solid #00c896' : '2px solid transparent',
    transition:'all 0.15s', whiteSpace:'nowrap',
  })}>
    <Icon size={13} strokeWidth={2} />
    {label}
    {count > 0 && <span style={{ marginLeft:'auto', background:'#ff3b5c', color:'#fff', fontSize:'9px', fontWeight:700, padding:'1px 4px', borderRadius:'3px' }}>{count}</span>}
  </NavLink>
)

export default function Layout() {
  const ws = useWebSocket()
  const unacked = ws.alerts.filter(a => !a.isAcknowledged && a.severity === 'CRITICAL').length
  const beds = ws.stats?.bedStats

  return (
    <WsCtx.Provider value={ws}>
      <div style={{ display:'flex', minHeight:'100vh', background:'#020608' }}>
        {/* Sidebar */}
        <aside style={{ width:'200px', flexShrink:0, background:'#080f14', borderRight:'1px solid rgba(0,200,150,0.08)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
          {/* Logo */}
          <div style={{ padding:'1.25rem 1rem', borderBottom:'1px solid rgba(0,200,150,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
              <Heart size={16} color="#00c896" strokeWidth={2.5} />
              <span style={{ fontFamily:'Outfit, sans-serif', fontWeight:800, fontSize:'15px', color:'#d4e8e0', letterSpacing:'0.02em' }}>MedCore</span>
            </div>
            <div style={{ fontSize:'10px', color:'#405850', letterSpacing:'0.08em' }}>EMERGENCY ROOM</div>
          </div>

          {/* Nav */}
          <nav style={{ padding:'0.75rem 0.5rem', flex:1, overflowY:'auto' }}>
            <div style={{ fontSize:'9px', color:'#405850', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.4rem 0.5rem', marginBottom:'0.25rem' }}>Operations</div>
            <Nav to="/dashboard" icon={Activity}  label="Dashboard"  />
            <Nav to="/patients"  icon={Users}      label="Patients"   />
            <Nav to="/admit"     icon={UserPlus}   label="Admit"      />
            <Nav to="/beds"      icon={BedDouble}  label="Bed Map"    />
            <Nav to="/alerts"    icon={Bell}       label="Alerts" count={unacked} />
            <Nav to="/threads"   icon={Cpu}        label="Threads"    />
          </nav>

          {/* WS status */}
          <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid rgba(0,200,150,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.4rem' }}>
              <div className={ws.connected ? 'pulse' : ''} style={{ width:'6px', height:'6px', borderRadius:'50%', background: ws.connected ? '#00c896' : '#ff3b5c', boxShadow: ws.connected ? '0 0 5px #00c896' : 'none' }} />
              <span style={{ fontSize:'10px', color: ws.connected ? '#00c896' : '#ff3b5c' }}>
                {ws.connected ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>
            {beds && (
              <div style={{ fontSize:'10px', color:'#405850' }}>
                Beds: <span style={{ color:'#00c896' }}>{beds.available}</span>/{beds.totalBeds} avail
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex:1, overflow:'auto', background:'#020608' }}>
          <Outlet />
        </main>
      </div>
    </WsCtx.Provider>
  )
}