import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qr-code'
import { bookingsAPI } from '../services/api.js'
import { authAPI } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Modal, Alert, Input, Avatar, StatusBadge, CategoryBadge, EmptyState, Spinner } from '../components/ui/index.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import PageTransition from '../components/animations/PageTransition.jsx'
import ParticleBackground from '../components/animations/ParticleBackground.jsx'
import { formatDate, formatDateTime, formatPrice, timeAgo } from '../utils/index.js'
import toast from 'react-hot-toast'

const SIDEBAR_ITEMS = [
  { id: 'overview',  icon: '🏠', label: 'Overview'   },
  { id: 'bookings',  icon: '🎟️', label: 'My Bookings' },
  { id: 'settings',  icon: '⚙️', label: 'Settings'   },
]

function SidebarNav({ active, setActive, user }) {
  return (
    <div style={{ width: 240, background: 'rgba(22,33,62,0.85)', borderRight: '1px solid rgba(255,106,0,0.1)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, backdropFilter: 'blur(14px)' }}>
      {/* User chip */}
      <div style={{ padding: '12px 10px', marginBottom: 14, background: 'rgba(255,106,0,0.07)', border: '1px solid rgba(255,106,0,0.14)', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user?.name} size={38} />
          <div>
            <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13, color: '#E2E8F0', lineHeight: 1.2 }}>{user?.name?.split(' ')[0]}</div>
            <div style={{ fontSize: 10, color: '#FF6A00', textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 }}>{user?.role}</div>
          </div>
        </div>
      </div>

      {SIDEBAR_ITEMS.map(item => (
        <motion.div key={item.id} whileHover={{ x: 3 }}
          onClick={() => setActive(item.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, cursor: 'pointer', background: active === item.id ? 'rgba(255,106,0,0.12)' : 'transparent', border: `1px solid ${active === item.id ? 'rgba(255,106,0,0.3)' : 'transparent'}`, color: active === item.id ? '#FF6A00' : 'rgba(226,232,240,0.55)', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 0.5, transition: 'all 0.2s', boxShadow: active === item.id ? 'inset 3px 0 0 #FF6A00' : 'none' }}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </motion.div>
      ))}
    </div>
  )
}

/* ── Overview Panel ── */
function OverviewPanel({ bookings, user }) {
  const confirmed  = bookings.filter(b => b.status === 'confirmed').length
  const cancelled  = bookings.filter(b => b.status === 'cancelled').length
  const upcoming   = bookings.filter(b => b.status === 'confirmed' && new Date(b.event?.date?.start) > new Date()).length
  const totalSpent = bookings.filter(b => b.payment?.status === 'completed').reduce((s, b) => s + (b.totalAmount || 0), 0)

  const stats = [
    { icon: '🎟️', label: 'Total Bookings',  value: bookings.length, color: '#FF6A00' },
    { icon: '✅', label: 'Confirmed',        value: confirmed,       color: '#4ADE80' },
    { icon: '📅', label: 'Upcoming Events',  value: upcoming,        color: '#60A5FA' },
    { icon: '💰', label: 'Total Spent',      value: formatPrice(totalSpent), color: '#FACC15' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#FF6A00', marginBottom: 6 }}>Welcome back</div>
        <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: 2, color: '#E2E8F0' }}>
          Hey, <span className="chakra-text">{user?.name?.split(' ')[0]}!</span> 🔥
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.42)', fontSize: 14, fontFamily: '"DM Sans",sans-serif', marginTop: 4 }}>Here's your ninja activity dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}
            style={{ background: 'linear-gradient(135deg,#16213E,#1A1A2E)', border: `1px solid ${s.color}25`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 30, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 600, fontSize: 10, color: 'rgba(226,232,240,0.38)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent bookings */}
      <h2 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 14, color: '#E2E8F0', marginBottom: 14 }}>Recent Bookings</h2>
      {bookings.slice(0, 4).length === 0
        ? <EmptyState icon="🎟️" title="No bookings yet" description="Start exploring events!" action={<Link to="/events"><Button>Browse Events</Button></Link>} />
        : bookings.slice(0, 4).map(b => <BookingRow key={b._id} booking={b} compact />)
      }
    </div>
  )
}

/* ── Booking Row ── */
function BookingRow({ booking: b, compact, onViewTicket, onCancel }) {
  return (
    <motion.div whileHover={{ x: 2 }} style={{ background: 'rgba(22,33,62,0.6)', border: '1px solid rgba(255,106,0,0.1)', borderRadius: 12, padding: compact ? '14px 16px' : '18px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,106,0,0.28)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,106,0,0.1)'}
    >
      <div style={{ width: 42, height: 42, background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {b.event?.category === 'hackathon' ? '💻' : b.event?.category === 'cultural' ? '🎭' : b.event?.category === 'sports' ? '⚽' : '🎟️'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13, color: '#E2E8F0', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.event?.title || 'Event'}</div>
        <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', fontFamily: '"DM Sans",sans-serif' }}>
          {b.event?.date?.start ? formatDate(b.event.date.start) : '—'} · {b.quantity} ticket{b.quantity > 1 ? 's' : ''} · {formatPrice(b.totalAmount)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <StatusBadge status={b.status} />
        {!compact && (
          <div style={{ display: 'flex', gap: 6 }}>
            {b.status === 'confirmed' && b.qrCode && (
              <Button size="sm" variant="ghost" onClick={() => onViewTicket(b)} style={{ fontSize: 10 }}>🎫 Ticket</Button>
            )}
            {['confirmed', 'pending'].includes(b.status) && (
              <Button size="sm" variant="danger" onClick={() => onCancel(b)} style={{ fontSize: 10 }}>Cancel</Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Bookings Panel ── */
function BookingsPanel({ bookings, loading, refetch }) {
  const [filter, setFilter]       = useState('all')
  const [ticketModal, setTicketModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelling, setCancelling]   = useState(false)

  const FILTERS = [
    { v: 'all', label: 'All' },
    { v: 'confirmed', label: 'Confirmed' },
    { v: 'pending', label: 'Pending' },
    { v: 'cancelled', label: 'Cancelled' },
  ]

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const handleCancel = async () => {
    if (!cancelModal) return
    setCancelling(true)
    try {
      await bookingsAPI.cancel(cancelModal._id, 'Cancelled by user')
      toast.success('Booking cancelled')
      setCancelModal(null)
      refetch()
    } catch (err) { toast.error(err.message) }
    finally { setCancelling(false) }
  }

  return (
    <div>
      <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '2.2rem', letterSpacing: 2, color: '#E2E8F0', marginBottom: 22 }}>
        My <span className="chakra-text">Bookings</span>
      </h2>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <motion.button key={f.v} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(f.v)}
            style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filter === f.v ? '#FF6A00' : 'rgba(255,106,0,0.15)'}`, background: filter === f.v ? 'rgba(255,106,0,0.14)' : 'transparent', color: filter === f.v ? '#FF6A00' : 'rgba(226,232,240,0.5)', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 11, cursor: 'pointer', letterSpacing: 0.8, transition: 'all 0.2s' }}>
            {f.label} {filter === f.v && `(${filtered.length})`}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={40} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎟️" title="No bookings found" description={filter === 'all' ? "You haven't booked any events yet." : `No ${filter} bookings.`} action={filter === 'all' ? <Link to="/events"><Button>Browse Events</Button></Link> : undefined} />
      ) : (
        <div>
          {filtered.map(b => <BookingRow key={b._id} booking={b} onViewTicket={setTicketModal} onCancel={setCancelModal} />)}
        </div>
      )}

      {/* Ticket Modal */}
      <Modal isOpen={!!ticketModal} onClose={() => setTicketModal(null)} title="Your Ticket 🎟️" size="sm">
        {ticketModal && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, display: 'inline-block', marginBottom: 20 }}>
              <QRCode value={ticketModal.qrCodeData || ticketModal.bookingId} size={200} />
            </div>
            <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 800, fontSize: 22, color: '#FF6A00', letterSpacing: 2, marginBottom: 6 }}>{ticketModal.bookingId}</div>
            <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.55)', fontFamily: '"DM Sans",sans-serif', marginBottom: 4 }}>{ticketModal.event?.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', fontFamily: '"DM Sans",sans-serif' }}>
              {ticketModal.event?.date?.start ? formatDate(ticketModal.event.date.start) : ''} · {ticketModal.quantity} ticket{ticketModal.quantity > 1 ? 's' : ''}
            </div>
            <div style={{ marginTop: 16, padding: '10px 16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.28)', borderRadius: 9, color: '#4ADE80', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
              ✅ VALID TICKET
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking" size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={() => setCancelModal(null)} fullWidth>Keep Booking</Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling} fullWidth>Cancel Booking</Button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>😢</div>
          <p style={{ color: 'rgba(226,232,240,0.65)', fontFamily: '"DM Sans",sans-serif', lineHeight: 1.7 }}>
            Are you sure you want to cancel your booking for <strong style={{ color: '#E2E8F0' }}>{cancelModal?.event?.title}</strong>?
          </p>
        </div>
      </Modal>
    </div>
  )
}

/* ── Settings Panel ── */
function SettingsPanel({ user, updateUser }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwError, setPwError] = useState('')

  const set   = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const setPw = f => e => setPwForm(p => ({ ...p, [f]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await authAPI.updateProfile(form)
      updateUser(res.user)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handlePwChange = async (e) => {
    e.preventDefault(); setPwError('')
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match'); return }
    if (pwForm.newPassword.length < 6) { setPwError('Min 6 characters'); return }
    setSavingPw(true)
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { setPwError(err.message) }
    finally { setSavingPw(false) }
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '2.2rem', letterSpacing: 2, color: '#E2E8F0', marginBottom: 28 }}>
        Account <span className="chakra-text">Settings</span>
      </h2>

      {/* Profile info */}
      <div style={{ background: 'rgba(22,33,62,0.7)', border: '1px solid rgba(255,106,0,0.14)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13, color: '#FF6A00', marginBottom: 18, letterSpacing: 1 }}>👤 Profile Information</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" value={form.name} onChange={set('name')} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 99999 99999" />
            <Input label="Department" value={form.department} onChange={set('department')} placeholder="Computer Science" />
          </div>
          <div style={{ background: 'rgba(255,106,0,0.05)', border: '1px solid rgba(255,106,0,0.1)', borderRadius: 9, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.38)', fontFamily: '"Exo 2",sans-serif', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Email</div>
            <div style={{ fontSize: 14, color: 'rgba(226,232,240,0.65)', fontFamily: '"DM Sans",sans-serif' }}>{user?.email}</div>
          </div>
          <Button type="submit" loading={saving} size="md" style={{ alignSelf: 'flex-start' }}>Save Changes</Button>
        </form>
      </div>

      {/* Change password */}
      <div style={{ background: 'rgba(22,33,62,0.7)', border: '1px solid rgba(255,106,0,0.14)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13, color: '#FF6A00', marginBottom: 18, letterSpacing: 1 }}>🔒 Change Password</h3>
        {pwError && <div style={{ marginBottom: 14 }}><Alert type="error" message={pwError} onClose={() => setPwError('')} /></div>}
        <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={setPw('currentPassword')} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="New Password" type="password" value={pwForm.newPassword} onChange={setPw('newPassword')} required />
            <Input label="Confirm Password" type="password" value={pwForm.confirmPassword} onChange={setPw('confirmPassword')} required />
          </div>
          <Button type="submit" loading={savingPw} size="md" style={{ alignSelf: 'flex-start' }}>Update Password</Button>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN STUDENT DASHBOARD
═══════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const { user, updateUser } = useAuth()
  const navigate             = useNavigate()
  const [activePanel, setActivePanel] = useState('overview')
  const [bookings, setBookings]       = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  const loadBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await bookingsAPI.getMy({ limit: 50 })
      setBookings(res.data || [])
    } catch { /* ignore */ }
    finally { setLoadingBookings(false) }
  }

  useEffect(() => { loadBookings() }, [])

  // Route /dashboard/bookings and /dashboard/settings via path
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes('/bookings')) setActivePanel('bookings')
    else if (path.includes('/settings')) setActivePanel('settings')
  }, [])

  return (
    <PageTransition>
      <Navbar />
      <ParticleBackground count={12} />

      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', position: 'relative', zIndex: 1 }}>
        {/* Sidebar – hide on mobile */}
        <div className="hide-mobile">
          <SidebarNav active={activePanel} setActive={setActivePanel} user={user} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '36px 32px', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activePanel} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              {activePanel === 'overview' && <OverviewPanel bookings={bookings} user={user} />}
              {activePanel === 'bookings' && <BookingsPanel bookings={bookings} loading={loadingBookings} refetch={loadBookings} />}
              {activePanel === 'settings' && <SettingsPanel user={user} updateUser={updateUser} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="show-mobile" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(22,33,62,0.97)', borderTop: '1px solid rgba(255,106,0,0.15)', display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 500, backdropFilter: 'blur(16px)' }}>
        {SIDEBAR_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActivePanel(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: activePanel === item.id ? '#FF6A00' : 'rgba(226,232,240,0.4)', fontSize: 20, padding: '4px 16px', transition: 'color 0.2s' }}>
            {item.icon}
            <span style={{ fontSize: 9, fontFamily: '"Exo 2",sans-serif', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </PageTransition>
  )
}
