import React, { createContext, useContext, useState, useEffect } from 'react'
const Ctx = createContext(null)
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => { const s=localStorage.getItem('theme'); if(s) setIsDark(s==='dark') }, [])
  const toggleTheme = () => setIsDark(p => { const n=!p; localStorage.setItem('theme',n?'dark':'light'); return n })
  useEffect(() => { document.documentElement.classList.toggle('dark',isDark); document.body.style.background=isDark?'#060B14':'#0F172A' }, [isDark])
  return <Ctx.Provider value={{ isDark, toggleTheme }}>{children}</Ctx.Provider>
}
export const useTheme = () => useContext(Ctx)
