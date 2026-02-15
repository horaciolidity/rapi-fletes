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

    const [step, setStep] = useState(1)
    const [pAddress, setPAddress] = useState('')
    const [dAddress, setDAddress] = useState('')
    const [isLocating, setIsLocating] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [activeSearch, setActiveSearch] = useState(null)
    const [geoError, setGeoError] = useState(null)

    useEffect(() => {
        if (profile?.role === 'driver') {
            navigate('/driver')
            return
        }
    }, [profile, navigate])

    useEffect(() => {
        fetchCategories()
        handleGeolocation(true)
        return () => resetBooking()
    }, [fetchCategories, resetBooking])

    const handleGeolocation = (silent = false) => {
        if (!navigator.geolocation) return
        if (!silent) setIsLocating(true)
        setGeoError(null)

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                try {
                    const res = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`)
                    if (!res.ok) throw new Error("Reverse geocoding failed")
                    const data = await res.json()

                    if (data && data.features && data.features.length > 0) {
                        const props = data.features[0].properties
                        const address = [props.name, props.street, props.housenumber, props.city, props.state]
                            .filter(Boolean)
                            .filter((val, i, arr) => arr.indexOf(val) === i)
                            .join(', ')
                        setPAddress(address)
                        setPickup({ address, lat: latitude, lng: longitude })
                    } else {
                        const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        setPAddress(address)
                        setPickup({ address, lat: latitude, lng: longitude })
                    }
                } catch (err) {
                    const fallbackAddress = "Mi Ubicación"
                    setPAddress(fallbackAddress)
                    setPickup({ address: fallbackAddress, lat: latitude, lng: longitude })
                } finally {
                    setIsLocating(false)
                }
            },
            (error) => {
                setIsLocating(false)
                if (!silent) {
                    if (error.code === 1) {
                        setGeoError("Ubicación bloqueada. Habilita permisos en tu navegador.")
                    } else {
                        setGeoError("No pudimos obtener tu ubicación exacta.")
                    }
                }
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
            // ARGENTINA BBOX: -73.5, -55.0, -53.5, -21.5 (Aproximado)
            // Limitamos la búsqueda a Argentina con bbox y prioridad por coordenadas
            let url = `https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=6&bbox=-73.5,-55.0,-53.5,-21.5`

            if (type === 'dropoff' && pickup) {
                url += `&lat=${pickup.lat}&lon=${pickup.lng}`
            } else {
                url += `&lat=-34.6037&lon=-58.3816`
            }

            const res = await fetch(url)
            if (!res.ok) return

            const data = await res.json()
            if (!data || !data.features) return

            const results = data.features.map(f => {
                const p = f.properties
                const label = [p.name, p.street, p.housenumber, p.city, p.state]
                    .filter(Boolean)
                    .filter((val, i, arr) => arr.indexOf(val) === i)
                    .join(', ')
                return {
                    display_name: label,
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0]
                }
            })

            setSearchResults(results)
            setActiveSearch(type)
        } catch (err) {
            console.error("Geocoding service unavailable", err)
        }
    }

    const handleMapClick = async (latlng) => {
        if (step !== 1) return
        setActiveSearch(null) // Cerrar buscador al clickear mapa

        try {
            const res = await fetch(`https://photon.komoot.io/reverse?lon=${latlng.lng}&lat=${latlng.lat}`)
            if (!res.ok) throw new Error("Reverse geocoding failed")
            const data = await res.json()

            let address = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
            if (data && data.features && data.features.length > 0) {
                const props = data.features[0].properties
                address = [props.name, props.street, props.housenumber, props.city, props.state]
                    .filter(Boolean)
                    .filter((val, i, arr) => arr.indexOf(val) === i)
                    .join(', ')
            }

            const item = { address, lat: latlng.lat, lng: latlng.lng }

            // Lógica inteligente: Si no hay pickup, actualizar pickup. Si hay pickup pero no dropoff, actualizar dropoff.
            if (!pickup) {
                setPAddress(address)
                setPickup(item)
            } else {
                setDAddress(address)
                setDropoff(item)
            }
            setSearchResults([])
            setGeoError(null)
        } catch (err) {
            console.error("Geocoding failed", err)
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
        setGeoError(null)
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
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch min-h-[700px]">

                    {/* Left Panel: Booking Flow */}
                    <div className="w-full lg:w-[480px] flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card flex-grow p-6 md:p-10 flex flex-col relative overflow-hidden bg-zinc-950/60 border-zinc-900 shadow-[20px_40px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="absolute top-0 right-0 w-2 md:w-3 h-full bg-gradient-to-b from-primary-500 to-secondary-600" />

                            <header className="mb-8 md:mb-12">
                                <div className="flex items-center gap-4 md:gap-6 mb-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-500 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-xl">
                                        <Truck className="w-6 h-6 md:w-8 md:h-8 text-black" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white leading-none">PEDIR<br /><span className="text-primary-500 text-4xl md:text-5xl">FLETE</span></h2>
                                </div>
                            </header>

                            {step < 4 && (
                                <div className="flex items-center gap-3 mb-10">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`h-2 flex-grow rounded-full transition-all duration-700 ${s <= step ? 'bg-primary-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-zinc-900'}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex-grow flex flex-col">
                                <AnimatePresence mode='wait'>
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-8">
                                            <div className="space-y-6">
                                                <div className="relative">
                                                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex justify-between items-center italic">
                                                        <span>01. PUNTO DE ORIGEN</span>
                                                        <button
                                                            onClick={() => handleGeolocation(false)}
                                                            className="flex items-center gap-2 text-primary-500 hover:text-white transition-all text-[9px]"
                                                        >
                                                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                                                            MI UBICACIÓN
                                                        </button>
                                                    </label>
                                                    <div className="relative group">
                                                        <MapPin className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-500 ${pickup ? 'text-primary-500 scale-110 shadow-glow' : 'text-zinc-700'}`} />
                                                        <input
                                                            className="input-field pl-14 h-14"
                                                            placeholder="Indica calle y altura..."
                                                            value={pAddress}
                                                            onFocus={() => setActiveSearch('pickup')}
                                                            onChange={(e) => {
                                                                setPAddress(e.target.value)
                                                                searchAddress(e.target.value, 'pickup')
                                                            }}
                                                        />
                                                    </div>
                                                    {geoError && (
                                                        <div className="mt-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-bold uppercase italic flex gap-3 items-center">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            {geoError}
                                                        </div>
                                                    )}
                                                    {activeSearch === 'pickup' && (
                                                        <div className="absolute z-[100] left-0 right-0 top-full mt-2 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-3xl">
                                                            {searchResults.length > 0 ? (
                                                                searchResults.map((r, i) => (
                                                                    <button key={i} onClick={() => selectResult(r)} className="w-full text-left p-5 hover:bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase text-zinc-400 hover:text-primary-500 transition-colors">
                                                                        {r.display_name}
                                                                    </button>
                                                                ))
                                                            ) : pAddress.length >= 3 && (
                                                                <div className="p-6 text-center">
                                                                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2 italic">Sin resultados en Argentina. Marca el mapa directamente.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3 block italic">02. DESTINO FINAL</label>
                                                    <div className="relative group">
                                                        <Navigation className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-500 ${dropoff ? 'text-secondary-500 scale-110 shadow-glow' : 'text-zinc-700'}`} />
                                                        <input
                                                            className="input-field pl-14 h-14"
                                                            placeholder="¿A dónde vamos?"
                                                            value={dAddress}
                                                            onFocus={() => setActiveSearch('dropoff')}
                                                            onChange={(e) => {
                                                                setDAddress(e.target.value)
                                                                searchAddress(e.target.value, 'dropoff')
                                                            }}
                                                        />
                                                    </div>
                                                    {activeSearch === 'dropoff' && (
                                                        <div className="absolute z-[100] left-0 right-0 top-full mt-2 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-3xl">
                                                            {searchResults.length > 0 ? (
                                                                searchResults.map((r, i) => (
                                                                    <button key={i} onClick={() => selectResult(r)} className="w-full text-left p-5 hover:bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase text-zinc-400 hover:text-primary-500 transition-colors">
                                                                        {r.display_name}
                                                                    </button>
                                                                ))
                                                            ) : dAddress.length >= 3 && (
                                                                <div className="p-6 text-center">
                                                                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2 italic">Sin resultados. Marca el mapa directamente.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button disabled={!pickup || !dropoff} onClick={() => setStep(2)} className="premium-button w-full flex items-center justify-center gap-6 mt-6">
                                                <span>ELEGIR VEHÍCULO</span>
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-none">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setCategory(cat)}
                                                        className={`w-full p-6 rounded-[2rem] border-2 transition-all duration-300 text-left flex items-center gap-6 relative group ${selectedCategory?.id === cat.id ? 'border-primary-500 bg-primary-500/10 shadow-xl' : 'border-white/5 bg-zinc-900/40 hover:border-white/20'}`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${selectedCategory?.id === cat.id ? 'bg-primary-500 text-black shadow-lg scale-110' : 'bg-black text-zinc-700'}`}>
                                                            <Truck className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-black italic uppercase text-lg text-white">{cat.name}</p>
                                                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">{cat.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-black text-primary-500 italic">${cat.base_price}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setStep(1)} className="p-5 bg-zinc-900 rounded-3xl border border-white/5 text-zinc-500 hover:text-white transition-all"><ChevronLeft className="w-6 h-6" /></button>
                                                <button disabled={!selectedCategory} onClick={() => setStep(3)} className="premium-button flex-grow">CONFIRMAR</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                            <div className="bg-zinc-950 rounded-[3rem] p-8 border border-zinc-900 shadow-2xl space-y-8">
                                                <div className="text-center pb-6 border-b border-zinc-900">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Vehículo</p>
                                                    <p className="text-3xl font-black italic text-white uppercase">{selectedCategory?.name}</p>
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[8px] font-black text-zinc-700 uppercase mb-1">Desde</p>
                                                        <p className="text-[11px] font-bold text-zinc-400 italic">{pickup?.address}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-zinc-700 uppercase mb-1">Hasta</p>
                                                        <p className="text-[11px] font-bold text-zinc-400 italic">{dropoff?.address}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-8 border-t border-zinc-900 text-center">
                                                    <p className="text-5xl font-black italic text-primary-500 tracking-tighter">${estimate?.toFixed(0)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => setStep(2)} className="p-5 bg-zinc-900 rounded-3xl border border-white/5 text-zinc-500"><ChevronLeft className="w-6 h-6" /></button>
                                                <button onClick={handleConfirmBooking} disabled={loading} className="premium-button flex-grow flex items-center justify-center gap-4">
                                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>SOLICITAR AHORA</span> <ArrowRight className="w-6 h-6" /></>}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 4 && (
                                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center mb-8 border border-primary-500/30">
                                                <CheckCircle2 className="w-12 h-12 text-primary-500" />
                                            </div>
                                            <h3 className="text-4xl font-black italic text-white uppercase mb-4 text-center">¡SOLICITUD<br /><span className="text-primary-500">ENVIADA!</span></h3>
                                            <button onClick={() => navigate('/my-fletes')} className="premium-button w-full mt-6">VER ESTADO</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Panel: Map */}
                    <div className="flex-grow flex flex-col min-h-[500px] lg:h-auto rounded-[3rem] overflow-hidden border-4 border-zinc-900 shadow-2xl relative bg-zinc-900">
                        <FreightMap
                            autoDetectLocation={true}
                            showActiveDrivers={true}
                            onMapClick={handleMapClick}
                        />
                    </div>

                </div>
            </div >
            <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_10%,#1a1100_0%,#000000_100%)]" />
        </div >
    )
}

export default Booking
