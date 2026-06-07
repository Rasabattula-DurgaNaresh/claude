import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout    from './components/shared/Layout'
import Dashboard from './components/dashboard/Dashboard'
import Orders    from './components/orders/Orders'
import Market    from './components/market/Market'
import Portfolio from './components/portfolio/Portfolio'
import Threads   from './components/threads/Threads'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background:'#111820', color:'#e2eaf3', border:'1px solid rgba(255,255,255,0.08)', fontFamily:'IBM Plex Mono', fontSize:'12px', borderRadius:'8px' },
        success: { iconTheme: { primary:'#00d487', secondary:'#000' } },
        error:   { iconTheme: { primary:'#ff4d6b', secondary:'#fff' } }
      }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="market"    element={<Market />} />
            <Route path="orders"    element={<Orders />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="threads"   element={<Threads />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BrowserRouter>
  )
}