import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Camera, Save, Loader2, ShieldCheck, Truck, MapPin, Settings, LogOut, ChevronRight, Bell, DollarSign, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/useThemeStore'
import { Moon, Sun } from 'lucide-react'

const Profile = () => {
    const { user, profile, updateProfile, fetchProfile, signOut } = useAuthStore()
    const { addNotification } = useNotificationStore()
    const { theme, toggleTheme } = useThemeStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [roleLoading, setRoleLoading] = useState(false)
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

        if (!formData.full_name || !formData.phone) {
            setMessage({ type: 'error', text: 'El nombre y el teléfono son obligatorios' })
            return
        }

        setLoading(true)
        setMessage({ type: '', text: '' })

        const res = await updateProfile(user.id, formData)

        if (res.data) {
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
            fetchProfile(user.id)
        } else {
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' })
        }
        setLoading(false)
    }

    const handleRoleSwitch = async (newRole) => {
        if (newRole === profile.role) return
        setRoleLoading(true)
        const res = await updateProfile(user.id, { role: newRole })
        if (res.data) {
            addNotification({
                message: `🔄 Modo ${newRole === 'driver' ? 'CONDUCTOR' : 'CLIENTE'} activado correctamente`,
                type: 'success'
            })
            fetchProfile(user.id)
            // Redirect based on role if needed
            if (newRole === 'driver') navigate('/driver')
            else navigate('/')
        }
        setRoleLoading(false)
    }

    const isProfileIncomplete = !profile?.full_name || !profile?.phone || !profile?.avatar_url

    const handleAvatarUpdate = () => {
        const url = prompt('Ingrese la URL de su foto de perfil:', formData.avatar_url)
        if (url !== null) {
            setFormData({ ...formData, avatar_url: url })
        }
    }

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    )

    return (
        <div className="pb-24 pt-10 min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans selection:bg-primary-500">
            <div className="container mx-auto px-6 max-w-md">

                {isProfileIncomplete && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                    >
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-[10px] font-black text-red-500 uppercase italic">Tu perfil está incompleto. Completa tu nombre, teléfono y foto para poder operar.</p>
                    </motion.div>
                )}

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
                        <button
                            onClick={handleAvatarUpdate}
                            className="absolute -bottom-2 -right-2 p-3 bg-primary-500 rounded-2xl text-black shadow-xl scale-90 active:scale-75 transition-transform"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1">
                        {profile.full_name || 'USUARIO'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-[var(--card-bg)] rounded-full border border-[var(--border-color)] shadow-sm">
                            <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest italic">{profile.role}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase italic">{user.email}</span>
                    </div>
                </div>

                {/* Role Switcher */}
                <div className="glass-card mb-6 overflow-hidden p-1 flex">
                    <button
                        onClick={() => handleRoleSwitch('client')}
                        disabled={roleLoading || isProfileIncomplete}
                        className={`flex-1 py-4 px-2 rounded-[2rem] text-[10px] font-black uppercase italic tracking-widest transition-all ${profile.role === 'client' ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-zinc-500 hover:text-white'} ${isProfileIncomplete && 'opacity-50 cursor-not-allowed'}`}
                    >
                        MODO CLIENTE
                    </button>
                    <button
                        onClick={() => handleRoleSwitch('driver')}
                        disabled={roleLoading || isProfileIncomplete}
                        className={`flex-1 py-4 px-2 rounded-[2rem] text-[10px] font-black uppercase italic tracking-widest transition-all ${profile.role === 'driver' ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-zinc-500 hover:text-white'} ${isProfileIncomplete && 'opacity-50 cursor-not-allowed'}`}
                    >
                        MODO CHOFER
                    </button>
                </div>

                {/* Account Settings Forms */}
                <div className="space-y-4 mb-10">
                    <div className="glass-card p-6 shadow-xl">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 italic flex items-center gap-2">
                            Información Personal <span className="text-red-500">*</span>
                        </h3>
                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 italic">Nombre Completo <span className="text-red-500">*</span></label>
                                <input
                                    className="input-field"
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 italic">Número de Celular <span className="text-red-500">*</span></label>
                                <input
                                    className="input-field"
                                    type="tel"
                                    placeholder="Ej: +54 9 261 1234567"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
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
                                className="w-full py-4 bg-primary-500 text-black text-[11px] font-black uppercase italic rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'GUARDAR CAMBIOS'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Driver / Advanced Menu */}
                <div className="space-y-3 mb-10">
                    {profile.role === 'driver' && (
                        <>
                            <button
                                onClick={() => navigate('/wallet')}
                                className="w-full flex items-center justify-between p-6 glass-card border-green-500/20 bg-green-500/5 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500 rounded-xl text-black">
                                        <DollarSign className="w-5 h-5 text-black" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase italic">Finanzas</p>
                                        <p className="text-xs font-black uppercase italic">MI BILLETERA</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" />
                            </button>

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
                                        <p className="text-xs font-black uppercase italic">PANEL DE CHOFER</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                    {profile.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full flex items-center justify-between p-6 glass-card border-secondary-600/20 bg-secondary-600/5 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary-600 rounded-xl text-black">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase italic">Sistema</p>
                                    <p className="text-xs font-black uppercase italic">PANEL DE ADMIN</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-secondary-600 group-hover:translate-x-1 transition-transform" />
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
                        <button
                            onClick={toggleTheme}
                            className={`w-full flex items-center justify-between p-5 hover:bg-zinc-900/50 transition-colors border-t border-white/5`}
                        >
                            <div className="flex items-center gap-4">
                                {theme === 'dark' ? <Moon className="w-5 h-5 text-zinc-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
                                <span className={`text-xs font-black uppercase italic tracking-wider ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    Modo {theme === 'dark' ? 'Oscuro' : 'Claro'}
                                </span>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-zinc-800' : 'bg-primary-500'} relative`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-0' : 'translate-x-6'}`} />
                            </div>
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
                                <span className="text-xs font-black uppercase italic tracking-wider">Probar Notificaciones</span>
                            </div>
                            <div className="px-2 py-0.5 bg-primary-500/10 rounded text-[7px] font-black text-primary-500 uppercase italic">Test</div>
                        </button>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={async () => {
                        await signOut()
                        navigate('/auth')
                    }}
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
