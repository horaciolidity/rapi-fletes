import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Truck, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('user')
    const { signIn, signUp, loading, error } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLogin) {
            const { user, error } = await signIn(email, password)
            if (user && !error) navigate('/')
        } else {
            const { user, error } = await signUp(email, password, fullName, role)
            if (user && !error) {
                alert('Registro exitoso! Por favor verifica tu email o intenta iniciar sesión.')
                setIsLogin(true)
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4">
                        <Truck className="w-8 h-8 text-primary-500" />
                    </div>
                    <h2 className="text-3xl font-bold">{isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}</h2>
                    <p className="text-slate-400 mt-2">
                        {isLogin ? 'Ingresa tus credenciales para continuar' : 'Únete a la red de fletes más moderna'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="input-field pl-12"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Quiero ser...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold ${role === 'user' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-slate-700 bg-slate-800/30 text-slate-500 hover:border-slate-600'}`}
                                    >
                                        Usuario/Cliente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('driver')}
                                        className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold ${role === 'driver' ? 'border-secondary-500 bg-secondary-500/10 text-secondary-400' : 'border-slate-700 bg-slate-800/30 text-slate-500 hover:border-slate-600'}`}
                                    >
                                        Chofer
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-12"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-12"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-button w-full flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-8 pt-8 border-t border-slate-800">
                    <p className="text-slate-500 text-sm">
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-primary-400 font-bold hover:underline"
                        >
                            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default Auth
