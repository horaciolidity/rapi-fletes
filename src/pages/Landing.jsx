import React, { useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Truck, MapPin, Shield, CreditCard, Clock, Star, ArrowRight, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { useBookingStore } from '../store/useBookingStore'
import { Link } from 'react-router-dom'

const Landing = () => {
    const { categories, fetchCategories, loading, error } = useBookingStore()

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] selection:bg-primary-500 selection:text-black font-sans pb-20">
            {/* Hero Section - App Style */}
            <section className="relative min-h-[90vh] pb-16 overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 -z-10">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-60 scale-105"
                        style={{ filter: 'grayscale(0.2) contrast(1.1)' }}
                    >
                        <source src="/imagenes/1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/20 to-transparent" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="container mx-auto px-6 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 rounded-full mb-10 shadow-lg shadow-primary-500/20"
                    >
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black italic">Logística de Élite</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl sm:text-8xl font-black mb-8 leading-[0.85] tracking-tighter italic uppercase drop-shadow-2xl"
                    >
                        RÁPIDO<br />
                        <span className="text-primary-500">SEGURO</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-zinc-200 mb-12 max-w-sm mx-auto leading-relaxed font-black italic uppercase tracking-widest drop-shadow-md"
                    >
                        Tu carga en buenas manos. <br />
                        <span className="opacity-80">Mudanzas inteligentes 24/7.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-5 px-4 w-full max-w-sm mx-auto"
                    >
                        <Link to="/booking" className="premium-button w-full group flex items-center justify-center gap-4 py-6 text-lg">
                            <span>PEDIR UN FLETE</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link to="/auth" className="px-10 py-5 bg-white/10 backdrop-blur-3xl text-white rounded-full text-[11px] font-black uppercase tracking-widest italic border border-white/20 hover:bg-white/20 transition-all active:scale-95">
                            Ser parte de la flota
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Scrolling Banner Compact */}
            <div className="py-6 bg-primary-500 overflow-hidden whitespace-nowrap border-y-4 border-black -rotate-1 relative z-20">
                <div className="flex gap-10 animate-infinite-scroll">
                    {[1, 2, 3].map(i => (
                        <span key={i} className="text-2xl font-black italic uppercase tracking-tighter text-black flex items-center gap-6">
                            Carga Segura <Star className="w-6 h-6 fill-black" />
                            Logística 4.0 <Star className="w-6 h-6 fill-black" />
                            Precios Bajos <Star className="w-6 h-6 fill-black" />
                        </span>
                    ))}
                </div>
            </div>

            {/* Fleet Section - Horizontal Scroll on Mobile */}
            <section className="py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col mb-12">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 leading-none">LA FLOTA</h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] italic">Vehículos para cada necesidad</p>
                    </div>

                    {loading ? (
                        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="min-w-[280px] aspect-[4/5] rounded-[2.5rem] bg-zinc-900 animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="glass-card p-10 text-center border-red-500/20">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-black uppercase italic mb-2">Error</h3>
                            <button onClick={fetchCategories} className="text-primary-500 font-black italic uppercase text-xs underline">Reintentar</button>
                        </div>
                    ) : (
                        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-none px-2 -mx-2">
                            {categories.map((cat, idx) => (
                                <CategoryCard key={cat.id} category={cat} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section - Compact */}
            <section className="py-20 bg-[var(--card-bg)] border-t border-[var(--border-color)] rounded-t-[3rem]">
                <div className="container mx-auto px-10">
                    <div className="grid grid-cols-1 gap-12">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-primary-500" />}
                            title="MÁXIMA SEGURIDAD"
                            desc="Verificación rigurosa de conductores."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-8 h-8 text-primary-500" />}
                            title="SEGUIMIENTO EN VIVO"
                            desc="Rastreo GPS en tiempo real."
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-primary-500" />}
                            title="SERVICIO RÁPIDO"
                            desc="Llegamos en menos de 15 minutos."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

const CategoryCard = ({ category, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="min-w-[280px] glass-card p-8 group relative flex flex-col justify-between border-zinc-800 hover:border-primary-500/50"
    >
        <div>
            <div className="w-16 h-16 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)] flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{category.name}</h3>
            <p className="text-zinc-500 font-bold text-[10px] leading-relaxed italic uppercase tracking-tight line-clamp-2">
                {category.description}
            </p>
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
            <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-1">Desde</p>
                <p className="text-xl font-black italic text-primary-500">$ {category.base_price}</p>
            </div>
            <Link to="/booking" className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-black shadow-lg">
                <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
    </motion.div>
)

const FeatureCard = ({ icon, title, desc }) => (
    <div className="flex items-center gap-6">
        <div className="w-16 h-16 min-w-[64px] bg-[var(--bg-color)] rounded-2xl flex items-center justify-center border border-[var(--border-color)]">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter mb-1">{title}</h3>
            <p className="text-zinc-500 font-bold italic leading-tight text-[11px] uppercase tracking-tight">{desc}</p>
        </div>
    </div>
)

export default Landing
