import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, LogOut, Menu, X, Bell, LayoutDashboard, History, ShieldCheck, Settings, ArrowRight, Clock } from 'lucide-react'
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
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ${isScrolled ? 'bg-[var(--bg-color)]/80 backdrop-blur-3xl border-b border-[var(--border-color)] py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'bg-transparent py-5 md:py-8'}`}>
            <div className="container mx-auto px-6 md:px-10 flex items-center justify-between max-w-[1700px]">

                {/* Left Side: Mobile Avatar / Menu */}
                <div className="flex items-center gap-4 lg:hidden">
                    {user ? (
                        <Link to="/profile" className="w-11 h-11 rounded-2xl border border-[var(--border-color)] p-0.5 overflow-hidden active:scale-95 transition-transform bg-[var(--card-bg)]">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-[0.8rem]" />
                            ) : (
                                <div className="w-full h-full bg-zinc-900 rounded-[0.8rem] flex items-center justify-center">
                                    <User className="w-5 h-5 text-zinc-600" />
                                </div>
                            )}
                        </Link>
                    ) : (
                        <Link to="/auth" className="w-11 h-11 rounded-2xl border border-[var(--border-color)] flex items-center justify-center bg-[var(--card-bg)]">
                            <User className="w-5 h-5 text-zinc-600" />
                        </Link>
                    )}
                </div>

                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 group relative">
                    <div className="relative">
                        <div className="w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-[1.2rem] bg-black overflow-hidden border border-primary-500/20 shadow-xl transition-all duration-700 group-hover:rotate-[8deg] group-hover:scale-105">
                            <img src="/imagenes/1.jpg" alt="Rapi Fletes" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent" />
                        </div>
                        <div className="absolute -inset-2 bg-primary-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg md:text-3xl font-black tracking-tighter uppercase italic leading-none text-gradient">
                            RAPI<span className="text-primary-500">FLETES</span>
                        </span>
                        <span className="text-[6px] md:text-[9px] font-black tracking-[0.5em] text-zinc-500 leading-none mt-1.5 opacity-60 italic uppercase flex items-center gap-2">
                            <span className="block h-[1px] w-3 bg-primary-500/30" />
                            Elite Logistics
                        </span>
                    </div>
                </Link>

                {/* Main Desktop Nav */}
                <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-3xl px-3 py-2 rounded-[2rem] border border-white/5 shadow-2xl group/nav">
                    {navLinks.filter(l => l.show !== false).map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black tracking-[0.2em] transition-all relative italic uppercase ${location.pathname === link.path ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {profile?.role === 'driver' && (
                        <Link to="/driver" className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black tracking-[0.2em] italic uppercase transition-all ${location.pathname === '/driver' ? 'bg-primary-500 text-black' : 'text-primary-500 hover:bg-primary-500/10'}`}>
                            CONDUCTOR
                        </Link>
                    )}

                    {(profile?.role === 'admin' || user?.email === 'horaciowalterortiz@gmail.com') && (
                        <Link to="/admin" className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black tracking-[0.2em] italic transition-all uppercase ${location.pathname?.startsWith('/admin') ? 'bg-secondary-500 text-white' : 'text-secondary-500 hover:bg-secondary-500/10'}`}>
                            ADMIN
                        </Link>
                    )}
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-5">
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications)
                                    if (!showNotifications) markAsRead()
                                }}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative border ${showNotifications ? 'bg-primary-500 border-primary-500 text-black shadow-lg shadow-primary-500/30' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-primary-500/50 hover:text-primary-500'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-color)] animate-bounce shadow-lg">
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
                                            className="fixed inset-0 z-40"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                                            className="absolute right-0 mt-6 w-96 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden backdrop-blur-3xl"
                                        >
                                            <div className="p-7 border-b border-[var(--border-color)] flex items-center justify-between bg-primary-500/5">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-primary-500">Notificaciones</h3>
                                                </div>
                                                <button
                                                    onClick={clearNotifications}
                                                    className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary-500 transition-colors italic"
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                            <div className="max-h-[500px] overflow-y-auto p-2">
                                                {notifications.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <div key={n.id} className="p-6 rounded-3xl mb-1 hover:bg-white/5 transition-all flex gap-5 group/item">
                                                            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover/item:border-primary-500/30 transition-all">
                                                                <Bell className="w-4 h-4 text-zinc-400 group-hover/item:text-primary-500" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[12px] font-bold text-zinc-300 leading-relaxed italic mb-2">{n.message}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-3 h-3 text-zinc-700" />
                                                                    <p className="text-[8px] font-black text-zinc-700 uppercase italic">
                                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-20 text-center opacity-40">
                                                        <Bell className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                                                        <p className="text-[9px] font-black text-zinc-700 uppercase italic tracking-[0.3em]">Cero Novedades</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Desktop CTA / Profile */}
                    {user ? (
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="flex items-center gap-5 bg-white/5 p-2 pr-6 rounded-[2rem] border border-white/5 hover:border-primary-500/20 transition-all group cursor-pointer shadow-2xl backdrop-blur-3xl">
                                <Link to="/profile" className="w-12 h-12 rounded-[1.2rem] border-2 border-white/5 p-1 overflow-hidden transition-all group-hover:border-primary-500 group-hover:rotate-6">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-[0.8rem]" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900 rounded-[0.8rem] flex items-center justify-center">
                                            <User className="w-5 h-5 text-zinc-600" />
                                        </div>
                                    )}
                                </Link>

                                <div className="text-left" onClick={() => navigate('/profile')}>
                                    <p className="text-[10px] font-black uppercase italic tracking-widest leading-none mb-1.5">{profile?.full_name?.split(' ')[0] || 'AGENTE'}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                                        <p className="text-[7px] text-zinc-500 uppercase tracking-[0.4em] font-black italic">VERIFICADO</p>
                                    </div>
                                </div>

                                <div className="h-6 w-[2px] bg-white/5 mx-2" />

                                <button
                                    onClick={signOut}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-black transition-all group/exit"
                                >
                                    <LogOut className="w-4 h-4 group-hover/exit:rotate-12 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/auth" className="premium-button hidden lg:flex py-4 px-12 group">
                            <span>ACCEDER</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
