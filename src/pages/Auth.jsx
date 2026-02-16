import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { Truck, Mail, Lock, User, CheckCircle, ArrowRight, AlertCircle, Loader2, ChevronLeft, Star } from 'lucide-react'

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('user')
    const [justSignedUp, setJustSignedUp] = useState(false)

    const { signIn, signUp, loading, error, setError, user } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLogin) {
            const { error } = await signIn(email, password)
            if (!error) navigate('/')
        } else {
            const { user, error } = await signUp(email, password, fullName, role)
            if (!error) {
                if (user) setJustSignedUp(true)
            }
        }
    }

    if (justSignedUp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-10 text-center max-w-sm w-full border-primary-500/20"
                >
                    <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <CheckCircle className="w-10 h-10 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">¡LISTO!</h2>
                    <p className="text-zinc-500 mb-10 font-bold italic uppercase tracking-tight text-[11px] leading-relaxed">
                        Enviamos un link de confirmación a <br />
                        <span className="text-primary-500">{email}</span>.
                    </p>
                    <button
                        onClick={() => { setJustSignedUp(false); setIsLogin(true); }}
                        className="premium-button w-full py-4 text-[10px]"
                    >
                        INGRESAR
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 relative overflow-hidden font-sans">
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate('/')} className="text-zinc-600 flex items-center gap-2 font-black text-[10px] uppercase italic">
                    <ChevronLeft className="w-4 h-4" /> INICIO
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-12"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
                        <Truck className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                        {isLogin ? 'ACCESO' : 'UNIRSE'}
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 mt-2">
                        CONTROL OPERATIVO RAPIFLETES
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode='wait'>
                        {!isLogin && (
                            <motion.div
                                key="signup-fields"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <input
                                    type="text"
                                    placeholder="NOMBRE COMPLETO"
                                    className="input-field py-4 text-sm"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                />

                                <div className="flex p-1 bg-zinc-950 rounded-2xl border border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${role === 'user' ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/10' : 'text-zinc-600'}`}
                                    >
                                        CLIENTE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('driver')}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${role === 'driver' ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/10' : 'text-zinc-600'}`}
                                    >
                                        CHOFER
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input
                        type="email"
                        placeholder="EMAIL"
                        className="input-field py-4 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="CONTRASEÑA"
                        className="input-field py-4 text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="text-red-500 text-[10px] font-black uppercase italic text-center animate-pulse px-4">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-button w-full flex items-center justify-center gap-4 py-5"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <span className="text-[12px]">{isLogin ? 'INGRESAR' : 'REGISTRARSE'}</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-8 border-t border-zinc-900/50">
                    <p className="text-[10px] font-black text-zinc-800 uppercase mb-4 italic">
                        {isLogin ? '¿NO TIENES CUENTA?' : '¿YA TIENES CUENTA?'}
                    </p>
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-white font-black italic uppercase tracking-widest text-lg hover:text-primary-500 transition-all underline decoration-primary-500/20"
                    >
                        {isLogin ? 'CREAR PERFIL' : 'VOLVER AL LOGIN'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default Auth
