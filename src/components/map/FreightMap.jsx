import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, Loader2 } from 'lucide-react'
import { useBookingStore } from '../../store/useBookingStore'

const FreightMap = ({
    pickup: propPickup,
    dropoff: propDropoff,
    distance: propDistance,
    duration: propDuration
}) => {
    // Falls back to store if props are not provided (legacy/booking behavior)
    const storeData = useBookingStore()
    const pickup = propPickup || storeData.pickup
    const dropoff = propDropoff || storeData.dropoff
    const distance = propDistance || storeData.distance
    const duration = propDuration || storeData.duration

    const [isSimulating, setIsSimulating] = useState(false)

    useEffect(() => {
        if (pickup && dropoff) {
            setIsSimulating(true)
            const timer = setTimeout(() => setIsSimulating(false), 1500)
            return () => clearTimeout(timer)
        }
    }, [pickup, dropoff])

    return (
        <div className="relative w-full h-full min-h-[500px] bg-slate-900 overflow-hidden border border-white/10 shadow-2xl rounded-3xl">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-20 transition-opacity duration-1000" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            {/* Mock Map Lines (Roads) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <path d="M-100 200 C 200 150 400 300 1200 250" fill="none" stroke="#475569" strokeWidth="2" />
                <path d="M400 -100 C 450 200 300 400 350 1000" fill="none" stroke="#475569" strokeWidth="2" />
                <path d="M800 -100 C 750 300 900 600 850 1000" fill="none" stroke="#475569" strokeWidth="2" />

                {/* Animated route if both points exist */}
                <AnimatePresence>
                    {pickup && dropoff && !isSimulating && (
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            d="M 250 150 L 650 350" // Sample static line for visual
                            fill="none"
                            stroke="url(#route-gradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                    )}
                </AnimatePresence>

                <defs>
                    <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Pickup Marker */}
            <AnimatePresence>
                {pickup && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute"
                        style={{ top: '150px', left: '250px' }}
                    >
                        <div className="relative -translate-x-1/2 -translate-y-full">
                            <div className="bg-primary-500 p-2 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5)] border-2 border-white relative z-10">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-500 rotate-45 border-r border-b border-white" />
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold text-white shadow-xl">
                                Recogida: {pickup.address.split(',')[0]}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dropoff Marker */}
            <AnimatePresence>
                {dropoff && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute"
                        style={{ top: '350px', left: '650px' }}
                    >
                        <div className="relative -translate-x-1/2 -translate-y-full">
                            <div className="bg-secondary-500 p-2 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)] border-2 border-white relative z-10">
                                <Navigation className="w-6 h-6 text-white rotate-45" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary-500 rotate-45 border-r border-b border-white" />
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold text-white shadow-xl">
                                Entrega: {dropoff.address.split(',')[0]}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Overlays */}
            <div className="absolute bottom-10 left-10 right-10 flex flex-col sm:flex-row gap-4 items-center justify-between pointer-events-none">
                <AnimatePresence>
                    {distance && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="glass-card p-4 flex items-center gap-6 pointer-events-auto"
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Distancia</span>
                                <span className="text-xl font-black text-white">{distance} km</span>
                            </div>
                            <div className="w-[1px] h-10 bg-slate-700" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tiempo Est.</span>
                                <span className="text-xl font-black text-white">{duration} min</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isSimulating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-auto"
                        >
                            <div className="glass-card px-6 py-4 flex items-center gap-4 border-primary-500/50">
                                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                                <span className="font-bold text-white">Calculando mejor ruta...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search Hint (Upper top) */}
            {!pickup && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-6">
                    <div className="mx-auto bg-slate-950/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 inline-flex items-center gap-3">
                        <div className="p-1.5 bg-primary-500/20 rounded-lg">
                            <MapPin className="w-4 h-4 text-primary-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">Selecciona una misión para ver la ruta</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FreightMap
