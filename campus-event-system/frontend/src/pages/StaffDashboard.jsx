import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { eventsAPI, uploadAPI } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Input, Textarea, Select, Modal, Alert, StatusBadge, CategoryBadge, EmptyState, Spinner, StatCard } from '../components/ui/index.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import PageTransition from '../components/animations/PageTransition.jsx'
import ParticleBackground from '../components/animations/ParticleBackground.jsx'
import { formatDate, formatPrice, truncate, CATEGORIES } from '../utils/index.js'
import { Avatar } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const SIDEBAR = [
  { id: 'overview',  icon: '🏠', label: 'Overview'    },
  { id: 'events',    icon: '📅', label: 'My Events'    },
  { id: 'create',    icon: '➕', label: 'Create Event'  },
]

const EMPTY_FORM = {
  title: '', description: '', shortDescription: '', category: '', tags: '',
  venueName: '', venueCapacity: 500, venueAddress: '',
  startDate: '', endDate: '', registrationDeadline: '',
  ticketTotal: 100, ticketPrice: 0, requirements: '',
}

/* ── Event Form ── */
function EventForm({ initial = EMPTY_FORM, onSubmit, loading, onCancel }) {
  const [form, setForm]     = useState(initial)
  const [banner, setBanner] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]   = useState('')

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleBanner = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadAPI.uploadImage(file)
      setBanner(res.url)
      toast.success('Banner uploaded!')
    } catch (err) { toast.error(err.message) }
    finally { setUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.description || !form.category || !form.venueName || !form.startDate || !form.endDate || !form.registrationDeadline) {
      setError('Please fill all required fields'); return
    }
    const payload = {
      title: form.title, description: form.description,
      shortDescription: form.shortDescription, category: form.category,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      venue: { name: form.venueName, capacity: Number(form.venueCapacity), address: form.venueAddress },
      date: { start: new Date(form.startDate), end: new Date(form.endDate) },
      registrationDeadline: new Date(form.registrationDeadline),
      tickets: { total: Number(form.ticketTotal), price: Number(form.ticketPrice), isFree: Number(form.ticketPrice) === 0 },
      requirements: form.requirements,
      ...(banner ? { banner } : {}),
    }
    try { await onSubmit(payload) }
    catch (err) { setError(err.message) }
  }

  const catOptions = Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1/-1' }}><Input label="Event Title" value={form.title} onChange={set('title')} placeholder="HackFest 2025" required /></div>
        <Select label="Category" value={form.category} onChange={set('category')} options={catOptions} placeholder="Select category" required />
        <Input label="Tags (comma separated)" value={form.tags} onChange={set('tags')} placeholder="coding, innovation, prizes" />
      </div>

      <Textarea label="Short Description" name="shortDescription" value={form.shortDescription} onChange={set('shortDescription')} rows={2} placeholder="Brief 1-2 line description" />
      <Textarea label="Full Description" name="description" value={form.description} onChange={set('description')} rows={5} placeholder="Detailed event description..." required />

      {/* Banner upload */}
      <div>
        <label style={{ display: 'block', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(226,232,240,0.48)', marginBottom: 8 }}>Banner Image</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.22)', borderRadius: 9, color: '#FFB347', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>
            {uploading ? <Spinner size={14} /> : '📷'} {uploading ? 'Uploading…' : 'Upload Banner'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBanner} />
          </label>
          {banner && <img src={banner} alt="banner" style={{ height: 50, borderRadius: 8, border: '1px solid rgba(255,106,0,0.3)' }} />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Venue Name" value={form.venueName} onChange={set('venueName')} placeholder="Main Auditorium" required />
        <Input label="Venue Capacity" type="number" value={form.venueCapacity} onChange={set('venueCapacity')} required />
        <Input label="Venue Address" value={form.venueAddress} onChange={set('venueAddress')} placeholder="Block A, Campus" />
        <div />
        <Input label="Start Date & Time" type="datetime-local" value={form.startDate} onChange={set('startDate')} required />
        <Input label="End Date & Time" type="datetime-local" value={form.endDate} onChange={set('endDate')} required />
        <Input label="Registration Deadline" type="datetime-local" value={form.registrationDeadline} onChange={set('registrationDeadline')} required />
        <div />
        <Input label="Total Tickets" type="number" value={form.ticketTotal} onChange={set('ticketTotal')} required />
        <Input label="Ticket Price (0 = Free)" type="number" value={form.ticketPrice} onChange={set('ticketPrice')} />
      </div>

      <Textarea label="Requirements (optional)" name="requirements" value={form.requirements} onChange={set('requirements')} rows={3} placeholder="List any prerequisites or requirements..." />

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        {onCancel && <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>}
        <Button type="submit" loading={loading}>⚡ {initial?.title ? 'Update Event' : 'Create Event'}</Button>
      </div>
    </form>
  )
}

/* ── Events List ── */
function MyEventsPanel({ events, loading, onEdit, onDelete, onRefresh }) {
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (id) => {
    setDeleting(id)
    try { await eventsAPI.delete(id); toast.success('Event deleted'); onRefresh() }
    catch (err) { toast.error(err.message) }
    finally { setDeleting(null) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={44} /></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '2.2rem', letterSpacing: 2, color: '#E2E8F0' }}>My <span className="chakra-text">Events</span></h2>
        <Button onClick={onRefresh} variant="ghost" size="sm">↻ Refresh</Button>
      </div>

      {events.length === 0
        ? <EmptyState icon="📅" title="No events yet" description="Create your first campus event!" />
        : events.map(ev => (
          <motion.div key={ev._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}
            style={{ background: 'rgba(22,33,62,0.7)', border: '1px solid rgba(255,106,0,0.13)', borderRadius: 14, padding: '18px 20px', marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,106,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,106,0,0.13)'}
          >
            {/* Icon */}
            <div style={{ width: 48, height: 48, background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {CATEGORIES[ev.category]?.icon || '📅'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 14, color: '#E2E8F0' }}>{truncate(ev.title, 55)}</span>
                <StatusBadge status={ev.status} />
                <CategoryBadge category={ev.category} />
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: 'rgba(226,232,240,0.42)', fontFamily: '"DM Sans",sans-serif' }}>
                <span>📅 {formatDate(ev.date?.start)}</span>
                <span>📍 {ev.venue?.name}</span>
                <span>🎟️ {ev.tickets?.available}/{ev.tickets?.total} available</span>
                <span>💰 {formatPrice(ev.tickets?.price)}</span>
                <span>👁️ {ev.analytics?.views || 0} views</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
              <Link to={`/events/${ev._id}`} style={{ textDecoration: 'none' }}>
                <Button size="sm" variant="ghost">View</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => onEdit(ev)}>Edit</Button>
              <Button size="sm" variant="danger" loading={deleting === ev._id} onClick={() => handleDelete(ev._id)}>Delete</Button>
            </div>
          </motion.div>
        ))
      }
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN STAFF DASHBOARD
═══════════════════════════════════════════════════ */
export default function StaffDashboard() {
  const { user } = useAuth()
  const [active, setActive]       = useState('overview')
  const [events, setEvents]       = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [creating, setCreating]   = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [editModal, setEditModal] = useState(false)

  const loadEvents = async () => {
    setLoadingEvents(true)
    try { const r = await eventsAPI.getMyEvents(); setEvents(r.data || []) }
    catch { /* ignore */ }
    finally { setLoadingEvents(false) }
  }

  useEffect(() => { loadEvents() }, [])

  const handleCreate = async (payload) => {
    setCreating(true)
    try {
      await eventsAPI.create(payload)
      toast.success('🔥 Event created! Pending admin approval.')
      setActive('events')
      loadEvents()
    } catch (err) { toast.error(err.message); throw err }
    finally { setCreating(false) }
  }

  const handleEdit = async (payload) => {
    try {
      await eventsAPI.update(editEvent._id, payload)
      toast.success('Event updated!')
      setEditModal(false)
      setEditEvent(null)
      loadEvents()
    } catch (err) { toast.error(err.message); throw err }
  }

  const openEdit = (ev) => {
    setEditEvent({
      ...ev,
      venueName: ev.venue?.name || '',
      venueCapacity: ev.venue?.capacity || 100,
      venueAddress: ev.venue?.address || '',
      startDate: ev.date?.start ? new Date(ev.date.start).toISOString().slice(0, 16) : '',
      endDate: ev.date?.end ? new Date(ev.date.end).toISOString().slice(0, 16) : '',
      registrationDeadline: ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString().slice(0, 16) : '',
      ticketTotal: ev.tickets?.total || 100,
      ticketPrice: ev.tickets?.price || 0,
      tags: (ev.tags || []).join(', '),
    })
    setEditModal(true)
  }

  const total       = events.length
  const approved    = events.filter(e => e.status === 'approved').length
  const pending     = events.filter(e => e.status === 'pending').length
  const totalViews  = events.reduce((s, e) => s + (e.analytics?.views || 0), 0)

  return (
    <PageTransition>
      <Navbar />
      <ParticleBackground count={12} />

      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', position: 'relative', zIndex: 1 }}>
        {/* Sidebar */}
        <div className="hide-mobile" style={{ width: 240, background: 'rgba(22,33,62,0.85)', borderRight: '1px solid rgba(255,106,0,0.1)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, backdropFilter: 'blur(14px)' }}>
          <div style={{ padding: '12px 10px', marginBottom: 14, background: 'rgba(255,106,0,0.07)', border: '1px solid rgba(255,106,0,0.14)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={user?.name} size={38} />
              <div>
                <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13, color: '#E2E8F0' }}>{user?.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 }}>Staff</div>
              </div>
            </div>
          </div>
          {SIDEBAR.map(item => (
            <motion.div key={item.id} whileHover={{ x: 3 }} onClick={() => setActive(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, cursor: 'pointer', background: active === item.id ? 'rgba(255,106,0,0.12)' : 'transparent', border: `1px solid ${active === item.id ? 'rgba(255,106,0,0.3)' : 'transparent'}`, color: active === item.id ? '#FF6A00' : 'rgba(226,232,240,0.55)', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 12, transition: 'all 0.2s', boxShadow: active === item.id ? 'inset 3px 0 0 #FF6A00' : 'none' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '36px 32px', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>

              {/* OVERVIEW */}
              {active === 'overview' && (
                <div>
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#60A5FA', marginBottom: 6 }}>Staff Portal</div>
                    <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: 2, color: '#E2E8F0' }}>
                      Sensei <span className="chakra-text">{user?.name?.split(' ')[0]}</span> 🎓
                    </h1>
                    <p style={{ color: 'rgba(226,232,240,0.42)', fontSize: 14, fontFamily: '"DM Sans",sans-serif', marginTop: 4 }}>Your event management headquarters</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 16, marginBottom: 30 }}>
                    <StatCard icon="📅" label="Total Events"    value={total}       color="#FF6A00" />
                    <StatCard icon="✅" label="Approved"        value={approved}    color="#4ADE80" />
                    <StatCard icon="⏳" label="Pending Review"  value={pending}     color="#FACC15" />
                    <StatCard icon="👁️" label="Total Views"     value={totalViews}  color="#60A5FA" />
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
                    <Button onClick={() => setActive('create')}>➕ Create New Event</Button>
                    <Button variant="ghost" onClick={() => setActive('events')}>📅 My Events</Button>
                  </div>
                  {/* Recent events preview */}
                  {events.slice(0, 3).map(ev => (
                    <div key={ev._id} style={{ background: 'rgba(22,33,62,0.6)', border: '1px solid rgba(255,106,0,0.1)', borderRadius: 12, padding: '14px 18px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13, color: '#E2E8F0', marginBottom: 3 }}>{truncate(ev.title, 48)}</div>
                        <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.38)', fontFamily: '"DM Sans",sans-serif' }}>{formatDate(ev.date?.start)} · {ev.tickets?.available}/{ev.tickets?.total} seats</div>
                      </div>
                      <StatusBadge status={ev.status} />
                    </div>
                  ))}
                </div>
              )}

              {/* MY EVENTS */}
              {active === 'events' && <MyEventsPanel events={events} loading={loadingEvents} onEdit={openEdit} onDelete={() => {}} onRefresh={loadEvents} />}

              {/* CREATE EVENT */}
              {active === 'create' && (
                <div style={{ maxWidth: 780 }}>
                  <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '2.2rem', letterSpacing: 2, color: '#E2E8F0', marginBottom: 26 }}>
                    Create <span className="chakra-text">New Event</span>
                  </h2>
                  <div style={{ background: 'rgba(22,33,62,0.72)', border: '1px solid rgba(255,106,0,0.14)', borderRadius: 16, padding: 28 }}>
                    <EventForm onSubmit={handleCreate} loading={creating} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => { setEditModal(false); setEditEvent(null) }} title="Edit Event" size="lg">
        {editEvent && (
          <EventForm initial={editEvent} onSubmit={handleEdit} loading={false} onCancel={() => { setEditModal(false); setEditEvent(null) }} />
        )}
      </Modal>

      {/* Mobile bottom nav */}
      <div className="show-mobile" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(22,33,62,0.97)', borderTop: '1px solid rgba(255,106,0,0.15)', display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 500, backdropFilter: 'blur(16px)' }}>
        {SIDEBAR.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: active === item.id ? '#FF6A00' : 'rgba(226,232,240,0.4)', fontSize: 20, padding: '4px 14px', transition: 'color 0.2s' }}>
            {item.icon}
            <span style={{ fontSize: 9, fontFamily: '"Exo 2",sans-serif', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </PageTransition>
  )
}
