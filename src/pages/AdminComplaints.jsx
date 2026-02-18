import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Clock, CheckCircle, XCircle, Eye, User, Truck, MessageSquare, Shield } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { useAuthStore } from '../store/useAuthStore'

const AdminComplaints = () => {
    const { user } = useAuthStore()
    const { complaints, loading, fetchComplaints, assignComplaint, resolveComplaint, closeComplaint } = useAdminStore()
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [filter, setFilter] = useState('all')
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [resolution, setResolution] = useState('')

    useEffect(() => {
        fetchComplaints()
    }, [])

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-red-500 bg-red-500/10'
            case 'in_progress': return 'text-primary-500 bg-primary-500/10'
            case 'resolved': return 'text-green-500 bg-green-500/10'
            case 'closed': return 'text-zinc-500 bg-zinc-500/10'
            default: return 'text-zinc-500 bg-zinc-500/10'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-500 bg-red-500/10'
            case 'high': return 'text-orange-500 bg-orange-500/10'
            case 'medium': return 'text-primary-500 bg-primary-500/10'
            case 'low': return 'text-blue-500 bg-blue-500/10'
            default: return 'text-zinc-500 bg-zinc-500/10'
        }
    }

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'service': return Truck
            case 'payment': return DollarSign
            case 'behavior': return User
            case 'safety': return Shield
            default: return AlertCircle
        }
    }

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'all') return true
        return c.status === filter
    })

    const handleAssign = async (complaintId) => {
        await assignComplaint(complaintId, user.id)
        await fetchComplaints()
    }

    const handleResolve = async () => {
        if (!selectedComplaint || !resolution.trim()) return
        await resolveComplaint(selectedComplaint.id, resolution)
        await fetchComplaints()
        setShowDetailModal(false)
        setResolution('')
    }

    const handleClose = async (complaintId) => {
        await closeComplaint(complaintId)
        await fetchComplaints()
    }

    return (
        <div className="min-h-screen bg-black pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                    🚨 RECLAMOS
                </h1>
                <p className="text-[10px] font-bold text-zinc-600 uppercase italic">
                    Gestión de problemas reportados
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                        { value: 'all', label: 'Todos', count: complaints.length },
                        { value: 'pending', label: 'Pendientes', count: complaints.filter(c => c.status === 'pending').length },
                        { value: 'in_progress', label: 'En Progreso', count: complaints.filter(c => c.status === 'in_progress').length },
                        { value: 'resolved', label: 'Resueltos', count: complaints.filter(c => c.status === 'resolved').length }
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic whitespace-nowrap transition-colors ${filter === f.value
                                    ? 'bg-primary-500 text-black'
                                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                                }`}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>

                {/* Complaints List */}
                {loading ? (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-zinc-700 animate-spin mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">Cargando reclamos...</p>
                    </div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-white text-lg font-black italic mb-2">
                            ¡Todo en orden!
                        </p>
                        <p className="text-zinc-500 text-sm">
                            No hay reclamos {filter !== 'all' ? filter : ''} en este momento
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredComplaints.map((complaint, index) => {
                            const CategoryIcon = getCategoryIcon(complaint.category)

                            return (
                                <motion.div
                                    key={complaint.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card p-5 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <CategoryIcon className="w-6 h-6 text-red-500" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Title & Priority */}
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-sm font-black text-white italic uppercase">
                                                    {complaint.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${getPriorityColor(complaint.priority)}`}>
                                                    {complaint.priority}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                                                {complaint.description}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex flex-wrap items-center gap-3 text-[9px] text-zinc-600 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {complaint.user?.full_name} ({complaint.user_type})
                                                </span>
                                                {complaint.flete && (
                                                    <span className="flex items-center gap-1">
                                                        <Truck className="w-3 h-3" />
                                                        Viaje #{complaint.flete.id.substring(0, 8)}
                                                    </span>
                                                )}
                                                <span>
                                                    {new Date(complaint.created_at).toLocaleDateString('es-AR')}
                                                </span>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>

                                                <div className="flex gap-2">
                                                    {complaint.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleAssign(complaint.id)}
                                                            className="px-3 py-1.5 bg-primary-500 text-black rounded-lg text-[9px] font-black uppercase hover:bg-primary-400 transition-colors"
                                                        >
                                                            ASIGNARME
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedComplaint(complaint)
                                                            setShowDetailModal(true)
                                                        }}
                                                        className="px-3 py-1.5 bg-zinc-800 text-white rounded-lg text-[9px] font-black uppercase hover:bg-zinc-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        VER
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedComplaint && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailModal(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-6 z-50 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-black text-white italic uppercase mb-4">
                                DETALLE DEL RECLAMO
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Título</p>
                                    <p className="text-white font-black">{selectedComplaint.title}</p>
                                </div>

                                <div>
                                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Descripción</p>
                                    <p className="text-zinc-400 text-sm">{selectedComplaint.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Usuario</p>
                                        <p className="text-white text-sm">{selectedComplaint.user?.full_name}</p>
                                        <p className="text-zinc-500 text-xs">{selectedComplaint.user?.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Estado</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusColor(selectedComplaint.status)}`}>
                                            {selectedComplaint.status}
                                        </span>
                                    </div>
                                </div>

                                {selectedComplaint.status === 'in_progress' && (
                                    <div>
                                        <label className="text-[9px] text-zinc-600 uppercase font-bold mb-2 block">
                                            Resolución
                                        </label>
                                        <textarea
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            placeholder="Describe cómo se resolvió el problema..."
                                            rows={4}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                                        />
                                    </div>
                                )}

                                {selectedComplaint.resolution && (
                                    <div>
                                        <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Resolución</p>
                                        <p className="text-green-400 text-sm">{selectedComplaint.resolution}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 py-3 bg-zinc-900 text-zinc-400 font-black italic text-[10px] uppercase rounded-xl hover:bg-zinc-800 transition-colors"
                                >
                                    CERRAR
                                </button>
                                {selectedComplaint.status === 'in_progress' && (
                                    <button
                                        onClick={handleResolve}
                                        disabled={!resolution.trim()}
                                        className="flex-1 py-3 bg-green-500 text-black font-black italic text-[10px] uppercase rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        MARCAR RESUELTO
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminComplaints
