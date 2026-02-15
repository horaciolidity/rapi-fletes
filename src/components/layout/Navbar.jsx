import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, LogOut, Menu, X, Bell, LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

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
        { name: 'Pedir Flete', path: '/booking', show: profile?.role !== 'driver' },
        { name: 'Mis Fletes', path: '/my-fletes', show: user },
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-primary-600/30">
                        <Truck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">Rapi<span className="text-primary-500 font-black">Fletes</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.filter(l => l.show !== false).map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-xs font-black uppercase tracking-widest transition-all hover:text-primary-400 ${location.pathname === link.path ? 'text-primary-400' : 'text-slate-400'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {profile?.role === 'driver' && (
                        <Link
                            to="/driver"
                            className={`text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 px-4 py-2 rounded-lg ${location.pathname === '/driver' ? 'bg-primary-500/10 text-primary-400' : 'text-amber-400 bg-amber-400/10'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Panel Chofer
                        </Link>
                    )}
                </div>

                {/* User Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-500 hover:text-white transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-slate-950" />
                            </button>
                            <div className="h-8 w-[1px] bg-slate-800" />
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden lg:block">
                                    <p className="text-xs font-black text-white">{profile?.full_name || 'Cargando...'}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{profile?.role === 'driver' ? 'Chofer Verificado' : 'Cliente'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-white/5 shadow-inner">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-slate-600" />
                                    )}
                                </div>
                                <button
                                    onClick={signOut}
                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/auth" className="premium-button py-2.5 px-6 text-xs uppercase tracking-widest font-black">
                            Ingresar
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-slate-300"
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
                            <span className="text-2xl font-black tracking-tighter uppercase">Rapi<span className="text-primary-500">Fletes</span></span>
                            <button onClick={() => setMobileMenuOpen(false)} className="bg-slate-900 p-2 rounded-xl">
                                <X className="w-8 h-8 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8">
                            {navLinks.filter(l => l.show !== false).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-black text-slate-100 uppercase tracking-tighter"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {profile?.role === 'driver' && (
                                <Link
                                    to="/driver"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-black text-amber-400 uppercase tracking-tighter"
                                >
                                    Panel Chofer
                                </Link>
                            )}
                            {!user && (
                                <Link
                                    to="/auth"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="premium-button text-center mt-8 py-4 text-lg"
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                            {user && (
                                <button
                                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-4 text-red-500 font-black text-2xl mt-8 uppercase tracking-widest bg-red-500/5 p-4 rounded-2xl border border-red-500/10"
                                >
                                    <LogOut className="w-8 h-8" /> Cerrar Sesión
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
