import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Phone, DollarSign, ShieldCheck, Car, FileText, Upload, AlertTriangle, ChevronRight, Target, Map as MapIcon, Info, History, Activity, ChevronLeft, User } from 'lucide-react'
import { useDriverStore } from '../store/useDriverStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import FreightMap from '../components/map/FreightMap'
import ChatWidget from '../components/chat/ChatWidget'

const DriverDashboard = () => {
    const { user, profile, updateProfile, fetchProfile } = useAuthStore()
    const { availableFletes, activeFlete, loading: storeLoading, fetchAvailableFletes, fetchActiveFlete, acceptFlete, updateFleteStatus, subscribeToNewFletes, fetchDriverHistory } = useDriverStore()
    const navigate = useNavigate()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFleteId, setSelectedFleteId] = useState(null)
    const [completedHistory, setCompletedHistory] = useState([])
    const [activeTab, setActiveTab] = useState('marketplace') // marketplace, active, history
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

    // Live Tracking side-effect
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
        await updateFleteStatus(id, status)
        if (status === 'completed') {
            fetchDriverHistory(user.id).then(setCompletedHistory)
            setActiveTab('marketplace')
        }
    }

    const selectedFlete = activeFlete || availableFletes.find(f => f.id === selectedFleteId)

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    )

    // Verification Form (Mobile Optimized)
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

    // Pending Verification
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
        <div className="pb-24 pt-10 min-h-screen bg-black font-sans selection:bg-primary-500">
            <div className="container mx-auto px-6 max-w-md">

                {/* Driver Header */}
                <div className="flex justify-between items-center mb-8 pt-10">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">PANEL<br /><span className="text-primary-500">CHOFER</span></h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-zinc-700 uppercase italic mb-1">COMPLETADOS</p>
                        <p className="text-2xl font-black text-white italic">{completedHistory.length}</p>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-white/5 mb-8">
                    {[
                        { id: 'marketplace', label: 'PEDIDOS', icon: Truck },
                        { id: 'active', label: 'ACTUAL', icon: Activity },
                        { id: 'history', label: 'VIAJES', icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary-500 text-black' : 'text-zinc-600'}`}
                        >
                            <tab.icon className="w-4 h-4 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'marketplace' && (
                        <motion.div key="market" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            {availableFletes.length > 0 ? availableFletes.map((flete, idx) => (
                                <motion.div
                                    key={flete.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedFleteId(flete.id === selectedFleteId ? null : flete.id)}
                                    className={`glass-card p-6 border-zinc-900 bg-zinc-950/80 transition-all ${selectedFleteId === flete.id ? 'border-primary-500 bg-primary-500/10' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <Truck className={`w-6 h-6 ${selectedFleteId === flete.id ? 'text-primary-500' : 'text-zinc-800'}`} />
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-zinc-800 uppercase italic">ID: {flete.id.slice(0, 8)}</p>
                                            <p className="text-xl font-black text-white italic tracking-tighter">$ {flete.estimated_price}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-3 h-3 text-primary-500 shrink-0" />
                                            <p className="text-[10px] font-bold text-zinc-400 truncate italic uppercase">{flete.pickup_address}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Navigation className="w-3 h-1.5 text-secondary-500 shrink-0" />
                                            <p className="text-[10px] font-bold text-zinc-400 truncate italic uppercase">{flete.dropoff_address}</p>
                                        </div>
                                    </div>

                                    {selectedFleteId === flete.id && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={(e) => { e.stopPropagation(); handleAccept(flete.id); }}
                                            className="w-full py-4 bg-primary-500 text-black font-black italic text-[10px] uppercase rounded-xl"
                                        >
                                            ACEPTAR VIAJE
                                        </motion.button>
                                    )}
                                </motion.div>
                            )) : (
                                <div className="text-center py-20 grayscale opacity-20 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
                                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase italic tracking-widest">BUSCANDO PEDIDOS...</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'active' && (
                        <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            {activeFlete ? (
                                <div className="space-y-6">
                                    <div className="h-64 rounded-[2.5rem] overflow-hidden border-4 border-zinc-900 relative bg-zinc-900 shadow-2xl">
                                        <FreightMap
                                            pickup={{ address: activeFlete.pickup_address, lat: activeFlete.pickup_lat, lng: activeFlete.pickup_lng }}
                                            dropoff={{ address: activeFlete.dropoff_address, lat: activeFlete.dropoff_lat, lng: activeFlete.dropoff_lng }}
                                            autoDetectLocation={true}
                                            showActiveDrivers={false}
                                        />
                                        <div className="absolute top-4 left-4 p-3 bg-black/80 backdrop-blur-xl rounded-xl border border-white/5 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-white italic uppercase tracking-widest">{activeFlete.status}</span>
                                        </div>
                                    </div>

                                    <div className="glass-card p-8 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-black italic text-white uppercase italic truncate mr-4">{activeFlete.profiles?.full_name || "MUDANZA"}</h3>
                                            <p className="text-3xl font-black text-primary-500 italic tracking-tighter shrink-0">$ {activeFlete.estimated_price}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                                                <p className="text-[11px] font-black text-zinc-400 italic uppercase">#{activeFlete.pickup_address}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Navigation className="w-4 h-4 text-secondary-500 shrink-0" />
                                                <p className="text-[11px] font-black text-zinc-400 italic uppercase">#{activeFlete.dropoff_address}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            {activeFlete.status === 'accepted' && (
                                                <button onClick={() => handleStatusChange(activeFlete.id, 'picked_up')} className="premium-button flex-grow">A CARGAR</button>
                                            )}
                                            {activeFlete.status === 'picked_up' && (
                                                <button onClick={() => handleStatusChange(activeFlete.id, 'completed')} className="w-full py-5 bg-primary-500 text-black font-black italic text-[12px] uppercase rounded-2xl shadow-xl shadow-primary-500/20">ENTREGADO</button>
                                            )}
                                            <a href={`tel:${activeFlete.profiles?.phone || ''}`} className="p-5 bg-zinc-900 rounded-2xl border border-white/5 text-white">
                                                <Phone className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>

                                    <ChatWidget fleteId={activeFlete.id} receiverName={activeFlete.profiles?.full_name || "Cliente"} />
                                </div>
                            ) : (
                                <div className="text-center py-20 grayscale opacity-20 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
                                    <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase italic tracking-widest">SIN VIAJE ACTIVO</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                            {completedHistory.map((f) => (
                                <div key={f.id} className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 italic uppercase leading-tight mb-1">{f.dropoff_address}</p>
                                        <p className="text-[8px] font-black text-zinc-700 uppercase italic">{new Date(f.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-xl font-black text-white italic">$ {f.estimated_price}</p>
                                </div>
                            ))}
                            {completedHistory.length === 0 && (
                                <div className="text-center py-20 grayscale opacity-20 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
                                    <History className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase italic tracking-widest">HISTORIAL VACÍO</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default DriverDashboard
