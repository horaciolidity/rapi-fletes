import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, LogOut, Menu, X, Bell, LayoutDashboard, History, Package } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const Navbar = () => {
    const { user, profile, signOut } = useAuthStore()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Inicio', path: '/' },
        {
            name: 'Pedir Flete',
            path: '/booking',
            show: profile?.role !== 'driver',
            icon: <Truck className="w-4 h-4" />
        },
        {
            name: 'Mis Fletes',
            path: '/my-fletes',
            show: user && profile?.role !== 'driver',
            icon: <History className="w-4 h-4" />
        },
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary-600 rounded-xl group-hover:rotate-[15deg] transition-all duration-500 shadow-xl shadow-primary-600/20">
                        <Truck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic italic">Rapi<span className="text-primary-500">Fletes</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.filter(l => l.show !== false).map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary-400 flex items-center gap-2 ${location.pathname === link.path ? 'text-primary-400' : 'text-slate-400'}`}
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    ))}
                    {profile?.role === 'driver' && (
                        <Link
                            to="/driver"
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 px-4 py-2 rounded-xl ${location.pathname === '/driver' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-amber-400 bg-amber-400/10 border border-amber-400/20'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Panel Chofer
                        </Link>
                    )}
                </div>

                {/* User Actions */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-5">
                            <button className="p-2 text-slate-500 hover:text-white transition-colors relative group">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-slate-950 animate-pulse" />
                            </button>
                            <div className="h-6 w-[1px] bg-white/10" />
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden lg:block">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{profile?.full_name?.split(' ')[0] || 'Usuario'}</p>
                                    <p className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-black opacity-60">{profile?.role === 'driver' ? 'Chofer Verificado' : 'Cliente'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden ring-4 ring-white/5 group cursor-pointer hover:ring-primary-500/20 transition-all">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-slate-600 group-hover:text-primary-400 transition-colors" />
                                    )}
                                </div>
                                <button
                                    onClick={signOut}
                                    className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-300"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/auth" className="premium-button py-3 px-8 text-[10px] uppercase tracking-[0.2em] font-black">
                            Ingresar
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-3 bg-slate-900/50 rounded-xl border border-white/5 text-slate-300"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-[60] bg-slate-950 p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-3xl font-black tracking-tighter uppercase italic">Rapi<span className="text-primary-500">Fletes</span></span>
                            <button onClick={() => setMobileMenuOpen(false)} className="bg-slate-900 p-3 rounded-2xl border border-white/5">
                                <X className="w-8 h-8 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {navLinks.filter(l => l.show !== false).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-5xl font-black text-slate-600 hover:text-white uppercase tracking-tighter italic transition-colors flex items-center gap-4"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {profile?.role === 'driver' && (
                                <Link
                                    to="/driver"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-5xl font-black text-amber-500 uppercase tracking-tighter italic"
                                >
                                    Panel Chofer
                                </Link>
                            )}

                            <div className="mt-12 pt-12 border-t border-white/5 space-y-4">
                                {!user ? (
                                    <Link
                                        to="/auth"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="premium-button text-center py-5 text-xl w-full block"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                        className="flex items-center justify-between w-full bg-red-500 p-6 rounded-3xl text-white font-black text-2xl uppercase tracking-tighter italic shadow-xl shadow-red-500/20"
                                    >
                                        Cerrar Sesión <LogOut className="w-8 h-8" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
