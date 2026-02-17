import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Phone, DollarSign, ShieldCheck, Car, FileText, Upload, AlertTriangle, ChevronRight, Target, Map as MapIcon, Info, History, Activity, ChevronLeft, User, Search, X } from 'lucide-react'
import { useDriverStore } from '../store/useDriverStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import FreightMap from '../components/map/FreightMap'
import ChatWidget from '../components/chat/ChatWidget'
import TripTimer from '../components/trip/TripTimer'
import RatingModal from '../components/trip/RatingModal'

const DriverDashboard = () => {
    const { user, profile, updateProfile, fetchProfile } = useAuthStore()
    const { availableFletes, activeFlete, loading: storeLoading, fetchAvailableFletes, fetchActiveFlete, acceptFlete, updateFleteStatus, subscribeToNewFletes, fetchDriverHistory } = useDriverStore()
    const navigate = useNavigate()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFleteId, setSelectedFleteId] = useState(null)
    const [completedHistory, setCompletedHistory] = useState([])
    const [activeTab, setActiveTab] = useState('marketplace') // marketplace, active, history
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [completedTripId, setCompletedTripId] = useState(null)
    const [showPassengerConfirm, setShowPassengerConfirm] = useState(false)
    const [formData, setFormData] = useState({
        vehicle_model: '',
        vehicle_year: '',
        license_plate: '',
        phone: ''
    })

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }
        fetchProfile(user.id)
    }, [user])

    useEffect(() => {
        if (profile?.role !== 'driver' && profile?.role !== 'admin') {
            if (profile && profile.role !== 'admin') navigate('/')
        }

        if (profile?.verification_status === 'verified') {
            fetchAvailableFletes()
            fetchActiveFlete(user.id)
            fetchDriverHistory(user.id).then(setCompletedHistory)
            const channel = subscribeToNewFletes()
            return () => {
                if (channel) channel.unsubscribe()
            }
        }
    }, [profile?.verification_status])

    useEffect(() => {
        let watchId = null
        if (profile?.verification_status === 'verified' && activeFlete) {
            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords
                        useDriverStore.getState().updateLocation(user.id, latitude, longitude)
                    },
                    (err) => console.error("Error watching location", err),
                    { enableHighAccuracy: true, distanceFilter: 10 }
                )
            }
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [activeFlete, profile?.verification_status])

    useEffect(() => {
        if (activeFlete) setActiveTab('active')
    }, [activeFlete])

    const handleVerificationSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        const updates = {
            phone: formData.phone,
            license_plate: formData.license_plate,
            vehicle_details: {
                model: formData.vehicle_model,
                year: formData.vehicle_year
            },
            verification_status: 'pending'
        }
        await updateProfile(user.id, updates)
        setIsSubmitting(false)
        fetchProfile(user.id)
    }

    const handleAccept = async (id) => {
        await acceptFlete(id, user.id)
        setSelectedFleteId(null)
        setActiveTab('active')
    }


    const handleStatusChange = async (id, status) => {
        // Special handling for arrived_pickup - show passenger confirmation
        if (status === 'arrived_pickup') {
            setShowPassengerConfirm(true)
            return
        }

        // Special handling for completed - show rating modal
        if (status === 'completed') {
            await updateFleteStatus(id, status)
            setCompletedTripId(id)
            setShowRatingModal(true)
            fetchDriverHistory(user.id).then(setCompletedHistory)
            return
        }

        // Normal status updates
        await updateFleteStatus(id, status)
    }

    const handlePassengerConfirmation = async (passengerTravels) => {
        if (!activeFlete) return

        // Update passenger status and change to arrived_pickup
        await useDriverStore.getState().updatePassengerStatus(activeFlete.id, passengerTravels)
        await updateFleteStatus(activeFlete.id, 'arrived_pickup')
        setShowPassengerConfirm(false)
    }

    const handleRatingSubmit = async ({ rating, notes }) => {
        if (!completedTripId) return

        await useDriverStore.getState().submitDriverRating(completedTripId, rating, notes)
        setShowRatingModal(false)
        setCompletedTripId(null)
        setActiveTab('marketplace')
    }

    const currentFlete = activeFlete || availableFletes.find(f => f.id === selectedFleteId)

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    )

    if (profile.verification_status === 'none') {
        return (
            <div className="pb-24 pt-10 min-h-screen bg-black font-sans px-6">
                <div className="max-w-md mx-auto py-10">
                    <header className="mb-10">
                        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                            <Car className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">REGISTRO<br /><span className="text-primary-500">CONDUCTOR</span></h1>
                    </header>
                    <form onSubmit={handleVerificationSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Modelo / Marca</label>
                            <input className="input-field py-4" placeholder="EJ: SPRINTER 2024" value={formData.vehicle_model} onChange={e => setFormData({ ...formData, vehicle_model: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Patente</label>
                            <input className="input-field py-4 uppercase" placeholder="ABC-123-XY" value={formData.license_plate} onChange={e => setFormData({ ...formData, license_plate: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">WhatsApp</label>
                            <input className="input-field py-4" placeholder="+54 9 11 ..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="premium-button w-full py-5">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'ENVIAR SOLICITUD'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    if (profile.verification_status === 'pending') {
        return (
            <div className="pb-24 pt-10 min-h-screen bg-black font-sans px-6 flex flex-col items-center justify-center text-center">
                <Clock className="w-12 h-12 text-primary-500 animate-spin-slow mb-6" />
                <h2 className="text-3xl font-black italic uppercase text-white mb-2">AUDITORÍA<br />EN CURSO</h2>
                <p className="text-[11px] text-zinc-600 font-bold uppercase italic tracking-widest leading-relaxed max-w-xs">Estamos verificando tus datos. Te notificaremos pronto.</p>
                <button onClick={() => fetchProfile(user.id)} className="mt-10 text-primary-500 text-[10px] font-black uppercase underline italic tracking-widest">ACTUALIZAR ESTADO</button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans">
            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                <FreightMap
                    pickup={currentFlete ? { address: currentFlete.pickup_address, lat: currentFlete.pickup_lat, lng: currentFlete.pickup_lng } : null}
                    dropoff={currentFlete ? { address: currentFlete.dropoff_address, lat: currentFlete.dropoff_lat, lng: currentFlete.dropoff_lng } : null}
                    autoDetectLocation={true}
                    showActiveDrivers={false}
                />
            </div>

            {/* Overlays */}
            <div className="relative z-10 h-full pointer-events-none flex flex-col">
                {/* Header Overlay */}
                <div className="pt-16 px-6 pointer-events-auto">
                    <div className="max-w-md mx-auto flex justify-between items-center">
                        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/5">
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">PANEL<br /><span className="text-primary-500">CHOFER</span></h1>
                        </div>
                        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/5 text-right">
                            <p className="text-[8px] font-black text-zinc-500 uppercase italic leading-none mb-1">COMPLETADOS</p>
                            <p className="text-xl font-black text-white italic leading-none">{completedHistory.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow flex flex-col justify-end pb-48 px-4 pointer-events-auto">
                    <div className="max-w-md mx-auto w-full space-y-4">

                        {/* Tab Switcher (Floating) */}
                        <div className="flex bg-black/80 backdrop-blur-3xl p-1 rounded-2xl border border-white/5 mb-2 shadow-2xl">
                            {[
                                { id: 'marketplace', label: 'PEDIDOS', icon: Truck },
                                { id: 'active', label: 'ACTUAL', icon: Activity },
                                { id: 'history', label: 'VIAJES', icon: History }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-zinc-600 hover:text-white'}`}
                                >
                                    <tab.icon className="w-4 h-4 mb-1" />
                                    <span className="text-[8px] font-black uppercase tracking-tight">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'marketplace' && (
                                <motion.div
                                    key="market"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    className="max-h-[50vh] overflow-y-auto space-y-3 pb-4 scrollbar-none"
                                >
                                    {availableFletes.length > 0 ? availableFletes.map((flete, idx) => (
                                        <motion.div
                                            key={flete.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedFleteId(flete.id === selectedFleteId ? null : flete.id)}
                                            className={`glass-card p-5 border-white/5 bg-black/90 backdrop-blur-3xl transition-all cursor-pointer ${selectedFleteId === flete.id ? 'border-primary-500/50 ring-2 ring-primary-500/20' : ''}`}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${selectedFleteId === flete.id ? 'bg-primary-500 text-black' : 'bg-zinc-900 text-zinc-700'}`}>
                                                        <Truck className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">NUEVO PEDIDO</span>
                                                </div>
                                                <p className="text-xl font-black text-primary-500 italic">$ {flete.estimated_price}</p>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-3 h-3 text-primary-500 shrink-0" />
                                                    <p className="text-[10px] font-bold text-white truncate italic uppercase">{flete.pickup_address}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Navigation className="w-3 h-3 text-secondary-500 shrink-0" />
                                                    <p className="text-[10px] font-bold text-zinc-500 truncate italic uppercase">{flete.dropoff_address}</p>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {selectedFleteId === flete.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-4 mb-4"
                                                >
                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                                                        <div className="bg-zinc-900/50 px-2 py-2 rounded-xl text-center">
                                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DISTANCIA</p>
                                                            <p className="text-[10px] font-black text-white italic">{flete.distance} km</p>
                                                        </div>
                                                        <div className="bg-zinc-900/50 px-2 py-2 rounded-xl text-center">
                                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DURACIÓN</p>
                                                            <p className="text-[10px] font-black text-white italic">{flete.duration} min</p>
                                                        </div>
                                                        <div className="bg-zinc-900/50 px-2 py-2 rounded-xl text-center">
                                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">VEHÍCULO</p>
                                                            <p className="text-[9px] font-black text-white italic truncate">{flete.vehicle_categories?.name || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Client Info */}
                                                    {flete.profiles && (
                                                        <div className="bg-primary-500/5 p-3 rounded-xl border border-primary-500/10">
                                                            <p className="text-[7px] font-black text-primary-500 uppercase mb-1">CLIENTE</p>
                                                            <p className="text-[10px] font-bold text-white italic uppercase">{flete.profiles.full_name}</p>
                                                        </div>
                                                    )}

                                                    {/* Shipment Details */}
                                                    {flete.shipment_details && (
                                                        <div className="bg-secondary-500/5 p-3 rounded-xl border border-secondary-500/10">
                                                            <p className="text-[7px] font-black text-secondary-500 uppercase mb-1">DETALLES DE CARGA</p>
                                                            <p className="text-[9px] font-bold text-zinc-300 italic uppercase leading-tight">{flete.shipment_details}</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {selectedFleteId === flete.id && (
                                                <motion.button
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    onClick={(e) => { e.stopPropagation(); handleAccept(flete.id); }}
                                                    className="premium-button w-full py-4 text-[11px]"
                                                >
                                                    ACEPTAR VIAJE
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    )) : (
                                        <div className="text-center py-20 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-zinc-800" />
                                            <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-700">BUSCANDO PEDIDOS...</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'active' && (
                                <motion.div key="active" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="space-y-4">
                                    {activeFlete ? (
                                        <>
                                            {/* Trip Details Card */}
                                            <div className="glass-card p-6 bg-black/90 backdrop-blur-3xl border-primary-500/20 shadow-2xl space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                                        <span className="text-[11px] font-black text-primary-500 uppercase italic tracking-widest">VIAJE EN CURSO</span>
                                                    </div>
                                                    <span className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-[9px] font-bold text-zinc-500 uppercase italic">{activeFlete.status}</span>
                                                </div>

                                                <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                                                            <User className="w-5 h-5 text-zinc-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-black italic text-white uppercase">{activeFlete.profiles?.full_name || "MUDANZA"}</h3>
                                                            <p className="text-[9px] font-black text-zinc-500 italic">CLIENTE</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-3xl font-black text-primary-500 italic tracking-tighter shrink-0">$ {activeFlete.estimated_price}</p>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-4 p-3 bg-zinc-950/50 rounded-xl">
                                                        <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] font-black text-zinc-300 italic uppercase leading-tight">{activeFlete.pickup_address}</p>
                                                    </div>
                                                    <div className="flex items-start gap-4 p-3 bg-zinc-950/50 rounded-xl">
                                                        <Navigation className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] font-black text-zinc-300 italic uppercase leading-tight">{activeFlete.dropoff_address}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-zinc-900 px-4 py-3 rounded-xl">
                                                        <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">PEDIDO</p>
                                                        <p className="text-[10px] font-black text-white italic uppercase">{new Date(activeFlete.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <div className="bg-zinc-900 px-4 py-3 rounded-xl">
                                                        <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">DURACIÓN</p>
                                                        <p className="text-[10px] font-black text-white italic uppercase">{activeFlete.duration} MIN</p>
                                                    </div>
                                                </div>

                                                {activeFlete.shipment_details && (
                                                    <div className="bg-primary-500/5 p-4 rounded-xl border border-primary-500/10">
                                                        <p className="text-[7px] font-black text-primary-500 uppercase mb-1">DETALLES DE CARGA</p>
                                                        <p className="text-[10px] font-bold text-zinc-300 italic uppercase leading-tight">{activeFlete.shipment_details}</p>
                                                    </div>
                                                )}

                                                {/* Trip Timer - Shows when at pickup location */}
                                                {activeFlete.status === 'arrived_pickup' && activeFlete.trip_start_time && (
                                                    <TripTimer startTime={activeFlete.trip_start_time} />
                                                )}
                                            </div>

                                            {/* Action Buttons Card - Separate and clearly visible */}
                                            <div className="glass-card p-5 bg-black/95 backdrop-blur-3xl border-white/10 shadow-2xl space-y-3">
                                                {/* Navigation Button */}
                                                {(activeFlete.status === 'accepted' || activeFlete.status === 'arrived_pickup' || activeFlete.status === 'in_transit') && (
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${activeFlete.status === 'accepted' ? activeFlete.pickup_lat : activeFlete.dropoff_lat
                                                            },${activeFlete.status === 'accepted' ? activeFlete.pickup_lng : activeFlete.dropoff_lng
                                                            }&travelmode=driving`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 w-full py-4 bg-secondary-500 text-black font-black italic text-[11px] uppercase rounded-2xl shadow-xl shadow-secondary-500/20 hover:bg-secondary-400 transition-colors"
                                                    >
                                                        <Navigation className="w-5 h-5" />
                                                        {activeFlete.status === 'accepted' ? 'IR AL ORIGEN' : 'IR AL DESTINO'}
                                                    </a>
                                                )}

                                                {/* ACCEPTED - Go to pickup */}
                                                {activeFlete.status === 'accepted' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(activeFlete.id, 'arrived_pickup')}
                                                            className="premium-button w-full py-5 text-[11px]"
                                                        >
                                                            📍 ARRIBÉ AL ORIGEN
                                                        </button>
                                                        <a
                                                            href={`tel:${activeFlete.profiles?.phone || ''}`}
                                                            className="flex items-center justify-center gap-2 w-full p-4 bg-zinc-900 rounded-2xl border border-white/5 text-white shadow-xl hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase italic">LLAMAR CLIENTE</span>
                                                        </a>
                                                    </>
                                                )}

                                                {/* ARRIVED_PICKUP - Start trip */}
                                                {activeFlete.status === 'arrived_pickup' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(activeFlete.id, 'in_transit')}
                                                            className="w-full py-5 bg-primary-500 text-black font-black italic text-[12px] uppercase rounded-2xl shadow-xl shadow-primary-500/20"
                                                        >
                                                            🚀 INICIAR VIAJE
                                                        </button>
                                                        <a
                                                            href={`tel:${activeFlete.profiles?.phone || ''}`}
                                                            className="flex items-center justify-center gap-2 w-full p-4 bg-zinc-900 rounded-2xl border border-white/5 text-white shadow-xl hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase italic">LLAMAR CLIENTE</span>
                                                        </a>
                                                    </>
                                                )}

                                                {/* IN_TRANSIT - Arrive at destination */}
                                                {activeFlete.status === 'in_transit' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(activeFlete.id, 'arrived_dropoff')}
                                                            className="premium-button w-full py-5 text-[11px]"
                                                        >
                                                            🎯 LLEGAMOS A DESTINO
                                                        </button>
                                                        <a
                                                            href={`tel:${activeFlete.profiles?.phone || ''}`}
                                                            className="flex items-center justify-center gap-2 w-full p-4 bg-zinc-900 rounded-2xl border border-white/5 text-white shadow-xl hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase italic">LLAMAR CLIENTE</span>
                                                        </a>
                                                    </>
                                                )}

                                                {/* ARRIVED_DROPOFF - Complete trip */}
                                                {activeFlete.status === 'arrived_dropoff' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(activeFlete.id, 'completed')}
                                                            className="w-full py-5 bg-primary-500 text-black font-black italic text-[12px] uppercase rounded-2xl shadow-xl shadow-primary-500/20"
                                                        >
                                                            ✅ FINALIZAR VIAJE
                                                        </button>
                                                        <a
                                                            href={`tel:${activeFlete.profiles?.phone || ''}`}
                                                            className="flex items-center justify-center gap-2 w-full p-4 bg-zinc-900 rounded-2xl border border-white/5 text-white shadow-xl hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase italic">LLAMAR CLIENTE</span>
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-20 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                                            <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-700">SIN VIAJE ACTIVO</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'history' && (
                                <motion.div key="history" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="max-h-[50vh] overflow-y-auto space-y-3 pb-4 scrollbar-none">
                                    {completedHistory.map((f) => (
                                        <div key={f.id} className="p-5 bg-black/90 backdrop-blur-3xl border border-white/5 rounded-2xl space-y-4">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="w-3 h-3 text-primary-500" />
                                                        <p className="text-[11px] font-black text-white italic uppercase">{f.client?.full_name || 'Cliente'}</p>
                                                    </div>
                                                    <p className="text-[8px] font-black text-zinc-600 uppercase italic">{new Date(f.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">GANANCIA</p>
                                                    <p className="text-2xl font-black text-primary-500 italic">$ {f.estimated_price}</p>
                                                </div>
                                            </div>

                                            {/* Route Details */}
                                            <div className="space-y-2 border-t border-white/5 pt-3">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-3 h-3 text-primary-500 shrink-0 mt-0.5" />
                                                    <p className="text-[9px] font-bold text-zinc-400 italic uppercase leading-tight">{f.pickup_address}</p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Navigation className="w-3 h-3 text-secondary-500 shrink-0 mt-0.5" />
                                                    <p className="text-[9px] font-bold text-zinc-400 italic uppercase leading-tight">{f.dropoff_address}</p>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                                                <div className="bg-zinc-900/50 px-3 py-2 rounded-xl text-center">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DISTANCIA</p>
                                                    <p className="text-[10px] font-black text-white italic">{f.distance} km</p>
                                                </div>
                                                <div className="bg-zinc-900/50 px-3 py-2 rounded-xl text-center">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DURACIÓN</p>
                                                    <p className="text-[10px] font-black text-white italic">{f.duration} min</p>
                                                </div>
                                                <div className="bg-zinc-900/50 px-3 py-2 rounded-xl text-center">
                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">VEHÍCULO</p>
                                                    <p className="text-[10px] font-black text-white italic truncate">{f.vehicle_categories?.name || 'N/A'}</p>
                                                </div>
                                            </div>

                                            {/* Shipment Details if available */}
                                            {f.shipment_details && (
                                                <div className="bg-primary-500/5 px-4 py-3 rounded-xl border border-primary-500/10">
                                                    <p className="text-[7px] font-black text-primary-500 uppercase mb-1">DETALLES DE CARGA</p>
                                                    <p className="text-[9px] font-bold text-zinc-300 italic uppercase leading-tight">{f.shipment_details}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {completedHistory.length === 0 && (
                                        <div className="text-center py-20 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                                            <History className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-700">HISTORIAL VACÍO</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Chat Widget integrated into the flow if active voyage */}
            {activeFlete && ['accepted', 'arrived_pickup', 'in_transit', 'arrived_dropoff'].includes(activeFlete.status) && (
                <div className="fixed bottom-32 right-6 z-50 pointer-events-auto">
                    <ChatWidget fleteId={activeFlete.id} receiverName={activeFlete.profiles?.full_name || "Cliente"} />
                </div>
            )}

            {/* Passenger Confirmation Modal */}
            <AnimatePresence>
                {showPassengerConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPassengerConfirm(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-950 border border-white/10 rounded-3xl p-6 z-50 shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">
                                    ¿EL CLIENTE VIAJA?
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase italic">
                                    Confirma si el cliente viaja con la carga
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handlePassengerConfirmation(true)}
                                    className="py-4 bg-primary-500 text-black font-black italic text-[11px] uppercase rounded-xl hover:bg-primary-400 transition-colors"
                                >
                                    👤 SÍ, VIAJA
                                </button>
                                <button
                                    onClick={() => handlePassengerConfirmation(false)}
                                    className="py-4 bg-zinc-900 text-white font-black italic text-[11px] uppercase rounded-xl hover:bg-zinc-800 transition-colors"
                                >
                                    📦 SOLO CARGA
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => {
                    setShowRatingModal(false)
                    setCompletedTripId(null)
                    setActiveTab('marketplace')
                }}
                onSubmit={handleRatingSubmit}
                title="¿CÓMO FUE EL VIAJE?"
                subtitle="Califica tu experiencia con el cliente"
            />

            {/* Background elements */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none z-[5]" />
        </div>
    )
}

export default DriverDashboard
