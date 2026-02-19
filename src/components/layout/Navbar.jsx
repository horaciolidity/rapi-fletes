import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, LogOut, Menu, X, Bell, LayoutDashboard, History, ShieldCheck, Settings } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useNotificationStore } from '../../store/useNotificationStore'

const Navbar = () => {
    const { user, profile, signOut } = useAuthStore()
    const { notifications, markAsRead, clearNotifications } = useNotificationStore()
    const [isScrolled, setIsScrolled] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'INICIO', path: '/' },
        {
            name: 'SOLICITAR FLETE',
            path: '/booking',
            show: !profile || (profile.role !== 'driver' && profile.role !== 'admin'),
        },
        {
            name: 'MIS VIAJES',
            path: '/my-fletes',
            show: user && profile?.role !== 'driver' && profile?.role !== 'admin',
        },
        {
            name: 'PERFIL',
            path: '/profile',
            show: !!user,
        },
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled ? 'bg-[var(--bg-color)]/90 backdrop-blur-2xl border-b border-[var(--border-color)] py-3 shadow-2xl' : 'bg-transparent py-4 md:py-7'}`}>
            <div className="container mx-auto px-6 md:px-10 flex items-center justify-between max-w-[1700px]">

                {/* Profile/Back button on mobile */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link to="/profile" className="w-10 h-10 rounded-full border border-white/10 p-0.5 overflow-hidden md:hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-zinc-500" />
                                </div>
                            )}
                        </Link>
                    ) : (
                        <div className="w-10 h-10 md:hidden" /> // Spacer
                    )}
                </div>

                {/* Logo Centralizado/Izquierda */}
                <Link to="/" className="flex items-center gap-2 md:gap-5 group relative">
                    <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-[1.2rem] overflow-hidden flex items-center justify-center transform group-hover:rotate-[5deg] group-hover:scale-110 transition-all duration-700 shadow-[0_0_30px_rgba(245,158,11,0.3)] border-2 border-primary-500/20">
                        <img src="/imagenes/1.jpg" alt="Rapi Fletes" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg md:text-3xl font-black tracking-tighter uppercase italic leading-none">RAPI<span className="text-primary-500">FLETES</span></span>
                        <span className="text-[6px] md:text-[9px] font-black tracking-[0.5em] text-zinc-500 leading-none mt-1 md:mt-2 opacity-80 italic uppercase">Logística Móvil</span>
                    </div>
                </Link>

                {/* Navegación Principal (Desktop) */}
                <div className="hidden md:flex items-center gap-8 lg:gap-12 bg-[var(--card-bg)] px-8 lg:px-12 py-3 rounded-full border border-[var(--border-color)] backdrop-blur-xl shadow-2xl">
                    {navLinks.filter(l => l.show !== false).map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-[9px] lg:text-[10px] font-black tracking-[0.3em] transition-all hover:text-primary-500 relative py-1 italic ${location.pathname === link.path ? 'text-primary-500' : 'text-zinc-500'}`}
                        >
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div layoutId="nav-underline" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            )}
                        </Link>
                    ))}

                    {profile?.role === 'driver' && (
                        <Link to="/driver" className={`text-[9px] lg:text-[10px] font-black tracking-[0.3em] italic transition-all uppercase ${location.pathname === '/driver' ? 'text-primary-500' : 'text-zinc-500 hover:text-primary-500'}`}>
                            PANEL CHOFER
                        </Link>
                    )}

                    {(profile?.role === 'admin' || user?.email === 'horaciowalterortiz@gmail.com') && (
                        <Link to="/admin" className={`text-[9px] lg:text-[10px] font-black tracking-[0.3em] italic transition-all uppercase ${location.pathname?.startsWith('/admin') ? 'text-primary-500' : 'text-zinc-500 hover:text-primary-500'}`}>
                            ADMIN
                        </Link>
                    )}
                </div>

                {/* Acciones derecha */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowNotifications(!showNotifications)
                                        if (!showNotifications) markAsRead()
                                    }}
                                    className={`w-10 h-10 bg-[var(--bg-color)] rounded-xl border flex items-center justify-center transition-all ${showNotifications ? 'border-primary-500 text-primary-500' : 'border-[var(--border-color)] text-zinc-500 hover:text-primary-500'}`}
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-black text-[8px] font-black rounded-full flex items-center justify-center border-2 border-black animate-bounce">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => setShowNotifications(false)}
                                                className="fixed inset-0 z-40 bg-black/20"
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                className="absolute right-0 mt-4 w-80 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-zinc-900/5">
                                                    <h3 className="text-[10px] font-black uppercase tracking-widest italic">Notificaciones</h3>
                                                    <button
                                                        onClick={clearNotifications}
                                                        className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary-500 transition-colors italic"
                                                    >
                                                        Limpiar todo
                                                    </button>
                                                </div>
                                                <div className="max-h-[400px] overflow-y-auto">
                                                    {notifications.length > 0 ? (
                                                        notifications.map((n) => (
                                                            <div key={n.id} className="p-5 border-b border-[var(--border-color)] hover:bg-zinc-900/5 transition-colors flex gap-4">
                                                                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                                                                    <Bell className="w-4 h-4 text-primary-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] font-bold text-zinc-300 leading-relaxed mb-1 italic">{n.message}</p>
                                                                    <p className="text-[8px] font-black text-zinc-700 uppercase italic">
                                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-10 text-center">
                                                            <Bell className="w-10 h-10 text-zinc-900 mx-auto mb-4" />
                                                            <p className="text-[9px] font-black text-zinc-700 uppercase italic tracking-widest">Sin notificaciones nuevas</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Desktop Profile Info */}
                            <div className="hidden md:flex items-center gap-6 lg:gap-10">
                                <div className="flex items-center gap-4 bg-[var(--bg-color)] p-1.5 pr-5 rounded-full border border-[var(--border-color)] shadow-xl group cursor-pointer hover:border-primary-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-full border-2 border-zinc-200 p-0.5 overflow-hidden transition-all group-hover:border-primary-500">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-zinc-700" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-left hidden lg:block">
                                        <p className="text-[9px] font-black uppercase italic tracking-widest leading-none mb-1">{profile?.full_name?.split(' ')[0] || 'USUARIO'}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                                            <p className="text-[7px] text-zinc-700 uppercase tracking-[0.2em] font-black italic">ONLINE</p>
                                        </div>
                                    </div>
                                    <div className="h-5 w-[1px] bg-zinc-900 mx-1" />
                                    <button
                                        onClick={signOut}
                                        className="p-2.5 bg-zinc-900 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Link to="/auth" className="w-10 h-10 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-center md:hidden">
                            <User className="w-5 h-5 text-white" />
                        </Link>
                    )}

                    {!user && (
                        <Link to="/auth" className="hidden md:block premium-button py-4 px-10 text-[9px]">
                            INGRESAR
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
