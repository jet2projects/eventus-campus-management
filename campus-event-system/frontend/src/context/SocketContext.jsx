import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
const Ctx = createContext(null)
export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const ref = useRef(null)
  const [connected, setConnected] = useState(false)
  const [liveUpdates, setLive] = useState([])
  useEffect(() => {
    if (!isAuthenticated) return
    ref.current = io('http://localhost:5000', { transports:['websocket'] })
    ref.current.on('connect', () => setConnected(true))
    ref.current.on('disconnect', () => setConnected(false))
    ;['new_event','booking_update','payment_success','event_reviewed'].forEach(e =>
      ref.current.on(e, d => setLive(p=>[...p.slice(-19),{type:e,...d,ts:Date.now()}]))
    )
    return () => ref.current?.disconnect()
  }, [isAuthenticated])
  const joinEventRoom  = id => ref.current?.emit('join_event', id)
  const leaveEventRoom = id => ref.current?.emit('leave_event', id)
  return <Ctx.Provider value={{ socket:ref.current, connected, liveUpdates, joinEventRoom, leaveEventRoom }}>{children}</Ctx.Provider>
}
export const useSocket = () => useContext(Ctx)
