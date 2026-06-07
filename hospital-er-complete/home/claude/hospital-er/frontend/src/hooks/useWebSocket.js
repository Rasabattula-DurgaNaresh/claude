import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [alerts,    setAlerts]    = useState([])
  const [stats,     setStats]     = useState(null)
  const [vitals,    setVitals]    = useState([])
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/alerts', msg => {
          const alert = JSON.parse(msg.body)
          setAlerts(prev => [alert, ...prev].slice(0, 100))
        })
        client.subscribe('/topic/er-stats', msg => {
          setStats(JSON.parse(msg.body))
        })
        client.subscribe('/topic/vitals', msg => {
          const v = JSON.parse(msg.body)
          if (Array.isArray(v)) setVitals(v)
          else setVitals(prev => [v, ...prev].slice(0,20))
        })
      },
      onDisconnect: () => setConnected(false),
    })
    client.activate()
    clientRef.current = client
    return () => client.deactivate()
  }, [])

  return { connected, alerts, stats, vitals }
}