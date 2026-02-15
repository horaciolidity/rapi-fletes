import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { Truck, Mail, Lock, User, CheckCircle, ArrowRight, AlertCircle, Loader2, ChevronLeft } from 'lucide-react'

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('user')
    const [justSignedUp, setJustSignedUp] = useState(false)

    const { signIn, signUp, loading, error, setError, user } = useAuthStore()
    const navigate = useNavigate()

    // Redirect if already logged in
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
                // If the user is logged in automatically or needs confirm
                if (user) {
                    setJustSignedUp(true)
                }
            }
        }
    }

    if (justSignedUp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-12 text-center max-w-md w-full border-primary-500/20"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">¡Casi listo!</h2>
                    <p className="text-slate-400 mb-8 font-medium">
                        Hemos enviado un enlace de confirmación a <span className="text-primary-400 font-bold">{email}</span>.
                        Por favor verifica tu correo para activar tu cuenta.
                    </p>
                    <button
                        onClick={() => { setJustSignedUp(false); setIsLogin(true); }}
                        className="premium-button w-full py-4 uppercase tracking-widest font-black text-xs"
                    >
                        Volver al Ingreso
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 md:px-6 relative overflow-hidden">
            {/* Background elements for better alignment and depth */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
            </div>

            <motion.div
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl flex flex-col md:flex-row shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-3xl relative z-10"
            >
                {/* Left Side: Branding/Visual */}
                <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-primary-600 to-secondary-700 p-12 flex-col justify-between text-white relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubic-maze.png')] opacity-10" />
                    <div className="z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 border border-white/30">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black leading-none mb-4 italic tracking-tighter">MUEVE EL <br />FUTURO</h2>
                        <p className="text-primary-100 text-sm font-medium opacity-80 leading-relaxed">
                            Únete a la red logística más eficiente de la región.
                        </p>
                    </div>

                    <div className="z-10 bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Slogan</p>
                        <p className="text-sm font-bold italic">"Traslados rápidos, seguros y transparentes."</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 p-8 md:p-14 bg-slate-900/60 flex flex-col justify-center">
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-2">
                                {isLogin ? 'INGRESA' : 'REGISTRO'}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                {isLogin ? 'Bienvenido a RapiFletes' : 'Crea tu cuenta profesional'}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center md:hidden">
                            <Truck className="w-5 h-5 text-primary-500" />
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    key="signup-extra"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Nombre Completo"
                                            className="input-field pl-12 bg-slate-950/40 border-white/5 py-3.5 text-sm"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>

                                    <div className="flex p-1 bg-slate-950 rounded-2xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setRole('user')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'user' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Cliente
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('driver')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'driver' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Chofer
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="email"
                                placeholder="Email"
                                className="input-field pl-12 bg-slate-950/40 border-white/5 py-3.5 text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="input-field pl-12 bg-slate-950/40 border-white/5 py-3.5 text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-[11px] font-bold"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black hover:bg-primary-500 hover:text-white font-black italic uppercase tracking-tighter py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'ACCEDER AHORA' : 'CREAR MI CUENTA'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <footer className="mt-12 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">
                            {isLogin ? '¿AÚN NO TIENES CUENTA?' : '¿YA ERES MIEMBRO?'}
                        </p>
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="text-primary-400 font-black italic uppercase tracking-tighter text-xl hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto decoration-primary-500/40 underline decoration-4 underline-offset-4"
                        >
                            {isLogin ? 'REGÍSTRATE GRATIS' : 'INICIA SESIÓN'}
                        </button>
                    </footer>

                    {isLogin && (
                        <div className="mt-8 text-center">
                            <button className="text-[9px] font-black text-slate-500 hover:text-primary-400 uppercase tracking-widest opacity-60">
                                ¿OLVIDASTE TU CONTRASEÑA?
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Direct back button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-10 left-10 text-white/40 hover:text-white flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] transition-all"
            >
                <ChevronLeft className="w-4 h-4" /> Volver al Inicio
            </button>
        </div>
    )
}

export default Auth
