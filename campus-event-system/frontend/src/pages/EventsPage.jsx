import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { eventsAPI } from '../services/api.js'
import EventCard from '../components/ui/EventCard.jsx'
import { SkeletonCard, EmptyState, Button, Toggle } from '../components/ui/index.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import ParticleBackground from '../components/animations/ParticleBackground.jsx'
import PageTransition from '../components/animations/PageTransition.jsx'
import { CATEGORIES } from '../utils/index.js'
import { useDebounce } from '../hooks/index.js'

const SORTS = [
  { value: 'date.start|asc',          label: '📅 Upcoming First' },
  { value: 'date.start|desc',         label: '📅 Latest First' },
  { value: 'analytics.views|desc',    label: '🔥 Most Popular' },
  { value: 'tickets.price|asc',       label: '💰 Price: Low → High' },
  { value: 'tickets.price|desc',      label: '💰 Price: High → Low' },
  { value: 'createdAt|desc',          label: '🆕 Newest' },
]

function FilterPanel({ category, setCategory, isFree, setIsFree, isFeatured, setIsFeatured, upcoming, setUpcoming, onClear, hasFilters }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      {/* Category */}
      <div>
        <h3 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: '#FF6A00', marginBottom: 12 }}>Category</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[{ value: '', label: '🌐 All Categories' }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))].map(o => (
            <motion.button key={o.value} whileTap={{ scale: 0.97 }} onClick={() => setCategory(o.value)}
              style={{ textAlign: 'left', padding: '8px 11px', borderRadius: 8, background: category === o.value ? 'rgba(255,106,0,0.14)' : 'transparent', border: `1px solid ${category === o.value ? 'rgba(255,106,0,0.42)' : 'rgba(255,106,0,0.08)'}`, color: category === o.value ? '#FFB347' : 'rgba(226,232,240,0.58)', fontFamily: '"DM Sans",sans-serif', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            >{o.label}</motion.button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <h3 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: '#FF6A00', marginBottom: 12 }}>Filters</h3>
        {[
          { label: '🆓 Free Events', v: isFree, set: setIsFree },
          { label: '⭐ Featured Only', v: isFeatured, set: setIsFeatured },
          { label: '📅 Upcoming Only', v: upcoming, set: setUpcoming },
        ].map(t => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,106,0,0.07)' }}>
            <span style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, color: 'rgba(226,232,240,0.65)' }}>{t.label}</span>
            <Toggle value={t.v} onChange={t.set} />
          </div>
        ))}
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={onClear} fullWidth size="sm">✕ Clear Filters</Button>
      )}
    </div>
  )
}

