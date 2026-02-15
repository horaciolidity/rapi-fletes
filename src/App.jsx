import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Booking from './pages/Booking'
import DriverDashboard from './pages/DriverDashboard'
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
            <Route path="/booking" element={<Booking />} />
            <Route path="/driver" element={<DriverDashboard />} />
            {/* Future routes:
            <Route path="/my-fletes" element={<MyFletes />} />
            */}
          </Routes>
        </main>

        <footer className="py-12 bg-black/40 border-t border-white/5">
          <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
            <p>© 2026 Rapi Fletes. Todos los derechos reservados.</p>
            <p className="mt-2 font-medium">Moviendo tus sueños con tecnología eficiente.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
