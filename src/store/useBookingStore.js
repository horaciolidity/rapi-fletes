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
          driver:profiles!driver_id (
            id,
            full_name, 
            phone
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Para cada flete con chofer, obtener vehículo y calificación promedio
            const fletesWithDriverInfo = await Promise.all(
                data.map(async (flete) => {
                    if (!flete.driver) return flete

                    // Obtener vehículo del chofer
                    const { data: vehicleData } = await supabase
                        .from('vehicles')
                        .select('*')
                        .eq('driver_id', flete.driver.id)
                        .maybeSingle()

                    // Calcular calificación promedio del chofer
                    const { data: ratingsData } = await supabase
                        .from('fletes')
                        .select('client_rating')
                        .eq('driver_id', flete.driver.id)
                        .not('client_rating', 'is', null)

                    const averageRating = ratingsData && ratingsData.length > 0
                        ? ratingsData.reduce((sum, r) => sum + r.client_rating, 0) / ratingsData.length
                        : 0

                    // Contar viajes completados
                    const { count: totalTrips } = await supabase
                        .from('fletes')
                        .select('*', { count: 'exact', head: true })
                        .eq('driver_id', flete.driver.id)
                        .eq('status', 'completed')

                    return {
                        ...flete,
                        driver: {
                            ...flete.driver,
                            vehicle: vehicleData,
                            averageRating: parseFloat(averageRating.toFixed(1)),
                            totalTrips: totalTrips || 0
                        }
                    }
                })
            )

            set({ fletes: fletesWithDriverInfo, loading: false })
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

        try {
            // Simple Euclidean distance for mock (lat/lng degree is ~111km)
            const dx = (dropoff.lng - pickup.lng) * 111
            const dy = (dropoff.lat - pickup.lat) * 111
            const dist = Math.sqrt(dx * dx + dy * dy)

            const mockDistance = Math.max(1, parseFloat(dist.toFixed(1)) || 2)
            const mockDuration = Math.ceil(mockDistance * 2.5) || 10 // 2.5 min per km, min 10m

            set({ distance: mockDistance, duration: mockDuration })
            get().calculateEstimate()
        } catch (err) {
            console.error("Internal routing calc error", err)
            set({ distance: 5, duration: 15 })
            get().calculateEstimate()
        }
    },

    calculateEstimate: () => {
        const { selectedCategory, distance } = get()
        if (!selectedCategory || !distance) return

        const base = parseFloat(selectedCategory.base_price) || 0
        const perKm = parseFloat(selectedCategory.price_per_km) || 0
        const dist = parseFloat(distance) || 0

        const total = base + (perKm * dist)
        set({ estimate: isNaN(total) ? 0 : Math.round(total) })
    },

    createFlete: async (userId, shipmentDetails = '', passengerTravels = false) => {
        const { pickup, dropoff, selectedCategory, estimate, duration } = get()
        if (!pickup || !dropoff || !selectedCategory) {
            set({ error: "Faltan datos para completar la reserva" })
            return null
        }

        set({ loading: true, error: null })
        try {
            // Random vehicle arrival time between 5-15 mins
            const vehicleArrivalTime = Math.floor(Math.random() * 10) + 5

            // We attempt to insert with all fields
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
                        distance: get().distance,
                        duration: duration,
                        shipment_details: shipmentDetails,
                        passenger_travels: passengerTravels,
                        vehicle_arrival_minutes: vehicleArrivalTime,
                        status: 'pending'
                    }
                ])
                .select()
                .maybeSingle()

            if (error) {
                // If 400, try fallback without the new columns (schema might not be updated)
                if (error.code === '42703' || error.message.includes('column')) {
                    console.warn('Faltan columnas en la DB, intentando insert básico...')
                    const { data: fallbackData, error: fallbackError } = await supabase
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
                                distance: get().distance,
                                duration: duration,
                                status: 'pending'
                            }
                        ])
                        .select()
                        .maybeSingle()

                    if (fallbackError) throw fallbackError
                    set({ loading: false })
                    return fallbackData
                }
                throw error
            }

            set({ loading: false })
            return data
        } catch (err) {
            console.error('Error creating flete:', err)
            set({ error: err.message, loading: false })
            return null
        }
    },

    cancelFlete: async (fleteId) => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
            .from('fletes')
            .update({ status: 'cancelled', updated_at: new Date() })
            .eq('id', fleteId)
            .select()
            .maybeSingle()

        if (error) {
            set({ error: error.message, loading: false })
            return null
        }

        set({ loading: false })
        return data
    },

    subscribeToFleteUpdates: (userId) => {
        const channel = supabase
            .channel(`fletes_user_${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'fletes',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                // Refresh list when any change occurs
                get().fetchMyFletes(userId)
            })
            .subscribe()

        return channel
    },

    submitClientRating: async (fleteId, rating, notes) => {
        const { data, error } = await supabase
            .from('fletes')
            .update({
                client_rating: rating,
                client_notes: notes
            })
            .eq('id', fleteId)
            .select()
            .maybeSingle()

        if (error) {
            console.error('Error submitting client rating:', error)
            return { data: null, error }
        }

        // Refresh the fletes list
        const currentFletes = get().fletes
        const updatedFletes = currentFletes.map(f =>
            f.id === fleteId ? { ...f, client_rating: rating, client_notes: notes } : f
        )
        set({ fletes: updatedFletes })

        return { data, error: null }
    },

    reportProblem: async (fleteId, problemDescription) => {
        set({ loading: true, error: null })

        // Update the flete with problem notes and potentially change status
        const { data, error } = await supabase
            .from('fletes')
            .update({
                client_notes: `[PROBLEMA REPORTADO] ${problemDescription}`,
                // Optionally add a problem_reported field if you have one
            })
            .eq('id', fleteId)
            .select()
            .maybeSingle()

        if (error) {
            console.error('Error reporting problem:', error)
            set({ error: error.message, loading: false })
            return null
        }

        set({ loading: false })
        return data
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
