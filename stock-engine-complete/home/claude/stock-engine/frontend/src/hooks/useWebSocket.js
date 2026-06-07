import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [ticks,     setTicks]     = useState([])
  const [trades,    setTrades]    = useState([])
  const [stats,     setStats]     = useState(null)
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/market-data', msg => {
          setTicks(JSON.parse(msg.body))
        })
        client.subscribe('/topic/trades', msg => {
          const trade = JSON.parse(msg.body)
          setTrades(prev => [trade, ...prev].slice(0, 50))
        })
        client.subscribe('/topic/engine-stats', msg => {
          setStats(JSON.parse(msg.body))
        })
      },
      onDisconnect: () => setConnected(false),
    })
    client.activate()
    clientRef.current = client
    return () => client.deactivate()
  }, [])

  return { connected, ticks, trades, stats }
}