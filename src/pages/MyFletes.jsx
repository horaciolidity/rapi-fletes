import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, ChevronRight, Package, AlertCircle, Phone, Star, ShieldCheck, Map as MapIcon, Calendar, DollarSign, Activity, XCircle, History as HistoryIcon } from 'lucide-react'
import { useBookingStore } from '../store/useBookingStore'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'
import FreightMap from '../components/map/FreightMap'
import ChatWidget from '../components/chat/ChatWidget'

const MyFletes = () => {
    const { user } = useAuthStore()
    const { fletes, fetchMyFletes, subscribeToFleteUpdates, cancelFlete, loading, error } = useBookingStore()
    const navigate = useNavigate()
    const [selectedFleteId, setSelectedFleteId] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }
        fetchMyFletes(user.id)

        const channel = subscribeToFleteUpdates(user.id)
        return () => {
            if (channel) channel.unsubscribe()
        }
    }, [user])

    useEffect(() => {
        if (fletes.length > 0 && !selectedFleteId) {
            const active = fletes.find(f => ['pending', 'accepted', 'picked_up'].includes(f.status))
            setSelectedFleteId(active ? active.id : fletes[0].id)
        }
    }, [fletes])

    const getStatusTheme = (status) => {
        switch (status) {
            case 'pending': return { color: 'primary-500', label: 'Buscando Unidad', icon: Clock }
            case 'accepted': return { color: 'secondary-500', label: 'Unidad Asignada', icon: Truck }
            case 'picked_up': return { color: 'primary-400', label: 'En Operación', icon: Activity }
            case 'completed': return { color: 'green-500', label: 'Misión Exitosa', icon: CheckCircle2 }
            case 'cancelled': return { color: 'red-500', label: 'Abortado', icon: XCircle }
            default: return { color: 'zinc-500', label: status, icon: Package }
        }
    }

    const selectedFlete = fletes.find(f => f.id === selectedFleteId)

    if (!user) return null

    return (
        <div className="pt-32 pb-12 min-h-screen bg-black font-sans">
            <div className="container mx-auto px-10 max-w-[1700px]">

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                            <HistoryIcon className="w-10 h-10 text-black" />
                        </div>
                        <div>
                            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">CENTRO DE<br /><span className="text-primary-500">CONTROL</span></h1>
                            <p className="text-zinc-700 font-black italic mt-3 uppercase tracking-[0.4em] text-[10px]">Monitoreo táctico de misiones en curso</p>
                        </div>
                    </div>

                    <Link to="/booking" className="premium-button group flex items-center gap-4">
                        <span>NUEVO DESPLIEGUE</span>
                        <Truck className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

                    {/* Left: Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-8 max-h-[850px] overflow-y-auto pr-4 scrollbar-none"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em]">REGISTRO OPERATIVO</span>
                            <span className="px-3 py-1 bg-zinc-900 text-zinc-500 text-[8px] font-black rounded-full italic tracking-widest">{fletes.length} MISIONES</span>
                        </div>

                        <AnimatePresence mode='popLayout'>
                            {fletes.map((flete, idx) => {
                                const theme = getStatusTheme(flete.status)
                                const isSelected = selectedFleteId === flete.id

                                return (
                                    <motion.div
                                        key={flete.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedFleteId(flete.id)}
                                        className={`glass-card p-10 border-2 cursor-pointer transition-all duration-500 relative overflow-hidden group ${isSelected ? 'border-primary-500 bg-primary-500/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]' : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800'}`}
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center bg-zinc-900 border border-white/5 transition-all duration-500 ${isSelected ? 'bg-primary-500 text-black shadow-lg scale-110' : 'text-zinc-600 group-hover:text-primary-500'}`}>
                                                <theme.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-zinc-800 uppercase italic tracking-widest mb-1">PROTOCOLO</p>
                                                <p className="text-[10px] font-black text-zinc-500 uppercase italic"># {flete.id.slice(0, 8)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <MapPin className="w-4 h-4 text-zinc-800 shrink-0" />
                                                <p className="text-xs font-black text-zinc-400 truncate italic uppercase tracking-tight">{flete.pickup_address}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Navigation className="w-4 h-4 text-zinc-800 shrink-0" />
                                                <p className="text-xs font-black text-zinc-400 truncate italic uppercase tracking-tight">{flete.dropoff_address}</p>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-zinc-900 flex justify-between items-center">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full italic bg-zinc-900 text-${theme.color}`}>
                                                {theme.label}
                                            </span>
                                            <span className="text-2xl font-black text-white italic tracking-tighter shadow-primary-500/10">${flete.estimated_price}</span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {fletes.length === 0 && !loading && (
                            <div className="text-center py-32 bg-zinc-950 rounded-[4rem] border-4 border-dashed border-zinc-900 opacity-20">
                                <Package className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 italic">ÁREA OPERATIVA VACÍA</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Right: Detailed View */}
                    <div className="lg:col-span-8 space-y-12 h-full">
                        {selectedFlete ? (
                            <motion.div
                                key={selectedFlete.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col gap-12"
                            >
                                {/* Map Area */}
                                <div className="h-[550px] rounded-[4rem] overflow-hidden border-8 border-zinc-950 bg-zinc-900 relative shadow-[0_40px_100px_rgba(0,0,0,0.9)] group">
                                    <FreightMap
                                        pickup={{ address: selectedFlete.pickup_address, lat: selectedFlete.pickup_lat, lng: selectedFlete.pickup_lng }}
                                        dropoff={{ address: selectedFlete.dropoff_address, lat: selectedFlete.dropoff_lat, lng: selectedFlete.dropoff_lng }}
                                        distance={selectedFlete.distance}
                                        duration={selectedFlete.duration}
                                    />

                                    {/* Map HUD */}
                                    <div className="absolute top-12 left-12 p-8 bg-black/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl">
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 rounded-full bg-primary-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] leading-none mb-2">SATELITE STATUS</p>
                                                <p className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{getStatusTheme(selectedFlete.status).label}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-12 right-12 p-8 bg-black/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex items-center gap-8 shadow-2xl">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] leading-none mb-2">RECURSO ASIGNADO</p>
                                            <p className="text-xl font-black text-primary-500 italic uppercase tracking-tighter leading-none">{selectedFlete.vehicle_categories?.name}</p>
                                        </div>
                                        <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                            <Truck className="w-8 h-8 text-black" />
                                        </div>
                                    </div>
                                </div>

                                {/* Control Panel Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Route Specs */}
                                    <div className="glass-card p-12 bg-zinc-900/40 border-zinc-800 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 mb-10">ESPECIFICACIONES DE RUTA</h3>
                                            <div className="space-y-10 relative">
                                                <div className="absolute left-[7px] top-8 bottom-8 w-[1px] bg-primary-500/10" />
                                                <div className="flex gap-8 items-start">
                                                    <div className="w-4 h-4 bg-primary-500 rounded-full border-4 border-black z-10 mt-2 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                                    <div>
                                                        <p className="text-[8px] font-black text-zinc-700 uppercase mb-1">ORIGEN</p>
                                                        <p className="text-sm font-black text-zinc-400 italic leading-snug uppercase">{selectedFlete.pickup_address}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-8 items-start">
                                                    <div className="w-4 h-4 bg-secondary-600 rounded-full border-4 border-black z-10 mt-2 shadow-[0_0_15px_rgba(234,88,12,0.5)]" />
                                                    <div>
                                                        <p className="text-[8px] font-black text-zinc-700 uppercase mb-1">DESTINO</p>
                                                        <p className="text-sm font-black text-zinc-400 italic leading-snug uppercase">{selectedFlete.dropoff_address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-10 border-t border-zinc-900 flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-700 uppercase mb-2">VALOR OPERATIVO</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-6xl font-black text-primary-500 italic tracking-tighter">$ {selectedFlete.estimated_price}</span>
                                                    <span className="text-[10px] font-black text-zinc-800 uppercase italic">ARS</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actor Information */}
                                    <div className="glass-card p-12 bg-zinc-900/40 border-zinc-800">
                                        {selectedFlete.driver ? (
                                            <div className="h-full flex flex-col">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 mb-10">RECURSO HUMANO ASIGNADO</h3>
                                                <div className="flex items-center gap-8 mb-12">
                                                    <div className="w-24 h-24 bg-black rounded-[2.5rem] border-2 border-primary-500 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                                                        <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-black flex items-center justify-center">
                                                            <Truck className="w-12 h-12 text-primary-500" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">{selectedFlete.driver.full_name}</p>
                                                        <div className="flex items-center gap-3">
                                                            <ShieldCheck className="w-5 h-5 text-primary-500" />
                                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">CHOFER NIVEL ALPHA</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-4">
                                                    <a
                                                        href={`tel:${selectedFlete.driver.phone}`}
                                                        className="premium-button w-full flex items-center justify-center gap-4 text-sm"
                                                    >
                                                        <Phone className="w-6 h-6" /> COMUNICACIÓN DIRECTA
                                                    </a>
                                                    <div className="p-5 bg-zinc-950 rounded-[2rem] border border-white/5 flex gap-4 items-center">
                                                        <Calendar className="w-6 h-6 text-zinc-800" />
                                                        <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest italic">Iniciado: {new Date(selectedFlete.created_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : selectedFlete.status === 'cancelled' ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                                <XCircle className="w-24 h-24 text-red-500 mb-8" />
                                                <h3 className="text-3xl font-black italic uppercase tracking-widest text-zinc-500 leading-none">MISIÓN ABORTADA</h3>
                                                <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mt-4">OPERACIÓN CANCELADA POR EL SISTEMA / USUARIO</p>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center">
                                                <div className="relative mb-12">
                                                    <div className="absolute inset-0 bg-primary-500/20 blur-3xl animate-pulse rounded-full" />
                                                    <div className="relative w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center border-2 border-primary-500">
                                                        <Clock className="w-12 h-12 text-primary-500 animate-spin-slow" />
                                                    </div>
                                                </div>
                                                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none"> ESCANEANDO<br /><span className="text-zinc-800">PERÍMETRO</span></h3>
                                                <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em] italic mb-12">SINCRONIZANDO CON UNIDADES CERCANAS...</p>

                                                <div className="flex flex-col gap-6 w-full max-w-sm">
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('¿Desea abortar la misión actual?')) {
                                                                cancelFlete(selectedFlete.id)
                                                            }
                                                        }}
                                                        className="w-full py-5 border-2 border-red-500/20 text-red-500/40 font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.5rem] hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 italic"
                                                    >
                                                        <XCircle className="w-5 h-5" /> ABORTAR MISIÓN
                                                    </button>
                                                    <Link to="/booking" className="text-[10px] font-black text-zinc-700 hover:text-primary-500 transition-all uppercase tracking-widest text-center italic">RECONFIGURAR EXTRACCIÓN</Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full glass-card bg-zinc-950 border-zinc-900 border-dashed border-4 flex flex-col items-center justify-center text-center p-32 opacity-10">
                                <MapIcon className="w-32 h-32 text-zinc-800 mb-10" />
                                <h3 className="text-5xl font-black italic uppercase tracking-widest text-zinc-800 leading-none">SISTEMA EN <br />STANDBY</h3>
                                <p className="text-xs font-black text-zinc-800 uppercase tracking-[0.5em] mt-8 max-w-sm italic">SELECCIONE UNA COORDENADA EN EL PANEL IZQUIERDO</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-12 p-8 bg-black border-4 border-red-500/20 rounded-[3rem] flex items-center gap-6 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
                    >
                        <AlertCircle className="w-10 h-10 shrink-0" />
                        <p className="text-lg font-black italic uppercase tracking-tight">{error}</p>
                    </motion.div>
                )}
            </div>

            {/* Float Chat Widget Refined */}
            {selectedFlete && ['accepted', 'picked_up'].includes(selectedFlete.status) && (
                <div className="fixed bottom-10 right-10 z-[1000]">
                    <ChatWidget
                        fleteId={selectedFlete.id}
                        receiverName={selectedFlete.driver?.full_name || "Chofer"}
                    />
                </div>
            )}

            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary-500/5 blur-[200px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-secondary-900/5 blur-[250px] rounded-full" />
            </div>
        </div>
    )
}

export default MyFletes
