import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Truck, DollarSign, Activity, CheckCircle, XCircle,
    Clock, ShieldAlert, ChevronRight, Hash, TrendingUp, Filter, Search, Loader2
} from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
    const { user, profile, loading: authLoading } = useAuthStore()
    const {
        stats, pendingDrivers, allFletes, loading,
        fetchStats, fetchPendingDrivers, fetchAllFletes, verifyDriver, fetchDriverLeaderboard
    } = useAdminStore()
    const navigate = useNavigate()
    const [leaderboard, setLeaderboard] = useState([])
    const [activeTab, setActiveTab] = useState('overview') // overview, drivers, fletes

    useEffect(() => {
        if (authLoading) return
        if (!user || profile?.role !== 'admin') {
            navigate('/')
            return
        }

        fetchStats()
        fetchPendingDrivers()
        fetchAllFletes()
        fetchDriverLeaderboard().then(setLeaderboard)
    }, [user, profile, authLoading])

    const handleVerify = async (id, status) => {
        await verifyDriver(id, status)
    }

    if (authLoading || !profile || profile.role !== 'admin') return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
        </div>
    )

    return (
        <div className="pt-32 pb-12 min-h-screen bg-black px-10 font-sans">
            <div className="container mx-auto max-w-[1700px]">

                {/* Tactical Header */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-secondary-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(234,88,12,0.3)]">
                            <ShieldAlert className="w-10 h-10 text-black" />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">ALPHA<br /><span className="text-secondary-600">COMMAND</span></h1>
                                <span className="bg-red-600 text-[10px] font-black uppercase px-4 py-1.5 rounded-full italic tracking-widest shadow-xl shadow-red-600/20 border border-white/10">NIVEL ADMIN</span>
                            </div>
                            <p className="text-zinc-700 font-black italic uppercase tracking-[0.4em] text-[10px]">Gestión táctica de infraestructura logística global</p>
                        </div>
                    </div>
                </header>

                {/* Tabs Navigation */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-none">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={16} />} label="RESUMEN" />
                    <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Truck size={16} />} label={`CHOFERES (${pendingDrivers.length})`} />
                    <TabButton active={activeTab === 'fletes'} onClick={() => setActiveTab('fletes')} icon={<Hash size={16} />} label="HISTORIAL" />
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Grid Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Ingresos Totales" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="text-green-500" />} trend="+12%" />
                                <StatCard label="Viajes Realizados" value={stats.totalTrips} icon={<Truck className="text-primary-500" />} trend="+5%" />
                                <StatCard label="Choferes Activos" value={stats.activeDrivers} icon={<Users className="text-secondary-500" />} trend="0%" />
                                <StatCard label="Usuarios Registrados" value={stats.totalUsers} icon={<Activity className="text-amber-500" />} trend="+8%" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Leaderboard */}
                                <div className="lg:col-span-1 glass-card p-8 bg-slate-900/40">
                                    <h3 className="text-xl font-black italic uppercase tracking-widest mb-8 flex items-center gap-3 text-white">
                                        <TrendingUp className="text-primary-500" /> TOP OPERADORES
                                    </h3>
                                    <div className="space-y-4">
                                        {leaderboard.length > 0 ? leaderboard.map((driver, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-black border border-white/5 rounded-2xl">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-zinc-800 w-4">#{i + 1}</span>
                                                    <span className="text-xs font-bold text-zinc-400 italic uppercase">{driver.name}</span>
                                                </div>
                                                <span className="text-[9px] font-black text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full uppercase italic">MISIONES: {driver.count}</span>
                                            </div>
                                        )) : (
                                            <p className="text-zinc-600 text-[10px] italic text-center py-10 font-black uppercase tracking-widest">Sin datos de despliegue</p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity Log */}
                                <div className="lg:col-span-2 glass-card p-10 bg-zinc-950/40">
                                    <h3 className="text-xl font-black italic uppercase tracking-widest mb-8 flex items-center gap-3 text-white">
                                        <Clock className="text-secondary-500" /> LOG DE ACTIVIDAD
                                    </h3>
                                    <div className="space-y-4">
                                        {allFletes.slice(0, 5).map((flete, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-black border border-white/5 rounded-[2rem] hover:border-primary-500/30 transition-all group">
                                                <div className="flex gap-6 items-center">
                                                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 group-hover:bg-primary-500 group-hover:text-black transition-all">
                                                        <Truck className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{flete.profiles?.full_name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{flete.status}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black italic text-primary-400">${flete.estimated_price}</p>
                                                    <p className="text-[10px] text-slate-600 font-bold">{new Date(flete.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'drivers' && (
                        <motion.div
                            key="drivers"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-8">Solicitudes de Verificación</h2>
                            {pendingDrivers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {pendingDrivers.map((driver) => (
                                        <div key={driver.id} className="glass-card p-8 border-amber-500/20 bg-slate-900/40">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h4 className="text-lg font-black text-white italic">{driver.full_name}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{driver.phone || 'Sin teléfono'}</p>
                                                </div>
                                                <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase px-2 py-1 rounded">PENDIENTE</span>
                                            </div>

                                            <div className="bg-slate-950/50 p-4 rounded-2xl mb-8 space-y-2 border border-white/5 uppercase">
                                                <p className="text-[10px] text-slate-600 font-black">Vehículo: <span className="text-slate-300">{driver.vehicle_details?.model || 'N/A'}</span></p>
                                                <p className="text-[10px] text-slate-600 font-black">Patente: <span className="text-slate-300">{driver.license_plate || 'N/A'}</span></p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => handleVerify(driver.id, 'verified')}
                                                    className="flex items-center justify-center gap-2 bg-green-500 text-white font-black text-[10px] tracking-widest uppercase py-3 rounded-xl shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
                                                >
                                                    <CheckCircle size={14} /> APROBAR
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(driver.id, 'rejected')}
                                                    className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 font-black text-[10px] tracking-widest uppercase py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <XCircle size={14} /> RECHAZAR
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-white/5 text-slate-600">
                                    <CheckCircle className="mx-auto mb-4 opacity-20" size={48} />
                                    <p className="font-black italic uppercase tracking-widest">No hay choferes pendientes de aprobación</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'fletes' && (
                        <motion.div
                            key="fletes"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card overflow-hidden border-white/5"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-900/80 border-b border-white/5">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">ID Viaje</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cliente</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Chofer</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estado</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Monto</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {allFletes.map((flete) => (
                                            <tr key={flete.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-6 text-xs font-bold text-slate-500 tracking-tighter">#{flete.id.slice(0, 8)}</td>
                                                <td className="p-6">
                                                    <p className="text-sm font-bold text-white">{flete.profiles?.full_name}</p>
                                                    <p className="text-[10px] text-slate-600">{flete.profiles?.email}</p>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`text-xs font-medium ${flete.driver?.full_name ? 'text-slate-300' : 'text-slate-700 italic'}`}>
                                                        {flete.driver?.full_name || 'Sin asignar'}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded italic tracking-widest ${flete.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                        flete.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-slate-800 text-slate-400'
                                                        }`}>
                                                        {flete.status}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm font-black italic text-primary-400">$ {flete.estimated_price}</td>
                                                <td className="p-6 text-xs text-slate-600 font-bold">{new Date(flete.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 px-10 py-5 rounded-full font-black text-[10px] tracking-[0.2em] transition-all shadow-xl italic uppercase ${active
            ? 'bg-primary-500 text-black shadow-primary-500/20 scale-105'
            : 'bg-zinc-900 text-zinc-600 hover:text-white border border-white/5'
            }`}
    >
        {icon} {label}
    </button>
)

const StatCard = ({ label, value, icon, trend }) => (
    <div className="glass-card p-8 bg-zinc-950/40 border-zinc-900 hover:border-primary-500/30 transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-3xl rounded-full" />
        <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-black transition-all">
                {icon}
            </div>
            <span className={`text-[9px] font-black ${trend.startsWith('+') ? 'text-green-500' : 'text-zinc-600'} bg-black/40 px-3 py-1 rounded-full italic border border-white/5`}>{trend}</span>
        </div>
        <p className="text-4xl font-black text-white italic tracking-tighter mb-2 relative z-10 uppercase">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 italic relative z-10">{label}</p>
    </div>
)

export default AdminDashboard
    ```
