import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Browse Events', to: '/events' },
    { label: 'Upcoming Events', to: '/events?upcoming=true' },
    { label: 'Featured Events', to: '/events?isFeatured=true' },
    { label: 'Hackathons', to: '/events?category=hackathon' },
  ],

  Account: [
    { label: 'Login', to: '/login' },
    { label: 'Create Account', to: '/register' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Bookings', to: '/dashboard/bookings' },
  ],

  Explore: [
    { label: 'Workshops', to: '/events?category=workshop' },
    { label: 'Cultural Events', to: '/events?category=cultural' },
    { label: 'Sports', to: '/events?category=sports' },
    { label: 'Tech Events', to: '/events?category=technical' },
  ],
}

const SOCIALS = [
  { icon: '𝕏', link: '#' },
  { icon: '◎', link: '#' },
  { icon: '◉', link: '#' },
  { icon: '▶', link: '#' },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: '#050816',
        borderTop: '1px solid rgba(139,255,152,0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 300,
          background:
            'radial-gradient(ellipse, rgba(139,255,152,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '70px 24px 40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
            gap: 40,
            marginBottom: 55,
          }}
        >
          <div>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 4 }}
                style={{
                  width: 44,
                  height: 44,
                  background: 'linear-gradient(135deg,#8BFF98,#4ADE80)',
                  borderRadius: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#04110A',
                  fontWeight: 900,
                  fontSize: 20,
                  boxShadow: '0 0 22px rgba(139,255,152,0.32)',
                }}
              >
                X
              </motion.div>

              <div>
                <div
                  style={{
                    fontFamily: '"Bebas Neue",sans-serif',
                    fontSize: 24,
                    letterSpacing: 3,
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
                    color: '#8BFF98',
                    letterSpacing: 4,
                    lineHeight: 1,
                  }}
                >
                  CAMPUS SYSTEM
                </div>
              </div>
            </Link>

            <p
              style={{
                color: 'rgba(248,250,252,0.48)',
                fontSize: 13,
                lineHeight: 1.8,
                maxWidth: 250,
              }}
            >
              EVENTUS is a premium campus event ecosystem for discovering,
              organizing, and managing modern college experiences.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              {SOCIALS.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.link}
                  whileHover={{ scale: 1.15, y: -3 }}
                  style={{
                    width: 38,
                    height: 38,
                    background: 'rgba(139,255,152,0.08)',
                    border: '1px solid rgba(139,255,152,0.18)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8BFF98',
                    fontSize: 15,
                    textDecoration: 'none',
                  }}
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4
                style={{
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: '#8BFF98',
                  marginBottom: 18,
                }}
              >
                {section}
              </h4>

              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 11,
                }}
              >
                {links.map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      style={{
                        textDecoration: 'none',
                        color: 'rgba(248,250,252,0.48)',
                        fontSize: 13,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.target.style.color = '#8BFF98'
                      }}
                      onMouseLeave={e => {
                        e.target.style.color = 'rgba(248,250,252,0.48)'
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="accent-divider" style={{ marginBottom: 24 }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p
            style={{
              color: 'rgba(248,250,252,0.28)',
              fontSize: 12,
            }}
          >
            © {new Date().getFullYear()} EVENTUS. All rights reserved.
          </p>

          <p
            style={{
              color: 'rgba(248,250,252,0.28)',
              fontSize: 12,
            }}
          >
            Premium Campus Event Management Platform
          </p>
        </div>
      </div>
    </footer>
  )
}