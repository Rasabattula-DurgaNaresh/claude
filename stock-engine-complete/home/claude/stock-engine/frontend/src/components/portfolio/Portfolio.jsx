import React, { useState, useEffect } from 'react'
import { accountApi } from '../../utils/api'
import { TrendingUp, TrendingDown } from 'lucide-react'

const fmt = (n, d=2) => n != null ? Number(n).toFixed(d) : '—'
const fmtCur = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', {minimumFractionDigits:2})}` : '—'

export default function Portfolio() {
  const [clientId, setClientId] = useState('ACC001')
  const [account, setAccount]   = useState(null)
  const [portfolio, setPortfolio]= useState(null)
  const [positions, setPositions]= useState([])
  const [trades, setTrades]     = useState([])
  const [tab, setTab]           = useState('positions')

  useEffect(() => {
    accountApi.getOne(clientId).then(r => setAccount(r.data)).catch(()=>{})
    accountApi.getPortfolio(clientId).then(r => setPortfolio(r.data)).catch(()=>{})
    accountApi.getPositions(clientId).then(r => setPositions(r.data || [])).catch(()=>{})
    accountApi.getTrades(clientId).then(r => setTrades(r.data || [])).catch(()=>{})
  }, [clientId])

  return (
    <div style={{ padding:'1.5rem', display:'grid', gap:'1rem' }}>
      {/* Account selector */}
      <div style={{ display:'flex', gap:'0.5rem' }}>
        {['ACC001','ACC002','ACC003','ACC004'].map(id=>(
          <button key={id} onClick={()=>setClientId(id)}
            className={`btn ${clientId===id?'btn-buy':'btn-ghost'}`}>
            {id}
          </button>
        ))}
      </div>

      {/* Account + Portfolio summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'1rem' }}>
        {account && (
          <div className="card" style={{ padding:'1.25rem' }}>
            <h3 style={{ fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#556070', marginBottom:'1rem' }}>Account</h3>
            <div style={{ fontFamily:'Syne', fontSize:'1.4rem', fontWeight:800, marginBottom:'0.25rem' }}>{account.clientName}</div>
            <div style={{ color:'#556070', fontSize:'11px', marginBottom:'1rem' }}>{account.clientId} · {account.segment}</div>
            <div style={{ display:'grid', gap:'0.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'#556070' }}>Cash Balance</span>
                <span style={{ color:'#00d487', fontWeight:600 }}>{fmtCur(account.cashBalance)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'#556070' }}>Blocked</span>
                <span style={{ color:'#ff4d6b' }}>{fmtCur(account.blockedAmount)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'#556070' }}>Status</span>
                <span className={`badge badge-${account.status==='ACTIVE'?'filled':'cancelled'}`}>{account.status}</span>
              </div>
            </div>
          </div>
        )}

        {portfolio && (
          <div className="card" style={{ padding:'1.25rem' }}>
            <h3 style={{ fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#556070', marginBottom:'1rem' }}>Portfolio (ForkJoinPool P&L)</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem' }}>
              {[
                ['Invested', portfolio.investedValue, '#e2eaf3'],
                ['Current', portfolio.currentValue, '#e2eaf3'],
                ['Unrealized P&L', portfolio.unrealizedPnl, Number(portfolio.unrealizedPnl)>=0?'#00d487':'#ff4d6b'],
                ['Realized P&L',   portfolio.realizedPnl,   Number(portfolio.realizedPnl)>=0?'#00d487':'#ff4d6b'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'0.75rem' }}>
                  <div style={{ fontSize:'10px', color:'#556070', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                  <div style={{ fontFamily:'Syne', fontSize:'1.1rem', fontWeight:700, color }}>{fmtCur(value)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.75rem', borderRadius:'6px', background: Number(portfolio.returnPct)>=0?'var(--green-dim)':'var(--red-dim)' }}>
              <span style={{ fontSize:'12px', color:'#556070' }}>Total Return: </span>
              <span style={{ fontWeight:700, color: Number(portfolio.returnPct)>=0?'#00d487':'#ff4d6b', fontSize:'14px' }}>
                {Number(portfolio.returnPct)>=0?'+':''}{fmt(portfolio.returnPct)}%
              </span>
              <span style={{ fontSize:'10px', color:'#556070', marginLeft:'0.75rem' }}>
                ({portfolio.positionCount} positions — computed via RecursiveTask)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.25rem', borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:'0.5rem' }}>
        {[['positions','Positions'],['trades','Trade History']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} className={`btn ${tab===id?'btn-buy':'btn-ghost'}`} style={{ fontSize:'11px' }}>{label}</button>
        ))}
      </div>

      {tab === 'positions' ? (
        <div className="card">
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['SYMBOL','QTY','AVG BUY','AVG SELL','REALIZED P&L','UNREALIZED P&L','PRODUCT'].map(h=>(
                  <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'10px', color:'#556070', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center', color:'#556070' }}>No positions</td></tr>
              ) : positions.map(p => (
                <tr key={p.positionId} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding:'0.55rem 0.75rem', fontWeight:600 }}>{p.symbol}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>{p.netQty?.toLocaleString()}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>₹{fmt(p.avgBuyPrice)}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>{Number(p.avgSellPrice)>0?`₹${fmt(p.avgSellPrice)}`:'—'}</td>
                  <td style={{ padding:'0.55rem 0.75rem', color: Number(p.realizedPnl)>=0?'#00d487':'#ff4d6b', fontWeight:600 }}>
                    {Number(p.realizedPnl)>=0?'+':''}{fmtCur(p.realizedPnl)}
                  </td>
                  <td style={{ padding:'0.55rem 0.75rem', color: Number(p.unrealizedPnl)>=0?'#00d487':'#ff4d6b', fontWeight:600 }}>
                    {Number(p.unrealizedPnl)>=0?'+':''}{fmtCur(p.unrealizedPnl)}
                  </td>
                  <td style={{ padding:'0.55rem 0.75rem' }}><span className="badge badge-open">{p.product}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['TRADE REF','SYMBOL','QTY','PRICE','VALUE','BROKERAGE','STT+GST','THREAD','EXECUTED AT'].map(h=>(
                  <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'10px', color:'#556070', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr><td colSpan={9} style={{ padding:'2rem', textAlign:'center', color:'#556070' }}>No trades yet</td></tr>
              ) : trades.slice(0,30).map(t => (
                <tr key={t.tradeId} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#556070', fontFamily:'monospace', fontSize:'11px' }}>{t.tradeRef?.substring(0,14)}</td>
                  <td style={{ padding:'0.55rem 0.75rem', fontWeight:600 }}>{t.symbol}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>{t.quantity?.toLocaleString()}</td>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#4a9eff' }}>₹{fmt(t.price)}</td>
                  <td style={{ padding:'0.55rem 0.75rem' }}>₹{Number(t.tradeValue).toLocaleString('en-IN')}</td>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#ff4d6b' }}>₹{fmt(t.brokerageBuy)}</td>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#ff4d6b' }}>₹{fmt(Number(t.stt)+Number(t.gst))}</td>
                  <td style={{ padding:'0.55rem 0.75rem', fontSize:'10px', color:'#556070', fontFamily:'monospace' }}>{t.threadName?.split('-')[0]}</td>
                  <td style={{ padding:'0.55rem 0.75rem', color:'#556070', fontSize:'11px' }}>
                    {t.executedAt ? new Date(t.executedAt).toLocaleTimeString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}