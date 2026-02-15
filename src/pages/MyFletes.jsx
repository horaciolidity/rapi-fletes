import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, ChevronRight, Package, AlertCircle } from 'lucide-react'
import { useBookingStore } from '../store/useBookingStore'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'

const MyFletes = () => {
    const { user } = useAuthStore()
    const { fletes, fetchMyFletes, loading, error } = useBookingStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }
        fetchMyFletes(user.id)
    }, [user])

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'picked_up': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Buscando Chofer'
            case 'accepted': return 'Chofer en camino'
            case 'picked_up': return 'En viaje'
            case 'completed': return 'Entregado'
            case 'cancelled': return 'Cancelado'
            default: return status
        }
    }

    if (!user) return null

    return (
        <div className="pt-24 pb-12 min-h-screen bg-slate-950 px-6">
            <div className="container mx-auto max-w-4xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-2">Mis Fletes</h1>
                    <p className="text-slate-400 font-medium">Historial de tus envíos y mudanzas</p>
                </header>

                {loading && fletes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 animate-pulse">Cargando tus pedidos...</p>
                    </div>
                ) : fletes.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence mode='popLayout'>
                            {fletes.map((flete, index) => (
                                <motion.div
                                    key={flete.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card hover:border-white/10 transition-all group overflow-hidden"
                                >
                                    <div className="p-6 flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between md:justify-start gap-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(flete.status)}`}>
                                                    {getStatusLabel(flete.status)}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {new Date(flete.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-primary-500 mt-1 shrink-0" />
                                                    <p className="text-sm text-slate-200 font-medium">{flete.pickup_address}</p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Navigation className="w-4 h-4 text-secondary-500 mt-1 shrink-0" />
                                                    <p className="text-sm text-slate-200 font-medium">{flete.dropoff_address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Total</p>
                                                <p className="text-2xl font-black text-white">${flete.estimated_price}</p>
                                            </div>
                                            <Link
                                                to={`/booking`}
                                                className="text-xs font-bold text-primary-400 flex items-center gap-1 hover:underline group/link"
                                            >
                                                Repetir Pedido <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <Package className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">No tienes fletes todavía</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Cuando realices tu primer pedido, aparecerá aquí para que puedas seguirlo.</p>
                        <Link to="/booking" className="premium-button px-8 py-3">
                            Solicitar mi primer flete
                        </Link>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyFletes
