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
        <div className="pb-24 pt-10 min-h-screen text-[var(--text-color)] font-sans selection:bg-primary-500">
            <div className="container mx-auto px-6 max-w-md">

                {/* Profile Header Card */}
                <div className="flex flex-col items-center mb-12 pt-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative mb-8"
                    >
                        <div className="w-32 h-32 rounded-[3.5rem] overflow-hidden border-4 border-[var(--border-color)] shadow-[0_0_50px_rgba(245,158,11,0.15)] relative group cursor-pointer transition-transform hover:scale-105 active:scale-95">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                    <User className="w-14 h-14 text-zinc-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] font-black italic uppercase text-white">Editar</span>
                            </div>
                        </div>
                        <button
                            onClick={handleAvatarUpdate}
                            className="absolute -bottom-2 -right-2 p-3.5 bg-primary-500 rounded-2xl text-black shadow-xl hover:bg-primary-400 transition-colors z-10"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </motion.div>

                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-gradient">
                        {profile.full_name || 'USUARIO'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="badge-gold">MODO {profile.role}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase italic tracking-widest">{user.email}</span>
                    </div>
                </div>

                {/* PREMIUM ROLE SWITCHER */}
                <div className="glass-card mb-10 p-1.5 flex gap-1 relative z-10 backdrop-blur-3xl shadow-primary-500/5">
                    <button
                        onClick={() => handleRoleSwitch('client')}
                        disabled={roleLoading}
                        className={`flex-1 py-5 rounded-[2.5rem] text-[10px] font-black uppercase italic tracking-[0.2em] transition-all duration-500 ${profile.role === 'client' ? 'bg-primary-500 text-black shadow-xl shadow-primary-500/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        CLIENTE
                    </button>
                    <button
                        onClick={() => handleRoleSwitch('driver')}
                        disabled={roleLoading}
                        className={`flex-1 py-5 rounded-[2.5rem] text-[10px] font-black uppercase italic tracking-[0.2em] transition-all duration-500 ${profile.role === 'driver' ? 'bg-primary-500 text-black shadow-xl shadow-primary-500/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        CHOFER
                    </button>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="glass-card p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Settings className="w-20 h-20" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-8 italic flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                            Información Personal
                        </h3>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-4 italic opacity-60">Nombre Completo</label>
                                <input
                                    className="input-field"
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-4 italic opacity-60">Número de Celular</label>
                                <input
                                    className="input-field"
                                    type="tel"
                                    placeholder="Ej: +54 9 261 1234567"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-2xl border text-[10px] font-black uppercase italic text-center ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="premium-button w-full"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>GUARDAR CAMBIOS</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ADVANCED MENU */}
                <div className="space-y-4 mb-12">
                    {profile.role === 'driver' && (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/wallet')}
                                className="p-6 glass-card bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 transition-all text-left group"
                            >
                                <DollarSign className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black text-zinc-500 uppercase italic">Finanzas</p>
                                <p className="text-xs font-black uppercase italic">WALLET</p>
                            </button>
                            <button
                                onClick={() => navigate('/driver')}
                                className="p-6 glass-card bg-primary-500/5 border-primary-500/10 hover:bg-primary-500/10 transition-all text-left group"
                            >
                                <Truck className="w-8 h-8 text-primary-500 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black text-zinc-500 uppercase italic">Operativo</p>
                                <p className="text-xs font-black uppercase italic">PANEL</p>
                            </button>
                        </div>
                    )}

                    <div className="glass-card overflow-hidden divide-y divide-[var(--border-color)]">
                        <MenuButton
                            icon={<ShieldCheck className="w-5 h-5" />}
                            title="Seguridad & Privacidad"
                            onClick={() => { }}
                        />
                        <button
                            onClick={toggleTheme}
                            className={`w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-zinc-900 text-zinc-400' : 'bg-primary-100 text-primary-600'}`}>
                                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase italic tracking-widest text-[var(--text-color)]">APARIENCIA</p>
                                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">{theme === 'dark' ? 'MODO OSCURO' : 'MODO CLARO'}</p>
                                </div>
                            </div>
                            <div className={`w-14 h-7 rounded-full p-1.5 transition-all duration-500 shadow-inner ${theme === 'dark' ? 'bg-zinc-800' : 'bg-primary-500'} relative`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-500 ${theme === 'dark' ? 'translate-x-0' : 'translate-x-7'}`} />
                            </div>
                        </button>
                        <MenuButton
                            icon={<Bell className="w-5 h-5 text-primary-500" />}
                            title="Prueba de Notificaciones"
                            onClick={() => addNotification({ message: '¡Canal de comunicación verificado!', type: 'success' })}
                            badge="OPERATIVO"
                        />
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={async () => {
                        await signOut()
                        navigate('/auth')
                    }}
                    className="w-full flex items-center justify-center gap-4 p-7 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/10 rounded-[2.5rem] text-xs font-black uppercase italic tracking-[0.3em] transition-all duration-500 group shadow-xl"
                >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    CERRAR SESIÓN
                </button>
            </div>
        </div>
    )
}

const MenuButton = ({ icon, title, onClick, badge }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left group"
    >
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-primary-500/30 transition-all">
                {icon}
            </div>
            <div>
                <p className="text-xs font-black uppercase italic tracking-widest text-[var(--text-color)]">{title}</p>
                {badge && <p className="text-[7px] font-black text-primary-500 uppercase tracking-widest italic mt-1">{badge}</p>}
            </div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
    </button>
)

export default Profile
