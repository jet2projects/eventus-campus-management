import React, { useMemo } from 'react'

function generateParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${5 + Math.random() * 6}s`,
    size: Math.random() > 0.5 ? 3 : 5,
  }))
}

export default function ParticleBackground({ count = 28 }) {
  const particles = useMemo(() => generateParticles(count), [count])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left, width: p.size, height: p.size,
            background: '#FF6A00',
            boxShadow: `0 0 ${p.size * 2}px #FF6A00`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '15%', left: '5%', width: 350, height: 350, background: 'radial-gradient(ellipse,rgba(255,106,0,0.07) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 450, height: 450, background: 'radial-gradient(ellipse,rgba(255,179,71,0.05) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '55%', left: '45%', width: 500, height: 500, background: 'radial-gradient(ellipse,rgba(250,204,21,0.03) 0%,transparent 70%)', borderRadius: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
    </div>
  )
}
