import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useDriverLocationStore = create((set, get) => ({
    activeDrivers: [],
    loading: false,
    error: null,

    // Fetch all active drivers with their locations
    fetchActiveDrivers: async () => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, phone, last_location_lat, last_location_lng, is_available')
                .eq('role', 'driver')
                .eq('verification_status', 'verified')
                .eq('is_available', true)
                .not('last_location_lat', 'is', null)
                .not('last_location_lng', 'is', null)

            if (error) throw error
            set({ activeDrivers: data || [], loading: false })
            return data || []
        } catch (err) {
            console.error('Error fetching active drivers:', err)
            set({ error: err.message, loading: false })
            return []
        }
    },

    // Get drivers near a specific location (within radius in km)
    getDriversNearLocation: (lat, lng, radiusKm = 5) => {
        const { activeDrivers } = get()

        return activeDrivers.filter(driver => {
            if (!driver.last_location_lat || !driver.last_location_lng) return false

            const dx = (driver.last_location_lng - lng) * 111
            const dy = (driver.last_location_lat - lat) * 111
            const distance = Math.sqrt(dx * dx + dy * dy)

            return distance <= radiusKm
        })
    },

    // Subscribe to real-time driver location updates
    subscribeToDriverLocations: () => {
        const channel = supabase
            .channel('driver_locations')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: 'role=eq.driver'
            }, (payload) => {
                get().fetchActiveDrivers()
            })
            .subscribe()

        return channel
    }
}))
