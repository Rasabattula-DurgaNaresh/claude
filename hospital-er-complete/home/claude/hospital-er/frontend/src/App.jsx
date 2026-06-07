import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout      from './components/shared/Layout'
import Dashboard   from './components/dashboard/Dashboard'
import Patients    from './components/patients/Patients'
import AdmitForm   from './components/patients/AdmitForm'
import Beds        from './components/beds/Beds'
import AlertsPage  from './components/alerts/AlertsPage'
import Threads     from './components/threads/Threads'

export const WsContext = React.createContext({})

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background:'#0c1820', color:'#d4e8e0', border:'1px solid rgba(0,200,150,0.15)', fontFamily:'JetBrains Mono', fontSize:'11px', borderRadius:'8px' },
        success: { iconTheme: { primary:'#00c896', secondary:'#000' } },
        error:   { iconTheme: { primary:'#ff3b5c', secondary:'#fff' } }
      }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="patients"   element={<Patients />} />
          <Route path="admit"      element={<AdmitForm />} />
          <Route path="beds"       element={<Beds />} />
          <Route path="alerts"     element={<AlertsPage />} />
          <Route path="threads"    element={<Threads />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}