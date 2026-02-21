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
        <div className="min-h-screen text-[var(--text-color)] selection:bg-primary-500 selection:text-black font-sans pb-20">
            {/* Hero Section */}
            <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 -z-10">
                    <video
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover opacity-40 scale-110"
                        style={{ filter: 'grayscale(0.4) brightness(0.8)' }}
                    >
                        <source src="/imagenes/1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent" />
                </div>

                <div className="container mx-auto px-6 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="badge-gold mb-8 inline-block"
                    >
                        LOGÍSTICA DE ÉLITE 2026
                    </motion.div>

                    <div className="overflow-hidden mb-6">
                        <motion.h1
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-7xl sm:text-9xl font-black leading-[0.85] tracking-tighter italic uppercase text-gradient"
                        >
                            MOVEMOS<br />TRABAJAMOS
                        </motion.h1>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-[10px] sm:text-xs text-zinc-400 mb-14 max-w-sm mx-auto leading-loose font-black italic uppercase tracking-[0.4em]"
                    >
                        INTELIGENCIA EN CARGA<br />
                        <span className="text-white/40">MUDANZAS DE ALTO NIVEL</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-6 w-full max-w-xs mx-auto"
                    >
                        <Link to="/booking" className="premium-button group">
                            <span>RESERVAR AHORA</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link to="/auth" className="glass-button">
                            Unirse a la flota
                        </Link>
                    </motion.div>
                </div>

                {/* Performance HUD Indicators */}
                <div className="absolute bottom-12 left-10 hidden lg:flex flex-col gap-4 text-left border-l border-primary-500/30 pl-6">
                    <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">Status</p>
                        <p className="text-[10px] font-bold text-white uppercase italic">Sistema Online</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">Latencia</p>
                        <p className="text-[10px] font-bold text-primary-500 uppercase italic">0.4ms Response</p>
                    </div>
                </div>
            </section>

            {/* Premium Ticker */}
            <div className="relative z-20 py-8 bg-black border-y-2 border-primary-500/20 whitespace-nowrap overflow-hidden">
                <div className="flex gap-20 animate-infinite-scroll">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-20 shrink-0">
                            {['MÁXIMA VELOCIDAD', 'CARGA PREMIUM', 'RASTREO GPS 24/7', 'SEGURO TOTAL'].map(text => (
                                <span key={text} className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-6">
                                    <span className="text-white">{text}</span>
                                    <Star className="w-4 h-4 fill-primary-500 text-primary-500 animate-pulse" />
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fleet Section */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <span className="badge-gold mb-4 inline-block">MERCADO</span>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-gradient">NUESTRA FLOTA</h2>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] italic max-w-xs text-right opacity-60">
                            Vehículos certificados con estándares de alta gama para transporte seguro.
                        </p>
                    </header>

                    {loading ? (
                        <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-none">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="min-w-[320px] h-[500px] rounded-[3rem] bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-none px-4 -mx-4 group/fleet">
                            {categories.map((cat, idx) => (
                                <CategoryCard key={cat.id} category={cat} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Values Section */}
            <section className="py-32 border-t border-[var(--border-color)] overflow-hidden">
                <div className="container mx-auto px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                        <FeatureItem
                            icon={<Shield className="w-10 h-10" />}
                            title="BLINDAJE TOTAL"
                            desc="Carga asegurada al 100% durante todo el trayecto."
                        />
                        <FeatureItem
                            icon={<MapPin className="w-10 h-10" />}
                            title="PRECISIÓN GPS"
                            desc="Rastreo satelital con actualizaciones cada 3 segundos."
                        />
                        <FeatureItem
                            icon={<Clock className="w-10 h-10" />}
                            title="TIEMPO RÁPIDO"
                            desc="Optimización de rutas por IA para entregas veloces."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

const CategoryCard = ({ category, index }) => {
    const imgPath = `/imagenes/categories/${category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'camion' ? 'camion' : category.name.toLowerCase()}.jpg`

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="min-w-[320px] md:min-w-[400px] glass-card group/card hover:-translate-y-4 transition-all duration-700 h-[550px] flex flex-col"
        >
            <div className="h-[280px] relative overflow-hidden">
                <img src={imgPath} alt={category.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-8">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-lg">{category.name}</h3>
                </div>
            </div>

            <div className="p-10 flex flex-col justify-between flex-1">
                <p className="text-zinc-500 font-bold text-[11px] leading-relaxed italic uppercase tracking-tight opacity-80 mb-8">
                    {category.description}
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 italic opacity-50">TARIFA BASE</p>
                        <p className="text-3xl font-black italic text-primary-500 tracking-tighter">$ {category.base_price}</p>
                    </div>
                    <Link to="/booking" className="w-16 h-16 bg-white/5 hover:bg-primary-500 rounded-[1.5rem] flex items-center justify-center text-white hover:text-black transition-all duration-500 active:scale-90 border border-white/10 group/btn">
                        <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

const FeatureItem = ({ icon, title, desc }) => (
    <div className="flex flex-col items-start gap-8 group">
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 group-hover:bg-primary-500 transition-all duration-700 shadow-xl">
            <div className="text-white group-hover:text-black transition-colors duration-700">
                {icon}
            </div>
        </div>
        <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gradient">{title}</h3>
            <p className="text-zinc-500 font-bold italic leading-relaxed text-xs uppercase tracking-widest opacity-80">{desc}</p>
        </div>
    </div>
)

export default Landing
