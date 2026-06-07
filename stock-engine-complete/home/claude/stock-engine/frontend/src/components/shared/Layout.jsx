import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Activity, BarChart2, ShoppingCart, Briefcase, Cpu, Zap } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'

export const WsContext = React.createContext({})

const Nav = ({ to, icon: Icon, label }) => (
  <NavLink to={to} style={({ isActive }) => ({
    display:'flex', alignItems:'center', gap:'0.5rem',
    padding:'0.55rem 0.9rem', borderRadius:'6px', textDecoration:'none',
    fontSize:'11px', fontWeight:600, letterSpacing:'0.05em',
    color: isActive ? '#00d487' : '#556070',
    background: isActive ? 'rgba(0,212,135,0.08)' : 'transparent',
    transition:'all 0.15s',
  })}>
    <Icon size={14} strokeWidth={1.8} />
    {label}
  </NavLink>
)

export default function Layout() {
  const ws = useWebSocket()

  return (
    <WsContext.Provider value={ws}>
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Top bar */}
        <header style={{
          height:'44px', background:'#0d1219',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 1.25rem', flexShrink:0
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <Zap size={16} color="#00d487" strokeWidth={2.5} />
              <span style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:'14px', letterSpacing:'0.05em', color:'#e2eaf3' }}>STOCKENGINE</span>
              <span style={{ fontSize:'10px', color:'#556070', marginLeft:'0.25rem' }}>v1.0</span>
            </div>
            <nav style={{ display:'flex', gap:'0.25rem' }}>
              <Nav to="/dashboard" icon={Activity}   label="DASHBOARD" />
              <Nav to="/market"    icon={BarChart2}  label="MARKET" />
              <Nav to="/orders"    icon={ShoppingCart}label="ORDERS" />
              <Nav to="/portfolio" icon={Briefcase}  label="PORTFOLIO" />
              <Nav to="/threads"   icon={Cpu}        label="THREADS" />
            </Nav>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background: ws.connected ? '#00d487' : '#ff4d6b', boxShadow: ws.connected ? '0 0 6px #00d487' : 'none' }} className={ws.connected?'blinking':''} />
              <span style={{ fontSize:'10px', color: ws.connected ? '#00d487' : '#ff4d6b' }}>
                {ws.connected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            {ws.stats && (
              <span style={{ fontSize:'10px', color:'#556070' }}>
                Q: {ws.stats.queueDepth || 0} | Matched: {ws.stats.ordersMatched || 0}
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, overflow:'auto', background:'#080c10' }}>
          <Outlet />
        </main>
      </div>
    </WsContext.Provider>
  )
}