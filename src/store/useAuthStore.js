import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useAuthStore = create((set) => ({
    user: null,
    profile: null,
    loading: true,
    error: null,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),

    signUp: async (email, password, fullName, role = 'user') => {
        set({ loading: true, error: null })
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (signUpError) {
            set({ error: signUpError.message, loading: false })
            return { error: signUpError }
        }

        if (user) {
            // Create profile record
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{ id: user.id, full_name: fullName, role }])

            if (profileError) {
                set({ error: profileError.message, loading: false })
                return { error: profileError }
            }
        }

        set({ loading: false })
        return { user }
    },

    signIn: async (email, password) => {
        set({ loading: true, error: null })
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            set({ error: error.message, loading: false })
            return { error }
        }

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            set({ user, profile, loading: false })
        }

        return { user }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
    },

    fetchProfile: async (userId) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (!error) set({ profile })
    }
}))
