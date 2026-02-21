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
            <div className="min-h-screen flex items-center justify-center bg-black px-6 relative overflow-hidden">
                <div className="bg-mesh opacity-30 fixed inset-0 pointer-events-none" />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-12 text-center max-w-sm w-full border-primary-500/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative z-10"
                >
                    <div className="w-24 h-24 bg-primary-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] border-2 border-primary-400/20">
                        <CheckCircle className="w-12 h-12 text-black" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">¡LISTO!</h2>
                    <p className="text-zinc-500 mb-10 font-bold italic uppercase tracking-tight text-[11px] leading-relaxed">
                        Enviamos un link de confirmación a <br />
                        <span className="text-primary-500 block mt-2 text-xs">{email}</span>
                    </p>
                    <button
                        onClick={() => { setJustSignedUp(false); setIsLogin(true); }}
                        className="premium-button w-full py-5 text-[10px]"
                    >
                        INGRESAR
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 relative overflow-hidden font-sans selection:bg-primary-500">
            <div className="bg-mesh opacity-20 fixed inset-0 pointer-events-none" />

            <div className="absolute top-10 left-8 z-30">
                <button
                    onClick={() => navigate('/')}
                    className="text-zinc-600 hover:text-white transition-colors flex items-center gap-3 font-black text-[10px] uppercase italic tracking-widest"
                >
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    VOLVER
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-12 relative z-20"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 3, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-20 h-20 bg-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_60px_rgba(245,158,11,0.2)] border-2 border-primary-400/20"
                    >
                        <Truck className="w-12 h-12 text-black" />
                    </motion.div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gradient leading-none">
                        {isLogin ? 'ACCESO' : 'UNIRSE'}
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="w-8 h-[1px] bg-primary-500/20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">
                            CONTROL OPERATIVO
                        </p>
                        <div className="w-8 h-[1px] bg-primary-500/20" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode='wait'>
                        {!isLogin && (
                            <motion.div
                                key="signup-fields"
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className="space-y-5 overflow-hidden"
                            >
                                <div className="group">
                                    <input
                                        type="text"
                                        placeholder="NOMBRE COMPLETO"
                                        className="input-field py-5 text-xs bg-zinc-950/40 border-white/5 focus:border-primary-500/30 uppercase tracking-widest"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                    />
                                </div>

                                <div className="flex p-1.5 bg-zinc-950/60 rounded-[2.2rem] border border-white/5 backdrop-blur-3xl">
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase italic tracking-widest transition-all duration-500 ${role === 'user' ? 'bg-primary-500 text-black shadow-xl shadow-primary-500/20' : 'text-zinc-600 hover:text-white'}`}
                                    >
                                        CLIENTE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('driver')}
                                        className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase italic tracking-widest transition-all duration-500 ${role === 'driver' ? 'bg-primary-500 text-black shadow-xl shadow-primary-500/20' : 'text-zinc-600 hover:text-white'}`}
                                    >
                                        CHOFER
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-5">
                        <input
                            type="email"
                            placeholder="DIRECCIÓN DE EMAIL"
                            className="input-field py-5 text-xs bg-zinc-950/40 border-white/5 focus:border-primary-500/30 uppercase tracking-widest"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="CLAVE DE ACCESO"
                            className="input-field py-5 text-xs bg-zinc-950/40 border-white/5 focus:border-primary-500/30 uppercase tracking-widest"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
                        >
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-red-500 text-[9px] font-black uppercase italic tracking-wider leading-relaxed">{error}</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-button w-full flex items-center justify-center gap-5 py-6 mt-4 shadow-[0_20px_50px_rgba(245,158,11,0.15)] group"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <span className="text-[12px] font-black tracking-[0.2em]">{isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-10 border-t border-white/5">
                    <p className="text-[10px] font-black text-zinc-700 uppercase mb-4 italic tracking-widest">
                        {isLogin ? '¿SIN ACCESO PERMITIDO?' : '¿YA TIENES CREDENCIALES?'}
                    </p>
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-white hover:text-primary-500 font-black italic uppercase tracking-[0.2em] text-xs transition-all border-b-2 border-primary-500/20 hover:border-primary-500 pb-1"
                    >
                        {isLogin ? 'SOLICITAR REGISTRO' : 'VOLVER AL ACCESO'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default Auth