export default function EventsPage() {
  const [searchParams] = useSearchParams()
  const [events, setEvents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [pagination, setPagination] = useState({ current: 1, total: 1, totalEvents: 0 })
  const [search, setSearch]       = useState(searchParams.get('search') || '')
  const [category, setCategory]   = useState(searchParams.get('category') || '')
  const [sort, setSort]           = useState('date.start|asc')
  const [isFree, setIsFree]       = useState(searchParams.get('isFree') === 'true')
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true')
  const [upcoming, setUpcoming]   = useState(searchParams.get('upcoming') === 'true')
  const [page, setPage]           = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const debSearch = useDebounce(search, 380)
  const [sortBy, sortOrder] = sort.split('|')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, sortBy, order: sortOrder }
      if (debSearch)  params.search    = debSearch
      if (category)   params.category  = category
      if (isFree)     params.isFree    = true
      if (isFeatured) params.isFeatured = true
      if (upcoming)   params.upcoming  = true
      const res = await eventsAPI.getAll(params)
      setEvents(res.data || [])
      setPagination(res.pagination || { current: 1, total: 1, totalEvents: 0 })
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, debSearch, category, isFree, isFeatured, upcoming, sortBy, sortOrder])

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { setPage(1) }, [debSearch, category, isFree, isFeatured, upcoming])

  const clearFilters = () => { setSearch(''); setCategory(''); setIsFree(false); setIsFeatured(false); setUpcoming(false); setPage(1) }
  const hasFilters = !!(search || category || isFree || isFeatured || upcoming)

  return (
    <PageTransition>
      <Navbar />
      <ParticleBackground count={15} />

      <div style={{ paddingTop: 100, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 36px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', color: '#FF6A00', marginBottom: 8 }}>🔥 All Events</div>
            <h1 className="section-title" style={{ color: '#E2E8F0', marginBottom: 6 }}>
              Discover <span className="chakra-text">Campus Events</span>
            </h1>
            <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14, fontFamily: '"DM Sans",sans-serif' }}>
              {pagination.totalEvents || 0} events found{hasFilters ? ' · filtered' : ''}
            </p>
          </motion.div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 90px', display: 'flex', gap: 30 }}>
          {/* Sidebar */}
          <div className="hide-mobile" style={{ width: 240, flexShrink: 0 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              style={{ position: 'sticky', top: 90, background: 'rgba(22,33,62,0.72)', border: '1px solid rgba(255,106,0,0.11)', borderRadius: 16, padding: 20, backdropFilter: 'blur(14px)' }}>
              <FilterPanel category={category} setCategory={setCategory} isFree={isFree} setIsFree={setIsFree} isFeatured={isFeatured} setIsFeatured={setIsFeatured} upcoming={upcoming} setUpcoming={setUpcoming} onClear={clearFilters} hasFilters={hasFilters} />
            </motion.div>
          </div>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: 'rgba(22,33,62,0.82)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                <span style={{ padding: '0 12px', fontSize: 16 }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#E2E8F0', fontSize: 13, padding: '11px 0', fontFamily: '"DM Sans",sans-serif' }}
                />
                {search && <button onClick={() => setSearch('')} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.4)', fontSize: 15 }}>✕</button>}
              </div>

              {/* Sort */}
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ background: 'rgba(22,33,62,0.82)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 10, color: '#E2E8F0', padding: '11px 14px', fontFamily: '"DM Sans",sans-serif', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                {SORTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Mobile filter btn */}
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(true)} style={{ display: 'none' }} className="show-mobile-flex">
                ⚙️ Filters{hasFilters ? ` (${[category,isFree,isFeatured,upcoming].filter(Boolean).length})` : ''}
              </Button>
            </motion.div>

            {/* Active filter chips */}
            {hasFilters && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {category  && <span className="tag active" onClick={() => setCategory('')}>{CATEGORIES[category]?.label} ✕</span>}
                {isFree    && <span className="tag active" onClick={() => setIsFree(false)}>Free ✕</span>}
                {isFeatured && <span className="tag active" onClick={() => setIsFeatured(false)}>Featured ✕</span>}
                {upcoming  && <span className="tag active" onClick={() => setUpcoming(false)}>Upcoming ✕</span>}
                {search    && <span className="tag active" onClick={() => setSearch('')}>"{search}" ✕</span>}
              </div>
            )}

            {/* Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
                  {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : events.length === 0 ? (
                <EmptyState icon="🔍" title="No Events Found" description="Try adjusting your filters or search to find what you're looking for." action={<Button onClick={clearFilters}>Clear Filters</Button>} />
              ) : (
                <motion.div key={`${page}-${debSearch}-${category}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(285px,1fr))', gap: 22 }}>
                    {events.map((e, i) => <EventCard key={e._id} event={e} index={i} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 44, flexWrap: 'wrap' }}>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
                {[...Array(pagination.total)].map((_, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setPage(i + 1)}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${page === i + 1 ? '#FF6A00' : 'rgba(255,106,0,0.15)'}`, background: page === i + 1 ? 'rgba(255,106,0,0.15)' : 'transparent', color: page === i + 1 ? '#FF6A00' : 'rgba(226,232,240,0.5)', fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {i + 1}
                  </motion.button>
                ))}
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(pagination.total, p + 1))} disabled={page === pagination.total}>Next →</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1500, backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 290, background: '#16213E', border: '1px solid rgba(255,106,0,0.2)', zIndex: 1600, padding: 22, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
                <h2 style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, color: '#E2E8F0', fontSize: 16 }}>Filters</h2>
                <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#FF6A00' }}>✕</button>
              </div>
              <FilterPanel category={category} setCategory={v => { setCategory(v); setDrawerOpen(false) }} isFree={isFree} setIsFree={setIsFree} isFeatured={isFeatured} setIsFeatured={setIsFeatured} upcoming={upcoming} setUpcoming={setUpcoming} onClear={() => { clearFilters(); setDrawerOpen(false) }} hasFilters={hasFilters} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
      <style>{`.show-mobile-flex{display:none!important}@media(max-width:768px){.show-mobile-flex{display:flex!important}}`}</style>
    </PageTransition>
  )
}
