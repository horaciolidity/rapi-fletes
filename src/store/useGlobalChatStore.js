import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useGlobalChatStore = create((set, get) => ({
    messages: [],
    loading: false,

    fetchMessages: async () => {
        set({ loading: true })
        try {
            const { data, error } = await supabase
                .from('global_messages')
                .select(`
                    id,
                    content,
                    created_at,
                    sender_id,
                    sender_name,
                    sender_role
                `)
                .order('created_at', { ascending: true })
                .limit(100)

            if (error) throw error
            set({ messages: data || [] })
        } catch (err) {
            console.error('Error fetching global messages:', err)
        } finally {
            set({ loading: false })
        }
    },

    sendMessage: async (senderId, senderName, senderRole, content) => {
        if (!content?.trim()) return false

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            sender_id: senderId,
            sender_name: senderName,
            sender_role: senderRole,
            content: content.trim(),
            created_at: new Date().toISOString(),
            isOptimistic: true
        }

        set(state => ({
            messages: [...state.messages, optimisticMsg]
        }))

        const { error } = await supabase
            .from('global_messages')
            .insert([{
                sender_id: senderId,
                sender_name: senderName,
                sender_role: senderRole,
                content: content.trim()
            }])

        if (error) {
            console.error('Error sending global message:', error)
            set(state => ({
                messages: state.messages.filter(m => m.id !== optimisticMsg.id)
            }))
            return false
        }

        return true
    },

    subscribeToMessages: () => {
        const channel = supabase
            .channel('global_chat')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'global_messages'
            }, (payload) => {
                const newMsg = payload.new
                set(state => {
                    const exists = state.messages.some(m => m.id === newMsg.id || (m.isOptimistic && m.content === newMsg.content))
                    if (exists) {
                        return {
                            messages: state.messages.map(m =>
                                (m.isOptimistic && m.content === newMsg.content) ? newMsg : m
                            )
                        }
                    }
                    return { messages: [...state.messages, newMsg] }
                })
            })
            .subscribe()

        return channel
    }
}))
