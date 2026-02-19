import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: false,
    error: null,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    signUp: async (email, password, fullName, role = 'client') => {
        set({ loading: true, error: null })
        try {
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            })

            if (signUpError) throw signUpError

            if (user) {
                // If the user is created but maybe not logged in (due to email confirm), we still try to create the profile
                // Supabase triggers are better for this, but we keep the frontend logic for now
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert([{ id: user.id, full_name: fullName, role }])

                if (profileError) {
                    console.warn('Profile creation error:', profileError)
                    // We don't throw here because the user was created, but we inform
                }
            }

            set({ loading: false })
            return { user, error: null }
        } catch (err) {
            set({ error: err.message, loading: false })
            return { user: null, error: err }
        }
    },

    signIn: async (email, password) => {
        set({ loading: true, error: null })
        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            if (user) {
                await get().fetchProfile(user.id)
                set({ user, loading: false })
            }
            return { user, error: null }
        } catch (err) {
            set({ error: err.message, loading: false })
            return { user: null, error: err }
        }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
    },

    fetchProfile: async (userId) => {
        if (!userId) return
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) throw error

            if (!profile) {
                // If profile doesn't exist, create it (handles older accounts)
                const { data: { user } } = await supabase.auth.getUser()
                const newProfile = {
                    id: userId,
                    full_name: user?.user_metadata?.full_name || 'Usuario',
                    role: user?.user_metadata?.role || 'user'
                }
                const { data: createdProfile, error: createError } = await supabase
                    .from('profiles')
                    .upsert([newProfile])
                    .select()
                    .single()

                if (createError) throw createError
                set({ profile: createdProfile })
                return createdProfile
            }

            set({ profile })
            return profile
        } catch (err) {
            console.error('Error fetching/creating profile:', err)
            return null
        }
    },

    updateProfile: async (userId, updates) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .maybeSingle()

            if (error) throw error
            set({ profile: data, loading: false })
            return { data, error: null }
        } catch (err) {
            set({ error: err.message, loading: false })
            return { data: null, error: err }
        }
    },

    subscribeToProfile: (userId) => {
        if (!userId) return null

        const channel = supabase
            .channel(`profile_changes_${userId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${userId}`
            }, (payload) => {
                set({ profile: payload.new })
            })
            .subscribe()

        return channel
    }
}))
