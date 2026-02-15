import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useBookingStore = create((set, get) => ({
    fletes: [],
    categories: [],
    pickup: null,
    dropoff: null,
    selectedCategory: null,
    estimate: null,
    distance: null,
    duration: null,
    loading: false,
    error: null,

    fetchCategories: async () => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('vehicle_categories')
                .select('*')
                .order('id', { ascending: true })

            if (error) throw error
            set({ categories: data, loading: false })
        } catch (err) {
            console.error('Error fetching categories:', err)
            set({ error: "No se pudieron cargar las categorías. Verifica la conexión con Supabase.", loading: false })
        }
    },

    fetchMyFletes: async (userId) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('fletes')
                .select(`
          *,
          vehicle_categories (name, base_price),
          driver:driver_id (full_name, phone)
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            set({ fletes: data, loading: false })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    setPickup: (location) => {
        set({ pickup: location })
        get().calculateRoute()
    },

    setDropoff: (location) => {
        set({ dropoff: location })
        get().calculateRoute()
    },

    setCategory: (category) => {
        set({ selectedCategory: category })
        get().calculateEstimate()
    },

    calculateRoute: () => {
        const { pickup, dropoff } = get()
        if (!pickup || !dropoff) return

        // Simple Euclidean distance for mock (lat/lng degree is ~111km)
        const dx = (dropoff.lng - pickup.lng) * 111
        const dy = (dropoff.lat - pickup.lat) * 111
        const dist = Math.sqrt(dx * dx + dy * dy)

        const mockDistance = Math.max(2, parseFloat(dist.toFixed(1)))
        const mockDuration = Math.ceil(mockDistance * 2.5) // 2.5 min per km

        set({ distance: mockDistance, duration: mockDuration })
        get().calculateEstimate()
    },

    calculateEstimate: () => {
        const { selectedCategory, distance } = get()
        if (!selectedCategory || !distance) return
        const total = parseFloat(selectedCategory.base_price) + (parseFloat(selectedCategory.price_per_km) * distance)
        set({ estimate: total })
    },

    createFlete: async (userId) => {
        const { pickup, dropoff, selectedCategory, estimate } = get()
        if (!pickup || !dropoff || !selectedCategory) {
            set({ error: "Faltan datos para completar la reserva" })
            return null
        }

        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('fletes')
                .insert([
                    {
                        user_id: userId,
                        pickup_address: pickup.address,
                        pickup_lat: pickup.lat,
                        pickup_lng: pickup.lng,
                        dropoff_address: dropoff.address,
                        dropoff_lat: dropoff.lat,
                        dropoff_lng: dropoff.lng,
                        category_id: selectedCategory.id,
                        estimated_price: estimate,
                        status: 'pending'
                    }
                ])
                .select()
                .single()

            if (error) throw error
            set({ loading: false })
            return data
        } catch (err) {
            set({ error: err.message, loading: false })
            return null
        }
    },

    resetBooking: () => set({
        pickup: null,
        dropoff: null,
        selectedCategory: null,
        estimate: null,
        distance: null,
        duration: null,
        error: null
    })
}))
