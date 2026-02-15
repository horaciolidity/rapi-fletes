import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useChatStore = create((set, get) => ({
    messages: [],
    loading: false,

    fetchMessages: async (fleteId) => {
        if (!fleteId) return;
        set({ loading: true })
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    id,
                    content,
                    created_at,
                    sender_id,
                    flete_id
                `)
                .eq('flete_id', fleteId)
                .order('created_at', { ascending: true })

            if (error) throw error
            set({ messages: data || [] })
        } catch (err) {
            console.error('Error fetching chat messages:', err)
        } finally {
            set({ loading: false })
        }
    },

    sendMessage: async (fleteId, senderId, content) => {
        if (!content?.trim()) return false

        // Optimistic update
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            flete_id: fleteId,
            sender_id: senderId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            isOptimistic: true
        }

        set(state => ({
            messages: [...state.messages, optimisticMsg]
        }))

        const { error } = await supabase
            .from('messages')
            .insert([{ flete_id: fleteId, sender_id: senderId, content: content.trim() }])

        if (error) {
            console.error('Error sending message:', error)
            // Rollback optimistic update on error
            set(state => ({
                messages: state.messages.filter(m => m.id !== optimisticMsg.id)
            }))
            return false
        }

        // No need to manually refresh here if subscription is working, 
        // but we'll let the subscription handle replacing the temp message
        return true
    },

    subscribeToMessages: (fleteId) => {
        if (!fleteId) return null;

        const channel = supabase
            .channel(`flete_chat_${fleteId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `flete_id=eq.${fleteId}`
            }, (payload) => {
                // To avoid duplicate optimistic messages, we just refetch
                // or we could replace. Let's refetch for simplicity.
                get().fetchMessages(fleteId)
            })
            .subscribe()

        return channel
    }
}))
