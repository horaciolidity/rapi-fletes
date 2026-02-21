import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Filter, Ban, ShieldAlert, AlertTriangle, Eye, User as UserIcon, MoreVertical, X, Check, Loader2, ShieldCheck, Flag } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { useAuthStore } from '../store/useAuthStore'

const AdminUsers = () => {
    const { user: currentAdmin } = useAuthStore()
    const {
        users, loading, fetchUsers, banUser, warnUser, liftBan,
        reportedRanking, fetchReportedRanking
    } = useAdminStore()

    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [actionType, setActionType] = useState(null) // 'ban', 'warn', 'detail'
    const [reason, setReason] = useState('')
    const [view, setView] = useState('all') // 'all', 'reported'

    useEffect(() => {
        fetchUsers()
        fetchReportedRanking()
    }, [])

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.phone?.includes(searchTerm) ||
            u.id.includes(searchTerm)
        const matchesRole = filterRole === 'all' || u.role === filterRole
        return matchesSearch && matchesRole
    })

    const handleAction = async () => {
        if (!reason.trim()) return

        if (actionType === 'ban') {
            await banUser(selectedUser.id, currentAdmin.id, reason, 'permanent')
        } else if (actionType === 'warn') {
            await warnUser(selectedUser.id, currentAdmin.id, reason, 'high')
        }

        setReason('')
        setActionType('detail')
        fetchUsers()
    }

    const UserCard = ({ user }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-5 bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60 transition-all flex items-center justify-between group"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-6 h-6 text-zinc-600" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white uppercase italic">{user.full_name || 'SIN NOMBRE'}</h3>
                        {user.is_banned && <Ban className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${user.role === 'driver' ? 'bg-blue-500/10 text-blue-500' : 'bg-secondary-500/10 text-secondary-500'}`}>
                            {user.role}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-600">{user.phone || 'S/T'}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => {
                    setSelectedUser(user)
                    setActionType('detail')
                    setShowModal(true)
                }}
                className="p-3 bg-zinc-800/50 rounded-xl text-zinc-500 hover:text-primary-500 hover:bg-zinc-800 transition-all"
            >
                <Eye className="w-4 h-4" />
            </button>
        </motion.div>
    )

    return (
        <div className="min-h-screen bg-black pb-24 text-white">
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary-500" />
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">GESTIÓN USUARIOS</h1>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* View Switcher */}
                <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setView('all')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${view === 'all' ? 'bg-primary-500 text-black' : 'text-zinc-500'}`}
                    >
                        TODOS LOS USUARIOS
                    </button>
                    <button
                        onClick={() => setView('reported')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${view === 'reported' ? 'bg-red-500 text-white' : 'text-zinc-500'}`}
                    >
                        MÁS REPORTADOS
                    </button>
                </div>

                {view === 'all' ? (
                    <>
                        {/* Search & Filters */}
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white outline-none focus:border-primary-500/30"
                                    placeholder="BUSCAR POR NOMBRE, TEL O ID..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-zinc-900/50 border border-white/5 rounded-2xl px-4 text-[10px] font-black uppercase italic outline-none"
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value)}
                            >
                                <option value="all">TODOS</option>
                                <option value="client">CLIENTE</option>
                                <option value="driver">CHOFER</option>
                                <option value="admin">ADMIN</option>
                            </select>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-800" /></div>
                            ) : (
                                filteredUsers.map(u => <UserCard key={u.id} user={u} />)
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-3">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            <p className="text-[10px] font-black text-red-500 uppercase italic">RANKING DE CUENTAS CON MÁS RECLAMOS</p>
                        </div>
                        {reportedRanking.length > 0 ? (
                            reportedRanking.map((u, idx) => (
                                <div key={u.id} className="glass-card p-5 bg-zinc-950 border-red-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-red-500 text-black flex items-center justify-center font-black text-xs">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase text-white">{u.full_name}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase">{u.role} • {u.complaint_count} RECLAMOS</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const fullUser = users.find(fu => fu.id === u.id)
                                            setSelectedUser(fullUser || u)
                                            setActionType('detail')
                                            setShowModal(true)
                                        }}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-zinc-600 uppercase italic font-black py-20">SIN DATOS DE REPORTES TODAVÍA</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Detail/Action */}
            <AnimatePresence>
                {showModal && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-zinc-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                            <div className="p-8 space-y-6">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">ESTADO DE CUENTA</h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
                                </div>

                                {/* User Bio */}
                                <div className="flex items-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-zinc-800 border-2 border-primary-500/30 overflow-hidden">
                                        {selectedUser.avatar_url && <img src={selectedUser.avatar_url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest italic mb-1">USUARIO SELECCIONADO</p>
                                        <h3 className="text-xl font-black text-white italic uppercase">{selectedUser.full_name}</h3>
                                        <p className="text-xs font-bold text-zinc-400">{selectedUser.phone}</p>
                                        <p className="text-[7px] font-bold text-zinc-600 uppercase mt-2 mono">{selectedUser.id}</p>
                                    </div>
                                </div>

                                {actionType === 'detail' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black text-zinc-600 uppercase italic mb-1">ADVERTENCIAS</p>
                                                <p className={`text-2xl font-black italic ${selectedUser.warnings?.length > 0 ? 'text-yellow-500' : 'text-zinc-800'}`}>{selectedUser.warnings?.length || 0}</p>
                                            </div>
                                            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 text-right">
                                                <p className="text-[8px] font-black text-zinc-600 uppercase italic mb-1">ESTADO</p>
                                                <p className={`text-sm font-black italic ${selectedUser.is_banned ? 'text-red-500' : 'text-green-500'}`}>{selectedUser.is_banned ? 'BANEADO' : 'ACTIVO'}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            {!selectedUser.is_banned ? (
                                                <>
                                                    <button onClick={() => setActionType('warn')} className="flex-1 py-4 bg-yellow-500 text-black font-black italic text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2">
                                                        <Flag className="w-4 h-4" /> ADVERTIR
                                                    </button>
                                                    <button onClick={() => setActionType('ban')} className="flex-1 py-4 bg-red-500 text-white font-black italic text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2">
                                                        <Ban className="w-4 h-4" /> BANEAR
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => liftBan(selectedUser.bans[0]?.id, currentAdmin.id)} className="w-full py-4 bg-green-500 text-black font-black italic text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" /> LEVANTAR RESTRICCIÓN
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-red-500 mb-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            <p className="text-sm font-black italic uppercase">MOTIVO DE LA {actionType === 'ban' ? 'SANCIÓN' : 'ADVERTENCIA'}</p>
                                        </div>
                                        <textarea
                                            className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-red-500/50 min-h-[120px] resize-none uppercase italic"
                                            placeholder="DESCRIBA EL INCIDENTE O INFRACCIÓN..."
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={() => setActionType('detail')} className="flex-1 py-4 bg-zinc-800 text-white font-black italic text-[10px] uppercase rounded-2xl">CANCELAR</button>
                                            <button onClick={handleAction} className={`flex-1 py-4 font-black italic text-[10px] uppercase rounded-2xl ${actionType === 'ban' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>CONFIRMAR ACCIÓN</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminUsers
