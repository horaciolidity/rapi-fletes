import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useWalletStore = create((set, get) => ({
    wallet: null,
    transactions: [],
    rechargeRequests: [],
    transactionFilter: 'all', // 'all' | 'deposit' | 'commission' | 'refund' | 'support' | 'withdrawal'
    loading: false,
    error: null,

    // Obtener billetera del chofer
    fetchWallet: async (driverId) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('wallets')
                .select('*')
                .eq('driver_id', driverId)
                .maybeSingle()

            if (error) throw error

            if (!data) {
                const { data: newWallet, error: createError } = await supabase
                    .from('wallets')
                    .insert({ driver_id: driverId, balance: 0.00 })
                    .select()
                    .single()

                if (createError) throw createError
                set({ wallet: newWallet, loading: false })
                return newWallet
            }

            set({ wallet: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching wallet:', err)
            set({ error: err.message, loading: false })
            return null
        }
    },

    // Obtener transacciones con filtro por categoría opcional
    fetchTransactions: async (walletId, limit = 100, category = null) => {
        set({ loading: true, error: null })
        try {
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('wallet_id', walletId)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (category && category !== 'all') {
                query = query.eq('transaction_category', category)
            }

            const { data, error } = await query
            if (error) throw error
            set({ transactions: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching transactions:', err)
            set({ error: err.message, loading: false })
            return []
        }
    },

    // Cambiar filtro activo y re-fetch
    setTransactionFilter: async (filter) => {
        set({ transactionFilter: filter })
        const { wallet } = get()
        if (wallet) {
            await get().fetchTransactions(wallet.id, 100, filter)
        }
    },

    // Calcular cuánto se cobraría de comisión SIN cobrar (para mostrar al chofer)
    calculateCommission: async (driverId, fleteId) => {
        try {
            const { data, error } = await supabase.rpc('calculate_trip_commission', {
                p_driver_id: driverId,
                p_flete_id: fleteId
            })
            if (error) throw error
            return data
        } catch (err) {
            console.error('Error calculating commission:', err)
            return null
        }
    },

    // Cobrar comisión atómicamente al aceptar un viaje
    chargeCommission: async (driverId, fleteId) => {
        try {
            const { data, error } = await supabase.rpc('charge_trip_commission', {
                p_driver_id: driverId,
                p_flete_id: fleteId
            })
            if (error) throw error

            if (data?.success) {
                await get().fetchWallet(driverId)
            }

            return data // { success, commission_amount, commission_rate, new_balance } or { success: false, error }
        } catch (err) {
            console.error('Error charging commission:', err)
            return { success: false, error: err.message }
        }
    },

    // Crear solicitud de recarga
    createRechargeRequest: async (driverId, walletId, amount) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('recharge_requests')
                .insert({
                    driver_id: driverId,
                    wallet_id: walletId,
                    amount: amount,
                    status: 'pending'
                })
                .select()
                .single()

            if (error) throw error
            set({ loading: false })
            return data
        } catch (err) {
            console.error('Error creating recharge request:', err)
            set({ error: err.message, loading: false })
            return null
        }
    },

    // Actualizar solicitud de recarga con datos de Mercado Pago
    updateRechargeRequest: async (rechargeId, updates) => {
        try {
            const { data, error } = await supabase
                .from('recharge_requests')
                .update(updates)
                .eq('id', rechargeId)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (err) {
            console.error('Error updating recharge request:', err)
            return null
        }
    },

    // Obtener solicitudes de recarga
    fetchRechargeRequests: async (driverId) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('recharge_requests')
                .select('*')
                .eq('driver_id', driverId)
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            set({ rechargeRequests: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching recharge requests:', err)
            set({ error: err.message, loading: false })
            return []
        }
    },

    // Procesar recarga aprobada
    processApprovedRecharge: async (rechargeId, paymentId, mpResponse) => {
        try {
            const { data, error } = await supabase.rpc('process_approved_recharge', {
                p_recharge_id: rechargeId,
                p_payment_id: paymentId,
                p_mp_response: mpResponse
            })

            if (error) throw error

            const wallet = get().wallet
            if (wallet) await get().fetchWallet(wallet.driver_id)

            return true
        } catch (err) {
            console.error('Error processing approved recharge:', err)
            return false
        }
    },

    // Limpiar estado
    clearWallet: () => {
        set({
            wallet: null,
            transactions: [],
            rechargeRequests: [],
            transactionFilter: 'all',
            loading: false,
            error: null
        })
    }
}))
