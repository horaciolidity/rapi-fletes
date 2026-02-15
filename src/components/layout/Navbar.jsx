import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, LogOut, Menu, X, Bell, LayoutDashboard, History, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const Navbar = () => {
    const { user, profile, signOut } = useAuthStore()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'INICIO', path: '/' },
        {
            name: 'PEDIR FLETE',
            path: '/booking',
            show: profile?.role !== 'driver',
        },
        {
            name: 'MIS PEDIDOS',
            path: '/my-fletes',
            show: user && profile?.role !== 'driver' && profile?.role !== 'admin',
        },
        {
            name: 'PANEL ADMIN',
            path: '/admin',
            show: profile?.role === 'admin',
        },
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
                {/* Logo - Centered alignment in its box */}
                <Link to="/" className="flex items-center gap-3 group relative">
                    <div className="p-2.5 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-[1rem] group-hover:rotate-[15deg] transition-all duration-500 shadow-lg shadow-primary-500/20">
                        <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">Rapi<span className="text-primary-500">Fletes</span></span>
                        <span className="text-[8px] font-black tracking-[0.4em] text-slate-500 leading-none mt-1 opacity-60">LOGÍSTICA ELITE</span>
                    </div>
                </Link>

                {/* Desktop Nav - Perfectly Spaced */}
                <div className="hidden md:flex items-center gap-12 bg-white/5 px-8 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
                    {navLinks.filter(l => l.show !== false).map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-[10px] font-black tracking-[0.2em] transition-all hover:text-primary-400 relative py-1 ${location.pathname === link.path ? 'text-primary-400' : 'text-slate-400'}`}
                        >
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* User Actions - Aligned to the end */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 pr-4 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 rounded-[0.8rem] bg-slate-800 border border-white/5 flex items-center justify-center overflow-hidden relative group">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
                                )}
                                {profile?.role === 'driver' && <div className="absolute bottom-0 right-0 bg-amber-500 w-2.5 h-2.5 rounded-full border-2 border-slate-900" />}
                            </div>

                            <div className="text-left">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{profile?.full_name?.split(' ')[0] || 'Cargando...'}</p>
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-3 h-3 text-primary-500" />
                                    <p className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-black">
                                        {profile?.role === 'driver' ? 'Chofer' : profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                                    </p>
                                </div>
                            </div>

                            <div className="h-4 w-[1px] bg-white/10 mx-2" />

                            {profile?.role === 'driver' && (
                                <Link to="/driver" className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all">
                                    <LayoutDashboard className="w-4 h-4" />
                                </Link>
                            )}

                            {profile?.role === 'admin' && (
                                <Link to="/admin" className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                    <LayoutDashboard className="w-4 h-4" />
                                </Link>
                            )}

                            <button
                                onClick={signOut}
                                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" className="premium-button py-3.5 px-10 text-[10px] uppercase tracking-[0.2em] font-black italic">
                            Acceso Clientes
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-3 bg-slate-900/80 rounded-2xl border border-white/5 text-slate-300 shadow-xl"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Menu - Premium Fullscreen */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-3xl p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-3xl font-black tracking-tighter uppercase italic">Rapi<span className="text-primary-500">Fletes</span></span>
                            <button onClick={() => setMobileMenuOpen(false)} className="bg-slate-900/50 p-4 rounded-3xl border border-white/10 text-white">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8 flex-grow">
                            {navLinks.filter(l => l.show !== false).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-6xl font-black text-slate-400 hover:text-white uppercase tracking-tighter italic transition-all hover:translate-x-4"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {profile?.role === 'driver' && (
                                <Link
                                    to="/driver"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-6xl font-black text-amber-500 uppercase tracking-tighter italic hover:translate-x-4 transition-all"
                                >
                                    PANEL CHOFER
                                </Link>
                            )}
                        </div>

                        <div className="pt-10 border-t border-white/10">
                            {!user ? (
                                <Link
                                    to="/auth"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="premium-button text-center py-6 text-2xl w-full block italic"
                                >
                                    INICIAR SESIÓN
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                    className="flex items-center justify-between w-full bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] text-red-500 font-black text-2xl uppercase tracking-tighter italic"
                                >
                                    CERRAR SESIÓN <LogOut className="w-8 h-8" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
