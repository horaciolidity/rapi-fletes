import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Truck, CheckCircle, XCircle, Clock, Info, User, Phone, ChevronLeft, Loader2, AlertTriangle, FileText, Check, X, ShieldCheck } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { useNavigate } from 'react-router-dom'

const AdminVehicles = () => {
    const { pendingVehicles, loading, fetchPendingVehicles, verifyVehicle } = useAdminStore()
    const navigate = useNavigate()
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [adminNotes, setAdminNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchPendingVehicles()
    }, [])

    const handleVerify = async (status) => {
        if (!selectedVehicle) return
        setIsSubmitting(true)
        await verifyVehicle(selectedVehicle.id, status, adminNotes)
        setIsSubmitting(false)
        setSelectedVehicle(null)
        setAdminNotes('')
    }

    return (
        <div className="min-h-screen bg-black pb-24 font-sans text-white">
            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6 sticky top-0 z-30 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-zinc-900 rounded-xl transition-colors">
                            <ChevronLeft className="w-6 h-6 text-zinc-500" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-primary-500" />
                                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                                    VERIFICACIÓN<br /><span className="text-primary-500 text-sm">DE VEHÍCULOS</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6">
                {loading && pendingVehicles.length === 0 ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-zinc-500 font-bold uppercase italic text-[10px] tracking-widest">Cargando solicitudes...</p>
                    </div>
                ) : pendingVehicles.length === 0 ? (
                    <div className="py-20 text-center bg-zinc-950/50 rounded-[2.5rem] border border-white/5">
                        <CheckCircle className="w-12 h-12 text-primary-500/20 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-white italic uppercase mb-2">TODO AL DÍA</h2>
                        <p className="text-zinc-600 text-[10px] font-bold uppercase italic tracking-widest">No hay vehículos pendientes de aprobación</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 italic font-sans">SOLICITUDES PENDIENTES ({pendingVehicles.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingVehicles.map((v) => (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedVehicle(v)}
                                    className="glass-card p-5 cursor-pointer border-white/5 bg-zinc-950/50 hover:bg-zinc-900/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                                                {v.driver?.avatar_url ? (
                                                    <img src={v.driver.avatar_url} className="w-full h-full object-cover" alt="Driver" />
                                                ) : (
                                                    <User className="w-5 h-5 text-zinc-700" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary-500 uppercase italic leading-none mb-1">{v.category?.name}</p>
                                                <h3 className="text-sm font-black text-white italic uppercase truncate">{v.brand} {v.model}</h3>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-white italic">{v.license_plate}</p>
                                            <p className="text-[8px] font-bold text-zinc-600 uppercase italic">Año {v.year}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-[8px] font-black text-zinc-600 uppercase italic">{v.driver?.full_name}</span>
                                        <div className="flex items-center gap-1 text-primary-500 font-black italic text-[9px] uppercase">
                                            Revisar <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Modal (Full Screen on Mobile) */}
            <AnimatePresence>
                {selectedVehicle && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVehicle(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full h-full md:h-auto md:max-w-2xl bg-zinc-950 border-t md:border border-white/10 md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-500 rounded-lg text-black">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Detalles del Vehículo</h2>
                                </div>
                                <button onClick={() => setSelectedVehicle(null)} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-none">
                                {/* Vehicle Main Info */}
                                <div className="flex flex-col items-center text-center">
                                    <span className="px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-black text-primary-500 uppercase italic mb-4">CATEGORÍA: {selectedVehicle.category?.name}</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{selectedVehicle.brand}</h3>
                                    <p className="text-xl font-bold text-zinc-500 uppercase italic mb-6">{selectedVehicle.model} ({selectedVehicle.year})</p>
                                    <div className="px-6 py-2 bg-zinc-900 rounded-xl border border-white/5 font-mono text-xl tracking-widest text-white shadow-xl">
                                        {selectedVehicle.license_plate}
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase italic mb-2 tracking-widest">PROPIETARIO</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                                {selectedVehicle.driver?.avatar_url ? (
                                                    <img src={selectedVehicle.driver.avatar_url} className="w-full h-full object-cover" alt="Driver" />
                                                ) : (
                                                    <User className="w-5 h-5 text-zinc-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white italic uppercase">{selectedVehicle.driver?.full_name}</p>
                                                <p className="text-[10px] font-bold text-zinc-600">{selectedVehicle.driver?.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-secondary-500/5 p-6 rounded-3xl border border-secondary-500/10 h-full flex flex-col justify-center">
                                        <p className="text-[9px] font-black text-secondary-500 uppercase italic mb-2 tracking-widest">FECHA SOLICITUD</p>
                                        <p className="text-sm font-black text-white uppercase italic">{new Date(selectedVehicle.created_at).toLocaleDateString()} - {new Date(selectedVehicle.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hs</p>
                                    </div>
                                </div>

                                {/* Justification */}
                                <div className="bg-primary-500/5 p-8 rounded-[2.5rem] border border-primary-500/10 relative overflow-hidden">
                                    <FileText className="absolute top-6 right-8 w-12 h-12 text-primary-500/10 rotate-12" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-primary-500 uppercase italic mb-4 tracking-widest flex items-center gap-2">
                                            <Info className="w-4 h-4" /> JUSTIFICACIÓN DEL CONDUCTOR
                                        </p>
                                        <p className="text-lg font-bold text-zinc-300 italic leading-relaxed">
                                            "{selectedVehicle.justification || 'Sin justificación proporcionada.'}"
                                        </p>
                                    </div>
                                </div>

                                {/* Admin Notes Input */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 italic">MOTIVO DE APROBACIÓN / RECHAZO (Opcional)</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="input-field min-h-[120px] py-6 px-8 text-sm italic resize-none rounded-[2rem] bg-zinc-900 border-white/5 focus:border-primary-500/50"
                                        placeholder="Escribe aquí tus observaciones..."
                                    />
                                </div>
                            </div>

                            {/* Modal Footer (Fixed Actions) */}
                            <div className="p-6 border-t border-white/10 bg-zinc-950 grid grid-cols-2 gap-4 flex-shrink-0">
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => handleVerify('rejected')}
                                    className="py-5 border border-red-500/30 text-red-500 font-black italic text-[11px] uppercase rounded-2xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" />
                                    RECHAZAR
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => handleVerify('approved')}
                                    className="py-5 bg-primary-500 text-black font-black italic text-[11px] uppercase rounded-2xl hover:bg-primary-400 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    APROBAR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminVehicles
