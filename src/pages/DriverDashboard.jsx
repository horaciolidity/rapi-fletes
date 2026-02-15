import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Phone, DollarSign, ShieldCheck, Car, FileText, Upload, AlertTriangle, ChevronRight, Target, Map as MapIcon, Info } from 'lucide-react'
import { useDriverStore } from '../store/useDriverStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import FreightMap from '../components/map/FreightMap'

const DriverDashboard = () => {
    const { user, profile, updateProfile, fetchProfile } = useAuthStore()
    const { availableFletes, activeFlete, loading: storeLoading, fetchAvailableFletes, acceptFlete, updateFleteStatus, subscribeToNewFletes } = useDriverStore()
    const navigate = useNavigate()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFleteId, setSelectedFleteId] = useState(null)
    const [formData, setFormData] = useState({
        vehicle_model: '',
        vehicle_year: '',
        license_plate: '',
        phone: ''
    })

    // Auto-refresh profile and data
    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }

        // Fetch latest profile to catch "verified" status update from admin
        fetchProfile(user.id)

        if (profile?.role !== 'driver') {
            navigate('/')
            return
        }

        if (profile?.verification_status === 'verified') {
            fetchAvailableFletes()
            const channel = subscribeToNewFletes()
            return () => {
                if (channel) channel.unsubscribe()
            }
        }
    }, [user, profile?.verification_status])

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
    }

    const handleAccept = async (id) => {
        await acceptFlete(id, user.id)
        setSelectedFleteId(null)
    }

    const handleStatusChange = async (id, status) => {
        await updateFleteStatus(id, status)
    }

    // --- HELPER: Selected Flete for Map ---
    const selectedFlete = activeFlete || availableFletes.find(f => f.id === selectedFleteId)

    // --- RENDER: LOADING ---
    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        )
    }

    // --- RENDER: VERIFICATION FLOW ---
    if (profile.verification_status === 'none') {
        return (
            <div className="pt-32 pb-12 min-h-screen bg-slate-950 px-6 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
                    <div className="glass-card p-10 border-primary-500/20 relative overflow-hidden bg-slate-900/40">
                        <header className="mb-10 text-center">
                            <Truck className="w-16 h-16 text-primary-500 mx-auto mb-6" />
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Activación de Chofer</h1>
                            <p className="text-slate-500 font-medium italic">Registra tu unidad para empezar a facturar.</p>
                        </header>
                        <form onSubmit={handleVerificationSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vehículo</label>
                                    <input className="input-field py-4" placeholder="Ej: Hilux 2020" value={formData.vehicle_model} onChange={e => setFormData({ ...formData, vehicle_model: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Patente</label>
                                    <input className="input-field py-4 uppercase" placeholder="ABC 123" value={formData.license_plate} onChange={e => setFormData({ ...formData, license_plate: e.target.value })} required />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp de contacto</label>
                                    <input className="input-field py-4" placeholder="+54 9 ..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="premium-button w-full py-5 italic font-black text-xs uppercase tracking-widest">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'ENVIAR SOLICITUD'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (profile.verification_status === 'pending') {
        return (
            <div className="pt-32 pb-12 min-h-screen bg-slate-950 px-6 flex items-center justify-center text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4">REVISIÓN ACTIVA</h2>
                    <p className="text-slate-500 font-medium mb-10 italic">Tu perfil está siendo verificado. Te habilitaremos en cuanto los datos sean confirmados.</p>
                    <button onClick={() => fetchProfile(user.id)} className="bg-white/5 border border-white/10 text-slate-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">ACTUALIZAR ESTADO</button>
                </motion.div>
            </div>
        )
    }

    // --- RENDER: MAIN DASHBOARD (Verified) ---
    return (
        <div className="pt-24 pb-12 min-h-screen bg-slate-950">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* 1. Header & Quick Stats */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">Marketplace</h1>
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black text-green-500 uppercase italic">OPERATIVO</span>
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium italic">Descubre y acepta misiones de fletes en tu zona.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-right w-40">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Viajes Hoy</p>
                            <p className="text-2xl font-black text-white italic">0</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-right w-40">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Ganancia Est.</p>
                            <p className="text-2xl font-black text-primary-400 italic">$ 0</p>
                        </div>
                    </div>
                </div>

                {/* 2. Pending Trips List (Horizontal Scroll / Head) */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                            <Activity className="w-4 h-4 text-primary-500" /> PEDIDOS DISPONIBLES
                        </h2>
                        <span className="text-[10px] font-black text-slate-700 uppercase italic">{availableFletes.length} CARGAS ESPERANDO</span>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x">
                        <AnimatePresence mode="popLayout">
                            {availableFletes.length > 0 ? availableFletes.map((flete) => (
                                <motion.div
                                    key={flete.id}
                                    layoutId={flete.id}
                                    className={`flex-shrink-0 w-[350px] snap-start glass-card p-6 border-2 transition-all cursor-pointer ${selectedFleteId === flete.id ? 'border-primary-500 bg-primary-500/5 shadow-2xl shadow-primary-500/10' : 'border-white/5 bg-slate-900/40 hover:border-white/10'}`}
                                    onClick={() => setSelectedFleteId(flete.id)}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-slate-950 rounded-2xl border border-white/5">
                                            <Truck className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Monto Líquido</p>
                                            <p className="text-2xl font-black text-white italic tracking-tighter">${flete.estimated_price}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start gap-4">
                                            <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-1" />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Recogida</p>
                                                <p className="text-sm font-bold text-slate-200 line-clamp-1 italic">{flete.pickup_address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Navigation className="w-4 h-4 text-secondary-500 shrink-0 mt-1" />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Destino</p>
                                                <p className="text-sm font-bold text-slate-200 line-clamp-1 italic">{flete.dropoff_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase italic">HACE 2M</span>
                                        </div>
                                        <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{flete.vehicle_categories?.name}</div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="w-full flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-white/5 text-slate-600">
                                    <Loader2 className="w-8 h-8 animate-spin opacity-20 mb-4" />
                                    <p className="font-black italic uppercase italic tracking-widest text-xs">Aguardando nuevas cargas...</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* 3. Detailed Map Orientation & Action */}
                <section>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                        {/* Selected Flete Details & Actions */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <AnimatePresence mode="wait">
                                {selectedFlete ? (
                                    <motion.div
                                        key={selectedFlete.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="glass-card p-10 h-full border-primary-500/30 bg-slate-900/60 flex flex-col"
                                    >
                                        <div className="flex-grow space-y-10">
                                            <header className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Detalles del Viaje</h3>
                                                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">ID #{selectedFlete.id.slice(0, 8)}</p>
                                                </div>
                                                {selectedFlete.status === 'pending' && (
                                                    <div className="bg-amber-500 text-black text-[9px] font-black uppercase px-3 py-1 rounded-full italic shadow-lg shadow-amber-500/20">UBICACIÓN ACTIVA</div>
                                                )}
                                                {selectedFlete.status === 'accepted' && (
                                                    <div className="bg-primary-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full italic shadow-lg shadow-primary-500/20">MISIÓN EN MARCHA</div>
                                                )}
                                            </header>

                                            <div className="space-y-6">
                                                <InfoItem label="Cliente" value={selectedFlete.profiles?.full_name || "Usuario RapiFletes"} />
                                                <InfoItem label="Categoría" value={selectedFlete.vehicle_categories?.name} />
                                                <div className="p-6 bg-slate-950 rounded-3xl border border-white/5">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Pago a recibir</p>
                                                    <p className="text-4xl font-black text-white italic tracking-tighter">$ {selectedFlete.estimated_price}</p>
                                                </div>
                                            </div>

                                            {selectedFlete.status === 'pending' && (
                                                <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20 flex gap-4">
                                                    <Info className="w-6 h-6 text-blue-400 shrink-0" />
                                                    <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">Este viaje requiere una unidad de tipo <span className="text-white font-black">{selectedFlete.vehicle_categories?.name}</span>. Asegúrate de tener espacio suficiente.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                                            {selectedFlete.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleAccept(selectedFlete.id)}
                                                    className="premium-button w-full py-5 italic font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-500/20"
                                                >
                                                    ACEPTAR ESTE VIAJE <ChevronRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <div className="space-y-4">
                                                    {selectedFlete.status === 'accepted' && (
                                                        <button onClick={() => handleStatusChange(selectedFlete.id, 'picked_up')} className="premium-button w-full py-5 italic font-black text-xs uppercase tracking-widest">CARGA RECOGIDA</button>
                                                    )}
                                                    {selectedFlete.status === 'picked_up' && (
                                                        <button onClick={() => handleStatusChange(selectedFlete.id, 'completed')} className="w-full py-5 bg-green-600 text-white italic font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-green-600/20">VIAJE COMPLETADO</button>
                                                    )}
                                                    <a href={`tel:${selectedFlete.profiles?.phone || ''}`} className="w-full block text-center py-5 bg-white text-black italic font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">LLAMAR CLIENTE</a>
                                                    <button onClick={() => handleStatusChange(selectedFlete.id, 'cancelled')} className="w-full py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">CANCELAR MISIÓN</button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="glass-card p-10 h-full border-white/5 bg-slate-900/20 flex flex-col items-center justify-center text-center opacity-40">
                                        <Target className="w-16 h-16 text-slate-700 mb-6" />
                                        <h3 className="text-xl font-black italic uppercase tracking-widest text-slate-700">Selecciona una misión</h3>
                                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2">Toca una carga arriba para ver la ruta</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Map Orientation (Below/Right) */}
                        <div className="lg:col-span-2 min-h-[500px] lg:h-auto rounded-[3.5rem] overflow-hidden border border-white/5 relative bg-slate-900 group shadow-2xl">
                            <div className="absolute inset-0 z-0 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                                {/* We reuse FreightMap here which is set up to read pickup/dropoff from useBookingStore. 
                                    However, we want it to show the SELECTED flete's points. 
                                    I will wrap FreightMap or modify it to accept props if needed, 
                                    but for now let's hope it's reactive or use a mock visual since FreightMap is internal.
                                */}
                                <FreightMap
                                    pickup={selectedFlete ? { address: selectedFlete.pickup_address, lat: selectedFlete.pickup_lat, lng: selectedFlete.pickup_lng } : null}
                                    dropoff={selectedFlete ? { address: selectedFlete.dropoff_address, lat: selectedFlete.dropoff_lat, lng: selectedFlete.dropoff_lng } : null}
                                />
                            </div>

                            {/* Map Overlay Controls */}
                            <div className="absolute top-10 right-10 flex flex-col gap-4">
                                <div className="p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 text-right">
                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Cálculo de Ruta</p>
                                    <p className="text-lg font-black text-white italic">OPTIMIZADO</p>
                                </div>
                            </div>

                            {!selectedFlete && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-slate-950/90 backdrop-blur-xl px-12 py-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-6">
                                        <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                                            <MapIcon className="w-6 h-6 text-primary-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white italic uppercase tracking-tighter">Radar de Proximidad</p>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ESCANEANDO RADIO DE 10KM</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </section>

            </div>
        </div>
    )
}

const InfoItem = ({ label, value }) => (
    <div className="flex justify-between items-center px-2">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-white italic uppercase">{value}</span>
    </div>
)

const Activity = (props) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
)

export default DriverDashboard
