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
                    className="glass-card p-16 text-center max-w-lg w-full border-primary-500/20 shadow-[0_0_100px_rgba(245,158,11,0.1)]"
                >
                    <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
                        <CheckCircle className="w-12 h-12 text-black" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-6 italic uppercase tracking-tighter">¡Operación Exitosa!</h2>
                    <p className="text-zinc-500 mb-10 font-bold italic uppercase tracking-tight leading-relaxed">
                        Hemos enviado un enlace de confirmación a <br />
                        <span className="text-primary-500">{email}</span>.
                    </p>
                    <button
                        onClick={() => { setJustSignedUp(false); setIsLogin(true); }}
                        className="premium-button w-full"
                    >
                        INGRESAR AHORA
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-6 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-primary-500/5 blur-[100px] rounded-full animate-float" />
                <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-secondary-600/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-5xl flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-[3.5rem] overflow-hidden border border-white/5 bg-zinc-950/40 backdrop-blur-3xl relative z-10"
            >
                {/* Left Side: Branding */}
                <div className="hidden md:flex md:w-[45%] bg-zinc-900 p-16 flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-600/20 pointer-events-none" />
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-500/10 rounded-full blur-[60px]" />

                    <div className="z-10">
                        <div className="flex items-center gap-4 mb-16">
                            <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center p-3 shadow-2xl">
                                <Truck className="w-full h-full text-black" />
                            </div>
                            <span className="text-3xl font-black italic uppercase tracking-tighter">Rapi<span className="text-primary-500">Fletes</span></span>
                        </div>
                        <h2 className="text-6xl font-black leading-[0.9] mb-8 italic tracking-tighter uppercase">
                            DOMINA <br />
                            <span className="text-primary-500">LA CALLE</span>
                        </h2>
                        <p className="text-zinc-500 text-lg font-bold italic uppercase tracking-tight leading-relaxed max-w-xs opacity-80">
                            La red logística más potente a tu disposición.
                        </p>
                    </div>

                    <div className="z-10 flex items-center gap-4 mt-auto">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-primary-500 fill-primary-500" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">+10K USUARIOS ACTIVOS</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 p-10 md:p-20 bg-black/40 flex flex-col justify-center">
                    <div className="mb-14 text-center md:text-left">
                        <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                            {isLogin ? 'ACCESO' : 'UNIRSE'}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
                            CONTROL DE OPERACIONES LOGÍSTICAS
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    key="signup-fields"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <input
                                        type="text"
                                        placeholder="TÚ NOMBRE COMPLETO"
                                        className="input-field"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                    />

                                    <div className="flex p-2 bg-zinc-900 rounded-full border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setRole('user')}
                                            className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${role === 'user' ? 'bg-primary-500 text-black shadow-2xl shadow-primary-500/20' : 'text-zinc-600 hover:text-white'}`}
                                        >
                                            CLIENTE
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('driver')}
                                            className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${role === 'driver' ? 'bg-primary-500 text-black shadow-2xl shadow-primary-500/20' : 'text-zinc-600 hover:text-white'}`}
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
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="CONTRASEÑA"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500 text-xs font-black italic uppercase tracking-tight"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="premium-button w-full flex items-center justify-center gap-6"
                        >
                            {loading ? (
                                <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'DESPLEGAR PANEL' : 'COMPLETAR REGISTRO'}</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-16 text-center">
                        <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-6">
                            {isLogin ? '¿SIN ACCESO AL SISTEMA?' : '¿YA TIENES CUENTA?'}
                        </p>
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="text-white font-black italic uppercase tracking-tighter text-3xl hover:text-primary-500 transition-all underline decoration-primary-500/30 decoration-8 underline-offset-8"
                        >
                            {isLogin ? 'REGISTRARSE' : 'LOGEARSE'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-12 left-12 text-zinc-700 hover:text-primary-500 flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.4em] transition-all group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> VOLVER AL INICIO
            </button>
        </div>
    )
}

export default Auth
