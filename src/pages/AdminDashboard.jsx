import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Truck, AlertCircle, CheckCircle, XCircle, TrendingUp, DollarSign, Activity, Shield, Ban } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
    const { stats, loading, fetchStats } = useAdminStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchStats()
    }, [])

    const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`glass-card p-6 ${onClick ? 'cursor-pointer hover:bg-zinc-900/70' : ''} transition-colors`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-black" />
                </div>
                <p className="text-3xl font-black text-white italic">
                    {value?.toLocaleString() || '0'}
                </p>
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase italic">
                {label}
            </p>
        </motion.div>
    )

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Cargando panel admin...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-primary-500" />
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        PANEL ADMIN
                    </h1>
                </div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase italic">
                    Centro de control y moderación
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Usuarios */}
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">
                        👥 USUARIOS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={Users}
                            label="Total Usuarios"
                            value={stats?.total_users}
                            color="bg-primary-500"
                            onClick={() => navigate('/admin/users')}
                        />
                        <StatCard
                            icon={Users}
                            label="Clientes"
                            value={stats?.total_clients}
                            color="bg-secondary-500"
                            onClick={() => navigate('/admin/users?role=client')}
                        />
                        <StatCard
                            icon={Truck}
                            label="Choferes"
                            value={stats?.total_drivers}
                            color="bg-blue-500"
                            onClick={() => navigate('/admin/users?role=driver')}
                        />
                    </div>
                </div>

                {/* Viajes */}
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">
                        🚛 VIAJES
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={CheckCircle}
                            label="Completados"
                            value={stats?.total_completed_trips}
                            color="bg-green-500"
                        />
                        <StatCard
                            icon={XCircle}
                            label="Cancelados"
                            value={stats?.total_cancelled_trips}
                            color="bg-red-500"
                        />
                        <StatCard
                            icon={Activity}
                            label="Hoy"
                            value={stats?.trips_today}
                            color="bg-primary-500"
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Ingresos Totales"
                            value={`$${stats?.total_revenue?.toFixed(0)}`}
                            color="bg-green-500"
                        />
                    </div>
                </div>

                {/* Reclamos */}
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">
                        🚨 RECLAMOS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={AlertCircle}
                            label="Pendientes"
                            value={stats?.pending_complaints}
                            color="bg-red-500"
                            onClick={() => navigate('/admin/complaints?status=pending')}
                        />
                        <StatCard
                            icon={Activity}
                            label="En Progreso"
                            value={stats?.in_progress_complaints}
                            color="bg-primary-500"
                            onClick={() => navigate('/admin/complaints?status=in_progress')}
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Resueltos"
                            value={stats?.resolved_complaints}
                            color="bg-green-500"
                            onClick={() => navigate('/admin/complaints?status=resolved')}
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="Hoy"
                            value={stats?.complaints_today}
                            color="bg-primary-500"
                        />
                    </div>
                </div>

                {/* Moderación */}
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">
                        ⚠️ MODERACIÓN
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard
                            icon={Ban}
                            label="Usuarios Baneados"
                            value={stats?.active_bans}
                            color="bg-red-500"
                            onClick={() => navigate('/admin/users?banned=true')}
                        />
                        <StatCard
                            icon={Shield}
                            label="Acciones Hoy"
                            value="0"
                            color="bg-primary-500"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">
                        ⚡ ACCIONES RÁPIDAS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/admin/complaints')}
                            className="premium-button py-6 text-sm"
                        >
                            <AlertCircle className="w-5 h-5" />
                            VER TODOS LOS RECLAMOS
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/admin/users')}
                            className="glass-card p-6 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <Users className="w-5 h-5 text-primary-500" />
                                <span className="text-sm font-black text-white italic uppercase">
                                    GESTIONAR USUARIOS
                                </span>
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
