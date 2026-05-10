import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Spinner, EmptyState, StatusBadge, Avatar, Modal, Select } from '../components/ui/index.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import PageTransition from '../components/animations/PageTransition.jsx'
import ParticleBackground from '../components/animations/ParticleBackground.jsx'
import { formatDate, formatPrice, truncate, CATEGORIES, timeAgo } from '../utils/index.js'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from 'recharts'
import toast from 'react-hot-toast'

const ACCENT = '#8BFF98'
const ACCENT2 = '#4ADE80'
const BG = '#050816'
const CARD = 'rgba(8,13,28,0.82)'
const BORDER = 'rgba(139,255,152,0.18)'

const SIDEBAR = [
  { id: 'overview', icon: '◈', label: 'Overview' },
  { id: 'events', icon: '□', label: 'Events' },
  { id: 'users', icon: '○', label: 'Users' },
  { id: 'analytics', icon: '▣', label: 'Analytics' },
]

const CHART_COLORS = ['#8BFF98', '#4ADE80', '#60A5FA', '#C084FC', '#F87171', '#FACC15']

function SoftButton({ children, onClick, danger, active, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: '9px 16px',
        borderRadius: 999,
        border: active ? 'none' : `1px solid ${danger ? 'rgba(248,113,113,0.35)' : BORDER}`,
        background: active
          ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`
          : danger
            ? 'rgba(248,113,113,0.08)'
            : 'rgba(139,255,152,0.06)',
        color: active ? '#04110A' : danger ? '#F87171' : '#F8FAFC',
        fontWeight: 800,
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function Card({ children, style }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 22,
        padding: 22,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 22px 70px rgba(0,0,0,0.28)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div style={{ background: '#0B1120', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 14px' }}>
      <p style={{ fontWeight: 800, fontSize: 12, color: ACCENT, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color || '#F8FAFC' }}>
          {p.name}: <strong>{p.name === 'revenue' ? formatPrice(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function OverviewPanel({ data }) {
  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={44} /></div>

  const { overview, charts, recentBookings, pendingEvents } = data

  const stats = [
    { label: 'Total Users', value: overview.totalUsers },
    { label: 'Total Events', value: overview.totalEvents },
    { label: 'Total Bookings', value: overview.totalBookings },
    { label: 'Total Revenue', value: formatPrice(overview.totalRevenue) },
  ]

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <div style={{ color: ACCENT, fontWeight: 900, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
          Admin Command Center
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 950, color: '#F8FAFC', lineHeight: 1 }}>
          EVENTUS Dashboard
        </h1>
        <p style={{ color: 'rgba(248,250,252,0.56)', marginTop: 8 }}>
          Manage users, events, analytics, approvals, and platform operations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 26 }}>
        {stats.map((s, i) => (
          <Card key={s.label}>
            <div style={{ color: 'rgba(248,250,252,0.48)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {s.label}
            </div>
            <div style={{ color: ACCENT, fontSize: 34, fontWeight: 950, marginTop: 8 }}>
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      {charts?.bookingsByMonth?.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#F8FAFC', fontWeight: 900, marginBottom: 20 }}>Bookings & Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts.bookingsByMonth.map(d => ({
              name: `${d._id?.month}/${d._id?.year?.toString().slice(2)}`,
              bookings: d.count,
              revenue: d.revenue,
            }))}>
              <defs>
                <linearGradient id="bookingsGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,255,152,0.08)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(248,250,252,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(248,250,252,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bookings" stroke={ACCENT} strokeWidth={3} fill="url(#bookingsGlow)" name="bookings" />
              <Area type="monotone" dataKey="revenue" stroke="#60A5FA" strokeWidth={2} fill="transparent" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, marginBottom: 24 }}>
        {charts?.eventsByCategory?.length > 0 && (
          <Card>
            <h3 style={{ color: '#F8FAFC', fontWeight: 900, marginBottom: 18 }}>Events by Category</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={charts.eventsByCategory.map(d => ({ name: CATEGORIES[d._id]?.label || d._id, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,255,152,0.08)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(248,250,252,0.42)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(248,250,252,0.42)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={ACCENT} radius={[6, 6, 0, 0]} name="events" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {charts?.usersByRole?.length > 0 && (
          <Card>
            <h3 style={{ color: '#F8FAFC', fontWeight: 900, marginBottom: 18 }}>Users by Role</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={charts.usersByRole.map(d => ({ name: d._id, value: d.count }))} innerRadius={48} outerRadius={78} paddingAngle={4} dataKey="value">
                    {charts.usersByRole.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ flex: 1 }}>
                {charts.usersByRole.map((d, i) => (
                  <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 99, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span style={{ flex: 1, color: 'rgba(248,250,252,0.7)', textTransform: 'capitalize', fontWeight: 700 }}>{d._id}</span>
                    <strong style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>{d.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {pendingEvents?.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ color: ACCENT, fontWeight: 900, marginBottom: 16 }}>Pending Approvals ({pendingEvents.length})</h3>
          {pendingEvents.slice(0, 5).map(ev => (
            <div key={ev._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(139,255,152,0.08)' }}>
              <div>
                <div style={{ color: '#F8FAFC', fontWeight: 800 }}>{truncate(ev.title, 52)}</div>
                <div style={{ color: 'rgba(248,250,252,0.42)', fontSize: 12, marginTop: 3 }}>
                  by {ev.organizer?.name} · {timeAgo(ev.createdAt)}
                </div>
              </div>
              <StatusBadge status="pending" />
            </div>
          ))}
        </Card>
      )}

      {recentBookings?.length > 0 && (
        <Card>
          <h3 style={{ color: '#F8FAFC', fontWeight: 900, marginBottom: 16 }}>Recent Bookings</h3>
          {recentBookings.slice(0, 6).map(b => (
            <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(139,255,152,0.08)' }}>
              <Avatar name={b.user?.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.user?.name} → {b.event?.title}
                </div>
                <div style={{ color: 'rgba(248,250,252,0.42)', fontSize: 11 }}>
                  {timeAgo(b.createdAt)} · {formatPrice(b.totalAmount)}
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function EventsPanel({ onRefresh }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [reviewModal, setReviewModal] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await adminAPI.getAllEvents({ status: filter === 'all' ? undefined : filter, limit: 50 })
      setEvents(r.data || [])
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleReview = async action => {
    if (!reviewModal) return
    setReviewing(true)
    try {
      await adminAPI.reviewEvent(reviewModal._id, action, feedback)
      toast.success(`Event ${action}d`)
      setReviewModal(null)
      setFeedback('')
      load()
      onRefresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setReviewing(false)
    }
  }

  const handleToggleFeatured = async id => {
    try {
      await adminAPI.toggleFeatured(id)
      toast.success('Featured status updated')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <h2 style={{ color: '#F8FAFC', fontSize: 36, fontWeight: 950, marginBottom: 22 }}>
        Manage <span style={{ color: ACCENT }}>Events</span>
      </h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(f => (
          <SoftButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </SoftButton>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={44} /></div>
      ) : events.length === 0 ? (
        <EmptyState icon="□" title="No events found" />
      ) : (
        events.map(ev => (
          <Card key={ev._id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: 'rgba(139,255,152,0.1)',
                border: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>
                {CATEGORIES[ev.category]?.icon || '□'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <strong style={{ color: '#F8FAFC' }}>{truncate(ev.title, 58)}</strong>
                  <StatusBadge status={ev.status} />
                  {ev.isFeatured && <span className="badge badge-green">Featured</span>}
                </div>
                <div style={{ color: 'rgba(248,250,252,0.46)', fontSize: 12 }}>
                  by {ev.organizer?.name} · {formatDate(ev.date?.start)} · {ev.tickets?.available}/{ev.tickets?.total} seats · {formatPrice(ev.tickets?.price)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ev.status === 'pending' && <SoftButton onClick={() => setReviewModal(ev)}>Review</SoftButton>}
                <SoftButton onClick={() => handleToggleFeatured(ev._id)}>
                  {ev.isFeatured ? 'Unfeature' : 'Feature'}
                </SoftButton>
              </div>
            </div>
          </Card>
        ))
      )}

      <Modal
        isOpen={!!reviewModal}
        onClose={() => { setReviewModal(null); setFeedback('') }}
        title="Review Event"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <SoftButton onClick={() => setReviewModal(null)}>Cancel</SoftButton>
            <SoftButton danger onClick={() => handleReview('reject')}>{reviewing ? 'Working...' : 'Reject'}</SoftButton>
            <SoftButton active onClick={() => handleReview('approve')}>{reviewing ? 'Working...' : 'Approve'}</SoftButton>
          </div>
        }
      >
        {reviewModal && (
          <div>
            <Card style={{ marginBottom: 18, boxShadow: 'none' }}>
              <strong style={{ color: '#F8FAFC' }}>{reviewModal.title}</strong>
              <p style={{ color: 'rgba(248,250,252,0.56)', fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
                {truncate(reviewModal.description, 220)}
              </p>
            </Card>

            <label style={{ color: 'rgba(248,250,252,0.58)', fontSize: 12, fontWeight: 800 }}>
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Optional feedback for organizer"
              className="premium-input"
              style={{ resize: 'vertical', marginTop: 8 }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [roleModal, setRoleModal] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = { limit: 100 }
      if (roleFilter) params.role = roleFilter
      if (search) params.search = search
      const r = await adminAPI.getUsers(params)
      setUsers(r.data || [])
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [roleFilter])

  const handleToggle = async id => {
    try {
      await adminAPI.toggleUserStatus(id)
      toast.success('User status updated')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleRoleChange = async () => {
    if (!roleModal || !newRole) return
    setUpdating(true)
    try {
      await adminAPI.updateUserRole(roleModal._id, newRole)
      toast.success('Role updated')
      setRoleModal(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h2 style={{ color: '#F8FAFC', fontSize: 36, fontWeight: 950, marginBottom: 22 }}>
        Manage <span style={{ color: ACCENT }}>Users</span>
      </h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name or email"
          className="premium-input"
          style={{ flex: 1, minWidth: 220 }}
        />

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="premium-input" style={{ width: 150 }}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <SoftButton onClick={load}>Refresh</SoftButton>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={44} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="○" title="No users found" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {filtered.map(u => (
            <Card key={u._id}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar name={u.name} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#F8FAFC' }}>{u.name}</strong>
                    <span className={u.role === 'admin' ? 'badge badge-blue' : u.role === 'staff' ? 'badge badge-green' : 'badge badge-gray'}>
                      {u.role}
                    </span>
                    {!u.isActive && <span className="badge badge-red">Disabled</span>}
                  </div>
                  <div style={{ color: 'rgba(248,250,252,0.44)', fontSize: 12, marginTop: 4 }}>{u.email}</div>
                  {u.department && <div style={{ color: 'rgba(248,250,252,0.32)', fontSize: 11, marginTop: 3 }}>{u.department}</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SoftButton onClick={() => { setRoleModal(u); setNewRole(u.role) }}>Role</SoftButton>
                  {u.role !== 'admin' && (
                    <SoftButton danger={u.isActive} active={!u.isActive} onClick={() => handleToggle(u._id)}>
                      {u.isActive ? 'Disable' : 'Enable'}
                    </SoftButton>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!roleModal}
        onClose={() => setRoleModal(null)}
        title="Change User Role"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <SoftButton onClick={() => setRoleModal(null)}>Cancel</SoftButton>
            <SoftButton active onClick={handleRoleChange}>{updating ? 'Updating...' : 'Update'}</SoftButton>
          </div>
        }
      >
        {roleModal && (
          <div>
            <Card style={{ marginBottom: 18, boxShadow: 'none' }}>
              <strong style={{ color: '#F8FAFC' }}>{roleModal.name}</strong>
              <div style={{ color: 'rgba(248,250,252,0.46)', fontSize: 12, marginTop: 4 }}>{roleModal.email}</div>
            </Card>

            <Select
              label="New Role"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'staff', label: 'Staff' },
                { value: 'admin', label: 'Admin' },
              ]}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

function AnalyticsPanel({ data }) {
  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={44} /></div>

  const { charts } = data

  return (
    <div>
      <h2 style={{ color: '#F8FAFC', fontSize: 36, fontWeight: 950, marginBottom: 26 }}>
        Platform <span style={{ color: ACCENT }}>Analytics</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', gap: 20, marginBottom: 24 }}>
        <Card>
          <h3 style={{ color: '#F8FAFC', fontWeight: 900, marginBottom: 18 }}>Events by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={(charts?.eventsByStatus || []).map(d => ({ name: d._id, value: d.count }))} innerRadius={58} outerRadius={90} paddingAngle={4} dataKey="value">
                {(charts?.eventsByStatus || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ color: '#F8FAFC', fontWeight: 900, marginBottom: 18 }}>Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(charts?.bookingsByMonth || []).map(d => ({
              name: `${d._id?.month}/${d._id?.year?.toString().slice(2)}`,
              revenue: d.revenue || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,255,152,0.08)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(248,250,252,0.42)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(248,250,252,0.42)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill={ACCENT} radius={[6, 6, 0, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 style={{ color: '#F8FAFC', fontWeight: 900, marginBottom: 18 }}>Bookings Timeline</h3>
        <ResponsiveContainer width="100%" height={270}>
          <AreaChart data={(charts?.bookingsByMonth || []).map(d => ({
            name: `${d._id?.month}/${d._id?.year?.toString().slice(2)}`,
            bookings: d.count,
            revenue: d.revenue,
          }))}>
            <defs>
              <linearGradient id="timelineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.35} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,255,152,0.08)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(248,250,252,0.42)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(248,250,252,0.42)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="bookings" stroke={ACCENT} strokeWidth={3} fill="url(#timelineGlow)" name="bookings" />
            <Area type="monotone" dataKey="revenue" stroke="#60A5FA" strokeWidth={2} fill="transparent" name="revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [active, setActive] = useState('overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await adminAPI.getAnalytics()
      setData(r.data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  return (
    <PageTransition>
      <Navbar />
      <ParticleBackground count={10} />

      <div style={{ paddingTop: 74, minHeight: '100vh', display: 'flex', background: BG, position: 'relative', zIndex: 1 }}>
        <aside
          className="hide-mobile"
          style={{
            width: 250,
            background: 'rgba(8,13,28,0.88)',
            borderRight: `1px solid ${BORDER}`,
            padding: '26px 16px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <Card style={{ padding: 16, marginBottom: 18, boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                color: '#04110A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 950,
              }}>
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ color: '#F8FAFC', fontWeight: 900 }}>{user?.name?.split(' ')[0] || 'Admin'}</div>
                <div style={{ color: ACCENT, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  System Administrator
                </div>
              </div>
            </div>
          </Card>

          {SIDEBAR.map(item => (
            <motion.div
              key={item.id}
              whileHover={{ x: 3 }}
              onClick={() => setActive(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 14,
                marginBottom: 7,
                cursor: 'pointer',
                background: active === item.id ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})` : 'transparent',
                color: active === item.id ? '#04110A' : 'rgba(248,250,252,0.62)',
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </motion.div>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '36px 32px', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              {active === 'overview' && (
                loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={44} /></div> : <OverviewPanel data={data} />
              )}
              {active === 'events' && <EventsPanel onRefresh={loadData} />}
              {active === 'users' && <UsersPanel />}
              {active === 'analytics' && (
                loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={44} /></div> : <AnalyticsPanel data={data} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <div
        className="show-mobile"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(8,13,28,0.96)',
          borderTop: `1px solid ${BORDER}`,
          justifyContent: 'space-around',
          padding: '10px 0',
          zIndex: 500,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {SIDEBAR.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active === item.id ? ACCENT : 'rgba(248,250,252,0.42)',
              fontSize: 18,
              fontWeight: 800,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {item.icon}
            <span style={{ fontSize: 9, textTransform: 'uppercase' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </PageTransition>
  )
}