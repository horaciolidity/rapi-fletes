import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useWalletStore = create((set, get) => ({
    wallet: null,
    transactions: [],
    rechargeRequests: [],
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

            // Si no existe billetera, crearla
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

    // Obtener transacciones
    fetchTransactions: async (walletId, limit = 50) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('wallet_id', walletId)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (error) throw error
            set({ transactions: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching transactions:', err)
            set({ error: err.message, loading: false })
            return []
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

    // Obtener solicitudes de recarga del chofer
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

    // Procesar recarga aprobada (llamado desde webhook o frontend)
    processApprovedRecharge: async (rechargeId, paymentId, mpResponse) => {
        try {
            // Llamar a la función de Supabase
            const { data, error } = await supabase.rpc('process_approved_recharge', {
                p_recharge_id: rechargeId,
                p_payment_id: paymentId,
                p_mp_response: mpResponse
            })

            if (error) throw error

            // Refrescar wallet
            const wallet = get().wallet
            if (wallet) {
                await get().fetchWallet(wallet.driver_id)
            }

            return true
        } catch (err) {
            console.error('Error processing approved recharge:', err)
            return false
        }
    },

    // Agregar ganancia de viaje
    addTripEarning: async (walletId, amount, fleteId) => {
        try {
            const { data, error } = await supabase.rpc('update_wallet_balance', {
                p_wallet_id: walletId,
                p_amount: amount,
                p_type: 'trip_earning',
                p_description: `Ganancia de viaje #${fleteId.substring(0, 8)}`,
                p_reference_id: fleteId
            })

            if (error) throw error

            // Refrescar wallet
            const wallet = get().wallet
            if (wallet) {
                await get().fetchWallet(wallet.driver_id)
            }

            return true
        } catch (err) {
            console.error('Error adding trip earning:', err)
            return false
        }
    },

    // Descontar comisión
    deductCommission: async (walletId, amount, fleteId) => {
        try {
            const { data, error } = await supabase.rpc('update_wallet_balance', {
                p_wallet_id: walletId,
                p_amount: -Math.abs(amount), // Negativo para descontar
                p_type: 'commission',
                p_description: `Comisión de plataforma - Viaje #${fleteId.substring(0, 8)}`,
                p_reference_id: fleteId
            })

            if (error) throw error

            // Refrescar wallet
            const wallet = get().wallet
            if (wallet) {
                await get().fetchWallet(wallet.driver_id)
            }

            return true
        } catch (err) {
            console.error('Error deducting commission:', err)
            return false
        }
    },

    // Limpiar estado
    clearWallet: () => {
        set({
            wallet: null,
            transactions: [],
            rechargeRequests: [],
            loading: false,
            error: null
        })
    }
}))
