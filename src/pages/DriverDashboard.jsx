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
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
        </div>
    )

    if (profile.verification_status === 'none') {
        return (
            <div className="pt-32 pb-12 min-h-screen bg-black px-6 flex items-center justify-center font-sans relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 blur-[120px] rounded-full animate-float" />

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full glass-card p-16 bg-zinc-950/60 border-zinc-900 shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative z-10">
                    <header className="mb-16 text-center">
                        <div className="w-24 h-24 bg-primary-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                            <Car className="w-12 h-12 text-black" />
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-6 text-white leading-none">REGISTRO DE<br /><span className="text-primary-500">CONDUCTOR</span></h1>
                        <p className="text-zinc-500 font-bold italic uppercase tracking-tight">Registro profesional de conductor y vehículo</p>
                    </header>
                    <form onSubmit={handleVerificationSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 px-4 italic">01. MODELO / MARCA</label>
                                <input className="input-field" placeholder="EJ: MERCEDEZ SPRINTER 2024" value={formData.vehicle_model} onChange={e => setFormData({ ...formData, vehicle_model: e.target.value })} required />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 px-4 italic">02. DOMINIO / PATENTE</label>
                                <input className="input-field uppercase" placeholder="ABC-123-XY" value={formData.license_plate} onChange={e => setFormData({ ...formData, license_plate: e.target.value })} required />
                            </div>
                            <div className="col-span-full space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 px-4 italic">03. CANAL DE COMUNICACIÓN (WHATSAPP)</label>
                                <input className="input-field" placeholder="+54 9 11 0000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="premium-button w-full">
                            {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'ENVIAR SOLICITUD'}
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    if (profile.verification_status === 'pending') {
        return (
            <div className="pt-32 pb-12 min-h-screen bg-black px-6 flex items-center justify-center font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-500/2 opacity-10 pointer-events-none" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-center glass-card p-20 bg-zinc-950/80 border-zinc-900 shadow-2xl">
                    <div className="w-32 h-32 bg-zinc-900 rounded-[3rem] flex items-center justify-center mx-auto mb-12 border-2 border-primary-500/20">
                        <Clock className="w-16 h-16 text-primary-500 animate-spin-slow" />
                    </div>
                    <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white mb-8 leading-none">AUDITORÍA<br /><span className="text-zinc-800">EN PROCESO</span></h2>
                    <p className="text-zinc-500 font-bold italic mb-16 uppercase tracking-tight leading-relaxed max-w-sm mx-auto">Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos cuando estés aprobado.</p>
                    <button onClick={() => fetchProfile(user.id)} className="w-full bg-zinc-900 border-2 border-white/5 text-zinc-500 py-6 rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase hover:text-white hover:border-primary-500/50 transition-all italic">ACTUALIZAR ESTADO</button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="pt-32 pb-12 min-h-screen bg-black font-sans">
            <div className="container mx-auto px-10 max-w-[1700px]">

                {/* Dashboard Control Bar */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
                    <div>
                        <div className="flex items-center gap-6 mb-6">
                            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">PANEL CONDUCTOR</h1>
                            <div className="px-5 py-2 bg-primary-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                <span className="text-[10px] font-black text-black uppercase italic tracking-[0.2em]">CONDUCTOR VERIFICADO</span>
                            </div>
                        </div>
                        <div className="flex gap-10">
                            {[
                                { id: 'marketplace', label: 'MARKETPLACE' },
                                { id: 'history', label: 'HISTORIAL DE SERVICIOS' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`text-xs font-black uppercase tracking-[0.4em] transition-all relative py-2 italic ${activeTab === tab.id ? 'text-primary-500' : 'text-zinc-700 hover:text-zinc-400'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-1 bg-primary-500 rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="bg-zinc-950 px-10 py-6 rounded-[2.5rem] border border-zinc-900 text-right min-w-[200px] shadow-2xl">
                            <p className="text-[10px] font-black text-zinc-800 uppercase italic tracking-widest mb-2">SERVICIOS COMPLETADOS</p>
                            <p className="text-5xl font-black text-white italic tracking-tighter leading-none">{completedHistory.length} <span className="text-xs text-zinc-700 not-italic uppercase">OK</span></p>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'marketplace' ? (
                        <motion.div key="market" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
                            {/* Horizontal Marketplace Scroll */}
                            <section>
                                <div className="flex items-center justify-between mb-10 px-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-800 italic">SERVICIOS DISPONIBLES</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">REAL-TIME DATA REDACTED</span>
                                    </div>
                                </div>
                                <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-none snap-x h-[360px]">
                                    {availableFletes.length > 0 ? availableFletes.map((flete, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={flete.id}
                                            onClick={() => setSelectedFleteId(flete.id)}
                                            className={`flex-shrink-0 w-[450px] snap-start glass-card p-10 border-2 transition-all duration-500 cursor-pointer flex flex-col justify-between relative overflow-hidden ${selectedFleteId === flete.id || activeFlete?.id === flete.id ? 'border-primary-500 bg-primary-500/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] scale-[0.98]' : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center border transition-all duration-500 ${selectedFleteId === flete.id ? 'bg-primary-500 text-black border-transparent shadow-xl' : 'bg-black text-zinc-700 border-white/5'}`}>
                                                    <Truck className="w-8 h-8" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-zinc-800 uppercase italic tracking-widest mb-1">GANANCIA</p>
                                                    <p className="text-4xl font-black text-white italic tracking-tighter">$ {flete.estimated_price}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-5">
                                                    <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                                                    <p className="text-xs font-black text-zinc-500 line-clamp-1 italic uppercase tracking-tight">{flete.pickup_address}</p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <Navigation className="w-5 h-5 text-secondary-600 shrink-0" />
                                                    <p className="text-xs font-black text-zinc-500 line-clamp-1 italic uppercase tracking-tight">{flete.dropoff_address}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="w-full bg-zinc-950/40 rounded-[4rem] border-4 border-dashed border-zinc-900 flex flex-col items-center justify-center text-zinc-800 italic p-20 grayscale opacity-20">
                                            <Loader2 className="w-20 h-20 animate-spin mb-8" />
                                            <p className="text-xl font-black uppercase tracking-[0.4em]">ESPERANDO NUEVAS CARGAS EN TU SECTOR</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Detailed Orientation & Map */}
                            <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch min-h-[700px]">
                                <div className="lg:col-span-1 h-full">
                                    <AnimatePresence mode="wait">
                                        {selectedFlete ? (
                                            <motion.div key={selectedFlete.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-12 h-full bg-zinc-950 border-primary-500/20 flex flex-col shadow-[0_45px_100px_rgba(0,0,0,0.9)]">
                                                <div className="flex-grow space-y-12">
                                                    <header>
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <span className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                                                            <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] italic leading-none">SERVICIO #{selectedFlete.id.slice(0, 8)}</span>
                                                        </div>
                                                        <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">DETALLES<br /><span className="text-primary-500">DEL VIAJE</span></h3>
                                                    </header>

                                                    <div className="space-y-8">
                                                        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3">
                                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic leading-none">CLIENTE</p>
                                                            <p className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedFlete.profiles?.full_name || "CLIENTE EXTERNO"}</p>
                                                        </div>
                                                        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3">
                                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic leading-none">PAGO DEL SERVICIO</p>
                                                            <p className="text-4xl font-black text-primary-500 italic tracking-tighter leading-none">$ {selectedFlete.estimated_price}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-16 space-y-6">
                                                    {selectedFlete.status === 'pending' ? (
                                                        <button onClick={() => handleAccept(selectedFlete.id)} className="premium-button w-full shadow-2xl shadow-primary-500/30">
                                                            ACEPTAR SERVICIO
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            {selectedFlete.status === 'accepted' && (
                                                                <button onClick={() => handleStatusChange(selectedFlete.id, 'picked_up')} className="premium-button w-full">REGISTRAR CARGA</button>
                                                            )}
                                                            {selectedFlete.status === 'picked_up' && (
                                                                <button onClick={() => handleStatusChange(selectedFlete.id, 'completed')} className="w-full py-6 bg-primary-500 text-black font-black italic text-sm uppercase rounded-[2rem] shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02]">
                                                                    FINALIZAR ENTREGA
                                                                </button>
                                                            )}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <a href={`tel:${selectedFlete.profiles?.phone || ''}`} className="py-5 bg-zinc-900 border border-white/5 text-white font-black italic text-[9px] uppercase rounded-[1.5rem] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 tracking-[0.2em] shadow-xl">
                                                                    <Phone className="w-4 h-4" /> LLAMAR
                                                                </a>
                                                                <button onClick={() => handleStatusChange(selectedFlete.id, 'cancelled')} className="py-5 border-2 border-red-500/20 text-red-500/50 font-black text-[9px] uppercase rounded-[1.5rem] hover:border-red-500 hover:text-red-500 transition-all tracking-[0.2em] italic">CANCELAR</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="glass-card p-20 h-full bg-zinc-950/20 border-zinc-900 border-dashed border-4 flex flex-col items-center justify-center text-center opacity-10">
                                                <Target className="w-24 h-24 text-zinc-800 mb-8" />
                                                <h3 className="text-4xl font-black italic uppercase tracking-widest text-zinc-800 leading-none">SELECCIONE<br />UN SERVICIO</h3>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="lg:col-span-2 min-h-[600px] lg:h-auto rounded-[4rem] overflow-hidden border-8 border-zinc-950 relative bg-zinc-900 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
                                    <FreightMap
                                        pickup={selectedFlete ? { address: selectedFlete.pickup_address, lat: selectedFlete.pickup_lat, lng: selectedFlete.pickup_lng } : null}
                                        dropoff={selectedFlete ? { address: selectedFlete.dropoff_address, lat: selectedFlete.dropoff_lat, lng: selectedFlete.dropoff_lng } : null}
                                        distance={selectedFlete?.distance}
                                        duration={selectedFlete?.duration}
                                    />

                                    {/* Map Overlays */}
                                    <div className="absolute top-10 right-10 flex flex-col gap-4">
                                        <div className="bg-black/90 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] flex flex-col items-end gap-2 shadow-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                                <span className="text-[10px] font-black text-white italic tracking-[0.3em] leading-none uppercase">SAT-FEED LIVE</span>
                                            </div>
                                            <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest italic">ENCRYPTION: AES-256</p>
                                        </div>
                                    </div>

                                    {selectedFlete && (
                                        <div className="absolute bottom-10 left-10 p-8 bg-black/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 border-l-8 border-l-primary-500 shadow-2xl max-w-sm">
                                            <div className="flex gap-6 items-center flex-col md:flex-row">
                                                <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center shrink-0 border border-white/5">
                                                    <Navigation className="w-8 h-8 text-primary-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2 leading-none">DISTANCIA Y TIEMPO</p>
                                                    <p className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">
                                                        {selectedFlete.distance ? `${selectedFlete.distance.toFixed(1)} KM` : '-- KM'}
                                                        <span className="mx-3 text-zinc-800">|</span>
                                                        {selectedFlete.duration ? `${selectedFlete.duration.toFixed(0)} MIN` : '-- MIN'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div key="history" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card bg-zinc-950 border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-zinc-950 border-b border-zinc-900">
                                            <th className="p-10 text-[10px] font-black uppercase text-zinc-800 tracking-[0.4em] italic">ID SERVICIO</th>
                                            <th className="p-10 text-[10px] font-black uppercase text-zinc-800 tracking-[0.4em] italic">LOGÍSTICA / RUTA</th>
                                            <th className="p-10 text-[10px] font-black uppercase text-zinc-800 tracking-[0.4em] italic text-right">GANANCIA</th>
                                            <th className="p-10 text-[10px] font-black uppercase text-zinc-800 tracking-[0.4em] italic text-right">FECHA</th>
                                            <th className="p-10 text-[10px] font-black uppercase text-zinc-800 tracking-[0.4em] italic text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900">
                                        {completedHistory.map((f) => (
                                            <tr key={f.id} className="hover:bg-primary-500/[0.02] transition-colors group">
                                                <td className="p-10 text-[10px] font-black text-zinc-700 tracking-[0.2em] italic group-hover:text-primary-500/50 transition-colors">#{f.id.slice(0, 8)}</td>
                                                <td className="p-10">
                                                    <p className="text-sm font-black text-zinc-400 italic uppercase tracking-tight mb-2 truncate max-w-[250px]">{f.pickup_address}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-primary-500 transition-colors" />
                                                        <p className="text-[10px] text-zinc-700 italic truncate max-w-[250px] uppercase font-bold tracking-tight">RUTA COMPLETADA → {f.dropoff_address}</p>
                                                    </div>
                                                </td>
                                                <td className="p-10 text-right">
                                                    <span className="text-3xl font-black italic text-white group-hover:text-primary-500 transition-colors tracking-tighter shadow-primary-500/10">$ {f.estimated_price}</span>
                                                </td>
                                                <td className="p-10 text-right text-[10px] font-black text-zinc-700 uppercase italic tracking-widest">{new Date(f.created_at).toLocaleDateString()}</td>
                                                <td className="p-10 text-center">
                                                    <span className="px-4 py-2 bg-zinc-900 text-green-500 text-[10px] font-black uppercase italic rounded-full border border-green-500/20 group-hover:border-green-500 group-hover:bg-green-500/10 transition-all tracking-[0.2em]">SUCCESS</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {completedHistory.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-32 text-center italic text-zinc-800 font-black uppercase tracking-[0.6em] text-xs grayscale opacity-20">ÁREA SIN REGISTROS DE VIAJES COMPLETADOS</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Widget Floating Refined */}
            {activeFlete && ['accepted', 'picked_up'].includes(activeFlete.status) && (
                <div className="fixed bottom-12 right-12 z-[2000]">
                    <ChatWidget
                        fleteId={activeFlete.id}
                        receiverName={activeFlete.profiles?.full_name || "Cliente"}
                    />
                </div>
            )}
        </div>
    )
}

export default DriverDashboard
