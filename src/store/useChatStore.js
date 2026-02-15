import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useChatStore = create((set, get) => ({
    messages: [],
    loading: false,

    fetchMessages: async (fleteId) => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id (full_name)
            `)
            .eq('flete_id', fleteId)
            .order('created_at', { ascending: true })

        if (!error) set({ messages: data })
        set({ loading: false })
    },

    sendMessage: async (fleteId, senderId, content) => {
        const { error } = await supabase
            .from('messages')
            .insert([{ flete_id: fleteId, sender_id: senderId, content }])

        return !error
    },

    subscribeToMessages: (fleteId) => {
        const channel = supabase
            .channel(`chat_${fleteId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `flete_id=eq.${fleteId}`
            }, (payload) => {
                // Simplified: Re-fetching to get sender info. 
                // In production, we'd optimize this.
                get().fetchMessages(fleteId)
            })
            .subscribe()

        return channel
    }
}))
