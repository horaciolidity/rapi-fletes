import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useDriverStore = create((set, get) => ({
    availableFletes: [],
    activeFlete: null,
    loading: false,
    error: null,

    fetchAvailableFletes: async () => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
            .from('fletes')
            .select(`
        *,
        vehicle_categories (name, base_price),
        profiles:user_id (full_name)
      `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) set({ error: error.message, loading: false })
        else set({ availableFletes: data, loading: false })
    },

    fetchActiveFlete: async (driverId) => {
        if (!driverId) return null
        const { data, error } = await supabase
            .from('fletes')
            .select(`
                *,
                vehicle_categories (name, base_price),
                profiles:user_id (full_name, phone)
            `)
            .eq('driver_id', driverId)
            .in('status', ['accepted', 'picked_up'])
            .maybeSingle()

        if (!error && data) {
            set({ activeFlete: data })
        }
        return data
    },

    acceptFlete: async (fleteId, driverId) => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
            .from('fletes')
            .update({
                driver_id: driverId,
                status: 'accepted',
                updated_at: new Date()
            })
            .eq('id', fleteId)
            .select()
            .maybeSingle()

        if (error) {
            set({ error: error.message, loading: false })
            return null
        }

        set({ activeFlete: data, loading: false })
        // Refresh available list
        get().fetchAvailableFletes()
        return data
    },

    updateFleteStatus: async (fleteId, status) => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
            .from('fletes')
            .update({ status, updated_at: new Date() })
            .eq('id', fleteId)
            .select()
            .maybeSingle()

        if (error) {
            set({ error: error.message, loading: false })
            return null
        }

        if (status === 'completed' || status === 'cancelled') {
            set({ activeFlete: null })
        } else {
            set({ activeFlete: data })
        }

        set({ loading: false })
        return data
    },

    subscribeToNewFletes: () => {
        const channel = supabase
            .channel('fletes_marketplace')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'fletes'
            }, (payload) => {
                // Whenever any flete changes, we refresh the marketplace list
                // if it affects pending status. It's safer to just refetch.
                get().fetchAvailableFletes()
            })
            .subscribe()

        return channel
    },

    fetchDriverHistory: async (driverId) => {
        if (!driverId) return []
        const { data, error } = await supabase
            .from('fletes')
            .select(`
                *,
                vehicle_categories (name, base_price),
                client:profiles!user_id (full_name, phone)
            `)
            .eq('driver_id', driverId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching driver history:', error)
            return []
        }
        return data || []
    },

    updateLocation: async (driverId, lat, lng) => {
        const { error } = await supabase
            .from('profiles')
            .update({
                last_location_lat: lat,
                last_location_lng: lng,
                updated_at: new Date()
            })
            .eq('id', driverId)

        if (error) console.error('Error updating driver location:', error)
    }
}))

