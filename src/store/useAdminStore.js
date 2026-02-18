import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useAdminStore = create((set, get) => ({
    // Estado
    stats: null,
    complaints: [],
    users: [],
    activityLogs: [],
    loading: false,
    error: null,

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

    // Limpiar estado
    clearAdmin: () => {
        set({
            stats: null,
            complaints: [],
            users: [],
            activityLogs: [],
            loading: false,
            error: null
        })
    }
}))
