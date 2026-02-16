import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Camera, Save, Loader2, ShieldCheck, Truck, MapPin, Settings, LogOut, ChevronRight, Bell } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const { user, profile, updateProfile, fetchProfile, signOut } = useAuthStore()
    const { addNotification } = useNotificationStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        avatar_url: ''
    })

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                avatar_url: profile.avatar_url || ''
            })
        }
    }, [user, profile])

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const success = await updateProfile(user.id, formData)

        if (success) {
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
            fetchProfile(user.id)
        } else {
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' })
        }
        setLoading(false)
    }

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    )

    return (
        <div className="pb-24 pt-10 min-h-screen bg-black font-sans selection:bg-primary-500">
            <div className="container mx-auto px-6 max-w-md">

                {/* Profile Header Card */}
                <div className="flex flex-col items-center mb-10 pt-10">
                    <div className="relative mb-6">
                        <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden border-4 border-zinc-900 shadow-2xl relative">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                    <User className="w-12 h-12 text-zinc-700" />
                                </div>
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-primary-500 rounded-2xl text-black shadow-xl scale-90 active:scale-75 transition-transform">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-1">
                        {profile.full_name || 'USUARIO'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
                            <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest italic">{profile.role}</span>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase italic">{user.email}</span>
                    </div>
                </div>

                {/* Account Settings Forms */}
                <div className="space-y-4 mb-10">
                    <div className="glass-card p-6 bg-zinc-950/80 border-zinc-900 shadow-xl">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-6 italic">Información Personal</h3>
                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Nombre</label>
                                <input
                                    className="w-full px-6 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-sm italic font-bold placeholder:text-zinc-700 outline-none focus:border-primary-500/50"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Celular</label>
                                <input
                                    className="w-full px-6 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-sm italic font-bold placeholder:text-zinc-700 outline-none focus:border-primary-500/50"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            {message.text && (
                                <p className={`text-[9px] font-black uppercase italic text-center ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                    {message.text}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary-500 text-black text-[10px] font-black uppercase italic rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
                            >
                                {loading ? 'GUARDANDO...' : 'ACTUALIZAR PERFIL'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Driver / Advanced Menu */}
                <div className="space-y-3 mb-10">
                    {profile.role === 'driver' && (
                        <button
                            onClick={() => navigate('/driver')}
                            className="w-full flex items-center justify-between p-6 glass-card border-primary-500/20 bg-primary-500/5 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-500 rounded-xl text-black">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase italic">Control</p>
                                    <p className="text-xs font-black text-white uppercase italic">PANEL DE CHOFER</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    <div className="glass-card overflow-hidden divide-y divide-white/5">
                        <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="w-5 h-5 text-zinc-500" />
                                <span className="text-xs font-black text-zinc-400 uppercase italic tracking-wider">Seguridad</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-800" />
                        </button>
                        <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <Settings className="w-5 h-5 text-zinc-500" />
                                <span className="text-xs font-black text-zinc-400 uppercase italic tracking-wider">Ajustes</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-800" />
                        </button>
                        <button
                            onClick={() => addNotification({ message: '¡Notificación de prueba operativa!', type: 'success' })}
                            className="w-full flex items-center justify-between p-5 hover:bg-zinc-900/50 transition-colors border-t border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <Bell className="w-5 h-5 text-primary-500" />
                                <span className="text-xs font-black text-white uppercase italic tracking-wider">Probar Notificaciones</span>
                            </div>
                            <div className="px-2 py-0.5 bg-primary-500/10 rounded text-[7px] font-black text-primary-500 uppercase italic">Test</div>
                        </button>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-3 p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-500 text-[10px] font-black uppercase italic tracking-widest hover:bg-red-500 hover:text-black transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    CERRAR SESIÓN
                </button>
            </div>
        </div>
    )
}

export default Profile
