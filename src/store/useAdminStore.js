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
                profiles:user_id (full_name, email),
                driver:driver_id (full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(50)

        if (!error) set({ allFletes: data })
    },

    fetchDriverLeaderboard: async () => {
        const { data, error } = await supabase
            .from('fletes')
            .select('driver_id, profiles:driver_id(full_name)')
            .eq('status', 'completed')
            .not('driver_id', 'is', null)

        if (error) return []

        const counts = data.reduce((acc, flete) => {
            const name = flete.profiles?.full_name || 'Desconocido'
            acc[name] = (acc[name] || 0) + 1
            return acc
        }, {})

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
    }
}))
