import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { eventsAPI } from '../services/api.js'
import EventCard from '../components/ui/EventCard.jsx'
import ParticleBackground from '../components/animations/ParticleBackground.jsx'
import PageTransition, { SlideIn, CountUp } from '../components/animations/PageTransition.jsx'
import { SkeletonCard } from '../components/ui/index.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { CATEGORIES } from '../utils/index.js'

const STATS = [
  { value: 500, suffix: '+', label: 'Events Hosted' },
  { value: 12000, suffix: '+', label: 'Students Engaged' },
  { value: 50, suffix: '+', label: 'Clubs & Depts' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  useEffect(() => {
    ;(async () => {
      try {
        const [f, u] = await Promise.all([
          eventsAPI.getFeatured(),
          eventsAPI.getAll({ upcoming: 'true', limit: 6 }),
        ])
        setFeatured(f.data || [])
        setUpcoming(u.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    if (search.trim()) navigate(`/events?search=${encodeURIComponent(search)}`)
  }

  return (
    <PageTransition>
      <Navbar />
      <ParticleBackground count={22} />

      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          paddingTop: 80,
          backgroundImage: "url('/images/campus-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(5,8,22,0.94) 10%, rgba(5,8,22,0.62) 52%, rgba(5,8,22,0.88) 100%)',
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 65% 45%, rgba(74,222,128,0.18), transparent 65%)',
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 58%, #050816 100%)',
        }} />

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(139,255,152,0.08)',
                border: '1px solid rgba(139,255,152,0.28)',
                borderRadius: 30,
                padding: '7px 18px',
                marginBottom: 26,
                backdropFilter: 'blur(14px)',
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#8BFF98',
                boxShadow: '0 0 18px #8BFF98',
              }} />
              <span style={{
                fontFamily: '"Exo 2", sans-serif',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 2.8,
                textTransform: 'uppercase',
                color: '#DFFFE2',
              }}>
                Smarter Events · Stronger Campus
              </span>
            </motion.div>

            {['ELEVATE', 'EVERY', 'EVENT'].map((line, i) => (
              <div key={line} style={{ overflow: 'hidden', marginBottom: i === 2 ? 26 : 4 }}>
                <motion.h1
                  style={{
                    color: i === 2 ? '#8BFF98' : '#F8FAFC',
                    lineHeight: 0.88,
                    fontSize: 'clamp(4rem, 10vw, 8.5rem)',
                    fontWeight: 900,
                    letterSpacing: '-5px',
                    textTransform: 'uppercase',
                    textShadow: i === 2 ? '0 0 35px rgba(139,255,152,0.35)' : '0 0 35px rgba(255,255,255,0.08)',
                  }}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.15 + i * 0.12 }}
                >
                  {line}
                </motion.h1>
              </div>
            ))}

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.58 }}
              style={{
                color: 'rgba(248,250,252,0.72)',
                fontSize: 17,
                lineHeight: 1.8,
                maxWidth: 560,
                marginBottom: 34,
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              EVENTUS is a premium campus event ecosystem to discover, organize,
              manage, and experience college events with speed, clarity, and style.
            </motion.p>

            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.72 }}
              style={{
                display: 'flex',
                maxWidth: 540,
                marginBottom: 34,
                background: 'rgba(8,13,28,0.76)',
                border: '1px solid rgba(139,255,152,0.25)',
                borderRadius: 16,
                overflow: 'hidden',
                backdropFilter: 'blur(18px)',
                boxShadow: '0 18px 70px rgba(0,0,0,0.35)',
              }}
            >
              <span style={{ padding: '0 16px', display: 'flex', alignItems: 'center', color: '#8BFF98' }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search hackathons, workshops, fests..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#F8FAFC',
                  fontSize: 14,
                  padding: '15px 0',
                }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'linear-gradient(135deg, #8BFF98, #4ADE80)',
                  border: 'none',
                  padding: '0 26px',
                  cursor: 'pointer',
                  color: '#04110A',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                Search
              </motion.button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.84 }}
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
            >
              <Link to="/events" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 999,
                    border: 'none',
                    background: 'linear-gradient(135deg, #8BFF98, #4ADE80)',
                    color: '#04110A',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 0 38px rgba(139,255,152,0.35)',
                  }}
                >
                  Explore Events
                </motion.button>
              </Link>

              <Link to="/register" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 999,
                    border: '1px solid rgba(139,255,152,0.38)',
                    background: 'rgba(8,13,28,0.52)',
                    color: '#F8FAFC',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section style={{ position: 'relative', zIndex: 2, padding: '60px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: 16 }}>
          {STATS.map((s, i) => (
            <SlideIn key={i} direction="up" delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  textAlign: 'center',
                  background: 'rgba(8,13,28,0.72)',
                  border: '1px solid rgba(139,255,152,0.14)',
                  borderRadius: 18,
                  padding: '28px 20px',
                  backdropFilter: 'blur(18px)',
                }}
              >
                <div style={{ fontSize: '2.8rem', lineHeight: 1, fontWeight: 900, color: '#8BFF98' }}>
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 2.5,
                  color: 'rgba(248,250,252,0.52)',
                  marginTop: 7,
                }}>
                  {s.label}
                </div>
              </motion.div>
            </SlideIn>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 2, padding: '20px 24px 64px', maxWidth: 1280, margin: '0 auto' }}>
        <SlideIn direction="left">
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', color: '#8BFF98', marginBottom: 9 }}>
              Browse by Type
            </div>
            <h2 style={{ color: '#F8FAFC', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900 }}>
              Event <span style={{ color: '#8BFF98' }}>Categories</span>
            </h2>
          </div>
        </SlideIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
          {Object.entries(CATEGORIES).map(([key, cat], i) => (
            <SlideIn key={key} direction="up" delay={i * 0.06}>
              <Link to={`/events?category=${key}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(8,13,28,0.72)',
                    border: '1px solid rgba(139,255,152,0.14)',
                    borderRadius: 16,
                    padding: '22px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 11, color: 'rgba(248,250,252,0.72)', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {cat.label}
                  </div>
                </motion.div>
              </Link>
            </SlideIn>
          ))}
        </div>
      </section>

      {(loading || featured.length > 0) && (
        <section style={{ position: 'relative', zIndex: 2, padding: '0 24px 80px', maxWidth: 1280, margin: '0 auto' }}>
          <SlideIn direction="left">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', color: '#8BFF98', marginBottom: 8 }}>
                  Highlighted
                </div>
                <h2 style={{ color: '#F8FAFC', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900 }}>
                  Featured <span style={{ color: '#8BFF98' }}>Events</span>
                </h2>
              </div>
              <Link to="/events?isFeatured=true" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ x: 3 }} style={{
                  fontSize: 12,
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: '1px solid rgba(139,255,152,0.32)',
                  background: 'transparent',
                  color: '#F8FAFC',
                  cursor: 'pointer',
                }}>
                  View All →
                </motion.button>
              </Link>
            </div>
          </SlideIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 22 }}>
            {loading ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />) : featured.map((e, i) => <EventCard key={e._id} event={e} index={i} />)}
          </div>
        </section>
      )}

      <section style={{ position: 'relative', zIndex: 2, padding: '0 24px 80px', maxWidth: 1280, margin: '0 auto' }}>
        <SlideIn direction="left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', color: '#8BFF98', marginBottom: 8 }}>
                Coming Up
              </div>
              <h2 style={{ color: '#F8FAFC', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900 }}>
                Upcoming <span style={{ color: '#8BFF98' }}>Events</span>
              </h2>
            </div>
            <Link to="/events?upcoming=true" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ x: 3 }} style={{
                fontSize: 12,
                padding: '10px 20px',
                borderRadius: 999,
                border: '1px solid rgba(139,255,152,0.32)',
                background: 'transparent',
                color: '#F8FAFC',
                cursor: 'pointer',
              }}>
                See All →
              </motion.button>
            </Link>
          </div>
        </SlideIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 22 }}>
          {loading ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />) : upcoming.map((e, i) => <EventCard key={e._id} event={e} index={i} />)}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 2, padding: '0 24px 90px', maxWidth: 1280, margin: '0 auto' }}>
        <SlideIn direction="up">
          <motion.div
            whileHover={{ boxShadow: '0 0 64px rgba(139,255,152,0.16)' }}
            style={{
              background: 'linear-gradient(135deg,rgba(139,255,152,0.10),rgba(74,222,128,0.05))',
              border: '1px solid rgba(139,255,152,0.24)',
              borderRadius: 26,
              padding: '60px 48px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(18px)',
            }}
          >
            <h2 style={{ color: '#F8FAFC', marginBottom: 14, fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900 }}>
              Ready to transform your <span style={{ color: '#8BFF98' }}>campus experience?</span>
            </h2>
            <p style={{ color: 'rgba(248,250,252,0.62)', fontSize: 15, maxWidth: 520, margin: '0 auto 34px', lineHeight: 1.75 }}>
              Join EVENTUS and manage every event, registration, ticket, and update in one premium platform.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} style={{
                  fontSize: 13,
                  padding: '14px 34px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'linear-gradient(135deg, #8BFF98, #4ADE80)',
                  color: '#04110A',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}>
                  Create Free Account
                </motion.button>
              </Link>

              <Link to="/events" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} style={{
                  fontSize: 13,
                  padding: '14px 34px',
                  borderRadius: 999,
                  border: '1px solid rgba(139,255,152,0.34)',
                  background: 'transparent',
                  color: '#F8FAFC',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}>
                  Browse Events
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </SlideIn>
      </section>

      <Footer />
    </PageTransition>
  )
}