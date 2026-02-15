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
            .single()

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
            .single()

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
            .channel('public:fletes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'fletes',
                filter: 'status=eq.pending'
            }, (payload) => {
                set((state) => ({
                    availableFletes: [payload.new, ...state.availableFletes]
                }))
            })
            .subscribe()

        return channel
    }
}))
