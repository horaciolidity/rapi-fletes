import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Truck } from 'lucide-react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Booking from './pages/Booking'
import DriverDashboard from './pages/DriverDashboard'
import DriverWallet from './pages/DriverWallet'
import AdminDashboard from './pages/AdminDashboard'
import AdminComplaints from './pages/AdminComplaints'
import AdminVehicles from './pages/AdminVehicles'
import AdminUsers from './pages/AdminUsers'
import AdminSettings from './pages/AdminSettings'
import MyFletes from './pages/MyFletes'
import Profile from './pages/Profile'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'
import { supabase } from './api/supabase'
import NotificationManager from './components/notifications/NotificationManager'
import { useNotificationStore } from './store/useNotificationStore'

const AppContent = () => {
  const setUser = useAuthStore(state => state.setUser)
  const fetchProfile = useAuthStore(state => state.fetchProfile)
  const theme = useThemeStore(state => state.theme)
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  const profileSubRef = React.useRef(null)

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  useEffect(() => {
    // 1. Initial Session Check
    const initAuth = async () => {
      console.log('--- Initial Auth Check ---')
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
        if (!profileSubRef.current) {
          profileSubRef.current = useAuthStore.getState().subscribeToProfile(session.user.id)
        }
      }
    }

    initAuth()

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('--- Auth Event:', event)
      const user = session?.user ?? null
      setUser(user)

      if (user) {
        await fetchProfile(user.id)
        if (!profileSubRef.current) {
          profileSubRef.current = useAuthStore.getState().subscribeToProfile(user.id)
        }
      } else {
        if (profileSubRef.current) {
          supabase.removeChannel(profileSubRef.current)
          profileSubRef.current = null
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      if (profileSubRef.current) {
        supabase.removeChannel(profileSubRef.current)
        profileSubRef.current = null
      }
    }
  }, []) // Stability: run once

  const ProtectedAdminRoute = ({ children }) => {
    const { profile, loading } = useAuthStore()
    if (loading) return null
    if (profile?.role !== 'admin') return <Navigate to="/" replace />
    return children
  }

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary-500 selection:text-white max-w-lg mx-auto relative transition-colors duration-500 overflow-x-hidden">
      <div className="bg-mesh" />
      {!isAuthPage && <Navbar />}
      <NotificationManager />

      <main className={`flex-grow relative ${!isAuthPage ? 'pb-24 pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />

          <Route path="/booking" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/wallet" element={<DriverWallet />} />
          <Route path="/my-fletes" element={<MyFletes />} />

          {/* Admin Routes - Protected */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/admin/complaints" element={<ProtectedAdminRoute><AdminComplaints /></ProtectedAdminRoute>} />
          <Route path="/admin/vehicles" element={<ProtectedAdminRoute><AdminVehicles /></ProtectedAdminRoute>} />
          <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
          <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <BottomNav />}

      {/* Footer only shown on larger screens if needed, otherwise removed for "mobile-only" feel */}
      {!isAuthPage && (
        <footer className={`hidden md:block py-20 ${theme === 'dark' ? 'bg-zinc-950 border-t border-zinc-900' : 'bg-white border-t border-zinc-100'} relative overflow-hidden mt-auto transition-colors duration-500`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          <div className="container mx-auto px-10 text-center relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-10">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-primary-500 rounded-lg">
                  <Truck className="w-4 h-4 text-black" />
                </div>
                <span className={`text-lg font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Rapi<span className="text-primary-500">Fletes</span></span>
              </div>
              <div className="flex gap-8">
                <a href="#" className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'} hover:text-primary-500 transition-colors italic`}>Términos Operativos</a>
                <a href="#" className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'} hover:text-primary-500 transition-colors italic`}>Protocolos de Privacidad</a>
                <a href="#" className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'} hover:text-primary-500 transition-colors italic`}>HQ Soporte</a>
              </div>
            </div>
            <p className={`text-[7px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-zinc-800' : 'text-zinc-200'} italic`}>© 2026 RapiFletes Inc - Inteligencia en Movimiento</p>
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
