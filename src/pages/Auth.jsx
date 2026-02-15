import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { Truck, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('user') // 'user' or 'driver'

    const { signIn, signUp, loading, error, setError } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLogin) {
            const { error } = await signIn(email, password)
            if (!error) navigate('/')
        } else {
            const { error } = await signUp(email, password, fullName, role)
            if (!error) setIsLogin(true)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-950 px-6 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-600 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-600 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="glass-card p-10 border-white/5 bg-slate-900/40 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20 rotate-3">
                            <Truck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                            {isLogin ? '¡Hola de nuevo!' : 'Únete a la flota'}
                        </h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                            {isLogin ? 'Ingresa tus credenciales para continuar' : 'Crea tu cuenta en segundos'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    key="signup-fields"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-5 overflow-hidden"
                                >
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Nombre Completo"
                                            className="input-field pl-12 bg-slate-950/50 border-white/5"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-2xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setRole('user')}
                                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'user' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}
                                        >
                                            Soy Cliente
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('driver')}
                                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'driver' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}
                                        >
                                            Soy Chofer
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                className="input-field pl-12 bg-slate-950/50 border-white/5"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="input-field pl-12 bg-slate-950/50 border-white/5"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`premium-button w-full py-4 flex items-center justify-center gap-2 group transition-all ${loading ? 'opacity-70 scale-[0.98]' : ''}`}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Entrar a mi cuenta' : 'Crear mi cuenta'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        </p>
                        <button
                            onClick={() => { setIsLogin(!isLogin); useAuthStore.getState().setError(null); }}
                            className="text-primary-400 hover:text-primary-300 font-black italic mt-2 uppercase tracking-tight text-lg underline decoration-primary-500/30 underline-offset-4"
                        >
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión ahora'}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Protegido por seguridad de grado militar
                </p>
            </motion.div>
        </div>
    )
}

export default Auth
