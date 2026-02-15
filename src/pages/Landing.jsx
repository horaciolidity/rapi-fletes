import React, { useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Truck, MapPin, Shield, CreditCard, Clock, Star, ArrowRight, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { useBookingStore } from '../store/useBookingStore'
import { Link } from 'react-router-dom'

const Landing = () => {
    const { categories, fetchCategories, loading, error } = useBookingStore()
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary-500 selection:text-black font-sans">


            {/* Hero Section */}
            <section className="relative min-h-screen pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden flex flex-col justify-center items-center">
                {/* Visual Elements - Background Video */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-40 md:opacity-50 scale-105"
                    >
                        <source src="/imagenes/1.mp4" type="video/mp4" />
                    </video>
                    {/* Simplified Overlays for better visibility and performance */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <motion.div style={{ y: y1 }} className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute top-[10%] left-[5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary-500/10 blur-[100px] rounded-full animate-float" />
                    <div className="absolute bottom-[10%] right-[5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-secondary-600/10 blur-[120px] rounded-full" />
                </motion.div>

                <div className="container mx-auto px-6 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 bg-zinc-950/80 border border-white/5 rounded-full mb-8 md:mb-12 backdrop-blur-3xl"
                        >
                            <span className="flex h-2 w-2 md:h-3 md:w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-primary-500"></span>
                            </span>
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 italic">Disponibilidad 24/7</span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black mb-8 md:mb-12 leading-[0.9] md:leading-[0.8] tracking-tighter italic uppercase flex flex-col items-center">
                            <span className="flex items-baseline gap-3 md:gap-4">
                                RÁPIDO <ArrowRight className="w-8 h-8 sm:w-16 sm:h-16 md:w-24 md:h-24 text-primary-500 -rotate-45" />
                            </span>
                            <span className="text-gradient">EFICIENTE</span>
                        </h1>

                        <p className="text-sm md:text-xl lg:text-2xl text-zinc-500 mb-10 md:mb-16 max-w-2xl mx-auto leading-relaxed font-bold italic uppercase tracking-tight px-4">
                            Fletes urbanos al instante. <span className="text-white font-black">Mudanzas y logística exprés</span> con seguimiento en tiempo real.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
                            <Link to="/booking" className="premium-button w-full sm:min-w-[250px] md:min-w-[300px] group flex items-center justify-center gap-4 md:gap-6 py-4 md:py-5">
                                <span className="text-[10px] md:text-xs">SOLICITAR UNIDAD</span>
                                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-2 md:group-hover:translate-x-3 transition-transform duration-500" />
                            </Link>
                            <Link to="/auth" className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-zinc-900/50 backdrop-blur-xl text-white rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic border border-white/5 hover:bg-zinc-800 transition-all">
                                Ingresar como Chofer
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Scrolling Banner */}
            <div className="py-20 bg-primary-500 overflow-hidden whitespace-nowrap border-y-8 border-black -rotate-1 relative z-20 shadow-[0_0_100px_rgba(245,158,11,0.2)]">
                <div className="flex gap-20 animate-infinite-scroll">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <span key={i} className="text-6xl font-black italic uppercase tracking-tighter text-black flex items-center gap-10">
                            Carga Segura <Star className="w-10 h-10 fill-black" />
                            Logística 4.0 <Star className="w-10 h-10 fill-black" />
                            Precios Bajos <Star className="w-10 h-10 fill-black" />
                        </span>
                    ))}
                </div>
            </div>

            {/* Fleet Section */}
            <section className="py-40 relative">
                <div className="container mx-auto px-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10">
                        <div className="max-w-2xl">
                            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 leading-none">LA FLOTA<br /><span className="text-zinc-800">MÁS MODERNA</span></h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-sm italic">Vehículos adaptados a cada necesidad de transporte</p>
                        </div>
                        <div className="w-32 h-32 border-8 border-primary-500 rounded-full flex items-center justify-center animate-spin-slow">
                            <Truck className="w-12 h-12 text-primary-500" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[3/4] rounded-[3rem] bg-zinc-900 animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="glass-card p-20 text-center max-w-2xl mx-auto border-red-500/20">
                            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-10" />
                            <h3 className="text-3xl font-black uppercase italic mb-6">Error de Sistema</h3>
                            <p className="text-zinc-500 font-bold italic mb-10">{error}</p>
                            <button onClick={fetchCategories} className="premium-button">Reintentar</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {categories.map((cat, idx) => (
                                <CategoryCard key={cat.id} category={cat} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-40 bg-zinc-950 border-t border-white/5">
                <div className="container mx-auto px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                        <FeatureCard
                            icon={<Shield className="w-10 h-10 text-primary-500" />}
                            title="Máxima Seguridad"
                            desc="Verificación rigurosa de conductores y vehículos. Tu carga en manos confiables."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-10 h-10 text-primary-500" />}
                            title="Seguimiento en Vivo"
                            desc="Rastreo GPS en tiempo real. Sabé dónde está tu carga en todo momento."
                        />
                        <FeatureCard
                            icon={<Clock className="w-10 h-10 text-primary-500" />}
                            title="Servicio Rápido"
                            desc="Llegamos en menos de 15 minutos en la mayoría de las zonas. Rapidez garantizada."
                        />
                    </div>
                </div>
            </section>


        </div>
    )
}

const CategoryCard = ({ category, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
        whileHover={{ y: -20 }}
        className="glass-card p-10 group relative h-full overflow-hidden border-zinc-800 hover:border-primary-500/50 transition-all duration-700"
    >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 blur-[60px] rounded-full group-hover:bg-primary-500/10 transition-colors" />

        <div className="relative z-10">
            <div className="w-20 h-20 bg-zinc-950 rounded-[2rem] border border-white/5 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-primary-500 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-500">
                <Truck className="w-10 h-10 text-primary-500 group-hover:text-black transition-colors" />
            </div>

            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">{category.name}</h3>
            <p className="text-zinc-500 font-bold text-sm leading-relaxed mb-10 italic uppercase tracking-tight line-clamp-3">
                {category.description}
            </p>

            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-1">Precio Base</p>
                    <p className="text-2xl font-black italic text-primary-500">$ {category.base_price}</p>
                </div>
                <div className="w-12 h-12 bg-zinc-900 rounded-full border border-white/5 flex items-center justify-center group-hover:translate-x-2 transition-all">
                    <ArrowRight className="w-6 h-6 text-zinc-600" />
                </div>
            </div>
        </div>
    </motion.div>
)

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex flex-col gap-8 group"
    >
        <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-2xl group-hover:-rotate-12 transition-all duration-500">
            {icon}
        </div>
        <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">{title}</h3>
            <p className="text-zinc-500 font-bold italic leading-relaxed text-sm uppercase tracking-tight">{desc}</p>
        </div>
    </motion.div>
)

export default Landing
