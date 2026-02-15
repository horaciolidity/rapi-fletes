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
        { name: 'HOME', path: '/' },
        {
            name: 'SOLICITAR SERVICIO',
            path: '/booking',
            show: !profile || (profile.role !== 'driver' && profile.role !== 'admin'),
        },
        {
            name: 'MIS SERVICIOS',
            path: '/my-fletes',
            show: user && profile?.role !== 'driver' && profile?.role !== 'admin',
        },
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ${isScrolled ? 'bg-black/90 backdrop-blur-3xl border-b border-zinc-900 py-4 shadow-2xl' : 'bg-transparent py-10'}`}>
            <div className="container mx-auto px-10 flex items-center justify-between max-w-[1700px]">

                {/* Logo Profesional */}
                <Link to="/" className="flex items-center gap-5 group relative">
                    <div className="w-14 h-14 bg-primary-500 rounded-[1.5rem] flex items-center justify-center transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        <Truck className="w-7 h-7 text-black" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black tracking-tighter uppercase italic leading-none text-white">RAPI<span className="text-primary-500">FLETES</span></span>
                        <span className="text-[9px] font-black tracking-[0.5em] text-zinc-700 leading-none mt-2 opacity-80 italic uppercase">Transporte Confiable</span>
                    </div>
                </Link>

                {/* Navegación Principal */}
                <div className="hidden md:flex items-center gap-16 bg-zinc-950/50 px-12 py-3.5 rounded-full border border-zinc-900 backdrop-blur-xl shadow-2xl">
                    {navLinks.filter(l => l.show !== false).map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-[10px] font-black tracking-[0.4em] transition-all hover:text-primary-500 relative py-1 italic ${location.pathname === link.path ? 'text-primary-500' : 'text-zinc-500'}`}
                        >
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div layoutId="nav-underline" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            )}
                        </Link>
                    ))}

                    {profile?.role === 'driver' && (
                        <Link to="/driver" className={`text-[10px] font-black tracking-[0.4em] italic transition-all uppercase ${location.pathname === '/driver' ? 'text-primary-500' : 'text-zinc-500 hover:text-primary-500'}`}>
                            PANEL CONDUCTOR
                        </Link>
                    )}

                    {profile?.role === 'admin' && (
                        <Link to="/admin" className={`text-[10px] font-black tracking-[0.4em] italic transition-all uppercase ${location.pathname === '/admin' ? 'text-secondary-600' : 'text-zinc-500 hover:text-secondary-600'}`}>
                            ADMINISTRACIÓN
                        </Link>
                    )}
                </div>

                {/* Perfil de Usuario */}
                <div className="hidden md:flex items-center gap-10">
                    {user ? (
                        <div className="flex items-center gap-6 bg-zinc-950 p-2 pr-6 rounded-full border border-zinc-900 shadow-xl group cursor-pointer">
                            <div className="w-12 h-12 rounded-full border-2 border-zinc-800 p-0.5 overflow-hidden transition-all group-hover:border-primary-500">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-zinc-700" />
                                    </div>
                                )}
                            </div>

                            <div className="text-left hidden lg:block">
                                <p className="text-[10px] font-black text-white uppercase italic tracking-widest leading-none mb-2">{profile?.full_name?.split(' ')[0] || 'USUARIO'}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                    <p className="text-[8px] text-zinc-700 uppercase tracking-[0.3em] font-black italic">EN LÍNEA</p>
                                </div>
                            </div>

                            <div className="h-6 w-[1px] bg-zinc-900 mx-2" />

                            <button
                                onClick={signOut}
                                className="p-3 bg-zinc-900 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" className="premium-button py-5 px-12 text-[10px]">
                            INICIAR SESIÓN
                        </Link>
                    )}
                </div>

                {/* Mobile Trigger */}
                <button
                    className="md:hidden w-14 h-14 bg-zinc-950 rounded-[1.5rem] border-2 border-zinc-900 flex items-center justify-center text-white"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="w-7 h-7" />
                </button>
            </div>

            {/* Menú Móvil */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[200] bg-black p-12 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-24">
                            <span className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">RAPI<span className="text-primary-500">FLETES</span></span>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-16 h-16 bg-zinc-950 rounded-[2rem] border-2 border-zinc-900 flex items-center justify-center text-white">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-12 flex-grow">
                            {navLinks.filter(l => l.show !== false).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-7xl font-black text-zinc-900 hover:text-white uppercase tracking-tighter italic transition-all hover:translate-x-6"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {profile?.role === 'driver' && (
                                <Link
                                    to="/driver"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-7xl font-black text-zinc-900 hover:text-primary-500 uppercase tracking-tighter italic transition-all hover:translate-x-6"
                                >
                                    PANEL CONDUCTOR
                                </Link>
                            )}
                        </div>

                        <div className="pt-16 border-t border-zinc-900">
                            {!user ? (
                                <Link
                                    to="/auth"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="premium-button text-center w-full py-10 text-3xl italic"
                                >
                                    INICIAR SESIÓN
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                    className="w-full flex items-center justify-between bg-red-500/5 border-2 border-red-500/20 p-10 rounded-[3rem] text-red-500 font-black text-3xl uppercase tracking-tighter italic group hover:bg-red-500 hover:text-black transition-all"
                                >
                                    CERRAR SESIÓN <LogOut className="w-10 h-10" />
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
