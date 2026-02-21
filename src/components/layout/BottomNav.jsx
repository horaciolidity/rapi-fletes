import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Truck, History, User, Home, Map, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { motion } from 'framer-motion'

const BottomNav = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const { profile, user } = useAuthStore()
    const isDriver = profile?.role === 'driver'
    const isAdmin = profile?.role === 'admin' || user?.email === 'horaciowalterortiz@gmail.com'

    const navItems = [
        { icon: Home, label: 'INICIO', path: '/' },
        {
            icon: Map,
            label: isDriver ? 'LOGÍSTICA' : 'RESERVA',
            path: isDriver ? '/driver' : '/booking'
        },
        { icon: History, label: 'ÓRDENES', path: '/my-fletes' },
        { icon: User, label: 'PERFIL', path: '/profile' },
        ...(isAdmin ? [{ icon: Shield, label: 'ADMIN', path: '/admin' }] : []),
    ]

    return (
        <div className="fixed bottom-6 left-0 right-0 z-[60] px-6 pointer-events-none flex justify-center md:hidden">
            <nav className="glass-card bg-zinc-950/80 backdrop-blur-3xl border-white/10 px-6 py-4 flex justify-between items-center w-full max-w-sm pointer-events-auto shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />

                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="relative flex flex-col items-center gap-1.5 transition-all duration-500 active:scale-90 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavDot"
                                    className="absolute -top-1 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,1)]"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                                />
                            )}

                            <div className={`p-2 rounded-2xl transition-all duration-500 ${isActive ? 'bg-primary-500/10 text-primary-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'text-zinc-600 group-hover:text-white'}`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'fill-primary-500/20 stroke-[2.5]' : 'stroke-[2]'}`} />
                            </div>

                            <span className={`text-[8px] font-black italic tracking-widest transition-all duration-500 ${isActive ? 'text-white' : 'text-zinc-700'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}

export default BottomNav
