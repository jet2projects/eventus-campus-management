import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider }         from './context/ThemeContext.jsx'
import { SocketProvider }        from './context/SocketContext.jsx'

import { PageLoader } from './components/ui/index.jsx'

import HomePage         from './pages/HomePage.jsx'
import EventsPage       from './pages/EventsPage.jsx'
import EventDetailPage  from './pages/EventDetailPage.jsx'
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import StaffDashboard   from './pages/StaffDashboard.jsx'
import AdminDashboard   from './pages/AdminDashboard.jsx'

/* ─────────────────────────────────────────
   PROTECTED ROUTE
───────────────────────────────────────── */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to correct dashboard
    if (user?.role === 'admin')      return <Navigate to="/admin" replace />
    if (user?.role === 'staff')      return <Navigate to="/staff" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

/* ─────────────────────────────────────────
   PUBLIC ONLY ROUTE (redirect if logged in)
───────────────────────────────────────── */
function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'staff') return <Navigate to="/staff" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

/* ─────────────────────────────────────────
   ANIMATED ROUTES
───────────────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/"           element={<HomePage />} />
        <Route path="/events"     element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Guest only */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Student dashboard */}
        <Route path="/dashboard"           element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/bookings"  element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/settings"  element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

        {/* Staff dashboard */}
        <Route path="/staff"        element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/create" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />

        {/* Admin dashboard */}
        <Route path="/admin"            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events"     element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"      element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics"  element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────
   404 PAGE
───────────────────────────────────────── */
function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060B14', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>😵</div>
      <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '5rem', letterSpacing: 4, background: 'linear-gradient(135deg,#FF6A00,#FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</h1>
      <p style={{ fontFamily: '"Exo 2",sans-serif', fontWeight: 700, fontSize: 18, color: '#E2E8F0', margin: '16px 0 8px' }}>Page Not Found</p>
      <p style={{ color: 'rgba(226,232,240,0.42)', fontFamily: '"DM Sans",sans-serif', fontSize: 14, marginBottom: 32 }}>Even Naruto couldn't find this jutsu…</p>
      <a href="/" style={{ textDecoration: 'none' }}>
        <button className="btn-chakra" style={{ padding: '12px 28px', fontSize: 13 }}>⚡ Return Home</button>
      </a>
    </div>
  )
}

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AnimatedRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#16213E',
                  color: '#E2E8F0',
                  border: '1px solid rgba(255,106,0,0.28)',
                  borderRadius: 11,
                  fontFamily: '"DM Sans",sans-serif',
                  fontSize: 13,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                },
                success: { iconTheme: { primary: '#4ADE80', secondary: '#16213E' } },
                error:   { iconTheme: { primary: '#F87171', secondary: '#16213E' } },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
