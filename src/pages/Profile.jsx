import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Camera, Save, Loader2, ShieldCheck, Truck, MapPin, Settings } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const { user, profile, updateProfile, fetchProfile } = useAuthStore()
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
        <div className="pt-32 pb-20 min-h-screen bg-black font-sans selection:bg-primary-500 selection:text-black">
            <div className="container mx-auto px-6 max-w-4xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] overflow-hidden border-4 border-zinc-900 group-hover:border-primary-500 transition-all duration-500 shadow-2xl">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                    <User className="w-16 h-16 text-zinc-700" />
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-2 right-2 p-3 bg-primary-500 rounded-2xl text-black shadow-xl hover:scale-110 transition-all active:scale-95">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                                {profile.full_name || 'Configuración'}
                            </h1>
                            <div className="px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
                                <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest italic">{profile.role}</span>
                            </div>
                        </div>
                        <p className="text-zinc-500 font-bold italic uppercase tracking-[0.2em] text-xs">Información de cuenta y seguridad</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="glass-card p-8 bg-zinc-950/50 border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-6 italic">Estado de Cuenta</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase italic">Verificación</p>
                                        <p className="text-xs font-black text-white uppercase italic">{profile.verification_status || 'ESTÁNDAR'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-zinc-700" />
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase italic">Email</p>
                                        <p className="text-xs font-black text-white truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {profile.role === 'driver' && (
                            <div className="glass-card p-8 bg-primary-500/5 border-primary-500/10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 mb-6 italic">Info de Vehículo</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-4 h-4 text-primary-500" />
                                        <p className="text-[10px] font-black text-white uppercase italic tracking-wider">{profile.vehicle_details?.model || 'No registrado'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-primary-500" />
                                        <p className="text-[10px] font-black text-white uppercase italic tracking-wider">{profile.license_plate || 'SIN PATENTE'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/driver')}
                                    className="w-full mt-6 py-3 bg-primary-500/10 border border-primary-500/30 text-primary-500 text-[9px] font-black uppercase italic rounded-xl hover:bg-primary-500 hover:text-black transition-all"
                                >
                                    GESTIONAR FLOTA
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleUpdate}
                            className="glass-card p-10 md:p-12 bg-zinc-950/80 border-zinc-900 shadow-2xl space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-2 italic">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800" />
                                        <input
                                            className="input-field pl-16 py-4 text-sm"
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Tu nombre real"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-2 italic">Teléfono de contacto</label>
                                    <div className="relative">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800" />
                                        <input
                                            className="input-field pl-16 py-4 text-sm"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+54 9 11 ..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                >
                                    {message.text}
                                </motion.div>
                            )}

                            <div className="pt-6 border-t border-zinc-900">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="premium-button w-full flex items-center justify-center gap-4 py-5"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>GUARDAR CONFIGURACIÓN</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.form>

                        <div className="glass-card p-10 bg-zinc-950/20 border-dashed border-2 border-zinc-900 flex flex-col items-center justify-center text-center group hover:border-zinc-700 transition-all cursor-pointer">
                            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-all duration-500">
                                <Settings className="w-8 h-8 text-zinc-700 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <h4 className="text-xl font-black italic uppercase tracking-tighter text-zinc-700 group-hover:text-white transition-colors">Ajustes Avanzados</h4>
                            <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest mt-2 italic">Notificaciones, Seguridad y Privacidad</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
