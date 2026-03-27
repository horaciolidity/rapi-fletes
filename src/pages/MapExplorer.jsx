import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map as MapIcon, Compass, Truck, Target, Info, Loader2 } from 'lucide-react'
import FreightMap from '../components/map/FreightMap'
import { useAuthStore } from '../store/useAuthStore'
import { useDriverStore } from '../store/useDriverStore'

const MapExplorer = () => {
    const { profile, user } = useAuthStore()
    const { fetchAvailableFletes, availableFletes, loading } = useDriverStore()

    useEffect(() => {
        if (profile?.role === 'driver' && user?.id) {
            fetchAvailableFletes(user.id)
        }
    }, [profile?.role, user?.id, fetchAvailableFletes])

    return (
        <div className="fixed inset-0 overflow-hidden font-sans">
            {/* Main Background Map */}
            <div className="absolute inset-0 z-0">
                <FreightMap 
                    showActiveDrivers={true}
                    autoDetectLocation={true}
                />
                {/* Dark Vignette for better UI contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Header HUD */}
            <div className="absolute top-24 left-0 right-0 z-40 px-6 pointer-events-none">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-md mx-auto glass-card p-5 border-white/10 backdrop-blur-3xl flex items-center justify-between pointer-events-auto shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 relative">
                            <MapIcon className="w-6 h-6 text-black" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black italic uppercase tracking-tighter text-white leading-none mb-1.5 flex items-center gap-2">
                                MAPA <span className="text-primary-500">ESTRATEGICO</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.3em] italic bg-white/5 px-2 py-0.5 rounded-full">REAL-TIME GPS FEED</span>
                                {loading && <Loader2 className="w-3 h-3 text-primary-500 animate-spin" />}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Floating Info Overlay (Legend) */}
            <div className="absolute bottom-28 left-0 right-0 z-40 px-6 pointer-events-none">
                <div className="max-w-md mx-auto flex flex-col gap-4">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-card p-6 border-white/5 bg-zinc-950/80 backdrop-blur-2xl pointer-events-auto border-l-2 border-l-primary-500"
                    >
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-zinc-400">REFERENCIA OPERATIVA</h3>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black text-green-500 uppercase italic">SAT-LINK OK</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 group cursor-help">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl transition-all group-hover:scale-110">🚚</div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase italic">CONDUCTORES</p>
                                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">MOSTRANDO PRECIO BASE</p>
                                    </div>
                                </div>

                                {profile?.role === 'driver' && (
                                    <div className="flex items-center gap-4 group cursor-help border-l border-white/5 pl-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl transition-all group-hover:scale-110">📍</div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase italic">VIAJES</p>
                                            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">VALOR ESTIMADO</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {profile?.role === 'driver' && availableFletes?.length > 0 && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-primary-500 text-black px-6 py-3 rounded-full flex items-center justify-between shadow-2xl pointer-events-auto"
                        >
                            <span className="text-[9px] font-black uppercase italic tracking-widest">
                                {availableFletes.length} SOLICITUDES EN TU RADAR
                            </span>
                            <Truck className="w-4 h-4 animate-bounce" />
                        </motion.div>
                    )}
                </div>
            </div>
            
            {/* Mesh Overlay */}
            <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none z-10" />
        </div>
    )
}

export default MapExplorer
