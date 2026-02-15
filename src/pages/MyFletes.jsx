import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, ChevronRight, Package, AlertCircle, Phone, Star, ShieldCheck, Map as MapIcon, Calendar, DollarSign, Activity, XCircle } from 'lucide-react'
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

        // Real-time updates for client
        const channel = subscribeToFleteUpdates(user.id)
        return () => {
            if (channel) channel.unsubscribe()
        }
    }, [user])

    // Set first active or latest flete as selected by default
    useEffect(() => {
        if (fletes.length > 0 && !selectedFleteId) {
            const active = fletes.find(f => ['pending', 'accepted', 'picked_up'].includes(f.status))
            setSelectedFleteId(active ? active.id : fletes[0].id)
        }
    }, [fletes])

    const getStatusTheme = (status) => {
        switch (status) {
            case 'pending': return { color: 'amber', label: 'Buscando Chofer', icon: Clock }
            case 'accepted': return { color: 'blue', label: 'Chofer Asignado', icon: Truck }
            case 'picked_up': return { color: 'indigo', label: 'En Viaje', icon: Activity }
            case 'completed': return { color: 'green', label: 'Entregado', icon: CheckCircle2 }
            case 'cancelled': return { color: 'red', label: 'Cancelado', icon: XCircle }
            default: return { color: 'slate', label: status, icon: Package }
        }
    }

    const selectedFlete = fletes.find(f => f.id === selectedFleteId)

    if (!user) return null

    return (
        <div className="pt-24 pb-12 min-h-screen bg-slate-950">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* 1. Header Hero Area */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                                <History className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Mis Misiones</h1>
                                <p className="text-slate-500 font-medium italic mt-2 uppercase tracking-widest text-[10px]">Gestión logística en tiempo real</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link to="/booking" className="premium-button py-4 px-8 italic font-black text-xs uppercase tracking-widest flex items-center gap-3">
                            NUEVO FLETE <Truck className="w-4 h-4" />
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

                    {/* 2. Left: Timeline/History Feed */}
                    <div className="lg:col-span-4 space-y-6 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Historial de Viajes</span>
                            <span className="text-[10px] font-black text-slate-800 uppercase italic">{fletes.length} TOTAL</span>
                        </div>

                        <AnimatePresence mode='popLayout'>
                            {fletes.map((flete) => {
                                const theme = getStatusTheme(flete.status)
                                const isSelected = selectedFleteId === flete.id

                                return (
                                    <motion.div
                                        key={flete.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => setSelectedFleteId(flete.id)}
                                        className={`glass-card p-6 border-2 cursor-pointer transition-all relative overflow-hidden group ${isSelected ? 'border-primary-500 bg-primary-500/5 shadow-2xl scale-[1.02]' : 'border-white/5 bg-slate-900/40 hover:border-white/10'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2 rounded-xl border bg-${theme.color}-500/10 border-${theme.color}-500/20`}>
                                                <theme.icon className={`w-4 h-4 text-${theme.color}-500`} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-600 uppercase italic">{new Date(flete.created_at).toLocaleDateString()}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                                <p className="text-xs font-bold text-slate-200 truncate italic">{flete.pickup_address}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Navigation className="w-3 h-3 text-slate-500 shrink-0" />
                                                <p className="text-xs font-bold text-slate-200 truncate italic">{flete.dropoff_address}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/5">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded italic bg-${theme.color}-500/10 text-${theme.color}-500`}>
                                                {theme.label}
                                            </span>
                                            <span className="text-lg font-black text-white italic tracking-tighter">${flete.estimated_price}</span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {/* Chat Widget for active flete */}
                        {selectedFlete && ['accepted', 'picked_up'].includes(selectedFlete.status) && (
                            <ChatWidget
                                fleteId={selectedFlete.id}
                                receiverName={selectedFlete.driver?.full_name || "Chofer"}
                            />
                        )}

                        {fletes.length === 0 && !loading && (
                            <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-white/5 opacity-40">
                                <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">No hay misiones registradas</p>
                            </div>
                        )}
                    </div>

                    {/* 3. Right: Active Mission Tracking & Detailed View */}
                    <div className="lg:col-span-8 space-y-8">
                        {selectedFlete ? (
                            <motion.div
                                key={selectedFlete.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col gap-8"
                            >
                                {/* Active Map Area */}
                                <div className="h-[450px] rounded-[3.5rem] overflow-hidden border border-white/5 bg-slate-900 relative shadow-2xl group">
                                    <FreightMap
                                        pickup={{ address: selectedFlete.pickup_address, lat: selectedFlete.pickup_lat, lng: selectedFlete.pickup_lng }}
                                        dropoff={{ address: selectedFlete.dropoff_address, lat: selectedFlete.dropoff_lat, lng: selectedFlete.dropoff_lng }}
                                        distance={selectedFlete.distance}
                                        duration={selectedFlete.duration}
                                    />

                                    {/* Map Overlays */}
                                    <div className="absolute top-10 left-10 p-6 bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full animate-ping bg-${getStatusTheme(selectedFlete.status).color}-500`} />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Estatus del envío</p>
                                                <p className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">{getStatusTheme(selectedFlete.status).label}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-10 right-10 p-6 bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Vehículo Asignado</p>
                                            <p className="text-xs font-black text-white italic uppercase">{selectedFlete.vehicle_categories?.name}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-primary-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Details & Driver Control Panel */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                                    {/* Route Info */}
                                    <div className="glass-card p-10 bg-slate-900/60 border-white/5 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 mb-8">Información de Ruta</h3>
                                            <div className="space-y-8 relative">
                                                <div className="absolute left-[7px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-primary-500 to-secondary-500 opacity-20" />
                                                <div className="flex gap-6 items-start">
                                                    <div className="w-4 h-4 bg-primary-500 rounded-full border-4 border-slate-950 z-10 mt-1 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Punto de Carga</p>
                                                        <p className="text-sm font-bold text-white italic leading-tight">{selectedFlete.pickup_address}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6 items-start">
                                                    <div className="w-4 h-4 bg-secondary-500 rounded-full border-4 border-slate-950 z-10 mt-1 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Destino Final</p>
                                                        <p className="text-sm font-bold text-white italic leading-tight">{selectedFlete.dropoff_address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Inversión Logística</p>
                                                <p className="text-4xl font-black text-primary-400 italic">${selectedFlete.estimated_price}</p>
                                            </div>
                                            {selectedFlete.status === 'completed' && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest italic mb-1">Misión Exitosa</span>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Driver Profile / Status Action */}
                                    <div className="glass-card p-10 bg-slate-900/60 border-white/5">
                                        {selectedFlete.driver ? (
                                            <div className="h-full flex flex-col">
                                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 mb-8">Personal Asignado</h3>
                                                <div className="flex items-center gap-6 mb-10">
                                                    <div className="w-20 h-20 bg-slate-800 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden">
                                                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
                                                            <Truck className="w-10 h-10 text-white" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedFlete.driver.full_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <ShieldCheck className="w-3 h-3 text-primary-500" />
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Chofer Certificado</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-4">
                                                    <a
                                                        href={`tel:${selectedFlete.driver.phone}`}
                                                        className="w-full py-5 bg-white text-black font-black italic text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-primary-500 hover:text-white transition-all shadow-xl"
                                                    >
                                                        <Phone className="w-5 h-5" /> LLAMAR AL CHOFER
                                                    </a>
                                                    <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex gap-4 items-center">
                                                        <Calendar className="w-4 h-4 text-slate-600" />
                                                        <p className="text-[10px] text-slate-500 font-medium">Solicitado el {new Date(selectedFlete.created_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : selectedFlete.status === 'cancelled' ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                                <XCircle className="w-16 h-16 text-red-500 mb-6" />
                                                <h3 className="text-xl font-black italic uppercase tracking-widest text-slate-400">Viaje Cancelado</h3>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center">
                                                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border border-amber-500/20">
                                                    <Clock className="w-10 h-10 text-amber-500 animate-spin" />
                                                </div>
                                                <h3 className="text-xl font-black italic uppercase tracking-widest text-white mb-4 leading-tight">Escaneando Unidades Proximas</h3>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] italic">Esperando que un chofer acepte la carga...</p>

                                                <div className="flex flex-col gap-6 mt-12 w-full max-w-xs">
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('¿Estás seguro de que deseas cancelar este viaje?')) {
                                                                cancelFlete(selectedFlete.id)
                                                            }
                                                        }}
                                                        className="w-full py-4 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" /> CANCELAR MISIÓN
                                                    </button>
                                                    <Link to="/booking" className="text-[10px] font-black text-primary-500 hover:text-white transition-colors uppercase tracking-widest text-center">¿Necesitas modificar el pedido?</Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full glass-card bg-slate-900/10 border-white/5 flex flex-col items-center justify-center text-center p-20 opacity-30">
                                <MapIcon className="w-20 h-20 text-slate-800 mb-8" />
                                <h3 className="text-3xl font-black italic uppercase tracking-widest text-slate-800">Selecciona una Misión</h3>
                                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mt-4 max-w-xs">Toca cualquier viaje en el feed de la izquierda para ver el seguimiento táctico</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-400">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <p className="text-sm font-bold italic">{error}</p>
                    </div>
                )}

                {/* Chat Widget: Active only when flete is accepted/picked_up */}
                {selectedFlete && ['accepted', 'picked_up'].includes(selectedFlete.status) && (
                    <ChatWidget
                        fleteId={selectedFlete.id}
                        receiverName={selectedFlete.driver?.full_name || "Chofer"}
                    />
                )}
            </div>
        </div>
    )
}

const History = (props) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5h5"></path>
        <path d="M12 7v5l4 2"></path>
    </svg>
)

export default MyFletes
