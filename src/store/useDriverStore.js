import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useDriverStore = create((set, get) => ({
    availableFletes: [],
    activeFlete: null,
    vehicles: [],
    loading: false,
    error: null,

    fetchAvailableFletes: async (driverId) => {
        if (!driverId) return
        set({ loading: true, error: null })
        try {
            // Get active vehicle category and driver's province
            const { data: profileData } = await supabase
                .from('profiles')
                .select('active_vehicle_id, province')
                .eq('id', driverId)
                .single()

            let activeCategoryId = null
            if (profileData?.active_vehicle_id) {
                const { data: vehicleData } = await supabase
                    .from('vehicles')
                    .select('category_id')
                    .eq('id', profileData.active_vehicle_id)
                    .single()
                activeCategoryId = vehicleData?.category_id
            }

            let query = supabase
                .from('fletes')
                .select(`
                    *,
                    vehicle_categories (name, base_price),
                    profiles:user_id (full_name, phone, avatar_url)
                `)
                .eq('status', 'pending')

            if (activeCategoryId) {
                query = query.eq('category_id', activeCategoryId)
            }

            // Filter by province if the driver has one set
            if (profileData?.province) {
                query = query.eq('pickup_province', profileData.province)
            }

            const { data, error } = await query.order('created_at', { ascending: false })

            if (error) throw error
            set({ availableFletes: data, loading: false })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    fetchMyVehicles: async (driverId) => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, vehicle_categories(name)')
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false })

        if (!error) set({ vehicles: data })
        set({ loading: false })
        return data
    },

    addVehicle: async (driverId, vehicleData) => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
            .from('vehicles')
            .insert([{
                ...vehicleData,
                driver_id: driverId,
                verification_status: 'pending',
                created_at: new Date()
            }])
            .select()
            .single()

        if (error) {
            set({ error: error.message, loading: false })
            return null
        }

        set(state => ({ vehicles: [data, ...state.vehicles], loading: false }))
        return data
    },

    setActiveVehicle: async (driverId, vehicleId) => {
        set({ loading: true, error: null })
        const { data, error } = await supabase.rpc('set_active_vehicle', {
            p_driver_id: driverId,
            p_vehicle_id: vehicleId
        })

        if (error) {
            set({ error: error.message, loading: false })
            return false
        }

        if (data) {
            await get().fetchAvailableFletes(driverId)
        }
        set({ loading: false })
        return data
    },

    fetchActiveFlete: async (driverId) => {
        if (!driverId) return null
        const { data, error } = await supabase
            .from('fletes')
            .select(`
                *,
                vehicle_categories (name, base_price),
                profiles:user_id (full_name, phone, avatar_url)
            `)
            .eq('driver_id', driverId)
            .in('status', ['accepted', 'arrived_pickup', 'in_transit', 'arrived_dropoff'])
            .maybeSingle()

        if (!error && data) {
            set({ activeFlete: data })
        }
        return data
    },

    acceptFlete: async (fleteId, driverId) => {
        set({ loading: true, error: null })

        // 1. Charge the commission & accept trip atomically via RPC
        const { useWalletStore } = await import('./useWalletStore')
        const result = await useWalletStore.getState().chargeCommission(driverId, fleteId)

        if (!result?.success) {
            set({
                error: result?.error || 'Error al cobrar comisión. Verificá tu saldo.',
                loading: false
            })
            return result
        }

        // 2. Fetch the newly accepted flete with all relations for the store
        const { data, error } = await supabase
            .from('fletes')
            .select(`
                *,
                vehicle_categories (name, base_price),
                profiles:user_id (full_name, phone, avatar_url)
            `)
            .eq('id', fleteId)
            .maybeSingle()

        if (error) {
            set({ error: error.message, loading: false })
            return null
        }

        set({ activeFlete: data, loading: false })
        get().fetchAvailableFletes(driverId)
        return { ...data, commissionCharged: result.commission_amount }
    },

    updateFleteStatus: async (fleteId, status, additionalData = {}) => {
        set({ loading: true, error: null })

        const updateData = {
            status,
            updated_at: new Date(),
            ...additionalData
        }

        // Auto-set timestamps based on status
        if (status === 'accepted') {
            updateData.accepted_at = new Date()
        } else if (status === 'arrived_pickup') {
            updateData.arrived_pickup_time = new Date()
        } else if (status === 'in_transit') {
            // Trip starts when driver begins journey to destination
            updateData.trip_start_time = new Date()
        } else if (status === 'arrived_dropoff') {
            updateData.arrived_dropoff_time = new Date()
        } else if (status === 'completed') {
            updateData.trip_end_time = new Date()
        }

        const { data, error } = await supabase
            .from('fletes')
            .update(updateData)
            .eq('id', fleteId)
            .select(`
                *,
                vehicle_categories (name, base_price),
                profiles:user_id (full_name, phone, avatar_url)
            `)
            .maybeSingle()

        if (error) {
            console.error('Error updating flete status:', error)
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

    updatePassengerStatus: async (fleteId, passengerTravels) => {
        const { data, error } = await supabase
            .from('fletes')
            .update({ passenger_travels: passengerTravels })
            .eq('id', fleteId)
            .select()
            .maybeSingle()

        if (!error && data) {
            set({ activeFlete: data })
        }
        return data
    },

    submitDriverRating: async (fleteId, rating, notes) => {
        const { data, error } = await supabase
            .from('fletes')
            .update({
                driver_rating: rating,
                driver_notes: notes
            })
            .eq('id', fleteId)
            .select()
            .maybeSingle()

        return { data, error }
    },

    subscribeToNewFletes: (driverId) => {
        const channel = supabase
            .channel('fletes_marketplace')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'fletes'
            }, async (payload) => {
                const newFlete = payload.new

                if (newFlete.status === 'pending') {
                    // Refetch to get related info (category name, etc)
                    await get().fetchAvailableFletes(driverId)

                    // Trigger sound/alert if it matches driver's category
                    const { availableFletes } = get()
                    const matchingFlete = availableFletes.find(f => f.id === newFlete.id)

                    if (matchingFlete) {
                        const { useNotificationStore } = await import('./useNotificationStore')
                        const catName = matchingFlete.vehicle_categories?.name || 'FLETE'

                        useNotificationStore.getState().addNotification({
                            title: `¡NUEVO VIAJE [${catName}]!`,
                            message: `Hay una solicitud de ${catName} en ${newFlete.pickup_address.split(',')[0]}`,
                            type: 'info'
                        })
                    }
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'fletes'
            }, async (payload) => {
                // If a flete is accepted or cancelled by someone else, refresh the list
                get().fetchAvailableFletes(driverId)

                // If this flete belongs to THIS driver and was CANCELLED
                if (payload.new.driver_id === driverId && payload.old.status !== 'cancelled' && payload.new.status === 'cancelled') {
                    const { useNotificationStore } = await import('./useNotificationStore')
                    useNotificationStore.getState().addNotification({
                        title: '¡VIAJE CANCELADO!',
                        message: 'El cliente ha cancelado la reserva en curso.',
                        type: 'error'
                    })
                    // clear active flete
                    set({ activeFlete: null })
                }
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
                client:profiles!user_id (full_name, phone, avatar_url)
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

