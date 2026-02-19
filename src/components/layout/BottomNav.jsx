import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Truck, History, User, Home, Map, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const BottomNav = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const { profile, user } = useAuthStore()
    const isDriver = profile?.role === 'driver'
    const isAdmin = profile?.role === 'admin' || user?.email === 'horaciowalterortiz@gmail.com'

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        {
            icon: Map,
            label: isDriver ? 'Viajes' : 'Reserva',
            path: isDriver ? '/driver' : '/booking'
        },
        { icon: History, label: 'Mis Fletes', path: '/my-fletes' },
        { icon: User, label: 'Perfil', path: '/profile' },
        ...(isAdmin ? [{ icon: Shield, label: 'Admin', path: '/admin' }] : []),
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] backdrop-blur-xl border-t border-[var(--border-color)] px-6 py-3 z-50 flex justify-between items-center md:hidden">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary-500 scale-110' : 'text-zinc-500 hover:text-[var(--text-color)]'
                            }`}
                    >
                        <Icon className={`w-6 h-6 ${isActive ? 'fill-primary-500/20' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter italic">
                            {item.label}
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}

export default BottomNav
