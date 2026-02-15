import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, ChevronRight, Search, CreditCard, Clock, CheckCircle2, AlertTriangle, ChevronLeft, Loader2, Target, ArrowRight } from 'lucide-react'
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
    const [isLocating, setIsLocating] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [activeSearch, setActiveSearch] = useState(null) // 'pickup' or 'dropoff'

    useEffect(() => {
        fetchCategories()
        return () => resetBooking()
    }, [])

    const handleGeolocation = () => {
        if (!navigator.geolocation) return
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await res.json()
                    const address = data.display_name || `${latitude}, ${longitude}`
                    setPAddress(address)
                    setPickup({ address, lat: latitude, lng: longitude })
                } catch (err) {
                    console.error("Geocoding error", err)
                    setPickup({ address: "Ubicación Actual", lat: latitude, lng: longitude })
                }
                setIsLocating(false)
            },
            () => setIsLocating(false),
            { enableHighAccuracy: true }
        )
    }

    const searchAddress = async (query, type) => {
        if (query.length < 4) {
            setSearchResults([])
            return
        }
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
            const data = await res.json()
            setSearchResults(data)
            setActiveSearch(type)
        } catch (err) {
            console.error("Search error", err)
        }
    }

    const selectResult = (result) => {
        const item = {
            address: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
        }
        if (activeSearch === 'pickup') {
            setPAddress(result.display_name)
            setPickup(item)
        } else {
            setDAddress(result.display_name)
            setDropoff(item)
        }
        setSearchResults([])
        setActiveSearch(null)
    }

    const handleConfirmBooking = async () => {
        if (!user) {
            navigate('/auth')
            return
        }
        const result = await createFlete(user.id)
        if (result) setStep(4)
    }

    return (
        <div className="pt-32 pb-12 min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-7xl h-full">
                <div className="flex flex-col lg:flex-row gap-12 items-stretch min-h-[700px]">

                    {/* Left Panel: Booking Flow */}
                    <div className="w-full lg:w-[480px] flex flex-col">
                        <div className="glass-card flex-grow p-10 flex flex-col relative overflow-hidden bg-slate-900/60 border-white/5 shadow-2xl">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-600 to-secondary-600" />

                            <header className="mb-12">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2.5 bg-primary-600 rounded-2xl shadow-lg shadow-primary-600/20">
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
                                            className={`h-2 flex-grow rounded-full transition-all duration-700 ${s <= step ? 'bg-primary-500 w-full' : 'bg-slate-800 w-1/3 opacity-20'}`}
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
                                            className="space-y-10"
                                        >
                                            <div className="space-y-8">
                                                <div className="relative">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex justify-between items-center">
                                                        Punto de Recogida
                                                        <button
                                                            onClick={handleGeolocation}
                                                            className="flex items-center gap-1.5 text-primary-500 hover:text-white transition-colors"
                                                        >
                                                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                                                            Ubicación Actual
                                                        </button>
                                                    </label>
                                                    <div className="relative group">
                                                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${pickup ? 'text-primary-500' : 'text-slate-700'}`} />
                                                        <input
                                                            className="input-field pl-12 bg-slate-950/40 border-white/5 py-4 placeholder:italic"
                                                            placeholder="Indica la calle y altura..."
                                                            value={pAddress}
                                                            onChange={(e) => {
                                                                setPAddress(e.target.value)
                                                                searchAddress(e.target.value, 'pickup')
                                                            }}
                                                        />
                                                    </div>
                                                    {activeSearch === 'pickup' && searchResults.length > 0 && (
                                                        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl">
                                                            {searchResults.map((r, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => selectResult(r)}
                                                                    className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 text-xs text-slate-400 font-medium last:border-0"
                                                                >
                                                                    {r.display_name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Dirección de Entrega</label>
                                                    <div className="relative group">
                                                        <Navigation className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${dropoff ? 'text-secondary-500' : 'text-slate-700'}`} />
                                                        <input
                                                            className="input-field pl-12 bg-slate-950/40 border-white/5 py-4 placeholder:italic"
                                                            placeholder="¿A dónde llevamos la carga?"
                                                            value={dAddress}
                                                            onChange={(e) => {
                                                                setDAddress(e.target.value)
                                                                searchAddress(e.target.value, 'dropoff')
                                                            }}
                                                        />
                                                    </div>
                                                    {activeSearch === 'dropoff' && searchResults.length > 0 && (
                                                        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl">
                                                            {searchResults.map((r, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => selectResult(r)}
                                                                    className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 text-xs text-slate-400 font-medium last:border-0"
                                                                >
                                                                    {r.display_name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                disabled={!pickup || !dropoff}
                                                onClick={() => setStep(2)}
                                                className="premium-button w-full py-5 text-sm uppercase tracking-widest font-black italic mt-10 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all shadow-xl"
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
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setCategory(cat)}
                                                        className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center gap-6 ${selectedCategory?.id === cat.id ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20' : 'border-white/5 bg-slate-950/40 hover:border-white/10'}`}
                                                    >
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${selectedCategory?.id === cat.id ? 'bg-primary-500 text-white shadow-lg' : 'bg-slate-900 text-slate-600'}`}>
                                                            <Truck className="w-7 h-7" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-black italic uppercase text-lg leading-none mb-1">{cat.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-60">{cat.description}</p>
                                                            <p className="text-sm font-black text-primary-400 italic">$ {cat.base_price} <span className="text-[9px] text-slate-600 font-bold uppercase not-italic">Base</span></p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setStep(1)} className="p-5 bg-slate-950 rounded-[1.5rem] border border-white/5 text-slate-400 group hover:text-white transition-colors">
                                                    <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                                                </button>
                                                <button
                                                    disabled={!selectedCategory}
                                                    onClick={() => setStep(3)}
                                                    className="premium-button flex-grow uppercase tracking-widest font-black text-xs italic disabled:opacity-30 shadow-xl"
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
                                            <div className="bg-slate-950 rounded-[2.5rem] p-10 border border-white/5 space-y-8 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                                    <CreditCard className="w-40 h-40" />
                                                </div>

                                                <div className="space-y-4 relative z-10">
                                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vehículo</span>
                                                        <span className="font-black italic text-white uppercase text-base">{selectedCategory?.name}</span>
                                                    </div>

                                                    <div className="space-y-4 px-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-5 h-5 bg-primary-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                                                                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                                            </div>
                                                            <p className="text-xs text-slate-400 font-medium italic underline decoration-white/10 underline-offset-4">{pickup?.address}</p>
                                                        </div>
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-5 h-5 bg-secondary-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                                                                <div className="w-2 h-2 bg-secondary-500 rounded-full" />
                                                            </div>
                                                            <p className="text-xs text-slate-400 font-medium italic underline decoration-white/10 underline-offset-4">{dropoff?.address}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Total Estimado</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-4xl font-black italic text-primary-400 tracking-tighter">$ {estimate?.toFixed(2)}</span>
                                                            <div className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[8px] font-black rounded uppercase italic">Garantizado</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-bold flex gap-3">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                                    <p>{error}</p>
                                                </div>
                                            )}

                                            <div className="flex gap-4">
                                                <button onClick={() => setStep(2)} className="p-5 bg-slate-950 rounded-[1.5rem] border border-white/5 text-slate-400 group hover:text-white transition-colors">
                                                    <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                                                </button>
                                                <button
                                                    onClick={handleConfirmBooking}
                                                    disabled={loading}
                                                    className="premium-button flex-grow flex items-center justify-center gap-4 italic uppercase font-black text-xs tracking-widest shadow-2xl"
                                                >
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                        <>
                                                            CONFIRMAR SERVICIO <ArrowRight className="w-5 h-5" />
                                                        </>
                                                    )}
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
                                            <div className="relative mx-auto w-32 h-32">
                                                <div className="absolute inset-0 bg-green-500/20 blur-[40px] rounded-full animate-pulse" />
                                                <div className="relative w-full h-full bg-slate-900 border border-green-500/30 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none">¡MISIÓN <br /><span className="text-primary-500">ACEPTADA!</span></h3>
                                                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto italic">Sistema buscando la unidad de <span className="text-white font-black">{selectedCategory?.name}</span> más eficiente. Recibirás un alerta en breve.</p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/my-fletes')}
                                                className="premium-button w-full py-5 italic font-black tracking-widest uppercase text-xs shadow-xl"
                                            >
                                                SEGUIR MI PEDIDO
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Map */}
                    <div className="flex-grow flex flex-col min-h-[500px] lg:h-auto rounded-[3rem] overflow-hidden border border-white/5 relative shadow-2xl">
                        <FreightMap />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Booking
