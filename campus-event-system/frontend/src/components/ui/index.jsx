import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STATUS_CONFIG, CATEGORIES } from '../../utils/index.js'

/* ─────────────────────────────────────────
   SPINNER
───────────────────────────────────────── */
export function Spinner({ size = 36, color = '#FF6A00' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid rgba(255,106,0,0.15)`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.75s linear infinite', flexShrink: 0,
    }} />
  )
}

/* ─────────────────────────────────────────
   PAGE LOADER
───────────────────────────────────────── */
export function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#060B14',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        style={{ width: 58, height: 58, border: '3px solid rgba(255,106,0,0.15)', borderTopColor: '#FF6A00', borderRadius: '50%', marginBottom: 22 }}
      />
      <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 22, letterSpacing: 5, color: '#FF6A00' }}>LOADING...</div>
      <div style={{ color: 'rgba(226,232,240,0.35)', fontSize: 12, marginTop: 6, fontFamily: '"DM Sans",sans-serif' }}>Gathering chakra energy ⚡</div>
    </div>
  )
}

/* ─────────────────────────────────────────
   BUTTON
───────────────────────────────────────── */
export function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, onClick, type = 'button', fullWidth = false, icon = null, style = {}
}) {
  const pad  = { sm: '7px 14px', md: '10px 22px', lg: '13px 30px' }[size]
  const fs   = { sm: 11, md: 13, lg: 14 }[size]
  const variantStyles = {
    primary: { background: 'linear-gradient(135deg,#FF6A00,#FFB347)', color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: '#FF6A00', border: '2px solid #FF6A00' },
    ghost:   { background: 'rgba(255,106,0,0.08)', color: '#FFB347', border: '1px solid rgba(255,106,0,0.2)' },
    danger:  { background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' },
    success: { background: 'rgba(34,197,94,0.12)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)' },
    dark:    { background: 'rgba(22,33,62,0.9)', color: '#E2E8F0', border: '1px solid rgba(255,106,0,0.2)' },
  }
  return (
    <motion.button
      type={type}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...variantStyles[variant], padding: pad, fontSize: fs,
        fontFamily: '"Exo 2",sans-serif', fontWeight: 700,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        borderRadius: 9, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        width: fullWidth ? '100%' : 'auto', transition: 'box-shadow 0.3s ease',
        position: 'relative', overflow: 'hidden',
        ...style,
      }}
    >
      {loading ? <Spinner size={13} /> : icon}
      {children}
    </motion.button>
  )
}

/* ─────────────────────────────────────────
   INPUT
───────────────────────────────────────── */
export function Input({
  label, name, type = 'text', value, onChange, onBlur,
  error, placeholder, required, icon, disabled, inputStyle = {}, ...rest
}) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(226,232,240,0.5)', marginBottom: 6 }}>
          {label} {required && <span style={{ color: '#FF6A00' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.45, pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type} name={name} value={value}
          onChange={onChange} onBlur={onBlur}
          placeholder={placeholder} required={required} disabled={disabled}
          className="ninja-input"
          style={{ paddingLeft: icon ? 40 : 16, borderColor: error ? 'rgba(239,68,68,0.5)' : undefined, ...inputStyle }}
          {...rest}
        />
      </div>
      {error && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4, fontFamily: '"DM Sans",sans-serif' }}>⚠ {error}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────
   TEXTAREA
───────────────────────────────────────── */
export function Textarea({ label, name, value, onChange, error, placeholder, required, rows = 4 }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(226,232,240,0.5)', marginBottom: 6 }}>
          {label} {required && <span style={{ color: '#FF6A00' }}>*</span>}
        </label>
      )}
      <textarea
        name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required} rows={rows}
        className="ninja-input"
        style={{ resize: 'vertical', borderColor: error ? 'rgba(239,68,68,0.5)' : undefined }}
      />
      {error && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>⚠ {error}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────
   SELECT
───────────────────────────────────────── */
export function Select({ label, name, value, onChange, error, required, options = [], placeholder }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(226,232,240,0.5)', marginBottom: 6 }}>
          {label} {required && <span style={{ color: '#FF6A00' }}>*</span>}
        </label>
      )}
      <select name={name} value={value} onChange={onChange} required={required} className="ninja-input" style={{ cursor: 'pointer' }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>⚠ {error}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────
   MODAL
───────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  const maxW = { sm: 420, md: 560, lg: 740, xl: 920 }[size]

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={e => e.stopPropagation()}
            style={{ background: '#16213E', border: '1px solid rgba(255,106,0,0.22)', borderRadius: 18, width: '100%', maxWidth: maxW, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(0,0,0,0.65)' }}
          >
            {title && (
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,106,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <h2 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 17, color: '#E2E8F0' }}>{title}</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  style={{ width: 32, height: 32, background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 8, cursor: 'pointer', color: 'rgba(226,232,240,0.6)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</motion.button>
              </div>
            )}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>{children}</div>
            {footer && <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,106,0,0.1)', flexShrink: 0 }}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────
   ALERT
───────────────────────────────────────── */
export function Alert({ type = 'info', message, onClose }) {
  const cfg = {
    info:    { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  color: '#60A5FA', icon: 'ℹ️' },
    success: { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   color: '#4ADE80', icon: '✅' },
    warning: { bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.3)',  color: '#FACC15', icon: '⚠️' },
    error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: '#F87171', icon: '❌' },
  }[type]
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, color: cfg.color, fontSize: 13 }}
    >
      <span>{cfg.icon}</span>
      <span style={{ flex: 1, fontFamily: '"DM Sans",sans-serif' }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cfg.color, fontSize: 15, opacity: 0.7 }}>✕</button>}
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   BADGES
───────────────────────────────────────── */
export function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || { label: status, cls: 'badge-gray' }
  return <span className={`badge ${c.cls}`}>{c.label}</span>
}

export function CategoryBadge({ category }) {
  const c = CATEGORIES[category] || { label: category, icon: '📌', color: 'badge-gray' }
  return <span className={`badge ${c.color}`}>{c.icon} {c.label}</span>
}

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="ninja-card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 192, borderRadius: '15px 15px 0 0' }} />
      <div style={{ padding: 18 }}>
        <div className="skeleton" style={{ height: 15, width: '68%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 11, width: '90%', marginBottom: 7 }} />
        <div className="skeleton" style={{ height: 11, width: '55%', marginBottom: 18 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ height: 34, flex: 1 }} />
          <div className="skeleton" style={{ height: 34, width: 80 }} />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */
export function EmptyState({ icon = '🔍', title = 'Nothing found', description = '', action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '72px 24px' }}>
      <div style={{ fontSize: 58, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 20, color: '#E2E8F0', marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 14, maxWidth: 360, margin: '0 auto 24px', fontFamily: '"DM Sans",sans-serif', lineHeight: 1.7 }}>{description}</p>}
      {action}
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────── */
export function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const barColor = color || (pct > 50 ? '#4ADE80' : pct > 20 ? '#FACC15' : '#F87171')
  return (
    <div className="chakra-progress">
      <motion.div
        className="chakra-progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ background: `linear-gradient(90deg,${barColor},${barColor}88)` }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
export function StatCard({ icon, label, value, change, color = '#FF6A00' }) {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(0,0,0,0.4)' }} className="stat-card" transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, background: `${color}1A`, border: `1px solid ${color}44`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
        {change !== undefined && (
          <span style={{ fontSize: 11, fontFamily: '"Exo 2",sans-serif', fontWeight: 700, color: change >= 0 ? '#4ADE80' : '#F87171', background: change >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: 20 }}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 36, letterSpacing: 1, color: '#E2E8F0', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 600, fontSize: 11, color: 'rgba(226,232,240,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 5 }}>{label}</div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   AVATAR
───────────────────────────────────────── */
export function Avatar({ name = '', src, size = 40 }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,106,0,0.3)', flexShrink: 0 }} />
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#FFB347)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Exo 2",sans-serif', fontWeight: 800, fontSize: size * 0.34, color: '#fff', border: '2px solid rgba(255,106,0,0.3)', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

/* ─────────────────────────────────────────
   TOGGLE
───────────────────────────────────────── */
export function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, background: value ? 'linear-gradient(135deg,#FF6A00,#FFB347)' : 'rgba(255,106,0,0.1)', borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background 0.3s', border: '1px solid rgba(255,106,0,0.22)', flexShrink: 0 }}
    >
      <motion.div
        animate={{ x: value ? 21 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ position: 'absolute', top: 3, width: 16, height: 16, background: '#fff', borderRadius: '50%' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────
   DIVIDER
───────────────────────────────────────── */
export function Divider({ style = {} }) {
  return <div className="chakra-divider" style={style} />
}
