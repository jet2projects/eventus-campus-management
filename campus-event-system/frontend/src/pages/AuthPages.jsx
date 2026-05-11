import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { Input, Button, Alert } from '../components/ui/index.jsx'
import ParticleBackground from '../components/animations/ParticleBackground.jsx'
import PageTransition from '../components/animations/PageTransition.jsx'

function AuthLayout({ children }) {
  return (
    <PageTransition>
      <ParticleBackground count={18} />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
          zIndex: 1,
          background:
            'radial-gradient(circle at 50% 25%, rgba(139,255,152,0.12), transparent 38%), linear-gradient(135deg, #050816, #0B1120)',
        }}
      >
        {children}
      </div>
    </PageTransition>
  )
}

function AuthLogo() {
  return (
    <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 34 }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <motion.div
          whileHover={{ scale: 1.08, rotate: 4 }}
          style={{
            width: 52,
            height: 52,
            background: 'linear-gradient(135deg,#8BFF98,#4ADE80)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 900,
            color: '#04110A',
            boxShadow: '0 0 32px rgba(139,255,152,0.38)',
          }}
        >
          X
        </motion.div>

        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 30,
              letterSpacing: 4,
              color: '#F8FAFC',
              lineHeight: 1,
            }}
          >
            EVENTUS
          </div>
          <div
            style={{
              fontSize: 9,
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
    </motion.div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {

  if (
    email === "student@eventus.com" &&
    password === "123456"
  ) {
    localStorage.setItem("token", "demo-token")
    localStorage.setItem("role", "student")
    navigate("/dashboard")
  }

  else if (
    email === "staff@eventus.com" &&
    password === "123456"
  ) {
    localStorage.setItem("token", "demo-token")
    localStorage.setItem("role", "staff")
    navigate("/staff")
  }

  else if (
    email === "admin@eventus.com" &&
    password === "123456"
  ) {
    localStorage.setItem("token", "demo-token")
    localStorage.setItem("role", "admin")
    navigate("/admin")
  }

  else {
    setError("Invalid credentials")
  }

} catch (err) {
  setError(err.message)
} finally {
  setLoading(false)
}
  }

  return (
    <AuthLayout>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <AuthLogo />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(8,13,28,0.82)',
            border: '1px solid rgba(139,255,152,0.22)',
            borderRadius: 24,
            padding: 34,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.55)',
          }}
        >
          <h1 style={{ fontWeight: 900, fontSize: 26, color: '#F8FAFC', marginBottom: 6 }}>
            Welcome Back
          </h1>

          <p style={{ color: 'rgba(248,250,252,0.52)', fontSize: 14, marginBottom: 26 }}>
            Access your premium campus event platform
          </p>

          {error && (
            <div style={{ marginBottom: 20 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@college.edu"
              icon="✉"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              icon="●"
              required
            />

            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#8BFF98', fontWeight: 700 }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'rgba(248,250,252,0.48)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#8BFF98', fontWeight: 800 }}>
              Create Account →
            </Link>
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    studentId: '',
    phone: '',
  })

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    if (!form.name.trim()) return 'Name is required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return 'Valid email required'
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const err = validate()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department,
        studentId: form.studentId,
        phone: form.phone,
      })

      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'staff') navigate('/staff')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'student', label: 'Student', sub: 'Browse and book events' },
    { value: 'staff', label: 'Staff', sub: 'Create and manage events' },
  ]

  return (
    <AuthLayout>
      <div style={{ width: '100%', maxWidth: 510 }}>
        <AuthLogo />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(8,13,28,0.82)',
            border: '1px solid rgba(139,255,152,0.22)',
            borderRadius: 24,
            padding: 34,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.55)',
          }}
        >
          <h1 style={{ fontWeight: 900, fontSize: 26, color: '#F8FAFC', marginBottom: 6 }}>
            Create Your Account
          </h1>

          <p style={{ color: 'rgba(248,250,252,0.52)', fontSize: 14, marginBottom: 26 }}>
            Join EVENTUS and experience smarter campus events
          </p>

          {error && (
            <div style={{ marginBottom: 18 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: 'rgba(248,250,252,0.52)',
                  marginBottom: 8,
                }}
              >
                I am a *
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {roles.map(role => (
                  <motion.div
                    key={role.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setForm(p => ({ ...p, role: role.value }))}
                    style={{
                      padding: 15,
                      border: `1px solid ${form.role === role.value ? '#8BFF98' : 'rgba(139,255,152,0.16)'}`,
                      background: form.role === role.value ? 'rgba(139,255,152,0.12)' : 'rgba(17,24,39,0.35)',
                      borderRadius: 14,
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 13,
                        color: form.role === role.value ? '#8BFF98' : 'rgba(248,250,252,0.72)',
                      }}
                    >
                      {role.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(248,250,252,0.36)', marginTop: 4 }}>
                      {role.sub}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Input
              label="Full Name"
              value={form.name}
              onChange={set('name')}
              placeholder="Your Full Name"
              icon="👤"
              required
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="student@college.edu"
              icon="✉"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+91 99999 99999"
                icon="☎"
              />

              <Input
                label="Department"
                value={form.department}
                onChange={set('department')}
                placeholder="Computer Science"
                icon="🏛"
              />
            </div>

            {form.role === 'student' && (
              <Input
                label="Student ID"
                value={form.studentId}
                onChange={set('studentId')}
                placeholder="CS2024001"
                icon="ID"
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                icon="●"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="••••••••"
                icon="●"
                required
              />
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} style={{ marginTop: 4 }}>
              Create Account
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(248,250,252,0.48)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#8BFF98', fontWeight: 800 }}>
              Sign In →
            </Link>
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  )
}