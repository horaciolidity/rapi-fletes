import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageSquare, User, Loader2, Star } from 'lucide-react'
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
            return () => {
                if (channel) channel.unsubscribe()
            }
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
        <div className="fixed bottom-12 right-12 z-[1000] font-sans">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="w-[340px] h-[500px] bg-black border-2 border-zinc-900 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden backdrop-blur-3xl relative"
                    >
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-600" />

                        {/* Header */}
                        <div className="p-5 md:p-6 bg-zinc-950/80 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <User className="w-5 h-5 text-black" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-white uppercase italic tracking-tight">{receiverName}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] italic">Canal Encriptado</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-600 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 scrollbar-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-95">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === user.id
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] p-4 md:p-5 rounded-[1.5rem] text-sm font-bold italic tracking-tight relative ${isMe
                                            ? 'bg-primary-500 text-black rounded-tr-none shadow-[0_10px_30px_rgba(245,158,11,0.2)]'
                                            : 'bg-zinc-900 text-white rounded-tl-none border border-white/5 shadow-xl'
                                            }`}>
                                            {msg.content}
                                            <p className={`text-[8px] mt-2 font-black uppercase opacity-40 ${isMe ? 'text-black/60 text-right' : 'text-zinc-500 text-left'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Command Center Input */}
                        <form onSubmit={handleSend} className="p-5 md:p-6 bg-zinc-950/90 border-t border-white/5 flex gap-4 backdrop-blur-xl">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="ORDEN TÁCTICA..."
                                className="flex-grow bg-zinc-900 border-none rounded-full px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-primary-500/30 outline-none transition-all placeholder:text-zinc-800"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !newMessage.trim()}
                                className="w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full text-black transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shadow-xl shadow-primary-500/20"
                            >
                                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div className="relative">
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1, rotate: -10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(true)}
                            className="w-16 h-16 bg-primary-500 text-black rounded-2xl shadow-[0_20px_60px_rgba(245,158,11,0.4)] flex items-center justify-center relative group"
                        >
                            <MessageSquare className="w-8 h-8" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-black border-4 border-primary-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-ping" />
                            </div>
                        </motion.button>

                        {/* Subtle ping indicator */}
                        <div className="absolute -inset-4 bg-primary-500/10 rounded-full blur-2xl -z-10 animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ChatWidget
