import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDate, formatPrice, truncate, CATEGORIES, getAvailColor } from '../../utils/index.js'
import { CategoryBadge } from './index.jsx'

const ACCENT_COLORS = ['#FF6A00', '#FF8C42', '#FF6B6B', '#4ECDC4', '#45B7D1', '#9B59B6', '#E74C3C', '#2ECC71']

export default function EventCard({ event, index = 0 }) {
  if (!event) return null

  const cat          = CATEGORIES[event.category] || { label: event.category, icon: '📌' }
  const total        = event.tickets?.total || 1
  const available    = event.tickets?.available ?? 0
  const pct          = Math.round((available / total) * 100)
  const isSoldOut    = available === 0
  const isAlmostFull = pct <= 20 && !isSoldOut
  const isFree       = event.tickets?.isFree
  const isFeatured   = event.isFeatured
  const accent       = ACCENT_COLORS[index % ACCENT_COLORS.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4), ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ height: '100%' }}
    >
      <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <motion.div
          whileHover={{ y: -7, boxShadow: `0 24px 56px rgba(0,0,0,0.5), 0 0 32px ${accent}18` }}
          transition={{ duration: 0.3 }}
          style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(145deg,#16213E,#1A1A2E)',
            border: `1px solid ${isFeatured ? 'rgba(250,204,21,0.28)' : 'rgba(255,106,0,0.13)'}`,
            borderRadius: 17, overflow: 'hidden', cursor: 'pointer',
            transition: 'border-color 0.3s',
            boxShadow: isFeatured ? '0 0 20px rgba(250,204,21,0.08)' : 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = isFeatured ? 'rgba(250,204,21,0.55)' : 'rgba(255,106,0,0.45)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = isFeatured ? 'rgba(250,204,21,0.28)' : 'rgba(255,106,0,0.13)'
          }}
        >
          {/* ── Banner ── */}
          <div style={{ position: 'relative', height: 192, overflow: 'hidden', flexShrink: 0 }}>
            {event.banner ? (
              <motion.img
                src={event.banner} alt={event.title}
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg, ${accent}30, ${accent}08, #1A1A2E)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 64, opacity: 0.55 }}
                >
                  {cat.icon}
                </motion.div>
                {/* Decorative kanji */}
                <div style={{ position: 'absolute', fontSize: 100, opacity: 0.04, fontWeight: 900, color: accent, fontFamily: 'serif', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>忍</div>
              </div>
            )}

            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,33,62,0.97) 0%, transparent 50%)' }} />

            {/* Top badges */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <CategoryBadge category={event.category} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                {isFeatured && <span className="badge badge-gold">⭐ Featured</span>}
                {isSoldOut
                  ? <span className="badge badge-red">🚫 Sold Out</span>
                  : isAlmostFull
                    ? <span className="badge badge-gold">🔥 {available} left</span>
                    : null
                }
              </div>
            </div>

            {/* Price badge bottom-right */}
            <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
              {isFree
                ? <span className="badge badge-green">FREE</span>
                : <span className="badge badge-orange">{formatPrice(event.tickets?.price)}</span>
              }
            </div>

            {/* Shimmer line at bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }} />
          </div>

          {/* ── Content ── */}
          <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{
              fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 15,
              color: '#E2E8F0', marginBottom: 7, lineHeight: 1.3, letterSpacing: 0.2,
            }}>
              {truncate(event.title, 58)}
            </h3>

            <p style={{ color: 'rgba(226,232,240,0.42)', fontSize: 12, lineHeight: 1.6, fontFamily: '"DM Sans",sans-serif', flex: 1, marginBottom: 14 }}>
              {truncate(event.shortDescription || event.description, 82)}
            </p>

            {/* Meta info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(226,232,240,0.45)', fontSize: 11, fontFamily: '"DM Sans",sans-serif' }}>
                <span>📅</span>
                <span>{formatDate(event.date?.start, 'EEE, MMM dd yyyy')}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{formatDate(event.date?.start, 'h:mm a')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(226,232,240,0.45)', fontSize: 11, fontFamily: '"DM Sans",sans-serif' }}>
                <span>📍</span>
                <span>{truncate(event.venue?.name || 'TBD', 38)}</span>
              </div>
            </div>

            {/* Availability bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10, fontFamily: '"Exo 2",sans-serif', fontWeight: 700, letterSpacing: 0.5 }}>
                <span style={{ color: 'rgba(226,232,240,0.35)' }}>Availability</span>
                <span style={{ color: getAvailColor(pct) }}>
                  {isSoldOut ? 'SOLD OUT' : `${available} / ${total}`}
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isSoldOut ? '100%' : `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + index * 0.03 }}
                  style={{ height: '100%', background: `linear-gradient(90deg,${getAvailColor(pct)},${getAvailColor(pct)}88)`, borderRadius: 10 }}
                />
              </div>
            </div>

            {/* CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{
                background: isSoldOut
                  ? 'rgba(239,68,68,0.1)'
                  : `linear-gradient(135deg,${accent},${accent}cc)`,
                border: isSoldOut ? '1px solid rgba(239,68,68,0.3)' : 'none',
                borderRadius: 9, padding: '10px',
                textAlign: 'center',
                fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 11,
                letterSpacing: 1.2, textTransform: 'uppercase',
                color: isSoldOut ? '#F87171' : '#fff',
                boxShadow: isSoldOut ? 'none' : `0 4px 18px ${accent}44`,
              }}
            >
              {isSoldOut ? '🚫 Sold Out' : '⚡ Book Now'}
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
