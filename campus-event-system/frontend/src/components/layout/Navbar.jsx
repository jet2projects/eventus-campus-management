import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useScrollY } from '../../hooks/index.js'

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const scrollY = useScrollY()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const scrolled = scrollY > 40
  const path = location.pathname
  const accent = '#8BFF98'
  const accent2 = '#4ADE80'

  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(isStaff ? [{ to: '/staff', label: 'My Events' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  const profileLinks = [
    { to: '/dashboard', icon: '👤', label: 'My Profile' },
    { to: '/dashboard/bookings', icon: '🎟️', label: 'My Bookings' },
    { to: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  ]

  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(5,8,22,0.72)' : 'rgba(5,8,22,0.28)',
        backdropFilter: 'blur(22px)',
        borderBottom: '1px solid rgba(139,255,152,0.12)',
        boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.35)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 24px',
          height: scrolled ? 66 : 78,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'height 0.3s ease',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div
            whileHover={{ scale: 1.07, rotate: 3 }}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${accent}, ${accent2})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#04110A',
              fontWeight: 900,
              fontSize: 20,
              boxShadow: '0 0 28px rgba(139,255,152,0.38)',
            }}
          >
            X
          </motion.div>

          <div>
            <div
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: 24,
                letterSpacing: 4,
                color: '#F8FAFC',
                lineHeight: 1,
              }}
            >
              EVENTUS
            </div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: accent,
                letterSpacing: 4.2,
                lineHeight: 1,
              }}
            >
              CAMPUS SYSTEM
            </div>
          </div>
        </Link>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {navLinks.map(link => {
            const isActive = path === link.to || (link.to !== '/' && path.startsWith(link.to))
            return (
              <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -1 }}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: isActive ? '#04110A' : 'rgba(248,250,252,0.68)',
                    background: isActive ? `linear-gradient(135deg, ${accent}, ${accent2})` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {link.label}
                </motion.div>
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(139,255,152,0.09)',
              border: '1px solid rgba(139,255,152,0.24)',
              color: accent,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDark ? '☀' : '☾'}
          </motion.button>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setProfileOpen(p => !p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(139,255,152,0.09)',
                  border: '1px solid rgba(139,255,152,0.24)',
                  borderRadius: 999,
                  padding: '5px 12px 5px 5px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 31,
                    height: 31,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 11,
                    color: '#04110A',
                  }}
                >
                  {initials}
                </div>
                <div className="hide-mobile" style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: '#F8FAFC' }}>
                    {user?.name?.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {user?.role}
                  </div>
                </div>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: 0,
                      background: 'rgba(8,13,28,0.96)',
                      border: '1px solid rgba(139,255,152,0.22)',
                      borderRadius: 16,
                      padding: 10,
                      minWidth: 210,
                      boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(139,255,152,0.12)', marginBottom: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#F8FAFC' }}>{user?.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.48)', marginTop: 3 }}>{user?.email}</div>
                    </div>

                    {profileLinks.map(item => (
                      <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                        <motion.div
                          whileHover={{ background: 'rgba(139,255,152,0.1)', x: 3 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 10,
                            color: 'rgba(248,250,252,0.75)',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <span>{item.icon}</span> {item.label}
                        </motion.div>
                      </Link>
                    ))}

                    <motion.div
                      whileHover={{ background: 'rgba(239,68,68,0.1)', x: 3 }}
                      onClick={logout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        color: '#F87171',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <span>⎋</span> Sign Out
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hide-mobile" style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    border: '1px solid rgba(139,255,152,0.32)',
                    background: 'transparent',
                    color: '#F8FAFC',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Login
                </motion.button>
              </Link>

              <Link to="/register" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    border: 'none',
                    background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                    color: '#04110A',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 28px rgba(139,255,152,0.25)',
                  }}
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(p => !p)}
            className="show-mobile"
            style={{
              width: 38,
              height: 38,
              background: 'rgba(139,255,152,0.09)',
              border: '1px solid rgba(139,255,152,0.24)',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 4,
              padding: 8,
            }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{ height: 2, background: accent, borderRadius: 2, width: '100%' }}
                animate={
                  menuOpen
                    ? i === 1
                      ? { opacity: 0 }
                      : i === 0
                        ? { rotate: 45, y: 6 }
                        : { rotate: -45, y: -6 }
                    : { opacity: 1, rotate: 0, y: 0 }
                }
              />
            ))}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: 'hidden',
              background: 'rgba(5,8,22,0.98)',
              borderTop: '1px solid rgba(139,255,152,0.12)',
              padding: '12px 24px 20px',
            }}
          >
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    padding: '13px 0',
                    borderBottom: '1px solid rgba(139,255,152,0.08)',
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: path === link.to ? accent : 'rgba(248,250,252,0.68)',
                  }}
                >
                  {link.label}
                </div>
              </Link>
            ))}

            {!isAuthenticated && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Link to="/login" style={{ textDecoration: 'none', flex: 1 }}>
                  <button style={{ width: '100%', padding: 12, borderRadius: 999, border: '1px solid rgba(139,255,152,0.32)', background: 'transparent', color: '#F8FAFC', fontWeight: 800 }}>
                    Login
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none', flex: 1 }}>
                  <button style={{ width: '100%', padding: 12, borderRadius: 999, border: 'none', background: `linear-gradient(135deg, ${accent}, ${accent2})`, color: '#04110A', fontWeight: 900 }}>
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}