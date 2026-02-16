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
        <div className="min-h-screen bg-black text-white selection:bg-primary-500 selection:text-black font-sans pb-20">
            {/* Hero Section - App Style */}
            <section className="relative pt-10 pb-16 overflow-hidden flex flex-col items-center">
                <div className="absolute inset-0 -z-10">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-30"
                    >
                        <source src="/imagenes/1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
                </div>

                <div className="container mx-auto px-6 text-center z-10 pt-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border border-white/5 rounded-full mb-8 backdrop-blur-xl"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Operativo 24/7</span>
                    </motion.div>

                    <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-none tracking-tighter italic uppercase">
                        RÁPIDO<br />
                        <span className="text-gradient">EFICIENTE</span>
                    </h1>

                    <p className="text-sm text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed font-bold italic uppercase tracking-tight px-4">
                        Tus fletes al instante. <span className="text-white font-black">Mudanzas y logística</span> con seguimiento real.
                    </p>

                    <div className="flex flex-col gap-4 px-4">
                        <Link to="/booking" className="premium-button w-full group flex items-center justify-center gap-4 py-5">
                            <span className="text-[12px]">SOLICITAR FLETE</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link to="/auth" className="px-10 py-5 bg-zinc-900/50 backdrop-blur-xl text-white rounded-full text-[10px] font-black uppercase tracking-widest italic border border-white/5">
                            Ingresar como Chofer
                        </Link>
                    </div>
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
            <section className="py-20 bg-zinc-950/50 border-t border-white/5 rounded-t-[3rem]">
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
            <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white">{category.name}</h3>
            <p className="text-zinc-500 font-bold text-[10px] leading-relaxed italic uppercase tracking-tight line-clamp-2">
                {category.description}
            </p>
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
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
        <div className="w-16 h-16 min-w-[64px] bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-1">{title}</h3>
            <p className="text-zinc-500 font-bold italic leading-tight text-[11px] uppercase tracking-tight">{desc}</p>
        </div>
    </div>
)

export default Landing
