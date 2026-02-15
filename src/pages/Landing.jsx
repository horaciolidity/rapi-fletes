import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Truck, MapPin, Shield, CreditCard, Clock, Star, ArrowRight, Play, CheckCircle } from 'lucide-react'
import { useBookingStore } from '../store/useBookingStore'
import { Link } from 'react-router-dom'

const Landing = () => {
    const { categories, fetchCategories, loading, error } = useBookingStore()

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary-500 selection:text-white">
            {/* Hero Section - Optimized Alignment */}
            <section className="relative pt-40 pb-32 overflow-hidden flex flex-col justify-center items-center">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-[120%] pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-600/10 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-secondary-900/10 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto px-6 text-center max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-md">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Servicio Disponible 24/7</span>
                        </div>

                        <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.85] tracking-tighter italic uppercase">
                            LOGÍSTICA <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-500 to-primary-600">
                                SIN LÍMITES
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
                            Conectamos tus cargas con la red de choferes profesionales más eficiente. Mudanzas, exprés e industrial en minutos.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                            <Link to="/booking" className="premium-button w-full sm:w-auto px-12 py-5 flex items-center justify-center gap-4 group">
                                <span className="text-sm font-black uppercase tracking-widest italic">Pedir Flete Ahora</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <button className="w-full sm:w-auto px-12 py-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                                <Play className="w-5 h-5 text-primary-500 fill-current" />
                                <span className="text-sm font-black uppercase tracking-widest text-slate-300 italic">Ver cómo funciona</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats/Social Proof - Centered Row */}
            <section className="py-12 border-y border-white/5 bg-slate-900/40 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
                        <StatItem label="Choferes" value="+2,500" />
                        <StatItem label="Ciudades" value="45" />
                        <StatItem label="Entregas" value="150k" />
                        <StatItem label="Calificación" value="4.9/5" />
                    </div>
                </div>
            </section>

            {/* Categories Grid - Better Spacing and Alignment */}
            <section className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">NUESTRA FLOTA</h2>
                        <div className="w-24 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mb-8" />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
                            Soluciones escalables para cada tipo de necesidad
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Conectando con la flota...</p>
                        </div>
                    ) : error ? (
                        <div className="glass-card p-12 text-center max-w-md mx-auto border-red-500/20">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
                            <h3 className="text-xl font-bold mb-4 text-white">Error del Sistema</h3>
                            <p className="text-slate-500 mb-8">{error}</p>
                            <button onClick={fetchCategories} className="premium-button px-10 py-3 text-xs">Reintentar</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {categories.map((cat, idx) => (
                                <CategoryCard key={cat.id} category={cat} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features - Grid Alignment */}
            <section className="py-32 bg-slate-900/20 relative border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-primary-400" />}
                            title="SEGURO PREMIUM"
                            description="Toda carga viaja 100% asegurada por nuestra alianza con las mejores aseguradoras."
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-secondary-500" />}
                            title="REAL TIME TRACKING"
                            description="Visualiza el recorrido exacto de tu flete a través de nuestra plataforma optimizada."
                        />
                        <FeatureCard
                            icon={<CreditCard className="w-8 h-8 text-indigo-400" />}
                            title="MULTI-PAGO"
                            description="Aceptamos todas las tarjetas, transferencias y pagos en efectivo al finalizar."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

const StatItem = ({ label, value }) => (
    <div className="flex flex-col items-center text-center">
        <span className="text-3xl font-black text-white italic tracking-tighter mb-1">{value}</span>
        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 leading-none">{label}</span>
    </div>
)

const CategoryCard = ({ category, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card group hover:border-primary-500/40 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full bg-slate-900/60"
    >
        <div className="p-8 flex flex-col h-full">
            <div className="w-full aspect-video bg-slate-950 rounded-2xl mb-8 flex items-center justify-center group-hover:bg-primary-500/5 transition-colors duration-500 border border-white/5 overflow-hidden relative">
                <Truck className="w-16 h-16 text-slate-800 group-hover:text-primary-500/20 group-hover:scale-125 transition-all duration-700" />
                <div className="absolute top-4 left-4 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[8px] font-black uppercase px-2 py-0.5 rounded italic">Económico</div>
            </div>

            <h3 className="text-2xl font-black text-white italic mb-2 tracking-tighter uppercase">{category.name}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-grow line-clamp-2 italic">{category.description}</p>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Precio Inicial</p>
                    <p className="text-xl font-black text-white tracking-widest italic">$ {category.base_price}</p>
                </div>
                <div className="w-10 h-10 bg-slate-950 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary-500 transition-colors duration-300">
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white" />
                </div>
            </div>
        </div>
    </motion.div>
)

const FeatureCard = ({ icon, title, description }) => (
    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 group">
        <div className="p-5 bg-slate-950 rounded-[1.5rem] border border-white/5 shadow-2xl group-hover:border-primary-500/30 group-hover:-translate-y-2 transition-all duration-500">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-black text-white italic mb-3 tracking-tighter uppercase">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">{description}</p>
        </div>
    </div>
)

export default Landing
