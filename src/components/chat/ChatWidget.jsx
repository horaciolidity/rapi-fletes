import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageSquare, User, Loader2 } from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { useAuthStore } from '../../store/useAuthStore'

const ChatWidget = ({ fleteId, receiverName }) => {
    const { user } = useAuthStore()
    const { messages, fetchMessages, sendMessage, subscribeToMessages } = useChatStore()
    const [isOpen, setIsOpen] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef()

    useEffect(() => {
        if (fleteId) {
            fetchMessages(fleteId)
            const channel = subscribeToMessages(fleteId)
            return () => channel.unsubscribe()
        }
    }, [fleteId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        const success = await sendMessage(fleteId, user.id, newMessage)
        if (success) setNewMessage('')
        setIsSending(false)
    }

    return (
        <div className="fixed bottom-10 right-10 z-[100]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="w-80 md:w-96 h-[500px] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-6 bg-slate-950 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase italic">{receiverName}</p>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">En Línea</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 scrollbar-none">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === user.id
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${isMe
                                                ? 'bg-primary-500 text-white rounded-tr-none shadow-lg shadow-primary-500/20'
                                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                                            }`}>
                                            {msg.content}
                                            <p className={`text-[8px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-6 bg-slate-950 border-t border-white/5 flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-grow bg-slate-900 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:border-primary-500/50 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !newMessage.trim()}
                                className="p-3 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white transition-all disabled:opacity-50"
                            >
                                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setIsOpen(true)}
                        className="p-5 bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-500/40 relative group"
                    >
                        <MessageSquare className="w-8 h-8" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ChatWidget
