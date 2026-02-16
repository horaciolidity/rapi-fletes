import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Truck } from 'lucide-react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Booking from './pages/Booking'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MyFletes from './pages/MyFletes'
import Profile from './pages/Profile'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'
import { supabase } from './api/supabase'
import NotificationManager from './components/notifications/NotificationManager'

const AppContent = () => {
  const { setUser, fetchProfile } = useAuthStore()
  const { theme } = useThemeStore()
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

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
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-50 text-zinc-900'} selection:bg-primary-500 selection:text-white max-w-md mx-auto relative md:max-w-none shadow-2xl shadow-primary-500/5 transition-colors duration-500`}>
      {!isAuthPage && <Navbar />}
      <NotificationManager />

      <main className={`flex-grow overflow-y-auto ${!isAuthPage ? 'pb-24 pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />

          <Route path="/booking" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/my-fletes" element={<MyFletes />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <BottomNav />}

      {/* Footer only shown on larger screens if needed, otherwise removed for "mobile-only" feel */}
      {!isAuthPage && (
        <footer className={`hidden md:block py-20 ${theme === 'dark' ? 'bg-zinc-950 border-t border-zinc-900' : 'bg-white border-t border-zinc-100'} relative overflow-hidden mt-auto transition-colors duration-500`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          <div className="container mx-auto px-10 text-center relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <Truck className="w-5 h-5 text-black" />
                </div>
                <span className={`text-xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Rapi<span className="text-primary-500">Fletes</span></span>
              </div>
              <div className="flex gap-10">
                <a href="#" className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'} hover:text-primary-500 transition-colors italic`}>Términos Operativos</a>
                <a href="#" className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'} hover:text-primary-500 transition-colors italic`}>Protocolos de Privacidad</a>
                <a href="#" className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'} hover:text-primary-500 transition-colors italic`}>HQ Soporte</a>
              </div>
            </div>
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-zinc-800' : 'text-zinc-200'} italic`}>© 2026 RapiFletes Inc - Inteligencia en Movimiento</p>
          </div>
        </footer>
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
