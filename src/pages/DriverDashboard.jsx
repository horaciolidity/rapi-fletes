import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Phone, DollarSign } from 'lucide-react'
import { useDriverStore } from '../store/useDriverStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const DriverDashboard = () => {
    const { user, profile } = useAuthStore()
    const { availableFletes, activeFlete, loading, fetchAvailableFletes, acceptFlete, updateFleteStatus, subscribeToNewFletes } = useDriverStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user || profile?.role !== 'driver') {
            navigate('/auth')
            return
        }

        fetchAvailableFletes()
        const channel = subscribeToNewFletes()
        return () => {
            if (channel) channel.unsubscribe()
        }
    }, [user, profile])

    const handleAccept = async (id) => {
        await acceptFlete(id, user.id)
    }

    const handleStatusChange = async (id, status) => {
        await updateFleteStatus(id, status)
    }

    return (
        <div className="pt-24 pb-12 min-h-screen bg-slate-950 px-6">
            <div className="container mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Panel de Chofer</h1>
                        <p className="text-slate-400">Hola, {profile?.full_name}. Gestiona tus fletes activos y encuentra nuevas cargas.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-card px-6 py-3 flex items-center gap-3 border-green-500/30">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-green-400 uppercase tracking-widest">En Línea</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left/Middle: Active or Available Fletes */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeFlete ? (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                    Viaje en Curso
                                </h2>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-8 border-primary-500/50 bg-primary-500/5"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs ring-4 ring-primary-500/20">A</div>
                                                    <div className="w-0.5 h-12 bg-slate-700 my-1" />
                                                    <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xs ring-4 ring-secondary-500/20">B</div>
                                                </div>
                                                <div className="space-y-8 pt-1">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Recogida</p>
                                                        <p className="text-lg font-bold text-white leading-tight">{activeFlete.pickup_address}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Entrega</p>
                                                        <p className="text-lg font-bold text-white leading-tight">{activeFlete.dropoff_address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-64 space-y-4">
                                            <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5">
                                                <p className="text-xs text-slate-500 mb-1">Ganancia Estimada</p>
                                                <p className="text-3xl font-black text-primary-400">${activeFlete.estimated_price}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-slate-800 p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                                                    <Phone className="w-4 h-4" /> <span className="text-xs font-bold">Llamar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {activeFlete.status === 'accepted' && (
                                            <button
                                                onClick={() => handleStatusChange(activeFlete.id, 'picked_up')}
                                                className="premium-button py-4 flex items-center justify-center gap-2"
                                            >
                                                <Truck className="w-5 h-5" /> Marcar Recogido
                                            </button>
                                        )}
                                        {activeFlete.status === 'picked_up' && (
                                            <button
                                                onClick={() => handleStatusChange(activeFlete.id, 'completed')}
                                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20"
                                            >
                                                <CheckCircle2 className="w-5 h-5" /> Completar Flete
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleStatusChange(activeFlete.id, 'cancelled')}
                                            className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                                        >
                                            <XCircle className="w-5 h-5" /> Cancelar
                                        </button>
                                    </div>
                                </motion.div>
                            </section>
                        ) : (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <div className="w-2 h-6 bg-slate-500 rounded-full" />
                                        Cargas Disponibles
                                    </h2>
                                    <button
                                        onClick={fetchAvailableFletes}
                                        className="text-xs font-bold text-primary-400 hover:underline"
                                    >
                                        Actualizar
                                    </button>
                                </div>

                                <AnimatePresence mode='popLayout'>
                                    {availableFletes.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {availableFletes.map((flete) => (
                                                <motion.div
                                                    key={flete.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="glass-card p-6 border-slate-800 hover:border-primary-500/30 transition-all group"
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <span className="bg-primary-500/20 text-primary-400 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                                                                    {flete.vehicle_categories?.name || 'Flete'}
                                                                </span>
                                                                <span className="text-slate-500 text-xs flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> hace {Math.floor((new Date() - new Date(flete.created_at)) / 60000)} min
                                                                </span>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex items-start gap-3">
                                                                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-1" />
                                                                    <p className="text-sm font-medium text-slate-300">{flete.pickup_address}</p>
                                                                </div>
                                                                <div className="flex items-start gap-3">
                                                                    <Navigation className="w-4 h-4 text-secondary-500 flex-shrink-0 mt-1" />
                                                                    <p className="text-sm font-medium text-slate-300">{flete.dropoff_address}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="md:w-40 flex flex-col justify-between items-end">
                                                            <div className="text-right mb-4">
                                                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Pago</p>
                                                                <p className="text-2xl font-black text-white">${flete.estimated_price}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAccept(flete.id)}
                                                                className="w-full premium-button py-2.5 text-xs"
                                                            >
                                                                Tomar Carga
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
                                            className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 text-slate-500"
                                        >
                                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 opacity-20" />
                                            <p className="font-medium">Esperando nuevos pedidos en tu zona...</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar: Profile & Stats */}
                    <div className="space-y-8">
                        <section className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-6">Tu Actividad</h3>
                            <div className="space-y-4">
                                <StatItem label="Fletes Hoy" value="0" />
                                <StatItem label="Calificación" value="5.0 ⭐" />
                                <StatItem label="Billetera" value="$0.00" color="text-green-500" />
                            </div>
                        </section>

                        <section className="glass-card p-6 bg-gradient-to-br from-primary-600/10 to-transparent">
                            <h3 className="text-lg font-bold mb-4">Consejo Pro</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Mantén la aplicación abierta. Los fletes desaparecen rápido. ¡Acepta fletes cercanos para optimizar tu combustible!
                            </p>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    )
}

const StatItem = ({ label, value, color = "text-white" }) => (
    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-white/5">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`font-black ${color}`}>{value}</span>
    </div>
)

export default DriverDashboard
