import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, ChevronLeft, Package, AlertCircle, Phone, Star, ShieldCheck, Map as MapIcon, Calendar, DollarSign, Activity, XCircle, History as HistoryIcon, ArrowRight, User, Loader2 } from 'lucide-react'
import { useBookingStore } from '../store/useBookingStore'
import { useDriverStore } from '../store/useDriverStore'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'
import FreightMap from '../components/map/FreightMap'
import ChatWidget from '../components/chat/ChatWidget'

const MyFletes = () => {
    const { user, profile } = useAuthStore()
    const { fletes, fetchMyFletes, subscribeToFleteUpdates, cancelFlete, loading, error } = useBookingStore()
    const { fetchDriverHistory } = useDriverStore()
    const navigate = useNavigate()
    const [selectedFleteId, setSelectedFleteId] = useState(null)
    const [showDetail, setShowDetail] = useState(false)
    const [driverFletes, setDriverFletes] = useState([])

    const isDriver = profile?.role === 'driver'
    const displayFletes = isDriver ? driverFletes : fletes

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }

        // Wait for profile to load before fetching
        if (!profile) return

        if (isDriver) {
            // Fetch driver's completed trips
            fetchDriverHistory(user.id).then(data => setDriverFletes(data || []))
        } else {
            // Fetch client's trips
            fetchMyFletes(user.id)
            const channel = subscribeToFleteUpdates(user.id)
            return () => {
                if (channel) channel.unsubscribe()
            }
        }
    }, [user, profile?.role])

    const getStatusTheme = (status) => {
        switch (status) {
            case 'pending': return { color: 'text-primary-500', label: 'Buscando Unidad', icon: Clock, bg: 'bg-primary-500/10' }
            case 'accepted': return { color: 'text-secondary-500', label: 'Unidad Asignada', icon: Truck, bg: 'bg-secondary-500/10' }
            case 'picked_up': return { color: 'text-primary-400', label: 'En Tránsito', icon: Activity, bg: 'bg-primary-400/10' }
            case 'completed': return { color: 'text-green-500', label: 'Servicio Completado', icon: CheckCircle2, bg: 'bg-green-500/10' }
            case 'cancelled': return { color: 'text-red-500', label: 'Cancelado', icon: XCircle, bg: 'bg-red-500/10' }
            default: return { color: 'text-zinc-500', label: status, icon: Package, bg: 'bg-zinc-500/10' }
        }
    }

    const selectedFlete = displayFletes.find(f => f.id === selectedFleteId)

    const handleSelectFlete = (id) => {
        setSelectedFleteId(id)
        setShowDetail(true)
    }

    if (!user) return null

    // Show loading while profile is being fetched
    if (user && !profile) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-xs font-bold text-zinc-600 italic uppercase">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-24 pt-10 min-h-screen bg-black font-sans selection:bg-primary-500">
            <div className="container mx-auto px-6 max-w-md">

                <AnimatePresence mode="wait">
                    {!showDetail ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <header className="flex items-center gap-4 mb-10 pt-10">
                                <div className="p-3 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20">
                                    <HistoryIcon className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">MIS<br /><span className="text-primary-500">SERVICIOS</span></h1>
                                </div>
                            </header>

                            <div className="space-y-4">
                                {displayFletes.map((flete, idx) => {
                                    const theme = getStatusTheme(flete.status)
                                    return (
                                        <motion.div
                                            key={flete.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => handleSelectFlete(flete.id)}
                                            className="glass-card p-6 border-zinc-900 bg-zinc-950/80 active:scale-98 transition-transform cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded-xl bg-zinc-900 text-zinc-600 group-hover:text-primary-500 border border-white/5`}>
                                                    <theme.icon className="w-4 h-4" />
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full italic ${theme.bg} ${theme.color}`}>
                                                    {theme.label}
                                                </span>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-3 h-3 text-zinc-800 shrink-0" />
                                                    <p className="text-[10px] font-bold text-zinc-400 truncate italic uppercase">{flete.pickup_address}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Navigation className="w-3 h-3 text-zinc-800 shrink-0" />
                                                    <p className="text-[10px] font-bold text-zinc-400 truncate italic uppercase">{flete.dropoff_address}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end border-t border-zinc-900 pt-4">
                                                <p className="text-[8px] font-black text-zinc-800 uppercase italic"># {flete.id.slice(0, 8)}</p>
                                                <p className="text-xl font-black text-white italic tracking-tighter shadow-primary-500/10">${flete.estimated_price}</p>
                                            </div>
                                        </motion.div>
                                    )
                                })}

                                {fletes.length === 0 && !loading && (
                                    <div className="text-center py-20 bg-zinc-950/20 rounded-[2.5rem] border-2 border-dashed border-zinc-900 opacity-30">
                                        <Package className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">SIN SERVICIOS</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="pt-4"
                        >
                            <button
                                onClick={() => setShowDetail(false)}
                                className="flex items-center gap-2 text-primary-500 font-black italic uppercase text-[10px] mb-6 tracking-widest"
                            >
                                <ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO
                            </button>

                            {selectedFlete ? (
                                <div className="space-y-6">
                                    {/* Map HUD Style */}
                                    <div className="h-64 rounded-[2rem] overflow-hidden border-4 border-zinc-900 bg-zinc-900 relative shadow-2xl">
                                        <FreightMap
                                            pickup={{ address: selectedFlete.pickup_address, lat: selectedFlete.pickup_lat, lng: selectedFlete.pickup_lng }}
                                            dropoff={{ address: selectedFlete.dropoff_address, lat: selectedFlete.dropoff_lat, lng: selectedFlete.dropoff_lng }}
                                            distance={selectedFlete.distance}
                                            duration={selectedFlete.duration}
                                            enableLiveTracking={['accepted', 'picked_up'].includes(selectedFlete.status)}
                                            fleteId={selectedFlete.id}
                                        />
                                        <div className="absolute top-4 left-4 p-3 bg-black/80 backdrop-blur-xl rounded-xl border border-white/5 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                            <p className="text-[9px] font-black text-white italic uppercase">{getStatusTheme(selectedFlete.status).label}</p>
                                        </div>
                                    </div>

                                    {/* Info Card */}
                                    <div className="glass-card p-6 space-y-6">
                                        <div>
                                            <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-4 italic">DETALLES DE RUTA</h3>
                                            <div className="space-y-4">
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-1 shrink-0" />
                                                    <p className="text-[11px] font-black text-zinc-400 italic uppercase leading-snug">{selectedFlete.pickup_address}</p>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-3 h-3 bg-secondary-600 rounded-full mt-1 shrink-0" />
                                                    <p className="text-[11px] font-black text-zinc-400 italic uppercase leading-snug">{selectedFlete.dropoff_address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-zinc-900 pt-6">
                                            <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-4 italic">LOGÍSTICA Y TIEMPOS</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">PEDIDO</p>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-primary-500" />
                                                        <p className="text-[10px] font-black text-white italic uppercase">{new Date(selectedFlete.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">LLEGADA VEHÍCULO</p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-primary-500" />
                                                        <p className="text-[10px] font-black text-white italic uppercase">~{selectedFlete.vehicle_arrival_minutes || 10} MIN</p>
                                                    </div>
                                                </div>
                                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">TIEMPO VIAJE</p>
                                                    <div className="flex items-center gap-2">
                                                        <Navigation className="w-3 h-3 text-secondary-500" />
                                                        <p className="text-[10px] font-black text-white italic uppercase">{selectedFlete.duration} MIN</p>
                                                    </div>
                                                </div>
                                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">DISTANCIA</p>
                                                    <div className="flex items-center gap-2">
                                                        <MapIcon className="w-3 h-3 text-primary-500" />
                                                        <p className="text-[10px] font-black text-white italic uppercase">{selectedFlete.distance} KM</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedFlete.shipment_details && (
                                            <div className="border-t border-zinc-900 pt-6">
                                                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-2 italic">DETALLES DE ENVÍO</h3>
                                                <div className="bg-primary-500/5 p-4 rounded-2xl border border-primary-500/10">
                                                    <p className="text-[10px] font-bold text-zinc-300 italic uppercase leading-relaxed">{selectedFlete.shipment_details}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Client info for drivers */}
                                        {isDriver && selectedFlete.client && (
                                            <div className="border-t border-zinc-900 pt-6">
                                                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-4 italic">INFORMACIÓN DEL CLIENTE</h3>
                                                <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl border border-primary-500/20 flex items-center justify-center">
                                                        <User className="w-6 h-6 text-primary-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[11px] font-black text-white italic uppercase">{selectedFlete.client.full_name}</p>
                                                        <p className="text-[9px] font-bold text-zinc-600 italic">{selectedFlete.client.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-end pt-4 border-t border-zinc-900">
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-700 uppercase mb-1">{isDriver ? 'GANANCIA' : 'PRECIO TOTAL'}</p>
                                                <p className="text-4xl font-black text-primary-500 italic tracking-tighter">$ {selectedFlete.estimated_price}</p>
                                            </div>
                                            <p className="text-[9px] font-black text-zinc-600 italic uppercase">{selectedFlete.vehicle_categories?.name}</p>
                                        </div>
                                    </div>

                                    {/* Action Card */}
                                    {selectedFlete.driver ? (
                                        <div className="glass-card p-6 bg-zinc-900/50">
                                            <div className="flex items-center gap-6 mb-6">
                                                <div className="w-16 h-16 bg-black rounded-2xl border-2 border-primary-500 flex items-center justify-center overflow-hidden">
                                                    <Truck className="w-8 h-8 text-primary-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedFlete.driver.full_name}</p>
                                                    <p className="text-[9px] font-black text-primary-500 uppercase italic">Conductor Verificado</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`tel:${selectedFlete.driver.phone}`}
                                                className="premium-button w-full flex items-center justify-center gap-3 text-xs py-4"
                                            >
                                                <Phone className="w-5 h-5" /> CONTACTAR
                                            </a>
                                        </div>
                                    ) : selectedFlete.status !== 'cancelled' && selectedFlete.status !== 'completed' && (
                                        <div className="glass-card p-8 text-center flex flex-col items-center">
                                            <Clock className="w-10 h-10 text-primary-500 animate-spin-slow mb-4" />
                                            <p className="text-lg font-black italic uppercase text-white mb-2 tracking-tighter">BUSCANDO CHOFER</p>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('¿Desea cancelar el servicio?')) {
                                                        cancelFlete(selectedFlete.id)
                                                    }
                                                }}
                                                className="text-red-500 text-[10px] font-black uppercase underline mt-4 tracking-widest italic"
                                            >
                                                CANCELAR SOLICITUD
                                            </button>
                                        </div>
                                    )}

                                    {/* Chat Widget integrated if active */}
                                    {['accepted', 'picked_up'].includes(selectedFlete.status) && (
                                        <div className="pt-2">
                                            <ChatWidget
                                                fleteId={selectedFlete.id}
                                                receiverName={selectedFlete.driver?.full_name || "Conductor"}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-zinc-500 italic uppercase font-black text-sm mt-20">Servicio no encontrado</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

export default MyFletes
