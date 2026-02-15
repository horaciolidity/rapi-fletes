import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, ChevronRight, Search, CreditCard, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
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
        <div className="pt-24 pb-12 min-h-screen bg-slate-950">
            <div className="container mx-auto px-6 h-full">
                <div className="flex flex-col lg:flex-row gap-8 h-full">

                    {/* Left Panel: Booking Flow */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="glass-card p-6 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <Truck className="text-primary-500" />
                                Nueva Reserva
                            </h2>

                            {/* Progress Stepper */}
                            <div className="flex justify-between mb-8 relative">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2" />
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s <= step ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>

                            {/* Step 1: Locations */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Punto de Recogida</label>
                                        <div className="relative group">
                                            <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${pickup ? 'text-primary-500' : 'text-slate-600'}`} />
                                            <input
                                                className="input-field pl-12 bg-slate-900/50"
                                                placeholder="Calle, Ciudad..."
                                                value={pAddress}
                                                onChange={(e) => setPAddress(e.target.value)}
                                                onBlur={handleSetPickup}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Punto de Entrega</label>
                                        <div className="relative group">
                                            <Navigation className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${dropoff ? 'text-secondary-500' : 'text-slate-600'}`} />
                                            <input
                                                className="input-field pl-12 bg-slate-900/50"
                                                placeholder="Donde llevamos tu carga?"
                                                value={dAddress}
                                                onChange={(e) => setDAddress(e.target.value)}
                                                onBlur={handleSetDropoff}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        disabled={!pickup || !dropoff}
                                        onClick={() => setStep(2)}
                                        className="premium-button w-full mt-4 disabled:opacity-30 disabled:grayscale transition-all"
                                    >
                                        Seleccionar Vehículo
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 2: Categories */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategory(cat)}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${selectedCategory?.id === cat.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
                                            >
                                                <div className={`p-3 rounded-xl ${selectedCategory?.id === cat.id ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                    <Truck className="w-6 h-6" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-bold">{cat.name}</p>
                                                    <p className="text-xs text-slate-400">Base: ${cat.base_price}</p>
                                                </div>
                                                <div className="text-right">
                                                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedCategory?.id === cat.id ? 'rotate-90 text-primary-500' : 'text-slate-600'}`} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-800 rounded-xl font-bold flex-1">Atrás</button>
                                        <button
                                            disabled={!selectedCategory}
                                            onClick={() => setStep(3)}
                                            className="premium-button flex-[2] disabled:opacity-30"
                                        >
                                            Resumen
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Confirmation */}
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Categoría</span>
                                            <span className="font-bold text-white">{selectedCategory?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Estimación</span>
                                            <span className="text-xl font-black text-primary-400">${estimate?.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Seguro de carga incluido
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Seguimiento en tiempo real
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(2)} className="px-6 py-3 bg-slate-800 rounded-xl font-bold flex-1">Atrás</button>
                                        <button
                                            onClick={handleConfirmBooking}
                                            disabled={loading}
                                            className="premium-button flex-[2] flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Viaje'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Success! */}
                            {step === 4 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8 space-y-6">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-black">¡Flete Solicitado!</h3>
                                    <p className="text-slate-400">Estamos buscando al chofer más cercano para tu {selectedCategory?.name}. Recibirás una notificación pronto.</p>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="premium-button w-full"
                                    >
                                        Volver al Inicio
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Map */}
                    <div className="flex-grow min-h-[500px] lg:h-auto">
                        <FreightMap />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Booking
