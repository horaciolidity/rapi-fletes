import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Phone, DollarSign, ShieldCheck, Car, FileText, Upload, AlertTriangle } from 'lucide-react'
import { useDriverStore } from '../store/useDriverStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const DriverDashboard = () => {
    const { user, profile, updateProfile } = useAuthStore()
    const { availableFletes, activeFlete, loading: storeLoading, fetchAvailableFletes, acceptFlete, updateFleteStatus, subscribeToNewFletes } = useDriverStore()
    const navigate = useNavigate()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        vehicle_model: '',
        vehicle_year: '',
        license_plate: '',
        phone: ''
    })

    useEffect(() => {
        if (!user || profile?.role !== 'driver') {
            navigate('/auth')
            return
        }

        if (profile?.verification_status === 'verified') {
            fetchAvailableFletes()
            const channel = subscribeToNewFletes()
            return () => {
                if (channel) channel.unsubscribe()
            }
        }
    }, [user, profile])

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
    }

    const handleStatusChange = async (id, status) => {
        await updateFleteStatus(id, status)
    }

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
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full"
                >
                    <div className="glass-card p-10 border-primary-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="w-40 h-40" />
                        </div>

                        <header className="mb-10">
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Registro de Chofer</h1>
                            <p className="text-slate-400 font-medium">Completa tu perfil para empezar a recibir pedidos de fletes.</p>
                        </header>

                        <form onSubmit={handleVerificationSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Car className="w-3 h-3" /> Modelo del Vehículo
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field bg-slate-950/50 border-white/5 py-3.5"
                                        placeholder="Ej: Ford F-100"
                                        value={formData.vehicle_model}
                                        onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Año
                                    </label>
                                    <input
                                        type="number"
                                        className="input-field bg-slate-950/50 border-white/5 py-3.5"
                                        placeholder="2018"
                                        value={formData.vehicle_year}
                                        onChange={(e) => setFormData({ ...formData, vehicle_year: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Patente / Placa
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field bg-slate-950/50 border-white/5 py-3.5 uppercase"
                                        placeholder="ABC 123"
                                        value={formData.license_plate}
                                        onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        className="input-field bg-slate-950/50 border-white/5 py-3.5"
                                        placeholder="+54 9 11 ..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-primary-500/5 rounded-3xl border border-white/5 flex items-start gap-4">
                                <ShieldCheck className="w-6 h-6 text-primary-500 shrink-0" />
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Tu información será evaluada por nuestro equipo técnico. Una vez aprobada, recibirás una notificación para empezar a operar.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="premium-button w-full py-5 font-black uppercase italic tracking-widest flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ENVIAR PARA APROBACIÓN'}
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
                    <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Clock className="w-12 h-12 text-amber-500" />
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4">REVISIÓN EN CURSO</h2>
                    <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                        Estamos verificando tus documentos y datos del vehículo. Esto suele tardar entre 2 y 24 horas. ¡Te avisaremos pronto!
                    </p>
                    <button onClick={() => navigate('/')} className="premium-button px-10 py-3 text-xs">VOLVER AL INICIO</button>
                </motion.div>
            </div>
        )
    }

    if (profile.verification_status === 'rejected') {
        return (
            <div className="pt-32 pb-12 min-h-screen bg-slate-950 px-6 flex items-center justify-center text-center">
                <div className="max-w-md">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4">PERFIL RECHAZADO</h2>
                    <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                        Lo sentimos, tu solicitud no cumple con nuestros estándares actuales. Puedes contactar a soporte para más detalles.
                    </p>
                    <button onClick={() => navigate('/')} className="premium-button px-10 py-3 text-xs bg-slate-800 from-slate-800 to-slate-900">VOLVER AL INICIO</button>
                </div>
            </div>
        )
    }

    // --- RENDER: MAIN DASHBOARD (Only for Verified) ---
    return (
        <div className="pt-24 pb-12 min-h-screen bg-slate-950 px-6">
            <div className="container mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Panel de Chofer</h1>
                            <span className="bg-primary-500 text-[10px] font-black uppercase px-2 py-0.5 rounded italic">V-ELITE</span>
                        </div>
                        <p className="text-slate-500 font-medium italic">Hola, {profile?.full_name}. Tienes el sistema activo.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-card px-8 py-3.5 flex items-center gap-4 border-green-500/30 bg-green-500/5">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </div>
                            <span className="text-xs font-black text-green-400 uppercase tracking-widest">Chofer En Línea</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left/Middle: Active or Available Fletes */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeFlete ? (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-1.5 h-8 bg-primary-500 rounded-full" />
                                    <h2 className="text-xl font-black italic uppercase italic tracking-widest">Misión Actual</h2>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-10 border-primary-500/40 bg-slate-900/60 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.02]">
                                        <Truck className="w-40 h-40" />
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex gap-6">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary-500/30">OR</div>
                                                    <div className="w-1 h-20 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full my-2 opacity-20" />
                                                    <div className="w-10 h-10 bg-secondary-500 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-secondary-500/30">DE</div>
                                                </div>
                                                <div className="space-y-12 py-1">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2">Punto de Carga</p>
                                                        <p className="text-xl font-black text-white italic tracking-tight">{activeFlete.pickup_address}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2">Destino Final</p>
                                                        <p className="text-xl font-black text-white italic tracking-tight">{activeFlete.dropoff_address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-72 flex flex-col gap-4">
                                            <div className="bg-slate-950 rounded-3xl p-6 border border-white/5 text-center">
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Cobro Estimado</p>
                                                <p className="text-5xl font-black text-white italic tracking-tighter">${activeFlete.estimated_price}</p>
                                            </div>
                                            <a
                                                href={`tel:${activeFlete.profiles?.phone || ''}`}
                                                className="w-full bg-white text-black font-black uppercase italic tracking-tighter py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary-500 hover:text-white transition-all"
                                            >
                                                <Phone className="w-5 h-5" /> Llamar Cliente
                                            </a>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 border-t border-white/5 pt-8">
                                        {activeFlete.status === 'accepted' && (
                                            <button
                                                onClick={() => handleStatusChange(activeFlete.id, 'picked_up')}
                                                className="premium-button py-5 text-xs font-black uppercase italic tracking-widest"
                                            >
                                                MARCAR COMO RECOGIDO
                                            </button>
                                        )}
                                        {activeFlete.status === 'picked_up' && (
                                            <button
                                                onClick={() => handleStatusChange(activeFlete.id, 'completed')}
                                                className="bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-600/20 text-xs uppercase tracking-widest italic"
                                            >
                                                COMPLETAR FLETE
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleStatusChange(activeFlete.id, 'cancelled')}
                                            className="bg-slate-900 border border-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 font-black py-5 rounded-2xl transition-all text-xs uppercase tracking-widest italic"
                                        >
                                            CANCELAR MISIÓN
                                        </button>
                                    </div>
                                </motion.div>
                            </section>
                        ) : (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-slate-700 rounded-full" />
                                        <h2 className="text-xl font-black italic uppercase tracking-widest">Cargas Disponibles</h2>
                                    </div>
                                    <button
                                        onClick={fetchAvailableFletes}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-white transition-colors"
                                    >
                                        Forzar Refresco
                                    </button>
                                </div>

                                <AnimatePresence mode='popLayout'>
                                    {availableFletes.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-6">
                                            {availableFletes.map((flete) => (
                                                <motion.div
                                                    key={flete.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="glass-card p-8 border-white/5 hover:border-primary-500/30 transition-all bg-slate-900/40 group overflow-hidden relative"
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-3 mb-6">
                                                                <span className="bg-primary-500/10 text-primary-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-primary-500/20 italic">
                                                                    {flete.vehicle_categories?.name || 'Flete Estándar'}
                                                                </span>
                                                                <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black tracking-widest uppercase">
                                                                    <Clock className="w-3 h-3" /> {Math.floor((new Date() - new Date(flete.created_at)) / 60000)}m
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="flex items-start gap-3">
                                                                    <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                                                                    <p className="text-sm font-bold text-slate-200 tracking-tight">{flete.pickup_address}</p>
                                                                </div>
                                                                <div className="flex items-start gap-3">
                                                                    <Navigation className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                                                                    <p className="text-sm font-bold text-slate-200 tracking-tight">{flete.dropoff_address}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="md:w-44 flex flex-col justify-between items-end gap-6 bg-slate-950/50 p-6 rounded-3xl border border-white/5">
                                                            <div className="text-right">
                                                                <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-1">Precio</p>
                                                                <p className="text-3xl font-black text-white italic tracking-tighter">${flete.estimated_price}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAccept(flete.id)}
                                                                className="w-full bg-white text-black font-black uppercase italic tracking-tighter py-3 text-[10px] rounded-xl hover:bg-primary-500 hover:text-white transition-all"
                                                            >
                                                                ACEPTAR CARGA
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-32 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-white/5 text-slate-500"
                                        >
                                            <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                                <Loader2 className="w-10 h-10 animate-spin opacity-20" />
                                            </div>
                                            <h3 className="text-xl font-black italic uppercase tracking-widest text-slate-700 mb-2">Escaneando Mapa...</h3>
                                            <p className="font-medium text-xs uppercase tracking-widest opacity-50">Esperando nuevos pedidos en tiempo real</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar: Profile & Stats */}
                    <div className="space-y-8">
                        <section className="glass-card p-10 border-white/5 bg-slate-900/60">
                            <h3 className="text-xl font-black italic uppercase mb-8 tracking-widest">Actividad</h3>
                            <div className="space-y-3">
                                <StatItem label="Viajes Hoy" value="0" />
                                <StatItem label="Estrellas" value="5.0 ⭐" />
                                <StatItem label="Balance" value="$0.00" color="text-green-500 font-black italic" />
                                <StatItem label="Nivel" value="ORO" color="text-amber-500" />
                            </div>
                        </section>

                        <section className="glass-card p-10 bg-gradient-to-br from-primary-600/10 to-transparent border-white/5">
                            <h3 className="text-xl font-black italic uppercase mb-4 tracking-widest">Protocolo Elite</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                                "La eficiencia es nuestra identidad. Mantén tu vehículo limpio y coordina por WhatsApp inmediatamente al aceptar."
                            </p>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    )
}

const StatItem = ({ label, value, color = "text-white" }) => (
    <div className="flex justify-between items-center p-4 bg-slate-950/80 rounded-[1.5rem] border border-white/5">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{label}</span>
        <span className={`text-sm font-black italic tracking-widest ${color}`}>{value}</span>
    </div>
)

export default DriverDashboard
