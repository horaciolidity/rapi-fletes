import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useAdminStore = create((set, get) => ({
    // Estado
    stats: null,
    complaints: [],
    users: [],
    pendingVehicles: [],
    activityLogs: [],
    settings: {}, // Global app settings (currency, etc)
    reportedRanking: [], // Users with most complaints
    loading: false,
    error: null,

    // Fetch App Settings
    fetchSettings: async () => {
        try {
            const { data, error } = await supabase.from('app_settings').select('*')
            if (error) throw error
            const settingsObj = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
            set({ settings: settingsObj })
            return settingsObj
        } catch (err) {
            console.error('Error fetching settings:', err)
            return {}
        }
    },

    // Update App Setting
    updateSetting: async (key, value) => {
        try {
            const { error } = await supabase
                .from('app_settings')
                .update({ value, updated_at: new Date() })
                .eq('key', key)
            if (error) throw error
            set(state => ({ settings: { ...state.settings, [key]: value } }))
            return true
        } catch (err) {
            console.error('Error updating setting:', err)
            return false
        }
    },

    // Update Vehicle Category (Prices)
    updateVehicleCategory: async (categoryId, updates) => {
        try {
            // First try with updated_at
            const { error } = await supabase
                .from('vehicle_categories')
                .update({
                    ...updates,
                    updated_at: new Date()
                })
                .eq('id', categoryId)

            if (error) {
                // If it fails because of updated_at column missing, try without it
                if (error.message?.includes('updated_at')) {
                    const { error: retryError } = await supabase
                        .from('vehicle_categories')
                        .update(updates)
                        .eq('id', categoryId)
                    if (retryError) throw retryError
                    return true
                }
                throw error
            }
            return true
        } catch (err) {
            console.error('Error updating category:', err)
            return false
        }
    },

    // Fetch Reported Users Ranking
    fetchReportedRanking: async () => {
        set({ loading: true })
        try {
            const { data, error } = await supabase
                .from('reported_users_ranking')
                .select('*')
                .limit(20)
            if (error) throw error
            set({ reportedRanking: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching ranking:', err)
            set({ loading: false })
            return []
        }
    },

    // Obtener estadísticas del dashboard
    fetchStats: async () => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('admin_stats')
                .select('*')
                .single()

            if (error) throw error
            set({ stats: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching stats:', err)
            set({ error: err.message, loading: false })
            return null
        }
    },

    // Obtener todos los reclamos
    fetchComplaints: async (filters = {}) => {
        set({ loading: true, error: null })
        try {
            let query = supabase
                .from('complaints')
                .select(`
                    *,
                    user:profiles!user_id (id, full_name, phone, role),
                    flete:fletes (id, pickup_address, dropoff_address, status),
                    assigned_admin:profiles!assigned_to (id, full_name)
                `)
                .order('created_at', { ascending: false })

            // Aplicar filtros
            if (filters.status) {
                query = query.eq('status', filters.status)
            }
            if (filters.priority) {
                query = query.eq('priority', filters.priority)
            }
            if (filters.category) {
                query = query.eq('category', filters.category)
            }

            const { data, error } = await query

            if (error) throw error
            set({ complaints: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching complaints:', err)
            set({ error: err.message, loading: false })
            return []
        }
    },

    // Obtener un reclamo específico
    fetchComplaint: async (complaintId) => {
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select(`
                    *,
                    user:profiles!user_id (id, full_name, phone, email, role),
                    flete:fletes (
                        *,
                        driver:profiles!driver_id (id, full_name, phone)
                    ),
                    assigned_admin:profiles!assigned_to (id, full_name)
                `)
                .eq('id', complaintId)
                .single()

            if (error) throw error
            return data
        } catch (err) {
            console.error('Error fetching complaint:', err)
            return null
        }
    },

    // Actualizar estado de reclamo
    updateComplaint: async (complaintId, updates) => {
        try {
            const { data, error } = await supabase
                .from('complaints')
                .update(updates)
                .eq('id', complaintId)
                .select()
                .single()

            if (error) throw error

            // Actualizar en el estado local
            set(state => ({
                complaints: state.complaints.map(c =>
                    c.id === complaintId ? { ...c, ...updates } : c
                )
            }))

            return data
        } catch (err) {
            console.error('Error updating complaint:', err)
            return null
        }
    },

    // Asignar reclamo a admin
    assignComplaint: async (complaintId, adminId) => {
        return get().updateComplaint(complaintId, {
            assigned_to: adminId,
            status: 'in_progress'
        })
    },

    // Resolver reclamo
    resolveComplaint: async (complaintId, resolution) => {
        return get().updateComplaint(complaintId, {
            status: 'resolved',
            resolution: resolution,
            resolved_at: new Date().toISOString()
        })
    },

    // Cerrar reclamo
    closeComplaint: async (complaintId) => {
        return get().updateComplaint(complaintId, {
            status: 'closed',
            closed_at: new Date().toISOString()
        })
    },

    // Obtener todos los usuarios
    fetchUsers: async (filters = {}) => {
        set({ loading: true, error: null })
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            // Aplicar filtros
            if (filters.role) {
                query = query.eq('role', filters.role)
            }
            if (filters.search) {
                query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
            }

            const { data, error } = await query

            if (error) throw error

            // Para cada usuario, obtener advertencias y baneos
            const usersWithDetails = await Promise.all(
                data.map(async (user) => {
                    // Obtener advertencias
                    const { data: warnings } = await supabase
                        .from('user_warnings')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })

                    // Obtener baneos activos
                    const { data: bans } = await supabase
                        .from('user_bans')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_active', true)

                    // Verificar si está baneado
                    const { data: isBanned } = await supabase
                        .rpc('is_user_banned', { p_user_id: user.id })

                    return {
                        ...user,
                        warnings: warnings || [],
                        bans: bans || [],
                        is_banned: isBanned || false
                    }
                })
            )

            set({ users: usersWithDetails, loading: false })
            return usersWithDetails
        } catch (err) {
            console.error('Error fetching users:', err)
            set({ error: err.message, loading: false })
            return []
        }
    },

    // Advertir a un usuario
    warnUser: async (userId, adminId, reason, severity = 'medium', complaintId = null) => {
        try {
            const { data, error } = await supabase
                .from('user_warnings')
                .insert({
                    user_id: userId,
                    admin_id: adminId,
                    reason: reason,
                    severity: severity,
                    complaint_id: complaintId
                })
                .select()
                .single()

            if (error) throw error

            // Refrescar usuarios
            await get().fetchUsers()

            return data
        } catch (err) {
            console.error('Error warning user:', err)
            return null
        }
    },

    // Banear a un usuario
    banUser: async (userId, adminId, reason, banType = 'temporary', expiresAt = null, complaintId = null) => {
        try {
            const { data, error } = await supabase
                .from('user_bans')
                .insert({
                    user_id: userId,
                    admin_id: adminId,
                    reason: reason,
                    ban_type: banType,
                    expires_at: expiresAt,
                    complaint_id: complaintId,
                    is_active: true
                })
                .select()
                .single()

            if (error) throw error

            // Refrescar usuarios
            await get().fetchUsers()

            return data
        } catch (err) {
            console.error('Error banning user:', err)
            return null
        }
    },

    // Levantar baneo
    liftBan: async (banId, adminId) => {
        try {
            const { data, error } = await supabase
                .from('user_bans')
                .update({
                    is_active: false,
                    lifted_at: new Date().toISOString(),
                    lifted_by: adminId
                })
                .eq('id', banId)
                .select()
                .single()

            if (error) throw error

            // Refrescar usuarios
            await get().fetchUsers()

            return data
        } catch (err) {
            console.error('Error lifting ban:', err)
            return null
        }
    },

    // Obtener logs de actividad
    fetchActivityLogs: async (filters = {}) => {
        set({ loading: true, error: null })
        try {
            let query = supabase
                .from('activity_logs')
                .select(`
                    *,
                    user:profiles!user_id (id, full_name, role)
                `)
                .order('created_at', { ascending: false })
                .limit(filters.limit || 100)

            // Aplicar filtros
            if (filters.userId) {
                query = query.eq('user_id', filters.userId)
            }
            if (filters.action) {
                query = query.eq('action', filters.action)
            }

            const { data, error } = await query

            if (error) throw error
            set({ activityLogs: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching activity logs:', err)
            set({ error: err.message, loading: false })
            return []
        }
    },

    // Obtener vehículos pendientes de verificación
    fetchPendingVehicles: async () => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select(`
                    *,
                    driver:profiles!driver_id (id, full_name, phone, avatar_url),
                    category:vehicle_categories (id, name)
                `)
                .eq('verification_status', 'pending')
                .order('created_at', { ascending: true })

            if (error) throw error
            set({ pendingVehicles: data, loading: false })
            return data
        } catch (err) {
            console.error('Error fetching pending vehicles:', err)
            set({ error: err.message, loading: false })
            return []
        }
    },

    // Verificar (aprobar/rechazar) un vehículo
    verifyVehicle: async (vehicleId, status, adminNotes = '') => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .update({
                    verification_status: status,
                    admin_notes: adminNotes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', vehicleId)
                .select()
                .single()

            if (error) throw error

            const { data: vehicle } = await supabase
                .from('vehicles')
                .select('driver_id')
                .eq('id', vehicleId)
                .single()

            if (vehicle) {
                // Actualizar el perfil del chofer basado en el resultado
                const profileStatus = status === 'approved' ? 'verified' : 'none'
                await supabase
                    .from('profiles')
                    .update({
                        verification_status: profileStatus,
                        // Si se aprueba, ya tenemos el teléfono del formulario si no estaba
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', vehicle.driver_id)

                // Si se aprueba y es el primer vehículo aprobado, lo ponemos como activo
                if (status === 'approved') {
                    await supabase.rpc('set_active_vehicle', {
                        p_driver_id: vehicle.driver_id,
                        p_vehicle_id: vehicleId
                    })
                }

                // Registrar en Activity Logs
                await supabase.from('activity_logs').insert([{
                    user_id: vehicle.driver_id,
                    action: status === 'approved' ? 'vehicle_approved' : 'vehicle_rejected',
                    entity_type: 'vehicle',
                    entity_id: vehicleId,
                    details: { admin_notes: adminNotes }
                }])
            }

            // Actualizar lista local
            set(state => ({
                pendingVehicles: state.pendingVehicles.filter(v => v.id !== vehicleId),
                loading: false
            }))

            return data
        } catch (err) {
            console.error('Error verifying vehicle:', err)
            set({ error: err.message, loading: false })
            return null
        }
    },

    // Limpiar estado
    clearAdmin: () => {
        set({
            stats: null,
            complaints: [],
            users: [],
            pendingVehicles: [],
            activityLogs: [],
            loading: false,
            error: null
        })
    }
}))
