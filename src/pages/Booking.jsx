import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, ChevronRight, Search, CreditCard, Clock, CheckCircle2, AlertTriangle, ChevronLeft, Loader2 } from 'lucide-react'
import FreightMap from '../components/map/FreightMap'
import { useBookingStore } from '../store/useBookingStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const Booking = () => {
    const {
        categories, fetchCategories, pickup, setPickup, dropoff, setDropoff,
        selectedCategory, setCategory, estimate, createFlete, loading, error, resetBooking
    } = useBookingStore()
    const { user } = useAuthStore()
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1: Locations, 2: Category, 3: Confirm
    const [pAddress, setPAddress] = useState('')
    const [dAddress, setDAddress] = useState('')

    useEffect(() => {
        fetchCategories()
        return () => resetBooking()
    }, [])

    const handleSetPickup = () => {
        if (pAddress.length < 5) return
        setPickup({ address: pAddress, lat: -34.6037, lng: -58.3816 }) // Mock coords
    }

    const handleSetDropoff = () => {
        if (dAddress.length < 5) return
        setDropoff({ address: dAddress, lat: -34.6137, lng: -58.4016 }) // Mock coords
    }

    const handleConfirmBooking = async () => {
        if (!user) {
            navigate('/auth')
            return
        }
        const result = await createFlete(user.id)
        if (result) setStep(4) // Success step
    }

    return (
        <div className="pt-32 pb-12 min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-7xl h-full">
                <div className="flex flex-col lg:flex-row gap-12 items-stretch min-h-[700px]">

                    {/* Left Panel: Booking Flow - Sized and Aligned */}
                    <div className="w-full lg:w-[450px] flex flex-col">
                        <div className="glass-card flex-grow p-10 flex flex-col relative overflow-hidden bg-slate-900/40 border-white/5">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-600 to-secondary-600" />

                            <header className="mb-12">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2.5 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/20">
                                        <Truck className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">RESERVA</h2>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Configura tu traslado hoy</p>
                            </header>

                            {/* Stepper Indicator */}
                            {step < 4 && (
                                <div className="flex items-center gap-3 mb-12">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${s <= step ? 'bg-primary-500 w-full' : 'bg-slate-800 w-1/3'}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex-grow">
                                <AnimatePresence mode='wait'>
                                    {/* Step 1: Locations */}
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-8"
                                        >
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Punto de Recogida</label>
                                                    <div className="relative group">
                                                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${pickup ? 'text-primary-500' : 'text-slate-700'}`} />
                                                        <input
                                                            className="input-field pl-12 bg-slate-950/40 border-white/5 py-4"
                                                            placeholder="Indica la calle y altura..."
                                                            value={pAddress}
                                                            onChange={(e) => setPAddress(e.target.value)}
                                                            onBlur={handleSetPickup}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Dirección de Entrega</label>
                                                    <div className="relative group">
                                                        <Navigation className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${dropoff ? 'text-secondary-500' : 'text-slate-700'}`} />
                                                        <input
                                                            className="input-field pl-12 bg-slate-950/40 border-white/5 py-4"
                                                            placeholder="¿A dónde llevamos la carga?"
                                                            value={dAddress}
                                                            onChange={(e) => setDAddress(e.target.value)}
                                                            onBlur={handleSetDropoff}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                disabled={!pickup || !dropoff}
                                                onClick={() => setStep(2)}
                                                className="premium-button w-full py-5 text-sm uppercase tracking-widest font-black italic mt-10 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all"
                                            >
                                                Siguiente Paso <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Categories */}
                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-3">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setCategory(cat)}
                                                        className={`w-full p-4 rounded-3xl border-2 transition-all text-left flex items-center gap-5 ${selectedCategory?.id === cat.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/5 bg-slate-950/40 hover:border-white/10'}`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedCategory?.id === cat.id ? 'bg-primary-500 text-white' : 'bg-slate-900 text-slate-600'}`}>
                                                            <Truck className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-black italic uppercase text-sm">{cat.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base: ${cat.base_price}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setStep(1)} className="p-5 bg-slate-950 rounded-2xl border border-white/5 text-slate-400 group">
                                                    <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                                                </button>
                                                <button
                                                    disabled={!selectedCategory}
                                                    onClick={() => setStep(3)}
                                                    className="premium-button flex-grow uppercase tracking-widest font-black text-xs italic disabled:opacity-30"
                                                >
                                                    Ver Resumen
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Confirmation */}
                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-10"
                                        >
                                            <div className="bg-slate-950 rounded-[2rem] p-8 border border-white/5 space-y-6">
                                                <div className="flex justify-between items-center group">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Categoría</span>
                                                    <span className="font-black italic text-white uppercase text-sm underline decoration-primary-500 decoration-2 underline-offset-4">{selectedCategory?.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estimación Final</span>
                                                    <span className="text-3xl font-black italic text-primary-400 tracking-tighter">${estimate?.toFixed(2)}</span>
                                                </div>

                                                <div className="pt-6 border-t border-white/5 space-y-3">
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Seguro total incluido
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Chofer profesional verificado
                                                    </div>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-bold flex gap-3">
                                                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                                                </div>
                                            )}

                                            <div className="flex gap-4">
                                                <button onClick={() => setStep(2)} className="p-5 bg-slate-950 rounded-2xl border border-white/5 text-slate-400 group">
                                                    <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                                                </button>
                                                <button
                                                    onClick={handleConfirmBooking}
                                                    disabled={loading}
                                                    className="premium-button flex-grow flex items-center justify-center gap-3 italic uppercase font-black text-xs tracking-widest"
                                                >
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRMAR AHORA'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 4: Success */}
                                    {step === 4 && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center py-10 space-y-10"
                                        >
                                            <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/10">
                                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4">¡LOGRADO!</h3>
                                                <p className="text-slate-400 text-sm font-medium leading-relaxed">Estamos buscando el {selectedCategory?.name} más cercano. Te avisaremos pronto.</p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/')}
                                                className="premium-button w-full py-5 italic font-black tracking-widest uppercase text-xs"
                                            >
                                                VOLVER AL INICIO
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Map - Balanced Alignment */}
                    <div className="flex-grow flex flex-col min-h-[500px] lg:h-auto">
                        <FreightMap />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Booking
