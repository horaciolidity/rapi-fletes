import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useBookingStore = create((set, get) => ({
    categories: [],
    pickup: null, // { address, lat, lng }
    dropoff: null, // { address, lat, lng }
    selectedCategory: null,
    estimate: null,
    distance: null, // in km
    duration: null, // in minutes
    currentBooking: null,
    loading: false,
    error: null,

    fetchCategories: async () => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('vehicle_categories')
            .select('*')
            .order('id', { ascending: true })

        if (error) set({ error: error.message, loading: false })
        else set({ categories: data, loading: false })
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

        // Mock route calculation (In real app, use Google Distance Matrix API)
        // Simulating distance between two points
        const mockDistance = Math.floor(Math.random() * 20) + 5 // 5-25 km
        const mockDuration = mockDistance * 2 // ~2 mins per km

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

        if (error) {
            set({ error: error.message, loading: false })
            return null
        }

        set({ currentBooking: data, loading: false })
        return data
    },

    resetBooking: () => set({
        pickup: null,
        dropoff: null,
        selectedCategory: null,
        estimate: null,
        distance: null,
        duration: null,
        currentBooking: null
    })
}))
