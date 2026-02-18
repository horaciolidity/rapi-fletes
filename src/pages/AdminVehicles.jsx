import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Truck, CheckCircle, XCircle, Clock, Info, User, Phone, ChevronLeft, Loader2, AlertTriangle, FileText, Check } from 'lucide-react'
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

    const handleVerify = async (vehicleId, status) => {
        setIsSubmitting(true)
        await verifyVehicle(vehicleId, status, adminNotes)
        setIsSubmitting(false)
        setSelectedVehicle(null)
        setAdminNotes('')
    }

    return (
        <div className="min-h-screen bg-black pb-24 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6 sticky top-0 z-30 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-zinc-900 rounded-xl transition-colors">
                            <ChevronLeft className="w-6 h-6 text-zinc-500" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <Truck className="w-6 h-6 text-primary-500" />
                                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                                    AUDITORÍA<br /><span className="text-primary-500">DE VEHÍCULOS</span>
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
                        <p className="text-zinc-600 text-[10px] font-bold uppercase italic tracking-widest">No hay vehículos pendientes de verificación</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* List of pending vehicles */}
                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 italic">SOLICITUDES PENDIENTES ({pendingVehicles.length})</h2>
                            {pendingVehicles.map((v) => (
                                <motion.div
                                    key={v.id}
                                    layoutId={v.id}
                                    onClick={() => setSelectedVehicle(v)}
                                    className={`glass-card p-5 cursor-pointer transition-all ${selectedVehicle?.id === v.id ? 'border-primary-500/50 bg-primary-500/5 ring-4 ring-primary-500/10' : 'border-white/5 hover:border-white/10'}`}
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
                                                <p className="text-[10px] font-black text-primary-500 uppercase italic leading-none mb-1">{v.category?.name || 'VEHÍCULO'}</p>
                                                <h3 className="text-sm font-black text-white italic uppercase truncate max-w-[150px]">{v.brand} {v.model}</h3>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-white italic">{v.license_plate}</p>
                                            <p className="text-[8px] font-bold text-zinc-600 uppercase italic">Año {v.year}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-zinc-600" />
                                            <span className="text-[8px] font-black text-zinc-600 uppercase italic">Recibido {new Date(v.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button className="text-[9px] font-black text-primary-500 uppercase italic hover:underline">Ver detalles</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Details and Actions */}
                        <div className="lg:sticky lg:top-28 h-fit">
                            <AnimatePresence mode="wait">
                                {selectedVehicle ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass-card p-8 border-white/10 bg-zinc-950/80 backdrop-blur-3xl shadow-2xl"
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                                <Truck className="w-8 h-8 text-black" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">{selectedVehicle.brand}<br />{selectedVehicle.model}</h2>
                                                <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[9px] font-black text-primary-500 uppercase italic mt-2 inline-block">Categoría: {selectedVehicle.category?.name}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black text-zinc-600 uppercase italic mb-1">CONDUCTOR</p>
                                                <p className="text-xs font-black text-white italic uppercase truncate">{selectedVehicle.driver?.full_name}</p>
                                            </div>
                                            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black text-zinc-600 uppercase italic mb-1">WHATSAPP</p>
                                                <p className="text-xs font-black text-white italic uppercase">{selectedVehicle.driver?.phone}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mb-8">
                                            <div className="bg-secondary-500/5 p-5 rounded-2xl border border-secondary-500/10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="w-4 h-4 text-secondary-500" />
                                                    <p className="text-[10px] font-black text-secondary-500 uppercase italic">JUSTIFICACIÓN DEL CHOFER</p>
                                                </div>
                                                <p className="text-xs font-bold text-zinc-400 italic leading-relaxed">
                                                    "{selectedVehicle.justification || 'Sin justificación proporcionada.'}"
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">NOTAS ADMINISTRATIVAS (Opcional)</label>
                                                <textarea
                                                    value={adminNotes}
                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                    className="input-field min-h-[100px] py-4 text-xs italic resize-none"
                                                    placeholder="Escribe por qué apruebas o rechazas este vehículo..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleVerify(selectedVehicle.id, 'rejected')}
                                                className="py-4 border border-red-500/30 text-red-500 font-black italic text-[11px] uppercase rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                RECHAZAR
                                            </button>
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleVerify(selectedVehicle.id, 'approved')}
                                                className="py-4 bg-primary-500 text-black font-black italic text-[11px] uppercase rounded-xl hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                APROBAR
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-900 rounded-[2.5rem]"
                                    >
                                        <Info className="w-12 h-12 text-zinc-900 mb-4" />
                                        <p className="text-[11px] font-black text-zinc-800 uppercase italic tracking-widest leading-relaxed">SELECCIONA UNA SOLICITUD<br />PARA REVISAR LOS DETALLES</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminVehicles
