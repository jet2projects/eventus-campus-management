import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { eventsAPI, bookingsAPI, paymentsAPI } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import { useCountdown } from '../hooks/index.js'
import { formatDate, formatDateTime, formatPrice, CATEGORIES, getAvailColor, loadRazorpay, truncate } from '../utils/index.js'
import { Button, Modal, Spinner, StatusBadge, CategoryBadge, ProgressBar, Alert, Avatar } from '../components/ui/index.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import PageTransition, { SlideIn } from '../components/animations/PageTransition.jsx'
import toast from 'react-hot-toast'

const TAB_STYLE = (active) => ({
  padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 11,
  textTransform: 'uppercase', letterSpacing: 1.5,
  color: active ? '#FF6A00' : 'rgba(226,232,240,0.38)',
  borderBottom: `2px solid ${active ? '#FF6A00' : 'transparent'}`,
  transition: 'all 0.2s', marginBottom: -1,
})

function FAQItem({ q, a, i }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
      style={{ border: '1px solid rgba(255,106,0,0.1)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '13px 16px', background: 'rgba(22,33,62,0.6)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <span style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 600, fontSize: 14, color: '#E2E8F0' }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ color: '#FF6A00', fontSize: 14, flexShrink: 0 }}>▼</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.28 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', color: 'rgba(226,232,240,0.58)', fontSize: 13, lineHeight: 1.75, fontFamily: '"DM Sans",sans-serif', borderTop: '1px solid rgba(255,106,0,0.08)' }}>{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { joinEventRoom, leaveEventRoom, liveUpdates } = useSocket()

  const [event, setEvent]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [bookingModal, setBookingModal] = useState(false)
  const [quantity, setQuantity]         = useState(1)
  const [booking, setBooking]           = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [activeTab, setActiveTab]       = useState('about')
  const [liveAvailable, setLiveAvailable] = useState(null)

  const countdown = useCountdown(event?.date?.start)
  const deadline  = useCountdown(event?.registrationDeadline)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await eventsAPI.getById(id)
        setEvent(res.data)
        setLiveAvailable(res.data.tickets?.available)
      } catch { navigate('/events') }
      finally { setLoading(false) }
    })()
    joinEventRoom(id)
    return () => leaveEventRoom(id)
  }, [id]) // eslint-disable-line

  // Live socket ticket update
  useEffect(() => {
    const u = liveUpdates?.find(u => u.type === 'booking_update' && u.eventId === id)
    if (u) setLiveAvailable(u.availableTickets)
  }, [liveUpdates, id])

  const handleBook = async () => {
    if (!isAuthenticated) { toast.error('Please login to book'); navigate('/login'); return }
    setBooking(true)
    try {
      const res = await bookingsAPI.create({ eventId: id, quantity })
      if (event.tickets.isFree) {
        toast.success('🎟️ Booking confirmed! Check your dashboard.')
        setBookingModal(false)
        navigate('/dashboard/bookings')
      } else {
        await handlePayment(res.data)
      }
    } catch (err) { toast.error(err.message) }
    finally { setBooking(false) }
  }

  const handlePayment = async (bookingData) => {
    setPaymentLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { toast.error('Payment gateway failed to load'); return }

      const orderRes = await paymentsAPI.createOrder(bookingData._id)
      const { orderId, amount, currency, keyId } = orderRes.data

      const rzp = new window.Razorpay({
        key: keyId, amount, currency, order_id: orderId,
        name: 'Campus Events ⚡',
        description: event.title,
        handler: async (response) => {
          try {
            await paymentsAPI.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId: bookingData._id,
            })
            toast.success('🎉 Payment successful! Booking confirmed!')
            setBookingModal(false)
            navigate('/dashboard/bookings')
          } catch { toast.error('Payment verification failed') }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#FF6A00' },
        modal: { ondismiss: () => { toast('Payment cancelled', { icon: 'ℹ️' }); setPaymentLoading(false) } },
      })
      rzp.open()
    } catch (err) { toast.error(err.message) }
    finally { setPaymentLoading(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060B14' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size={50} />
        <p style={{ marginTop: 16, color: 'rgba(226,232,240,0.45)', fontFamily: '"Exo 2",sans-serif', fontSize: 13 }}>Loading event...</p>
      </div>
    </div>
  )
  if (!event) return null

  const available     = liveAvailable ?? event.tickets?.available ?? 0
  const total         = event.tickets?.total || 1
  const pct           = Math.round((available / total) * 100)
  const isSoldOut     = available === 0
  const isAlmostFull  = pct <= 20 && !isSoldOut
  const isDeadlinePast = new Date() > new Date(event.registrationDeadline)
  const canBook       = !isSoldOut && !isDeadlinePast && event.status === 'approved'
  const totalPrice    = (event.tickets?.price || 0) * quantity

  const tabs = [
    { id: 'about',    label: 'About'    },
    { id: 'schedule', label: 'Schedule' },
    { id: 'speakers', label: 'Speakers' },
    { id: 'faqs',     label: 'FAQs'     },
  ]

  return (
    <PageTransition>
      <Navbar />

      {/* ── Hero banner ── */}
      <div style={{ position: 'relative', height: '55vh', minHeight: 380, overflow: 'hidden' }}>
        {event.banner
          ? <motion.img src={event.banner} alt={event.title} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.2 }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,rgba(255,106,0,0.18),#1A1A2E,#060B14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, opacity: 0.4 }}>{CATEGORIES[event.category]?.icon}</div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,11,20,0.3) 0%, rgba(6,11,20,0.75) 60%, rgba(6,11,20,1) 100%)' }} />

        {/* Banner content */}
        <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <CategoryBadge category={event.category} />
              <StatusBadge status={event.status} />
              {event.isFeatured && <span className="badge badge-gold">⭐ Featured</span>}
              {isAlmostFull && <span className="badge badge-red">🔥 Almost Full!</span>}
            </div>
            <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 'clamp(2rem,5vw,3.8rem)', letterSpacing: 2, color: '#fff', lineHeight: 1, marginBottom: 10, textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}>{event.title}</h1>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', color: 'rgba(226,232,240,0.62)', fontSize: 13, fontFamily: '"DM Sans",sans-serif' }}>
              <span>📅 {formatDateTime(event.date?.start)}</span>
              <span>📍 {event.venue?.name}</span>
              <span>👥 {event.venue?.capacity} cap</span>
              <span>👁️ {event.analytics?.views || 0} views</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 90px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }} className="detail-grid">

        {/* LEFT */}
        <div>
          {/* Countdown */}
          {!countdown.expired && (
            <SlideIn direction="up">
              <div style={{ background: 'rgba(22,33,62,0.72)', border: '1px solid rgba(255,106,0,0.22)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', backdropFilter: 'blur(12px)' }}>
                <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: '#FF6A00' }}>⏰ Event Starts In</div>
                <div style={{ display: 'flex', gap: 18 }}>
                  {[['Days', countdown.days], ['Hrs', countdown.hours], ['Min', countdown.minutes], ['Sec', countdown.seconds]].map(([u, v]) => (
                    <div key={u} style={{ textAlign: 'center' }}>
                      <AnimatePresence mode="wait">
                        <motion.div key={v} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }} className="chakra-text" style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 30, lineHeight: 1 }}>
                          {String(v ?? 0).padStart(2, '0')}
                        </motion.div>
                      </AnimatePresence>
                      <div style={{ fontSize: 9, color: 'rgba(226,232,240,0.38)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{u}</div>
                    </div>
                  ))}
                </div>
              </div>
            </SlideIn>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,106,0,0.1)', marginBottom: 24 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={TAB_STYLE(activeTab === t.id)}>{t.label}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

              {/* ABOUT */}
              {activeTab === 'about' && (
                <div>
                  <p style={{ color: 'rgba(226,232,240,0.68)', fontSize: 15, lineHeight: 1.85, fontFamily: '"DM Sans",sans-serif', marginBottom: 24 }}>{event.description}</p>
                  {event.requirements && (
                    <div style={{ background: 'rgba(255,106,0,0.05)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                      <h3 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 12, color: '#FF6A00', marginBottom: 10, letterSpacing: 1 }}>📋 Requirements</h3>
                      <p style={{ color: 'rgba(226,232,240,0.6)', fontSize: 13, lineHeight: 1.7, fontFamily: '"DM Sans",sans-serif' }}>{event.requirements}</p>
                    </div>
                  )}
                  {event.tags?.length > 0 && (
                    <div>
                      <h3 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(226,232,240,0.35)', marginBottom: 10 }}>Tags</h3>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {event.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SCHEDULE */}
              {activeTab === 'schedule' && (
                <div>
                  {event.schedule?.length > 0
                    ? event.schedule.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        style={{ display: 'flex', gap: 18, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,106,0,0.07)' }}>
                        <div style={{ minWidth: 68, fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 12, color: '#FF6A00', paddingTop: 2 }}>{item.time}</div>
                        <div>
                          <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 600, fontSize: 14, color: '#E2E8F0' }}>{item.activity}</div>
                          {item.speaker && <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginTop: 4 }}>by {item.speaker}</div>}
                        </div>
                      </motion.div>
                    ))
                    : <p style={{ color: 'rgba(226,232,240,0.28)', fontFamily: '"DM Sans",sans-serif', textAlign: 'center', padding: '40px 0' }}>No schedule added yet.</p>}
                </div>
              )}

              {/* SPEAKERS */}
              {activeTab === 'speakers' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 16 }}>
                  {event.speakers?.length > 0
                    ? event.speakers.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                        style={{ background: 'rgba(22,33,62,0.7)', border: '1px solid rgba(255,106,0,0.12)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                        <Avatar name={s.name} src={s.avatar} size={60} />
                        <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 14, color: '#E2E8F0', marginTop: 12 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#FF6A00', marginTop: 3 }}>{s.designation}</div>
                        {s.bio && <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)', marginTop: 8, lineHeight: 1.55 }}>{s.bio}</div>}
                      </motion.div>
                    ))
                    : <p style={{ color: 'rgba(226,232,240,0.28)', fontFamily: '"DM Sans",sans-serif', textAlign: 'center', padding: '40px 0', gridColumn: '1/-1' }}>No speakers listed yet.</p>}
                </div>
              )}

              {/* FAQS */}
              {activeTab === 'faqs' && (
                <div>
                  {event.faqs?.length > 0
                    ? event.faqs.map((f, i) => <FAQItem key={i} q={f.question} a={f.answer} i={i} />)
                    : <p style={{ color: 'rgba(226,232,240,0.28)', fontFamily: '"DM Sans",sans-serif', textAlign: 'center', padding: '40px 0' }}>No FAQs added yet.</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT – Booking card */}
        <div>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ position: 'sticky', top: 90 }}>
            <div style={{ background: 'rgba(22,33,62,0.92)', border: '1px solid rgba(255,106,0,0.22)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
              {/* Price header */}
              <div style={{ background: 'linear-gradient(135deg,rgba(255,106,0,0.14),rgba(255,179,71,0.07))', padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,106,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div className="chakra-text" style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 36, lineHeight: 1 }}>
                    {event.tickets?.isFree ? 'FREE' : formatPrice(event.tickets?.price)}
                  </div>
                  {!event.tickets?.isFree && <span style={{ color: 'rgba(226,232,240,0.38)', fontSize: 12, fontFamily: '"DM Sans",sans-serif' }}>per ticket</span>}
                </div>
                <ProgressBar value={available} max={total} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, fontFamily: '"Exo 2",sans-serif', fontWeight: 700 }}>
                  <span style={{ color: 'rgba(226,232,240,0.38)' }}>{total - available} booked</span>
                  <span style={{ color: getAvailColor(pct) }}>{available} seats left</span>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '20px 24px' }}>
                {[
                  { icon: '📅', label: 'Date', val: formatDate(event.date?.start, 'EEE, MMM dd yyyy') },
                  { icon: '⏰', label: 'Time', val: `${formatDate(event.date?.start, 'h:mm a')} – ${formatDate(event.date?.end, 'h:mm a')}` },
                  { icon: '📍', label: 'Venue', val: event.venue?.name },
                  { icon: '⏳', label: 'Deadline', val: formatDate(event.registrationDeadline, 'MMM dd, yyyy') },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 12, marginBottom: 13, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: '"Exo 2",sans-serif', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(226,232,240,0.32)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontFamily: '"DM Sans",sans-serif', color: 'rgba(226,232,240,0.78)' }}>{item.val}</div>
                    </div>
                  </div>
                ))}

                {/* Warnings */}
                {!isDeadlinePast && !deadline.expired && deadline.days === 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <Alert type="warning" message={`Closes in ${deadline.hours}h ${deadline.minutes}m!`} />
                  </div>
                )}
                {isDeadlinePast && <div style={{ marginBottom: 14 }}><Alert type="error" message="Registration deadline has passed" /></div>}

                {/* Quantity */}
                {canBook && isAuthenticated && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(226,232,240,0.45)', marginBottom: 8 }}>Tickets</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <motion.button key={n} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setQuantity(n)}
                          style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${quantity === n ? '#FF6A00' : 'rgba(255,106,0,0.15)'}`, background: quantity === n ? 'rgba(255,106,0,0.18)' : 'transparent', color: quantity === n ? '#FF6A00' : 'rgba(226,232,240,0.45)', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                          {n}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                {canBook && !event.tickets?.isFree && quantity > 1 && (
                  <div style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.14)', borderRadius: 10, padding: '11px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, color: 'rgba(226,232,240,0.55)' }}>Total ({quantity} tickets)</span>
                    <span className="chakra-text" style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 24 }}>{formatPrice(totalPrice)}</span>
                  </div>
                )}

                {/* CTA */}
                {canBook ? (
                  <Button onClick={() => isAuthenticated ? setBookingModal(true) : navigate('/login')} fullWidth size="lg" loading={booking || paymentLoading}>
                    ⚡ {event.tickets?.isFree ? 'Reserve Free Ticket' : `Pay ${formatPrice(totalPrice)}`}
                  </Button>
                ) : isSoldOut ? (
                  <div style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 10, padding: 14, textAlign: 'center', color: '#F87171', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13 }}>🚫 Sold Out</div>
                ) : null}

                {!isAuthenticated && canBook && (
                  <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'rgba(226,232,240,0.38)', fontFamily: '"DM Sans",sans-serif' }}>
                    <Link to="/login" style={{ color: '#FF6A00' }}>Login</Link> to book tickets
                  </p>
                )}

                {/* Organizer */}
                {event.organizer && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,106,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={event.organizer.name} size={36} />
                    <div>
                      <div style={{ fontSize: 9, color: 'rgba(226,232,240,0.32)', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>Organizer</div>
                      <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.75)', fontFamily: '"DM Sans",sans-serif', marginTop: 1 }}>{event.organizer.name}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Confirm Booking" size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={() => setBookingModal(false)} fullWidth>Cancel</Button>
            <Button onClick={handleBook} loading={booking || paymentLoading} fullWidth>
              ⚡ {event.tickets?.isFree ? 'Confirm Free' : `Pay ${formatPrice(totalPrice)}`}
            </Button>
          </div>
        }
      >
        <div>
          <div style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 15, color: '#E2E8F0', marginBottom: 13 }}>{event.title}</div>
            {[
              ['📅 Date',    formatDate(event.date?.start, 'EEE, MMM dd yyyy')],
              ['📍 Venue',   event.venue?.name],
              ['🎟️ Tickets', `${quantity}x ${event.tickets?.isFree ? 'FREE' : formatPrice(event.tickets?.price)}`],
              ['💰 Total',   event.tickets?.isFree ? 'FREE' : formatPrice(totalPrice)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,106,0,0.06)', fontSize: 13 }}>
                <span style={{ color: 'rgba(226,232,240,0.48)', fontFamily: '"DM Sans",sans-serif' }}>{label}</span>
                <span style={{ color: '#E2E8F0', fontFamily: '"Exo 2",sans-serif', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.32)', textAlign: 'center', fontFamily: '"DM Sans",sans-serif', lineHeight: 1.6 }}>
            {event.tickets?.isFree ? 'Your QR ticket will be generated immediately.' : 'You will be redirected to Razorpay payment gateway.'}
          </p>
        </div>
      </Modal>

      <Footer />
      <style>{`@media(max-width:900px){.detail-grid{grid-template-columns:1fr!important}}`}</style>
    </PageTransition>
  )
}
