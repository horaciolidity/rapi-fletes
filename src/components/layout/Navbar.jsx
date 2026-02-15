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
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled ? 'bg-black/90 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl' : 'bg-transparent py-6 md:py-10'}`}>
            <div className="container mx-auto px-6 md:px-10 flex items-center justify-between max-w-[1700px]">

                {/* Logo Profesional */}
                <Link to="/" className="flex items-center gap-3 md:gap-5 group relative">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-[1rem] md:rounded-[1.2rem] overflow-hidden flex items-center justify-center transform group-hover:rotate-[5deg] group-hover:scale-110 transition-all duration-700 shadow-[0_0_30px_rgba(245,158,11,0.3)] border-2 border-primary-500/20">
                        <img src="/imagenes/1.jpg" alt="Rapi Fletes" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-3xl font-black tracking-tighter uppercase italic leading-none text-white">RAPI<span className="text-primary-500">FLETES</span></span>
                        <span className="text-[7px] md:text-[9px] font-black tracking-[0.5em] text-zinc-700 leading-none mt-1 md:mt-2 opacity-80 italic uppercase">Transporte Confiable</span>
                    </div>
                </Link>

                {/* Navegación Principal (Desktop) */}
                <div className="hidden md:flex items-center gap-8 lg:gap-12 bg-zinc-950/50 px-8 lg:px-12 py-3 rounded-full border border-white/5 backdrop-blur-xl shadow-2xl">
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

                    {profile?.role === 'admin' && (
                        <Link to="/admin" className={`text-[9px] lg:text-[10px] font-black tracking-[0.3em] italic transition-all uppercase ${location.pathname === '/admin' ? 'text-secondary-600' : 'text-zinc-500 hover:text-secondary-600'}`}>
                            ADMIN
                        </Link>
                    )}
                </div>

                {/* Perfil de Usuario (Desktop) */}
                <div className="hidden md:flex items-center gap-6 lg:gap-10">
                    {user ? (
                        <div className="flex items-center gap-4 bg-zinc-950 p-1.5 pr-5 rounded-full border border-white/5 shadow-xl group cursor-pointer hover:border-primary-500/30 transition-all">
                            <div className="w-10 h-10 rounded-full border-2 border-zinc-800 p-0.5 overflow-hidden transition-all group-hover:border-primary-500">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-zinc-700" />
                                    </div>
                                )}
                            </div>

                            <div className="text-left hidden lg:block">
                                <p className="text-[9px] font-black text-white uppercase italic tracking-widest leading-none mb-1">{profile?.full_name?.split(' ')[0] || 'USUARIO'}</p>
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
                    ) : (
                        <Link to="/auth" className="premium-button py-4 px-10 text-[9px]">
                            INGRESAR
                        </Link>
                    )}
                </div>

                {/* Mobile Trigger */}
                <button
                    className="md:hidden w-12 h-12 bg-zinc-950 rounded-[1.2rem] border border-white/5 flex items-center justify-center text-white"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Menú Móvil */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-0 z-[200] bg-black p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">RAPI<span className="text-primary-500">FLETES</span></span>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-12 h-12 bg-zinc-950 rounded-[1.2rem] border border-white/5 flex items-center justify-center text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8 flex-grow">
                            {navLinks.filter(l => l.show !== false).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-4xl font-black uppercase tracking-tighter italic transition-all hover:translate-x-4 ${location.pathname === link.path ? 'text-primary-500' : 'text-zinc-800 hover:text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {profile?.role === 'driver' && (
                                <Link
                                    to="/driver"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-black text-zinc-800 hover:text-primary-500 uppercase tracking-tighter italic transition-all hover:translate-x-4"
                                >
                                    PANEL CHOFER
                                </Link>
                            )}
                        </div>

                        <div className="pt-12 border-t border-zinc-900">
                            {!user ? (
                                <Link
                                    to="/auth"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="premium-button text-center w-full py-8 text-xl italic"
                                >
                                    INICIAR SESIÓN
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                    className="w-full flex items-center justify-between bg-red-500/5 border border-red-500/20 p-8 rounded-[2rem] text-red-500 font-black text-xl uppercase tracking-tighter italic group hover:bg-red-500 hover:text-black transition-all"
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
