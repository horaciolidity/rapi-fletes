import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'

const FreightMap = ({ pickup, dropoff }) => {
    return (
        <div className="relative w-full h-[500px] bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
            {/* Mock Map Background */}
            <div className="absolute inset-0 opacity-40">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-600" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Mock roads */}
                    <path d="M 0 50 Q 200 100 400 50" fill="none" stroke="#334155" strokeWidth="4" />
                    <path d="M 100 0 Q 150 200 100 500" fill="none" stroke="#334155" strokeWidth="4" />
                </svg>
            </div>

            {/* Origin Pin */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"
            >
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/50" />
                    <div className="bg-primary-600 p-2 rounded-full shadow-lg relative z-10">
                        <MapPin className="text-white w-6 h-6" />
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg whitespace-nowrap text-xs font-semibold">
                        Origen
                    </div>
                </div>
            </motion.div>

            {/* Destination Pin */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-1/4 right-1/3 -translate-x-1/2 -translate-y-1/2"
            >
                <div className="relative">
                    <div className="bg-secondary-600 p-2 rounded-full shadow-lg relative z-10">
                        <Navigation className="text-white w-6 h-6 rotate-45" />
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg whitespace-nowrap text-xs font-semibold">
                        Destino
                    </div>
                </div>
            </motion.div>

            {/* Floating Info Overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none">
                <div className="glass-card p-4 pointer-events-auto max-w-[200px]">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Estado del viaje</h5>
                    <p className="text-sm font-semibold">Buscando chofer cercano...</p>
                </div>

                <div className="glass-card p-4 pointer-events-auto flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Tiempo estimado</p>
                        <p className="text-lg font-bold">12 min</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FreightMap
