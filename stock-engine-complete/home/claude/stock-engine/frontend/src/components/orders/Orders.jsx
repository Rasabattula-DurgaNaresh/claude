import React, { useState, useEffect, useContext } from 'react'
import { WsContext } from '../shared/Layout'
import { orderApi } from '../../utils/api'
import toast from 'react-hot-toast'
import { Plus, X, RefreshCw } from 'lucide-react'

const fmt = (n, d=2) => n != null ? Number(n).toFixed(d) : '—'

const ACCOUNTS = ['ACC001','ACC002','ACC003','ACC004']
const SYMBOLS  = ['RELIANCE','TCS','INFY','HDFCBANK','WIPRO','ICICIBANK','BHARTIARTL','SBIN']

export default function Orders() {
  const { ticks } = useContext(WsContext)
  const [clientId, setClientId] = useState('ACC001')
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    symbol:'RELIANCE', side:'BUY', orderType:'LIMIT',
    quantity:'10', price:'', validity:'DAY', product:'CNC'
  })

  const loadOrders = async () => {
    setLoading(true)
    try {
      const r = await orderApi.getOrders(clientId)
      setOrders(r.data.content || [])
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadOrders() }, [clientId])

  const handlePlace = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        clientId,
        exchange: 'NSE',
        quantity: parseInt(form.quantity),
        price: form.price ? parseFloat(form.price) : null,
      }
      const r = await orderApi.place(payload)
      toast.success(`Order ${r.data.orderRef} placed!`)
      setShowForm(false)
      loadOrders()
    } catch(err) {
      toast.error(err.response?.data?.message || 'Order failed')
    }
  }

  const handleCancel = async (orderId) => {
    try {
      await orderApi.cancel(orderId, clientId)
      toast.success('Order cancelled')
      loadOrders()
    } catch(err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    }
  }

  const tick = ticks.find(t => t.symbol === form.symbol)

  const statusClass = (s) => {
    if (s === 'FILLED') return 'badge-filled'
    if (s === 'OPEN' || s === 'PENDING') return 'badge-open'
    if (s === 'CANCELLED') return 'badge-cancelled'
    if (s === 'PARTIALLY_FILLED') return 'badge-pending'
    return 'badge-cancelled'
  }

  return (
    <div style={{ padding:'1.5rem', display:'grid', gap:'1rem' }}>
      {/* Controls */}
      <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
        <select value={clientId} onChange={e=>setClientId(e.target.value)} style={{ maxWidth:'160px' }}>
          {ACCOUNTS.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={loadOrders}><RefreshCw size={12}/></button>
        <button className="btn btn-buy" onClick={()=>setShowForm(s=>!s)}><Plus size={12}/> PLACE ORDER</button>
      </div>

      {/* Order form */}
      {showForm && (
        <div className="card fade" style={{ padding:'1.25rem', borderColor:'rgba(0,212,135,0.2)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h3 style={{ fontSize:'12px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#556070' }}>New Order</h3>
            {tick && (
              <span style={{ fontSize:'12px', color:'#e2eaf3' }}>
                {form.symbol}: ₹{fmt(tick.ltp)}
                <span style={{ color: Number(tick.changePct)>=0?'#00d487':'#ff4d6b', marginLeft:'0.5rem' }}>
                  {Number(tick.changePct)>=0?'+':''}{fmt(tick.changePct)}%
                </span>
              </span>
            )}
          </div>
          <form onSubmit={handlePlace} style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', alignItems:'end' }}>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Symbol</label>
              <select value={form.symbol} onChange={e=>setForm(f=>({...f,symbol:e.target.value}))}>
                {SYMBOLS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Side</label>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                {['BUY','SELL'].map(s=>(
                  <button key={s} type="button"
                    className={`btn ${s==='BUY'?'btn-buy':'btn-sell'}`}
                    style={{ flex:1, justifyContent:'center', opacity: form.side===s ? 1 : 0.4 }}
                    onClick={()=>setForm(f=>({...f,side:s}))}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Type</label>
              <select value={form.orderType} onChange={e=>setForm(f=>({...f,orderType:e.target.value}))}>
                {['MARKET','LIMIT','STOP_LOSS'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Qty</label>
              <input type="number" min="1" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} required />
            </div>
            {form.orderType !== 'MARKET' && (
              <div>
                <label style={{ display:'block', fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Price (₹)</label>
                <input type="number" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" required />
              </div>
            )}
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Validity</label>
              <select value={form.validity} onChange={e=>setForm(f=>({...f,validity:e.target.value}))}>
                {['DAY','IOC','GTC'].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>Product</label>
              <select value={form.product} onChange={e=>setForm(f=>({...f,product:e.target.value}))}>
                {['CNC','MIS','NRML'].map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button className={`btn ${form.side==='BUY'?'btn-buy':'btn-sell'}`} type="submit" style={{ justifyContent:'center' }}>
              {form.side} {form.symbol}
            </button>
          </form>
        </div>
      )}

      {/* Orders table */}
      <div className="card">
        <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#556070' }}>Orders — {clientId}</h3>
          <span style={{ fontSize:'10px', color:'#556070' }}>{orders.length} records</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['REF','SYMBOL','SIDE','TYPE','QTY','FILLED','PRICE','AVG FILL','STATUS','SUBMITTED',''].map(h=>(
                  <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'10px', color:'#556070', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ padding:'2rem', textAlign:'center', color:'#556070' }}>Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={11} style={{ padding:'2rem', textAlign:'center', color:'#556070' }}>No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.orderId} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#556070', fontFamily:'monospace', fontSize:'11px' }}>{o.orderRef}</td>
                  <td style={{ padding:'0.55rem 0.75rem', fontWeight:600 }}>{o.symbol}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}><span className={`badge badge-${o.side.toLowerCase()}`}>{o.side}</span></td>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#556070' }}>{o.orderType}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>{o.quantity?.toLocaleString()}</td>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#00d487' }}>{o.filledQty?.toLocaleString()}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>{o.price ? `₹${fmt(o.price)}` : 'MKT'}</td>
                  <td style={{ padding:'0.55rem 0.75rem', color: Number(o.avgFillPrice)>0?'#00d487':'#556070' }}>
                    {Number(o.avgFillPrice)>0 ? `₹${fmt(o.avgFillPrice)}` : '—'}
                  </td>
                  <td style={{ padding:'0.55rem 0.75rem' }}><span className={`badge ${statusClass(o.status)}`}>{o.status}</span></td>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#556070', fontSize:'11px' }}>
                    {o.submittedAt ? new Date(o.submittedAt).toLocaleTimeString() : '—'}
                  </td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>
                    {['OPEN','PENDING','PARTIALLY_FILLED'].includes(o.status) && (
                      <button className="btn btn-ghost" style={{ padding:'0.25rem 0.5rem', fontSize:'10px' }} onClick={()=>handleCancel(o.orderId)}>
                        <X size={10}/> CANCEL
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}