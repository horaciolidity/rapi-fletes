import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, Car, Package, ChevronRight, Search, CreditCard, Clock, CheckCircle2, AlertTriangle, ChevronLeft, Loader2, Target, ArrowRight, Star, X, User } from 'lucide-react'
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

    return (
        <div className="fixed inset-0 overflow-hidden font-sans selection:bg-primary-500 text-[var(--text-color)]">
            {/* Mesh Background for context and depth */}
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none z-10" />

            {/* Main Background Map */}
            <div className="absolute inset-0 z-0">
                <FreightMap
                    autoDetectLocation={true}
                    showActiveDrivers={true}
                    onMapClick={handleMapClick}
                    pickup={pickup}
                    dropoff={dropoff}
                />
                {/* Dark Vignette for better UI contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            </div>

            {/* TOP HUD: Search & Route Configuration */}
            <div className="absolute top-24 left-0 right-0 z-40 px-6">
                <div className="max-w-md mx-auto relative">
                    <AnimatePresence>
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="glass-card shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-white/10 p-5 backdrop-blur-3xl overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

                                <div className="mb-6 flex items-center justify-between">
                                    <span className="badge-gold">RUTA ESTRATÉGICA</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]" />
                                        <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">SAT-LINK ACTIVE</span>
                                    </div>
                                </div>

                                <div className="space-y-4 relative">
                                    <div className="absolute left-[23px] top-10 bottom-10 w-[1px] bg-gradient-to-b from-primary-500 via-white/5 to-white/20 z-0" />

                                    <div className="relative z-10 group">
                                        <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-20" />
                                        <input
                                            className="input-field pl-14 pr-12 text-[10px] font-black tracking-[0.1em] uppercase italic bg-zinc-950/40 border-white/5 focus:border-primary-500/40"
                                            placeholder="Ingresar Punto A..."
                                            value={pAddress}
                                            onFocus={() => {
                                                setActiveSearch('pickup')
                                                if (!pickup) handleGeolocation(true)
                                            }}
                                            onChange={(e) => {
                                                setPAddress(e.target.value)
                                                searchAddress(e.target.value, 'pickup')
                                            }}
                                        />
                                        <button
                                            onClick={() => handleGeolocation(false)}
                                            disabled={isLocating}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-600 hover:text-primary-500 transition-all active:scale-90"
                                        >
                                            {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-primary-500" /> : <Target className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="relative z-10 group">
                                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] border-2 border-primary-500 bg-black z-20 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                                        <input
                                            className="input-field pl-14 text-[10px] font-black tracking-[0.1em] uppercase italic bg-zinc-950/40 border-white/5 focus:border-primary-500/40"
                                            placeholder="Definir Destino B..."
                                            value={dAddress}
                                            onFocus={() => setActiveSearch('dropoff')}
                                            onChange={(e) => {
                                                setDAddress(e.target.value)
                                                searchAddress(e.target.value, 'dropoff')
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Results Overlay - Premium Dropdown */}
                                <AnimatePresence>
                                    {activeSearch && searchResults.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-6 max-h-56 overflow-y-auto divide-y divide-white/5 border-t border-white/5 -mx-2 px-2"
                                        >
                                            {searchResults.map((r, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => selectResult(r)}
                                                    className="w-full text-left py-4 px-4 flex items-center gap-4 hover:bg-white/5 transition-all group"
                                                >
                                                    <MapPin className="w-4 h-4 text-zinc-700 group-hover:text-primary-500 transition-colors" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-400 group-hover:text-white transition-colors uppercase italic">{r.display_name?.split(',')[0] || 'DIRECCIÓN'}</p>
                                                        <p className="text-[7px] font-bold text-zinc-800 uppercase tracking-tighter mt-1">{r.display_name?.split(',').slice(1, 4).join(',')}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* BOTTOM HUD: Action Panel & Selection */}
            <div className="absolute bottom-0 left-0 right-0 z-50 px-6 pb-10 pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {pickup && dropoff && step < 4 && (
                            <motion.div
                                initial={{ y: '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: '100%', opacity: 0 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                                className="glass-card shadow-[0_-30px_100px_rgba(0,0,0,0.9)] border-white/10 backdrop-blur-3xl overflow-hidden pb-4"
                            >
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

                                {/* Aesthetic Drag Handle */}
                                <div className="flex justify-center py-5">
                                    <div className="w-16 h-1 bg-white/5 rounded-full" />
                                </div>

                                {step === 1 && (
                                    <div className="px-8 pb-6">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="premium-button w-full flex items-center justify-center gap-6 py-6 group"
                                        >
                                            <span className="text-[11px] font-black tracking-widest uppercase italic">CALCULAR FLOTA</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="px-8 space-y-8 pb-6">
                                        <header className="flex justify-between items-center">
                                            <h3 className="text-[11px] font-black italic uppercase text-primary-500 tracking-[0.2em] flex items-center gap-3">
                                                <span className="w-2 h-[1px] bg-primary-500" /> UNIDADES DISPONIBLES
                                            </h3>
                                            <button onClick={() => setStep(1)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                                <ChevronLeft className="w-5 h-5 text-zinc-500" />
                                            </button>
                                        </header>

                                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x px-1 -mx-4 lg:-mx-1">
                                            {categories.map((cat) => {
                                                const imgPath = `/imagenes/categories/${cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'camion' ? 'camion' : cat.name.toLowerCase()}.jpg`;
                                                const isSelected = selectedCategory?.id === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setCategory(cat)}
                                                        className={`min-w-[180px] snap-center glass-card p-0 overflow-hidden border-2 transition-all duration-500 relative group/unit ${isSelected ? 'border-primary-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-primary-500/5 translate-y-[-4px]' : 'border-white/5 bg-zinc-950/40 opacity-60 hover:opacity-100 hover:border-white/20'}`}
                                                    >
                                                        <div className="relative h-32 w-full overflow-hidden">
                                                            <img src={imgPath} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/unit:scale-110" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                                            <div className="absolute bottom-3 left-4">
                                                                <p className="text-[10px] font-black italic uppercase text-white tracking-widest leading-none drop-shadow-md">{cat.name}</p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 p-1.5 bg-primary-500 rounded-lg shadow-xl">
                                                                    <CheckCircle2 className="w-3 h-3 text-black" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-5 space-y-3">
                                                            <p className="text-[8px] font-black text-zinc-600 uppercase italic tracking-tighter leading-tight h-6 overflow-hidden line-clamp-2">{cat.description}</p>
                                                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                                <span className="text-[7px] font-black text-zinc-500 italic uppercase">Base</span>
                                                                <p className="text-xl font-black italic text-white tracking-tighter">${cat.base_price}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            disabled={!selectedCategory}
                                            onClick={() => setStep(3)}
                                            className="premium-button w-full flex items-center justify-center gap-6 py-6 group"
                                        >
                                            <span className="text-[11px] font-black tracking-widest uppercase italic">CONTINUAR AL PAGO</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="px-8 space-y-8 pb-8">
                                        <div className="text-center bg-white/5 py-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-inner relative overflow-hidden group">
                                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-3 italic leading-none">ESTIMACIÓN ESTRATÉGICA</p>
                                            <p className="text-7xl font-black italic text-gradient tracking-tighter leading-none">${estimate?.toFixed(0)}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                <div className="flex-1 glass-card p-5 border-white/5 bg-white/5 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                                                        <Truck className="w-5 h-5 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] font-black text-zinc-600 uppercase italic tracking-widest">VEHÍCULO</p>
                                                        <p className="text-[10px] font-black italic text-white uppercase">{selectedCategory?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex-1 glass-card p-5 border-white/5 bg-white/5 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
                                                        <CreditCard className="w-5 h-5 text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] font-black text-zinc-600 uppercase italic tracking-widest">PAGO</p>
                                                        <p className="text-[10px] font-black italic text-zinc-300 uppercase">EFECTIVO</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="glass-card p-6 border-white/5 bg-white/5 space-y-4">
                                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic flex items-center gap-2">
                                                    <Package className="w-3 h-3" /> DETALLES OPERATIVOS
                                                </label>
                                                <textarea
                                                    className="w-full px-5 py-4 bg-zinc-950/40 border border-white/5 rounded-2xl text-[10px] font-black italic text-white outline-none focus:border-primary-500/30 min-h-[100px] resize-none uppercase tracking-widest placeholder:text-zinc-800"
                                                    placeholder="OBJETOS, VOLUMEN, PISO..."
                                                    value={shipmentDetails}
                                                    onChange={(e) => setShipmentDetails(e.target.value)}
                                                />
                                            </div>

                                            {/* Premium Checkbox Toggle */}
                                            <div
                                                onClick={() => setPassengerTravels(!passengerTravels)}
                                                className="flex items-center justify-between p-6 glass-card bg-white/5 border-white/5 cursor-pointer hover:bg-white/10 transition-all group/toggle"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-500 ${passengerTravels ? 'bg-primary-500 border-primary-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'border-zinc-800'}`}>
                                                        {passengerTravels && <CheckCircle2 className="w-4 h-4 text-black" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase italic tracking-widest">PASAJERO A BORDO</p>
                                                        <p className="text-[8px] font-bold text-zinc-600 italic uppercase">Acompañar flete</p>
                                                    </div>
                                                </div>
                                                <User className={`w-5 h-5 transition-all duration-500 ${passengerTravels ? 'text-primary-500' : 'text-zinc-800'}`} />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button onClick={() => setStep(2)} className="p-6 glass-card bg-white/5 border-white/5 text-zinc-600 hover:text-white transition-all rotate-180"><ArrowRight className="w-6 h-6" /></button>
                                            <button
                                                onClick={() => createFlete(user.id, shipmentDetails, passengerTravels).then(res => res && setStep(4))}
                                                disabled={loading}
                                                className="premium-button flex-grow flex items-center justify-center gap-6 py-6 shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all duration-700"
                                            >
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <span className="text-[12px] font-black tracking-[0.2em] uppercase italic">GENERAR ORDEN</span> <CheckCircle2 className="w-6 h-6" /> </>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="glass-card bg-zinc-950/90 p-12 text-center flex flex-col items-center shadow-[0_50px_150px_rgba(0,0,0,1)] border-primary-500/20 backdrop-blur-3xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
                                <div className="w-24 h-24 bg-primary-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-primary-500/30 relative z-10 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                                    <CheckCircle2 className="w-12 h-12 text-primary-500" />
                                </div>
                                <h3 className="text-5xl font-black italic text-gradient uppercase mb-6 leading-none tracking-tighter relative z-11">ESTRATEGIA<br />CONFIRMADA</h3>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10 italic relative z-11">Buscando conductores en su área...</p>
                                <button onClick={() => navigate('/my-fletes')} className="premium-button w-full relative z-11 py-6 shadow-2xl">RASTREAR VIAJE</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </div>
    )
}

export default Booking
