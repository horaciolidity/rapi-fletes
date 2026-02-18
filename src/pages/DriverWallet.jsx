import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useWalletStore } from '../store/useWalletStore'
import { useAuthStore } from '../store/useAuthStore'
import RechargeModal from '../components/wallet/RechargeModal'

const DriverWallet = () => {
    const { user, profile } = useAuthStore()
    const { wallet, transactions, loading, fetchWallet, fetchTransactions } = useWalletStore()
    const [showRechargeModal, setShowRechargeModal] = useState(false)

    useEffect(() => {
        if (user && profile?.role === 'driver') {
            fetchWallet(user.id)
        }
    }, [user, profile])

    useEffect(() => {
        if (wallet) {
            fetchTransactions(wallet.id)
        }
    }, [wallet])

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'recharge':
                return { icon: Plus, color: 'text-green-500', bg: 'bg-green-500/10' }
            case 'trip_earning':
                return { icon: TrendingUp, color: 'text-primary-500', bg: 'bg-primary-500/10' }
            case 'commission':
                return { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10' }
            case 'withdrawal':
                return { icon: ArrowDownRight, color: 'text-blue-500', bg: 'bg-blue-500/10' }
            default:
                return { icon: DollarSign, color: 'text-zinc-500', bg: 'bg-zinc-500/10' }
        }
    }

    const getTransactionLabel = (type) => {
        switch (type) {
            case 'recharge': return 'Recarga'
            case 'trip_earning': return 'Ganancia de Viaje'
            case 'commission': return 'Comisión'
            case 'withdrawal': return 'Retiro'
            default: return type
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading && !wallet) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Wallet className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Cargando billetera...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                    💰 MI BILLETERA
                </h1>
                <p className="text-[10px] font-bold text-zinc-600 uppercase italic">
                    Gestiona tu saldo y movimientos
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-400 p-8 shadow-2xl shadow-primary-500/20"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-24 -translate-x-24" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-5 h-5 text-black/60" />
                            <p className="text-[10px] font-black text-black/60 uppercase italic">
                                Saldo Disponible
                            </p>
                        </div>
                        <p className="text-5xl font-black text-black italic mb-6">
                            $ {wallet?.balance?.toFixed(2) || '0.00'}
                        </p>

                        <button
                            onClick={() => setShowRechargeModal(true)}
                            className="w-full py-4 bg-black text-primary-500 font-black italic text-[11px] uppercase rounded-2xl hover:bg-black/90 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            RECARGAR SALDO
                        </button>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-4 bg-green-500/5 border-green-500/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <p className="text-[8px] font-black text-green-500 uppercase italic">
                                Ingresos
                            </p>
                        </div>
                        <p className="text-2xl font-black text-white italic">
                            $ {transactions
                                .filter(t => t.type === 'trip_earning' || t.type === 'recharge')
                                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                .toFixed(2)}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-4 bg-red-500/5 border-red-500/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <p className="text-[8px] font-black text-red-500 uppercase italic">
                                Egresos
                            </p>
                        </div>
                        <p className="text-2xl font-black text-white italic">
                            $ {Math.abs(transactions
                                .filter(t => t.type === 'commission' || t.type === 'withdrawal')
                                .reduce((sum, t) => sum + parseFloat(t.amount), 0))
                                .toFixed(2)}
                        </p>
                    </motion.div>
                </div>

                {/* Transactions List */}
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">
                        📊 MOVIMIENTOS RECIENTES
                    </h2>

                    {transactions.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 text-sm italic">
                                No hay movimientos aún
                            </p>
                            <p className="text-zinc-700 text-xs mt-1">
                                Tus transacciones aparecerán aquí
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((transaction, index) => {
                                const { icon: Icon, color, bg } = getTransactionIcon(transaction.type)
                                const isPositive = parseFloat(transaction.amount) > 0

                                return (
                                    <motion.div
                                        key={transaction.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-card p-4 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-6 h-6 ${color}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-white italic uppercase truncate">
                                                    {getTransactionLabel(transaction.type)}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 truncate">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-[9px] text-zinc-600 mt-1">
                                                    {formatDate(transaction.created_at)}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className={`text-lg font-black italic ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isPositive ? '+' : ''}$ {parseFloat(transaction.amount).toFixed(2)}
                                                </p>
                                                <p className="text-[9px] text-zinc-600">
                                                    Saldo: $ {parseFloat(transaction.balance_after).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Recharge Modal */}
            <RechargeModal
                isOpen={showRechargeModal}
                onClose={() => setShowRechargeModal(false)}
                wallet={wallet}
            />
        </div>
    )
}

export default DriverWallet
