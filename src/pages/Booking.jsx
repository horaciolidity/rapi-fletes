import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, ChevronRight, Search, CreditCard, Clock, CheckCircle2, AlertTriangle, ChevronLeft, Loader2, Target, ArrowRight, Star } from 'lucide-react'
import FreightMap from '../components/map/FreightMap'
import { useBookingStore } from '../store/useBookingStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const Booking = () => {
    const {
        categories, fetchCategories, pickup, setPickup, dropoff, setDropoff,
        selectedCategory, setCategory, estimate, createFlete, loading, error, resetBooking
    } = useBookingStore()
    const { user, profile } = useAuthStore()
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1: Locations, 2: Category, 3: Confirm
    const [pAddress, setPAddress] = useState('')
    const [dAddress, setDAddress] = useState('')
    const [isLocating, setIsLocating] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [activeSearch, setActiveSearch] = useState(null) // 'pickup' or 'dropoff'

    useEffect(() => {
        if (profile?.role === 'driver') {
            navigate('/driver')
            return
        }
    }, [profile])

    useEffect(() => {
        fetchCategories()
        // Auto-detect location on first load if no pickup is set
        if (!pickup && !pAddress) {
            handleGeolocation()
        }
        return () => resetBooking()
    }, [])


    const handleGeolocation = () => {
        if (!navigator.geolocation) return
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                try {
                    // Use Photon for reverse geocoding
                    const res = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`)
                    if (!res.ok) throw new Error("Reverse geocoding failed")
                    const data = await res.json()

                    if (data && data.features && data.features.length > 0) {
                        const feature = data.features[0]
                        const props = feature.properties
                        const address = [props.name, props.street, props.city, props.state]
                            .filter((val, index, self) => val && self.indexOf(val) === index) // Unique values
                            .join(', ')
                        setPAddress(address)
                        setPickup({ address, lat: latitude, lng: longitude })
                    } else {
                        const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        setPAddress(address)
                        setPickup({ address, lat: latitude, lng: longitude })
                    }
                } catch (err) {
                    console.error("Geocoding error", err)
                    const fallbackAddress = "Mi Ubicación Actual"
                    setPAddress(fallbackAddress)
                    setPickup({ address: fallbackAddress, lat: latitude, lng: longitude })
                } finally {
                    setIsLocating(false)
                }
            },
            (error) => {
                console.error("Geolocation error", error)
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 5000 }
        )
    }

    const searchAddress = async (query, type) => {
        if (!query || query.length < 3) {
            setSearchResults([])
            return
        }
        try {
            // Bias results based on the other point if available
            let url = `https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=6`

            // Apply location bias for more relevant local results (Origin -> Destination biasing)
            if (type === 'dropoff' && pickup) {
                url += `&lat=${pickup.lat}&lon=${pickup.lng}`
            } else if (type === 'pickup' && dropoff) {
                url += `&lat=${dropoff.lat}&lon=${dropoff.lng}`
            }

            const res = await fetch(url)
            if (!res.ok) {
                console.warn("Photon search rejected", res.status)
                return
            }

            const data = await res.json()
            if (!data || !data.features) {
                setSearchResults([])
                return
            }

            // Map Photon features to a cleaner display structure
            const results = data.features.map(f => {
                const p = f.properties
                const components = [
                    p.name !== p.street ? p.name : null,
                    p.street,
                    p.housenumber,
                    p.city,
                    p.state
                ].filter(Boolean)

                return {
                    display_name: components.join(', '),
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0]
                }
            })

            setSearchResults(results)
            setActiveSearch(type)
        } catch (err) {
            console.error("Search API error", err)
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
        <div className="pt-24 md:pt-32 pb-12 min-h-screen bg-black flex items-center justify-center font-sans overflow-x-hidden">
            <div className="container mx-auto px-4 md:px-10 max-w-[1600px] h-full relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch min-h-[600px] lg:min-h-[850px]">

                    {/* Left Panel: Booking Flow */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-[480px] flex flex-col"
                    >
                        <div className="glass-card flex-grow p-6 md:p-12 flex flex-col relative overflow-hidden bg-zinc-950/60 border-zinc-900 shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                            <div className="absolute top-0 right-0 w-2 md:w-3 h-full bg-gradient-to-b from-primary-500 to-secondary-600" />

                            <header className="mb-8 md:mb-14">
                                <div className="flex items-center gap-4 md:gap-6 mb-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-500 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                        <Truck className="w-6 h-6 md:w-8 md:h-8 text-black" />
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-white leading-none">SOLICITUD<br /><span className="text-primary-500">DE SERVICIO</span></h2>
                                </div>
                                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-700 italic">Configurando detalles del transporte</p>
                            </header>

                            {/* Stepper */}
                            {step < 4 && (
                                <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-14">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`h-2 md:h-3 flex-grow rounded-full transition-all duration-1000 ${s <= step ? 'bg-gradient-to-r from-primary-500 to-secondary-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-zinc-900'}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex-grow flex flex-col">
                                <AnimatePresence mode='wait'>
                                    {/* Step 1: Locations */}
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            className="space-y-12"
                                        >
                                            <div className="space-y-10">
                                                <div className="relative">
                                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 flex justify-between items-center italic">
                                                        <span>01. ORIGEN</span>
                                                        <button
                                                            onClick={handleGeolocation}
                                                            className="flex items-center gap-2 text-primary-500 hover:text-white transition-all uppercase tracking-widest"
                                                        >
                                                            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                                                            DETECTAR MI POSICIÓN
                                                        </button>
                                                    </label>
                                                    <div className="relative group">
                                                        <MapPin className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-all duration-500 ${pickup ? 'text-primary-500 scale-110' : 'text-zinc-800'}`} />
                                                        <input
                                                            className="input-field pl-16"
                                                            placeholder="Indica la calle y altura exacta..."
                                                            value={pAddress}
                                                            onChange={(e) => {
                                                                setPAddress(e.target.value)
                                                                searchAddress(e.target.value, 'pickup')
                                                            }}
                                                        />
                                                    </div>
                                                    {activeSearch === 'pickup' && searchResults.length > 0 && (
                                                        <div className="absolute z-[100] left-0 right-0 top-full mt-4 bg-zinc-950 border border-white/5 rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl">
                                                            {searchResults.map((r, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => selectResult(r)}
                                                                    className="w-full text-left p-6 hover:bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-zinc-500 hover:text-primary-500 transition-colors tracking-tight"
                                                                >
                                                                    {r.display_name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 block italic">02. DESTINO FINAL</label>
                                                    <div className="relative group">
                                                        <Navigation className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-all duration-500 ${dropoff ? 'text-secondary-500 scale-110' : 'text-zinc-800'}`} />
                                                        <input
                                                            className="input-field pl-16"
                                                            placeholder="¿A dónde nos dirigimos hoy?"
                                                            value={dAddress}
                                                            onChange={(e) => {
                                                                setDAddress(e.target.value)
                                                                searchAddress(e.target.value, 'dropoff')
                                                            }}
                                                        />
                                                    </div>
                                                    {activeSearch === 'dropoff' && searchResults.length > 0 && (
                                                        <div className="absolute z-[100] left-0 right-0 top-full mt-4 bg-zinc-950 border border-white/5 rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl">
                                                            {searchResults.map((r, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => selectResult(r)}
                                                                    className="w-full text-left p-6 hover:bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-zinc-500 hover:text-primary-500 transition-colors tracking-tight"
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
                                                className="premium-button w-full flex items-center justify-center gap-6 mt-10"
                                            >
                                                <span>ELEGIR VEHÍCULO</span>
                                                <ChevronRight className="w-7 h-7" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Categories */}
                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8 h-full flex flex-col"
                                        >
                                            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-none flex-grow">
                                                {categories.map((cat, idx) => (
                                                    <motion.button
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        key={cat.id}
                                                        onClick={() => setCategory(cat)}
                                                        className={`w-full p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left flex items-center gap-8 relative overflow-hidden group ${selectedCategory?.id === cat.id ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'border-white/5 bg-zinc-900/40 hover:border-white/20'}`}
                                                    >
                                                        {selectedCategory?.id === cat.id && (
                                                            <div className="absolute top-0 right-0 p-4">
                                                                <Star className="w-5 h-5 text-primary-500 fill-primary-500 shadow-xl" />
                                                            </div>
                                                        )}

                                                        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-all duration-500 ${selectedCategory?.id === cat.id ? 'bg-primary-500 text-black shadow-2xl scale-110' : 'bg-black text-zinc-700 group-hover:bg-zinc-800'}`}>
                                                            <Truck className="w-10 h-10" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-black italic uppercase text-2xl leading-tight mb-1 text-white">{cat.name}</p>
                                                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3">{cat.description}</p>
                                                            <p className="text-xl font-black text-primary-500 italic">$ {cat.base_price}</p>
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <div className="flex gap-4 pt-6">
                                                <button onClick={() => setStep(1)} className="p-6 bg-zinc-900 rounded-[2rem] border border-white/5 text-zinc-600 group hover:text-white transition-all">
                                                    <ChevronLeft className="w-7 h-7 transition-transform group-hover:-translate-x-2" />
                                                </button>
                                                <button
                                                    disabled={!selectedCategory}
                                                    onClick={() => setStep(3)}
                                                    className="premium-button flex-grow"
                                                >
                                                    RESUMEN FINAL
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Confirmation */}
                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-12"
                                        >
                                            <div className="bg-black rounded-[3rem] p-12 border border-zinc-900 space-y-10 relative overflow-hidden shadow-2xl">
                                                <div className="absolute -top-10 -right-10 opacity-[0.05] pointer-events-none">
                                                    <Clock className="w-64 h-64 text-primary-500" />
                                                </div>

                                                <div className="space-y-6 relative z-10">
                                                    <div className="bg-zinc-900/80 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-4">
                                                        <Truck className="w-12 h-12 text-primary-500 mb-2" />
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">CATEGORÍA SELECCIONADA</p>
                                                            <p className="text-3xl font-black italic text-white uppercase tracking-tighter">{selectedCategory?.name}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-8 py-6">
                                                        <div className="flex gap-6 items-start">
                                                            <div className="w-4 h-4 bg-primary-500 rounded-full border-4 border-black mt-1.5 shadow-[0_0_15px_rgba(245,158,11,1)]" />
                                                            <div>
                                                                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">PUNTO DE RECOGIDA</p>
                                                                <p className="text-xs font-black text-zinc-400 italic leading-snug">{pickup?.address}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-6 items-start">
                                                            <div className="w-4 h-4 bg-secondary-600 rounded-full border-4 border-black mt-1.5 shadow-[0_0_15px_rgba(234,88,12,1)]" />
                                                            <div>
                                                                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">DESTINO FINAL</p>
                                                                <p className="text-xs font-black text-zinc-400 italic leading-snug">{dropoff?.address}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-10 border-t border-zinc-900 flex flex-col items-center gap-4 relative z-10">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">COSTO ESTIMADO DEL SERVICIO</p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-6xl font-black italic text-primary-500 tracking-tighter shadow-primary-500/10">$ {estimate?.toFixed(0)}</span>
                                                        <div className="px-3 py-1 bg-primary-500 text-black text-[9px] font-black rounded-full uppercase italic animate-pulse">Precio Fijo</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-500 text-[11px] font-black italic uppercase flex gap-4 text-center">
                                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                                    <p>{error}</p>
                                                </div>
                                            )}

                                            <div className="flex gap-4">
                                                <button onClick={() => setStep(2)} className="p-6 bg-zinc-900 rounded-[2rem] border border-white/5 text-zinc-600 hover:text-white transition-all">
                                                    <ChevronLeft className="w-7 h-7" />
                                                </button>
                                                <button
                                                    onClick={handleConfirmBooking}
                                                    disabled={loading}
                                                    className="premium-button flex-grow flex items-center justify-center gap-6"
                                                >
                                                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                                                        <>
                                                            <span>CONFIRMAR SERVICIO</span> <ArrowRight className="w-7 h-7" />
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
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-10 flex flex-col items-center justify-center h-full"
                                        >
                                            <div className="relative mb-16">
                                                <div className="absolute inset-0 bg-primary-500 blur-[80px] opacity-20 rounded-full animate-pulse" />
                                                <motion.div
                                                    initial={{ rotate: -180, scale: 0 }}
                                                    animate={{ rotate: 0, scale: 1 }}
                                                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                                    className="relative w-40 h-40 bg-black border-4 border-primary-500 rounded-[4rem] flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.4)]"
                                                >
                                                    <CheckCircle2 className="w-20 h-20 text-primary-500" />
                                                </motion.div>
                                            </div>

                                            <h3 className="text-6xl font-black italic tracking-tighter uppercase mb-6 leading-[0.9] text-white">SERVICIO<br /><span className="text-primary-500">CONFIRMADO</span></h3>
                                            <p className="text-zinc-500 text-sm font-bold leading-relaxed max-w-xs mx-auto italic uppercase tracking-tight mb-16">
                                                Buscando conductores cercanos para asignar el vehículo <span className="text-white font-black">{selectedCategory?.name}</span> más adecuado.
                                            </p>

                                            <button
                                                onClick={() => navigate('/my-fletes')}
                                                className="premium-button w-full shadow-2xl shadow-primary-500/40"
                                            >
                                                RASTREAR SERVICIO
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel: Map */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-grow flex flex-col min-h-[500px] lg:h-auto rounded-[4rem] overflow-hidden border-8 border-zinc-950 relative shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
                    >
                        <FreightMap autoDetectLocation={true} showActiveDrivers={true} />
                    </motion.div>

                </div>
            </div>

            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary-500/5 blur-[200px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary-600/5 blur-[180px] rounded-full" />
            </div>
        </div>
    )
}

export default Booking
