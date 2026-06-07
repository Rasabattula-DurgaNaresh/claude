import React, { useContext, useEffect, useState } from 'react'
import { WsContext } from '../shared/Layout'
import { orderApi } from '../../utils/api'
import { TrendingUp, TrendingDown } from 'lucide-react'

const fmt = (n, d=2) => n != null ? Number(n).toFixed(d) : '—'

export default function Market() {
  const { ticks, connected } = useContext(WsContext)
  const [selected, setSelected] = useState('RELIANCE')
  const [book, setBook] = useState(null)
  const [loadingBook, setLoadingBook] = useState(false)

  const tick = ticks.find(t => t.symbol === selected) || null

  useEffect(() => {
    if (!selected) return
    setLoadingBook(true)
    orderApi.orderBook(selected).then(r => setBook(r.data)).catch(()=>setBook(null)).finally(()=>setLoadingBook(false))
    const iv = setInterval(() => {
      orderApi.orderBook(selected).then(r => setBook(r.data)).catch(()=>{})
    }, 2000)
    return () => clearInterval(iv)
  }, [selected])

  const pos = tick && Number(tick.changePct) >= 0

  return (
    <div style={{ padding:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', alignItems:'start' }}>
      {/* Left: symbol list */}
      <div className="card">
        <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#556070' }}>Symbols</h3>
        </div>
        {ticks.map(t => {
          const p = Number(t.changePct) >= 0
          return (
            <div key={t.symbol} onClick={() => setSelected(t.symbol)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 1rem', cursor:'pointer',
                background: selected===t.symbol ? 'rgba(0,212,135,0.06)' : 'transparent',
                borderLeft: selected===t.symbol ? '3px solid #00d487' : '3px solid transparent',
                borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'all 0.12s' }}>
              <div>
                <div style={{ fontWeight:600, color:'#e2eaf3' }}>{t.symbol}</div>
                <div style={{ fontSize:'10px', color:'#556070', marginTop:'0.15rem' }}>
                  Vol: {t.volume > 1e6 ? (t.volume/1e6).toFixed(2)+'M' : (t.volume/1e3).toFixed(0)+'K'}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:600 }}>₹{fmt(t.ltp)}</div>
                <div style={{ fontSize:'11px', color: p ? '#00d487' : '#ff4d6b', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.25rem' }}>
                  {p ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                  {p?'+':''}{fmt(t.changePct)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right: depth + details */}
      <div style={{ display:'grid', gap:'1rem' }}>
        {/* Price details */}
        {tick && (
          <div className="card" style={{ padding:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
              <div>
                <h2 style={{ fontFamily:'Syne', fontSize:'1.4rem', fontWeight:800 }}>{tick.symbol}</h2>
                <p style={{ color:'#556070', fontSize:'11px' }}>NSE | {connected ? '● LIVE' : '○ STATIC'}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'Syne', fontSize:'1.8rem', fontWeight:800, color:'#e2eaf3' }}>₹{fmt(tick.ltp)}</div>
                <div style={{ color: pos ? '#00d487' : '#ff4d6b', fontSize:'13px' }}>
                  {pos?'+':''}{fmt(tick.changeAmt)} ({pos?'+':''}{fmt(tick.changePct)}%)
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem' }}>
              {[['Open', tick.open],['High', tick.high],['Low', tick.low],['Prev Close', tick.close],
                ['52W High', tick.week52High],['52W Low', tick.week52Low],['P/E', tick.peRatio],['Bid/Ask', `${fmt(tick.bid)} / ${fmt(tick.ask)}`]
              ].map(([l,v]) => (
                <div key={l} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'6px', padding:'0.5rem 0.75rem' }}>
                  <div style={{ fontSize:'10px', color:'#556070', marginBottom:'0.2rem' }}>{l}</div>
                  <div style={{ fontWeight:600, fontSize:'12px' }}>{typeof v === 'number' ? `₹${fmt(v)}` : (v ?? '—')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market depth */}
        <div className="card">
          <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between' }}>
            <h3 style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#556070' }}>Market Depth — {selected}</h3>
            {loadingBook && <span style={{ fontSize:'10px', color:'#556070' }}>Refreshing...</span>}
          </div>
          {book ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
              <div style={{ borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding:'0.4rem 0.75rem', fontSize:'10px', color:'#00d487', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>BIDS</div>
                {(book.marketDepth?.bids || []).map((b, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0.75rem', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color:'#00d487' }}>₹{fmt(b[0])}</span>
                    <span style={{ color:'#556070' }}>{Number(b[1]).toLocaleString()}</span>
                  </div>
                ))}
                {(!book.marketDepth?.bids || book.marketDepth.bids.length === 0) && (
                  <div style={{ padding:'1rem', color:'#556070', fontSize:'11px', textAlign:'center' }}>No bids</div>
                )}
              </div>
              <div>
                <div style={{ padding:'0.4rem 0.75rem', fontSize:'10px', color:'#ff4d6b', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>ASKS</div>
                {(book.marketDepth?.asks || []).map((a, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0.75rem', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color:'#ff4d6b' }}>₹{fmt(a[0])}</span>
                    <span style={{ color:'#556070' }}>{Number(a[1]).toLocaleString()}</span>
                  </div>
                ))}
                {(!book.marketDepth?.asks || book.marketDepth.asks.length === 0) && (
                  <div style={{ padding:'1rem', color:'#556070', fontSize:'11px', textAlign:'center' }}>No asks</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding:'2rem', textAlign:'center', color:'#556070' }}>
              {loadingBook ? 'Loading depth...' : 'Select a symbol'}
            </div>
          )}
          {book && (
            <div style={{ padding:'0.6rem 0.75rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:'1.5rem', fontSize:'11px' }}>
              <span style={{ color:'#556070' }}>Last: <span style={{ color:'#e2eaf3' }}>₹{fmt(book.lastTradePrice)}</span></span>
              <span style={{ color:'#556070' }}>Volume: <span style={{ color:'#e2eaf3' }}>{book.totalVolume?.toLocaleString()}</span></span>
              <span style={{ color:'#556070' }}>Matched: <span style={{ color:'#00d487' }}>{book.matchedOrders}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}