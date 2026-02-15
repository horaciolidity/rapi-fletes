import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Booking from './pages/Booking'
import DriverDashboard from './pages/DriverDashboard'
import MyFletes from './pages/MyFletes'
import Navbar from './components/layout/Navbar'
import { useAuthStore } from './store/useAuthStore'
import { supabase } from './api/supabase'

function App() {
  const { setUser, fetchProfile } = useAuthStore()

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setUser(user)
      if (user) fetchProfile(user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-white selection:bg-primary-500 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            {/* Alias for /auth to prevent 404s reported by user */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />

            <Route path="/booking" element={<Booking />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/my-fletes" element={<MyFletes />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="py-12 bg-black/40 border-t border-white/5">
          <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
            <div className="flex justify-center gap-8 mb-6">
              <a href="#" className="hover:text-primary-400 transition-colors">Términos</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Soporte</a>
            </div>
            <p>© 2026 Rapi Fletes. Todos los derechos reservados.</p>
            <p className="mt-2 font-black text-xs uppercase tracking-[0.2em] text-slate-700">Moviendo el futuro</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
