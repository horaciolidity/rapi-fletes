import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, CreditCard, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { useWalletStore } from '../../store/useWalletStore'
import { useAuthStore } from '../../store/useAuthStore'

const RechargeModal = ({ isOpen, onClose, wallet }) => {
    const { user } = useAuthStore()
    const { createRechargeRequest } = useWalletStore()
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [step, setStep] = useState('select') // select, payment

    const quickAmounts = [1000, 2000, 5000, 10000]

    const handleQuickSelect = (val) => {
        setAmount(val.toString())
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!amount || parseFloat(amount) <= 0) {
            setError('Ingresa un monto válido')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Aquí iría la lógica para crear la solicitud en Supabase
            // y obtener el preference_id de Mercado Pago
            const request = await createRechargeRequest(user.id, wallet.id, parseFloat(amount))

            if (request) {
                // Simulación por ahora hasta tener la integración real
                setStep('payment')
            } else {
                setError('Error al crear la solicitud de recarga')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Recargar Saldo</h2>
                                <p className="text-[9px] font-black text-zinc-500 uppercase italic">Añade fondos a tu billetera</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 'select' ? (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Quick Selections */}
                                <div className="grid grid-cols-2 gap-3">
                                    {quickAmounts.map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => handleQuickSelect(val)}
                                            className={`py-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${amount === val.toString()
                                                    ? 'bg-primary-500 border-primary-500 text-black shadow-lg shadow-primary-500/20'
                                                    : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10'
                                                }`}
                                        >
                                            <span className="text-[8px] font-black uppercase opacity-60 italic">Cargar</span>
                                            <span className="text-lg font-black italic">$ {val.toLocaleString()}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Amount */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Monto Personalizado</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                            <DollarSign className="w-5 h-5 text-primary-500" />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="input-field py-5 pl-14"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <p className="text-[10px] font-black uppercase italic">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !amount}
                                    className="premium-button w-full py-5 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-[14px]">CONTINUAR AL PAGO</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-10 space-y-8">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CreditCard className="w-10 h-10 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">Pagar con Mercado Pago</h3>
                                    <p className="text-[11px] text-zinc-500 font-bold uppercase italic max-w-xs mx-auto leading-relaxed">
                                        Vas a recargar <span className="text-white">$ {parseFloat(amount).toLocaleString()}</span> para poder seguir aceptando viajes.
                                    </p>
                                </div>

                                {/* Placeholder para el botón de Mercado Pago */}
                                <div className="p-10 border-2 border-dashed border-white/5 rounded-[2rem]">
                                    <p className="text-[9px] font-black text-zinc-700 uppercase italic tracking-[0.2em] mb-4">Módulo de Pago</p>
                                    <button
                                        className="w-full py-5 bg-[#009EE3] text-white font-black italic rounded-2xl hover:bg-[#0089C7] transition-colors"
                                        onClick={() => window.alert('Integración de Mercado Pago en proceso')}
                                    >
                                        PAGAR CON MERCADO PAGO
                                    </button>
                                </div>

                                <button
                                    onClick={() => setStep('select')}
                                    className="text-[10px] font-black text-zinc-500 uppercase italic tracking-widest hover:text-white transition-colors"
                                >
                                    VOLVER A SELECCIONAR MONTO
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 bg-zinc-900/30 text-center">
                        <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">Seguridad RapiFletes 256-bit SSL</p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default RechargeModal
