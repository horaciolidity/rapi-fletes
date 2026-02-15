import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Truck, MapPin, Shield, CreditCard, Clock, ChevronRight, Loader2, Star, ArrowRight } from 'lucide-react'
import { useBookingStore } from '../store/useBookingStore'
import { Link } from 'react-router-dom'

const Landing = () => {
    const { categories, fetchCategories, loading, error } = useBookingStore()

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <div className="min-h-screen text-slate-100 selection:bg-primary-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Disponible en tu zona</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter italic">
                                FLETES <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">
                                    INTELIGENTES
                                </span>
                            </h1>
                            <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed font-medium">
                                Mudanzas, traslados y envíos industriales con seguimiento en tiempo real. La flota más grande de la ciudad a un clic de distancia.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Link to="/booking" className="premium-button w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-10 group">
                                    Solicitar Flete
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </Link>
                                <Link to="/auth" className="w-full sm:w-auto px-10 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                                    Ser Chofer
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center gap-6">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800" />
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="flex text-amber-500 mb-0.5"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                                    <p className="text-slate-500 font-bold tracking-tight">+500 Usuarios Felices</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative hidden lg:block"
                        >
                            <div className="absolute inset-0 bg-primary-500/20 blur-[150px] animate-pulse" />
                            <div className="glass-card p-4 rotate-3 relative z-10 border-white/5 bg-slate-900/40">
                                <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
                                    <Truck className="w-40 h-40 text-primary-500/20" />
                                    <div className="absolute inset-x-0 bottom-0 p-8">
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "75%" }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-full bg-primary-500"
                                            />
                                        </div>
                                        <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            <span>Origen</span>
                                            <span>En camino</span>
                                            <span>Destino</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Animated Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-900/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
            </section>

            {/* Features section with a modern look */}
            <section className="py-32 border-y border-white/5 bg-slate-900/20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter italic">¿Por qué elegir Rapi Fletes?</h2>
                        <div className="w-20 h-1.5 bg-primary-500 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-primary-400" />}
                            title="Seguridad Total"
                            description="Toda tu carga está protegida por nuestra póliza de seguro exclusiva. Viaja con mente tranquila."
                        />
                        <FeatureCard
                            icon={<Clock className="w-6 h-6 text-secondary-400" />}
                            title="Rapidez Extrema"
                            description="Asignación inmediata del chofer más cercano. Reducimos los tiempos de espera hasta en un 60%."
                        />
                        <FeatureCard
                            icon={<CreditCard className="w-6 h-6 text-green-400" />}
                            title="Precios Claros"
                            description="Sin sorpresas. Conoce el costo total antes de confirmar. Paga con el método que prefieras."
                        />
                    </div>
                </div>
            </section>

            {/* Categories Grid - Improving Layout */}
            <section id="categories" className="py-32">
                <div className="container mx-auto px-6">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">Nuestra Flota</h2>
                            <p className="text-slate-500 font-bold leading-none uppercase tracking-[0.3em] text-[10px]">Selecciona el vehículo ideal para tu necesidad</p>
                        </div>
                        <Link to="/booking" className="text-primary-500 font-bold hover:underline">Ver todos los fletes disponbles</Link>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse font-bold">Iniciando sistemas...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center max-w-lg mx-auto">
                            <h3 className="text-red-400 font-bold mb-2">Error al conectar</h3>
                            <p className="text-slate-400 text-sm mb-6">{error}</p>
                            <button onClick={() => fetchCategories()} className="premium-button text-xs py-2 px-6">Reintentar</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {categories.map((cat, index) => (
                                <CategoryCard key={cat.id} category={cat} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="glass-card p-10 group border-white/[0.03] transition-all bg-white/[0.01]"
    >
        <div className="mb-8 p-4 bg-slate-900 rounded-2xl w-fit group-hover:bg-primary-500 transition-all duration-500 shadow-xl group-hover:shadow-primary-500/30">
            {icon}
        </div>
        <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm font-medium">{description}</p>
    </motion.div>
)

const CategoryCard = ({ category, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card group overflow-hidden border-white/[0.03] hover:border-primary-500/30 transition-all cursor-pointer relative"
    >
        <div className="p-6">
            <div className="w-full h-32 bg-slate-900/50 rounded-xl mb-6 overflow-hidden relative flex items-center justify-center">
                <Truck className="w-16 h-16 text-white/5 transition-all group-hover:text-primary-500/20 group-hover:scale-125 duration-700" />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-[8px] font-black uppercase tracking-[0.2em] rounded">Verificado</div>
            </div>
            <h4 className="text-xl font-black uppercase tracking-tighter mb-1">{category.name}</h4>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed italic line-clamp-2 h-8">{category.description}</p>

            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div>
                    <span className="text-[10px] text-slate-600 block uppercase font-black tracking-widest mb-1">Precio Base</span>
                    <span className="text-xl font-black text-white">$ {category.base_price}</span>
                </div>
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-white/5 group-hover:bg-primary-500 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
            </div>
        </div>
    </motion.div>
)

export default Landing
