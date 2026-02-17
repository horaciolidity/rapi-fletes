import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useAdminStore = create((set, get) => ({
    stats: {
        totalTrips: 0,
        totalRevenue: 0,
        activeDrivers: 0,
        totalUsers: 0
    },
    pendingDrivers: [],
    allFletes: [],
    allUsers: [],
    loading: false,

    fetchStats: async () => {
        set({ loading: true })
        try {
            const { count: trips } = await supabase.from('fletes').select('*', { count: 'exact', head: true })
            const { data: revenueData } = await supabase.from('fletes').select('estimated_price').eq('status', 'completed')
            const { count: drivers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver')
            const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

            const revenue = revenueData?.reduce((acc, curr) => acc + parseFloat(curr.estimated_price || 0), 0) || 0

            set({
                stats: {
                    totalTrips: trips || 0,
                    totalRevenue: revenue,
                    activeDrivers: drivers || 0,
                    totalUsers: users || 0
                },
                loading: false
            })
        } catch (err) {
            console.error('Error fetching admin stats:', err)
            set({ loading: false })
        }
    },

    fetchPendingDrivers: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'driver')
            .eq('verification_status', 'pending')

        if (!error) set({ pendingDrivers: data })
    },

    verifyDriver: async (userId, status) => {
        const { error } = await supabase
            .from('profiles')
            .update({ verification_status: status })
            .eq('id', userId)

        if (!error) {
            set(state => ({
                pendingDrivers: state.pendingDrivers.filter(d => d.id !== userId)
            }))
            get().fetchStats()
            return true
        }
        return false
    },

    fetchAllFletes: async () => {
        const { data, error } = await supabase
            .from('fletes')
            .select(`
                *,
                user:profiles!fletes_user_id_fkey (full_name),
                driver:profiles!fletes_driver_id_fkey (full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) console.error('Error fetching all fletes:', error)
        else set({ allFletes: data })
    },

    fetchDriverLeaderboard: async () => {
        const { data, error } = await supabase
            .from('fletes')
            .select('driver_id, driver:profiles!driver_id(full_name)')
            .eq('status', 'completed')
            .not('driver_id', 'is', null)

        if (error) return []

        // Group by driver_id to avoid name collisions
        const driverStats = data.reduce((acc, flete) => {
            const id = flete.driver_id
            const name = flete.driver?.full_name || 'Desconocido'

            if (!acc[id]) {
                acc[id] = { name, count: 0 }
            }
            acc[id].count += 1
            return acc
        }, {})

        return Object.values(driverStats)
            .sort((a, b) => b.count - a.count)
    }
}))
