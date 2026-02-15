import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Phone, DollarSign, ShieldCheck, Car, FileText, Upload, AlertTriangle, ChevronRight, Target, Map as MapIcon, Info, History } from 'lucide-react'
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
    const [activeTab, setActiveTab] = useState('marketplace') // marketplace, history
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

        // Force profile refresh to catch admin approvals
        fetchProfile(user.id)
    }, [user])

    useEffect(() => {
        if (profile?.role !== 'driver' && profile?.role !== 'admin') {
            // If they are not a driver, they shouldn't be here
            // Note: Admins can view it for testing
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
    }

    const handleStatusChange = async (id, status) => {
        await updateFleteStatus(id, status)
        if (status === 'completed') {
            fetchDriverHistory(user.id).then(setCompletedHistory)
        }
    }

    const selectedFlete = activeFlete || availableFletes.find(f => f.id === selectedFleteId)

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    )

    if (profile.verification_status === 'none') {
        return (
            <div className="pt-32 pb-12 min-h-screen bg-slate-950 px-6 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full glass-card p-12 bg-slate-900/60 border-white/5">
                    <header className="mb-12 text-center">
                        <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/20">
                            <Car className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4 text-white">Activar Unidad</h1>
                        <p className="text-slate-500 font-medium italic">Ingresa los datos de tu vehículo para empezar a operar.</p>
                    </header>
                    <form onSubmit={handleVerificationSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Modelo y Marca</label>
                                <input className="input-field py-4 bg-slate-950/40 border-white/5" placeholder="Ej: Toyota Hilux" value={formData.vehicle_model} onChange={e => setFormData({ ...formData, vehicle_model: e.target.value })} required />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Patente / Dominio</label>
                                <input className="input-field py-4 bg-slate-950/40 border-white/5 uppercase" placeholder="ABC 123" value={formData.license_plate} onChange={e => setFormData({ ...formData, license_plate: e.target.value })} required />
                            </div>
                            <div className="col-span-full space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">WhatsApp de contacto institucional</label>
                                <input className="input-field py-4 bg-slate-950/40 border-white/5" placeholder="+54 9 11 ..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="premium-button w-full py-5 italic font-black text-xs uppercase tracking-widest">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'ENVIAR PARA REVISIÓN'}
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    if (profile.verification_status === 'pending') {
        return (
            <div className="pt-32 pb-12 min-h-screen bg-slate-950 px-6 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
                    <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-amber-500/20">
                        <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white mb-6">EN REVISIÓN</h2>
                    <p className="text-slate-500 font-medium mb-12 italic leading-relaxed">Tu documentación está siendo procesada por auditoría. Recibirás acceso en cuanto sea validada.</p>
                    <button onClick={() => fetchProfile(user.id)} className="w-full bg-white/5 border border-white/10 text-slate-500 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:text-white hover:bg-white/10 transition-all">REFRESCAR ESTADO</button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="pt-24 pb-12 min-h-screen bg-slate-950">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase">Dashboard</h1>
                            <div className="px-4 py-1.5 bg-primary-600 rounded-full shadow-lg shadow-primary-600/20">
                                <span className="text-[10px] font-black text-white uppercase italic tracking-widest">UNIT-VERIFIED</span>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <button onClick={() => setActiveTab('marketplace')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'marketplace' ? 'text-primary-500 underline underline-offset-8' : 'text-slate-600 hover:text-slate-400'}`}>MARKETPLACE</button>
                            <button onClick={() => setActiveTab('history')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'history' ? 'text-primary-500 underline underline-offset-8' : 'text-slate-600 hover:text-slate-400'}`}>HISTORIAL COMPLETADOS</button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-900 px-8 py-4 rounded-3xl border border-white/5 text-right min-w-[160px]">
                            <p className="text-[10px] font-black text-slate-700 uppercase mb-1">Viajes</p>
                            <p className="text-3xl font-black text-white italic">{completedHistory.length}</p>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'marketplace' ? (
                        <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                            {/* Horizontal Marketplace Scroll */}
                            <section>
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-700">SOLICITUDES EN TIEMPO REAL</h2>
                                    <div className="h-[1px] flex-grow mx-8 bg-white/5" />
                                </div>
                                <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-none snap-x h-[320px]">
                                    {availableFletes.length > 0 ? availableFletes.map((flete) => (
                                        <motion.div
                                            key={flete.id}
                                            layoutId={flete.id}
                                            onClick={() => setSelectedFleteId(flete.id)}
                                            className={`flex-shrink-0 w-[400px] snap-start glass-card p-8 border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedFleteId === flete.id || activeFlete?.id === flete.id ? 'border-primary-500 bg-primary-500/5 shadow-2xl' : 'border-white/5 bg-slate-900/40 hover:border-white/10'}`}
                                        >
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center">
                                                    <Truck className="w-6 h-6 text-slate-500" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-700 uppercase mb-1">Monto Flete</p>
                                                    <p className="text-3xl font-black text-white italic tracking-tighter">${flete.estimated_price}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                                                    <p className="text-sm font-bold text-slate-300 line-clamp-1 italic">{flete.pickup_address}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Navigation className="w-4 h-4 text-secondary-500 shrink-0" />
                                                    <p className="text-sm font-bold text-slate-300 line-clamp-1 italic">{flete.dropoff_address}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="w-full bg-slate-900/10 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-600 italic">
                                            <Loader2 className="w-10 h-10 animate-spin opacity-20 mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest">Sin cargas disponibles en este momento</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Detailed Orientation & Map */}
                            <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
                                <div className="lg:col-span-1">
                                    <AnimatePresence mode="wait">
                                        {selectedFlete ? (
                                            <motion.div key={selectedFlete.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-10 h-full bg-slate-900/60 border-primary-500/20 flex flex-col">
                                                <div className="flex-grow space-y-10">
                                                    <header>
                                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest block mb-1">ID #{selectedFlete.id.slice(0, 8)}</span>
                                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Hoja de Ruta</h3>
                                                    </header>
                                                    <div className="space-y-6">
                                                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-white/5">
                                                            <span className="text-[10px] font-black text-slate-700 uppercase">CLIENTE</span>
                                                            <span className="text-xs font-black text-white uppercase italic">{selectedFlete.profiles?.full_name || "Usuario RapiFletes"}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-white/5">
                                                            <span className="text-[10px] font-black text-slate-700 uppercase">RECAUDACIÓN</span>
                                                            <span className="text-2xl font-black text-primary-400 italic">${selectedFlete.estimated_price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-12 space-y-4">
                                                    {selectedFlete.status === 'pending' ? (
                                                        <button onClick={() => handleAccept(selectedFlete.id)} className="premium-button w-full py-6 font-black italic tracking-widest text-xs uppercase shadow-2xl">ACEPTAR CARGA YA</button>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {selectedFlete.status === 'accepted' && <button onClick={() => handleStatusChange(selectedFlete.id, 'picked_up')} className="premium-button w-full py-6 font-black italic text-xs uppercase">CONFIRMAR RECOGIDA</button>}
                                                            {selectedFlete.status === 'picked_up' && <button onClick={() => handleStatusChange(selectedFlete.id, 'completed')} className="w-full py-6 bg-green-600 text-white font-black italic text-xs uppercase rounded-2xl shadow-xl shadow-green-600/20">ENTREGA FINALIZADA</button>}
                                                            <a href={`tel:${selectedFlete.profiles?.phone || ''}`} className="w-full block text-center py-5 bg-white text-black font-black italic text-[10px] uppercase rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest font-black">Llamar Cliente</a>
                                                            <button onClick={() => handleStatusChange(selectedFlete.id, 'cancelled')} className="w-full py-4 text-slate-600 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors font-black">CANCELAR MISIÓN</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="glass-card p-10 h-full bg-slate-900/10 border-white/5 flex flex-col items-center justify-center text-center opacity-30">
                                                <MapIcon className="w-16 h-16 text-slate-700 mb-6" />
                                                <h3 className="text-2xl font-black italic uppercase tracking-widest text-slate-700">Radar Inactivo</h3>
                                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2">Selecciona un pedido superior para ver la ruta táctica</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="lg:col-span-2 min-h-[500px] lg:h-auto rounded-[3.5rem] overflow-hidden border border-white/5 relative bg-slate-900 shadow-2xl">
                                    <FreightMap
                                        pickup={selectedFlete ? { address: selectedFlete.pickup_address, lat: selectedFlete.pickup_lat, lng: selectedFlete.pickup_lng } : null}
                                        dropoff={selectedFlete ? { address: selectedFlete.dropoff_address, lat: selectedFlete.dropoff_lat, lng: selectedFlete.dropoff_lng } : null}
                                        distance={selectedFlete?.distance}
                                        duration={selectedFlete?.duration}
                                    />
                                    <div className="absolute bottom-10 right-10 p-6 bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/10 text-right">
                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Estatus del GPS</p>
                                        <p className="text-xl font-black text-white italic tracking-tighter">SINCRONIZADO</p>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-4 bg-slate-900/40 border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-950/80 border-b border-white/5">
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">ID</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">Ruta Táctica</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">Monto</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">Fecha</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {completedHistory.map((f) => (
                                            <tr key={f.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-6 text-[10px] font-bold text-slate-500 tracking-tighter">#{f.id.slice(0, 8)}</td>
                                                <td className="p-6">
                                                    <p className="text-xs font-black text-white italic uppercase tracking-tighter mb-1 truncate max-w-[200px]">{f.pickup_address}</p>
                                                    <p className="text-[10px] text-slate-600 italic truncate max-w-[200px]">→ {f.dropoff_address}</p>
                                                </td>
                                                <td className="p-6 text-sm font-black italic text-primary-400">$ {f.estimated_price}</td>
                                                <td className="p-6 text-[10px] font-black text-slate-600 uppercase italic">{new Date(f.created_at).toLocaleDateString()}</td>
                                                <td className="p-6">
                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black uppercase italic rounded border border-green-500/20">COMPLETADO</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {completedHistory.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-20 text-center italic text-slate-700 font-black uppercase tracking-widest text-xs">Sin registros de viajes completados</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Widget for active flete */}
            {activeFlete && ['accepted', 'picked_up'].includes(activeFlete.status) && (
                <ChatWidget
                    fleteId={activeFlete.id}
                    receiverName={activeFlete.profiles?.full_name || "Cliente"}
                />
            )}
        </div>
    )
}

export default DriverDashboard
