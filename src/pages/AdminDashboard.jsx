import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Truck, DollarSign, Activity, CheckCircle, XCircle,
    Clock, ShieldAlert, ChevronRight, Hash, TrendingUp, Filter, Search, Loader2, ChevronLeft
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

    if (authLoading || !profile || profile.role !== 'admin') return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    )

    return (
        <div className="pb-24 pt-10 min-h-screen bg-black font-sans px-6">
            <div className="container mx-auto max-w-md">

                <header className="flex flex-col gap-6 mb-10 pt-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary-600/20">
                            <ShieldAlert className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">ADMIN<br /><span className="text-secondary-600">CENTRAL</span></h1>
                        </div>
                    </div>
                </header>

                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-white/5 mb-8 overflow-x-auto scrollbar-none">
                    {[
                        { id: 'overview', label: 'STATS', icon: Activity },
                        { id: 'drivers', label: 'CHOFERES', icon: Truck },
                        { id: 'fletes', label: 'VIAJES', icon: Hash }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all min-w-[80px] ${activeTab === tab.id ? 'bg-secondary-600 text-black' : 'text-zinc-600'}`}
                        >
                            <tab.icon className="w-4 h-4 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label="Ingresos" value={`$${stats.totalRevenue.toFixed(0)}`} icon={<DollarSign size={14} />} color="text-green-500" />
                                <StatCard label="Viajes" value={stats.totalTrips} icon={<Truck size={14} />} color="text-primary-500" />
                                <StatCard label="Choferes" value={stats.activeDrivers} icon={<Users size={14} />} color="text-secondary-500" />
                                <StatCard label="Usuarios" value={stats.totalUsers} icon={<Activity size={14} />} color="text-amber-500" />
                            </div>

                            <div className="glass-card p-6 bg-zinc-900/50">
                                <h3 className="text-[10px] font-black italic uppercase tracking-widest mb-6 flex items-center gap-3 text-white">
                                    <TrendingUp className="text-primary-500 w-4 h-4" /> TOP CHOFERES
                                </h3>
                                <div className="space-y-3">
                                    {leaderboard.map((driver, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-black border border-white/5 rounded-xl">
                                            <span className="text-xs font-bold text-zinc-400 italic uppercase">{driver.name}</span>
                                            <span className="text-[9px] font-black text-primary-500 italic uppercase">{driver.count} VIAJES</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'drivers' && (
                        <motion.div key="drivers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <h2 className="text-xs font-black italic uppercase tracking-widest text-zinc-500 px-2">PENDIENTES ({pendingDrivers.length})</h2>
                            {pendingDrivers.map((driver) => (
                                <div key={driver.id} className="glass-card p-6 border-amber-500/20 bg-zinc-950/80">
                                    <div className="mb-6">
                                        <h4 className="text-lg font-black text-white italic leading-tight mb-1">{driver.full_name}</h4>
                                        <p className="text-[10px] text-zinc-600 font-black italic uppercase">{driver.phone || 'SIN TEL'}</p>
                                    </div>

                                    <div className="bg-black p-4 rounded-xl mb-6 space-y-2 border border-white/5 text-[9px] font-black uppercase italic">
                                        <p className="text-zinc-600">Model: <span className="text-zinc-400">{driver.vehicle_details?.model || 'N/A'}</span></p>
                                        <p className="text-zinc-600">Patente: <span className="text-zinc-400">{driver.license_plate || 'N/A'}</span></p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => verifyDriver(driver.id, 'verified')} className="flex-1 bg-green-500 text-black font-black text-[10px] py-3 rounded-xl uppercase italic">ACEPTAR</button>
                                        <button onClick={() => verifyDriver(driver.id, 'rejected')} className="flex-1 border border-red-500/20 text-red-500 font-black text-[10px] py-3 rounded-xl uppercase italic">RECHAZAR</button>
                                    </div>
                                </div>
                            ))}
                            {pendingDrivers.length === 0 && (
                                <div className="text-center py-20 opacity-20 italic">
                                    <p className="text-[10px] font-black uppercase tracking-widest">SIN SOLICITUDES</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'fletes' && (
                        <motion.div key="fletes" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                            {allFletes.slice(0, 10).map((flete) => (
                                <div key={flete.id} className="p-5 bg-zinc-950 border border-white/5 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-white italic uppercase leading-tight mb-1">{flete.profiles?.full_name}</p>
                                        <p className="text-[8px] font-black text-zinc-700 uppercase italic">STATUS: {flete.status}</p>
                                    </div>
                                    <p className="text-lg font-black text-secondary-500 italic">$ {flete.estimated_price}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

const StatCard = ({ label, value, icon, color }) => (
    <div className="glass-card p-5 bg-zinc-950/80 border-zinc-900">
        <div className="flex justify-between items-center mb-4">
            <div className={`p-2 bg-zinc-900 rounded-lg ${color}`}>{icon}</div>
        </div>
        <p className="text-xl font-black text-white italic tracking-tighter mb-1 uppercase leading-none">{value}</p>
        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700 italic">{label}</p>
    </div>
)

export default AdminDashboard
