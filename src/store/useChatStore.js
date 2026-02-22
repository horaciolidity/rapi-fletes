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

    subscribeToMessages: (fleteId, currentUserId) => {
        if (!fleteId) return null;

        const channel = supabase
            .channel(`flete_chat_${fleteId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `flete_id=eq.${fleteId}`
            }, async (payload) => {
                const newMsg = payload.new

                // Add to local state if not already exists (avoiding duplicate with optimistic)
                set(state => {
                    const exists = state.messages.some(m => m.id === newMsg.id || (m.isOptimistic && m.content === newMsg.content))
                    if (exists) {
                        // Replace optimistic with real one
                        return {
                            messages: state.messages.map(m =>
                                (m.isOptimistic && m.content === newMsg.content) ? newMsg : m
                            )
                        }
                    }
                    return { messages: [...state.messages, newMsg] }
                })

                // NOTIFICATION LOGIC
                // Only notify if the message is from THE OTHER person
                if (newMsg.sender_id !== currentUserId) {
                    const { useNotificationStore } = await import('./useNotificationStore')
                    const { useAuthStore } = await import('./useAuthStore')

                    // We try to get the sender's name if possible, or just a generic message
                    useNotificationStore.getState().addNotification({
                        title: 'NUEVO MENSAJE',
                        message: `Tienes un nuevo mensaje en tu flete activo: "${newMsg.content.slice(0, 30)}${newMsg.content.length > 30 ? '...' : ''}"`,
                        type: 'chat'
                    })
                }
            })
            .subscribe()

        return channel
    }
}))
