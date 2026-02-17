import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, ChevronRight, Search, CreditCard, Clock, CheckCircle2, AlertTriangle, ChevronLeft, Loader2, Target, ArrowRight, Star, X } from 'lucide-react'
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
    const [shipmentDetails, setShipmentDetails] = useState('')
    const [passengerTravels, setPassengerTravels] = useState(false)

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
                        setGeoError("Ubicación bloqueada.")
                    } else {
                        setGeoError("Error de ubicación.")
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
        setActiveSearch(null)

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
            if (!pickup) {
                setPAddress(address)
                setPickup(item)
            } else {
                setDAddress(address)
                setDropoff(item)
            }
            setSearchResults([])
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
        <div className="fixed inset-0 bg-black overflow-hidden font-sans">
            {/* Fullscreen Map Background */}
            <div className="absolute inset-0 z-0">
                <FreightMap
                    autoDetectLocation={true}
                    showActiveDrivers={true}
                    onMapClick={handleMapClick}
                    pickup={pickup}
                    dropoff={dropoff}
                />
            </div>

            {/* Top Search Bars (Uber Style) */}
            <div className="absolute top-20 left-0 right-0 z-20 px-4">
                <div className="max-w-md mx-auto space-y-2">
                    <AnimatePresence>
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-card bg-black/80 backdrop-blur-2xl p-4 shadow-2xl border-white/5"
                            >
                                <div className="space-y-3">
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                        <input
                                            className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 rounded-xl text-xs font-bold italic border border-white/5 outline-none focus:border-primary-500/50"
                                            placeholder="Origen..."
                                            value={pAddress}
                                            onFocus={() => setActiveSearch('pickup')}
                                            onChange={(e) => {
                                                setPAddress(e.target.value)
                                                searchAddress(e.target.value, 'pickup')
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500" />
                                        <input
                                            className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 rounded-xl text-xs font-bold italic border border-white/5 outline-none focus:border-primary-500/50"
                                            placeholder="¿A dónde vas?"
                                            value={dAddress}
                                            onFocus={() => setActiveSearch('dropoff')}
                                            onChange={(e) => {
                                                setDAddress(e.target.value)
                                                searchAddress(e.target.value, 'dropoff')
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Results Overlay */}
                                {activeSearch && searchResults.length > 0 && (
                                    <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-white/5">
                                        {searchResults.map((r, i) => (
                                            <button
                                                key={i}
                                                onClick={() => selectResult(r)}
                                                className="w-full text-left py-3 px-2 text-[10px] font-bold text-zinc-400 italic hover:text-primary-500"
                                            >
                                                {r.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Sheet - Vehicle Selection */}
            <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-8 pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {pickup && dropoff && step < 4 && (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="glass-card bg-black/90 backdrop-blur-3xl border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] pb-10"
                            >
                                {/* Drag Handle */}
                                <div className="flex justify-center py-4">
                                    <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                                </div>

                                {step === 1 && (
                                    <div className="px-6">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="premium-button w-full flex items-center justify-center gap-4 py-5"
                                        >
                                            <span className="text-[12px]">BUSCAR UNIDAD</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="px-6 space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-sm font-black italic uppercase text-white">ELEGIR VEHÍCULO</h3>
                                            <button onClick={() => setStep(1)}><ChevronLeft className="w-5 h-5 text-zinc-500" /></button>
                                        </div>
                                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none px-1 -mx-1">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setCategory(cat)}
                                                    className={`min-w-[140px] p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedCategory?.id === cat.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/5 bg-zinc-900/40'}`}
                                                >
                                                    <Truck className={`w-8 h-8 ${selectedCategory?.id === cat.id ? 'text-primary-500' : 'text-zinc-700'}`} />
                                                    <p className="text-[10px] font-black italic uppercase text-white leading-none">{cat.name}</p>
                                                    <p className="text-lg font-black italic text-primary-500">${cat.base_price}</p>
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            disabled={!selectedCategory}
                                            onClick={() => setStep(3)}
                                            className="premium-button w-full flex items-center justify-center gap-4 py-5"
                                        >
                                            <span className="text-[12px]">CONTINUAR</span>
                                        </button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="px-8 space-y-6">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">PRECIO FINAL ORIENTATIVO</p>
                                            <p className="text-5xl font-black italic text-primary-500 tracking-tighter">${estimate?.toFixed(0)}</p>
                                        </div>
                                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Truck className="w-4 h-4 text-primary-500" />
                                                <p className="text-xs font-black italic text-white uppercase">{selectedCategory?.name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-4 h-4 text-zinc-600" />
                                                <p className="text-[10px] font-bold italic text-zinc-400 uppercase tracking-tight">Efectivo al finalizar</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 italic">DETALLES DEL ENVÍO (OBJETOS, PISO, ETC)</label>
                                            <textarea
                                                className="w-full px-6 py-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-[10px] font-bold italic text-white outline-none focus:border-primary-500/50 min-h-[80px] resize-none"
                                                placeholder="Ej: 1 Heladera, 2do piso por escalera..."
                                                value={shipmentDetails}
                                                onChange={(e) => setShipmentDetails(e.target.value)}
                                            />
                                        </div>

                                        {/* Passenger Travels Checkbox */}
                                        <div
                                            onClick={() => setPassengerTravels(!passengerTravels)}
                                            className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl cursor-pointer hover:bg-zinc-900 transition-colors"
                                        >
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${passengerTravels ? 'bg-primary-500 border-primary-500' : 'border-zinc-700'
                                                }`}>
                                                {passengerTravels && <CheckCircle2 className="w-4 h-4 text-black" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-white uppercase italic">Viajaré con la carga</p>
                                                <p className="text-[8px] font-bold text-zinc-600 italic">Marca si acompañarás el envío</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button onClick={() => setStep(2)} className="p-5 bg-zinc-900 rounded-2xl border border-white/5 text-zinc-500 rotate-180"><ArrowRight className="w-5 h-5" /></button>
                                            <button
                                                onClick={() => createFlete(user.id, shipmentDetails, passengerTravels).then(res => res && setStep(4))}
                                                disabled={loading}
                                                className="premium-button flex-grow flex items-center justify-center gap-4 py-5"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <span className="text-[12px]">CONFIRMAR FLETE</span> <CheckCircle2 className="w-5 h-5" /> </>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="glass-card bg-black p-10 text-center flex flex-col items-center shadow-2xl border-primary-500/20"
                            >
                                <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mb-6 border border-primary-500/30">
                                    <CheckCircle2 className="w-10 h-10 text-primary-500" />
                                </div>
                                <h3 className="text-3xl font-black italic text-white uppercase mb-4 leading-none">¡SOLICITUD<br />ENVIADA!</h3>
                                <button onClick={() => navigate('/my-fletes')} className="premium-button w-full mt-4">VER ESTADO</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
        </div>
    )
}

export default Booking
