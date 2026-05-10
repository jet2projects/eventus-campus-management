import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
const Ctx = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setAuth] = useState(false)
  const loadUser = useCallback(async () => {
    const t = localStorage.getItem('token')
    if (!t) { setLoading(false); return }
    try { const r=await authAPI.getMe(); setUser(r.user); setAuth(true) }
    catch { localStorage.removeItem('token'); localStorage.removeItem('user') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { loadUser() }, [loadUser])
  const login = async (email, password) => {
    const r = await authAPI.login({ email, password })
    localStorage.setItem('token', r.token); localStorage.setItem('user', JSON.stringify(r.user))
    setUser(r.user); setAuth(true); toast.success(`Welcome back, ${r.user.name}! ⚡`); return r.user
  }
  const register = async data => {
    const r = await authAPI.register(data)
    localStorage.setItem('token', r.token); localStorage.setItem('user', JSON.stringify(r.user))
    setUser(r.user); setAuth(true); toast.success('Account created! 🍥'); return r.user
  }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setAuth(false); toast.success('Logged out') }
  const updateUser = u => { setUser(p=>({...p,...u})); localStorage.setItem('user', JSON.stringify({...user,...u})) }
  return <Ctx.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateUser, loadUser, isAdmin:user?.role==='admin', isStaff:user?.role==='staff', isStudent:user?.role==='student' }}>{children}</Ctx.Provider>
}
export const useAuth = () => { const c=useContext(Ctx); if(!c) throw new Error('useAuth outside provider'); return c }
