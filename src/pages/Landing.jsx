import React from 'react'
import { motion } from 'framer-motion'
import { Truck, MapPin, Shield, CreditCard, Clock, ChevronRight } from 'lucide-react'

const Landing = () => {
    return (
        <div className="min-h-screen text-slate-100 selection:bg-primary-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                            Mueve lo que quieras, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">
                                cuando quieras.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                            La plataforma de fletes más confiable y moderna. Conecta con choferes calificados en minutos para mudar tu hogar, oficina o enviar mercadería.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button className="premium-button flex items-center gap-2 group">
                                Pedir Flete Ahora
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl font-semibold transition-colors">
                                Ser Chofer
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Background blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-600 rounded-full blur-[120px] animate-pulse delay-700" />
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Truck className="w-8 h-8 text-primary-400" />}
                            title="Categorías Flexibles"
                            description="Desde utilitarios pequeños hasta camiones grandes. Elige el tamaño perfecto para tu carga."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-8 h-8 text-secondary-400" />}
                            title="Seguimiento Real"
                            description="Sigue tu flete en tiempo real desde que el chofer lo recoge hasta su destino final."
                        />
                        <FeatureCard
                            icon={<CreditCard className="w-8 h-8 text-accent-400" />}
                            title="Pago Seguro"
                            description="Múltiples métodos de pago integrados. Paga con tarjeta, transferencia o efectivo."
                        />
                    </div>
                </div>
            </section>

            {/* Categories Showcase */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16 underline decoration-primary-500/30 underline-offset-8">
                        Categorías disponibles
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CategoryCard name="Eco Flete" type="Utilitario" price="$$" time="15 min" />
                        <CategoryCard name="Flete Hogar" type="Mudanza Mediana" price="$$$" time="20 min" />
                        <CategoryCard name="Flete Industrial" type="Camión Pesado" price="$$$$" time="45 min" />
                        <CategoryCard name="Flete Express" type="Moto/Auto" price="$" time="10 min" />
                    </div>
                </div>
            </section>
        </div>
    )
}

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card p-8 group"
    >
        <div className="mb-6 p-3 bg-slate-800/50 rounded-xl w-fit group-hover:bg-primary-500/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
)

const CategoryCard = ({ name, type, price, time }) => (
    <div className="glass-card p-6 border-transparent hover:border-primary-500/50 transition-all cursor-pointer">
        <div className="w-full h-40 bg-slate-800 rounded-lg mb-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent" />
            {/* Image placeholder would go here */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Truck className="w-16 h-16 text-slate-600 opacity-50" />
            </div>
        </div>
        <h4 className="text-xl font-bold mb-1">{name}</h4>
        <p className="text-sm text-slate-500 mb-4">{type}</p>
        <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-primary-400">{price}</span>
            <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {time}
            </span>
        </div>
    </div>
)

export default Landing
