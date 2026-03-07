import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageSquare, User, Loader2, Star, ShieldCheck, Clock, Users } from 'lucide-react'
import { useGlobalChatStore } from '../../store/useGlobalChatStore'
import { useAuthStore } from '../../store/useAuthStore'

const GlobalChatModal = ({ isOpen, onClose }) => {
    const { user, profile } = useAuthStore()
    const { messages, fetchMessages, sendMessage, subscribeToMessages, loading } = useGlobalChatStore()
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef()

    useEffect(() => {
        if (isOpen) {
            fetchMessages()
            const channel = subscribeToMessages()
            return () => {
                if (channel) channel.unsubscribe()
            }
        }
    }, [isOpen])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        const success = await sendMessage(
            user.id,
            profile?.full_name || 'Agente',
            profile?.role || 'client',
            newMessage
        )
        if (success) setNewMessage('')
        setIsSending(false)
    }

    if (!user) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto"
                    />

                    {/* Chat Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="pointer-events-auto w-full max-w-2xl h-[85vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative"
                    >
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-600 to-primary-500" />

                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20 backdrop-blur-3xl">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/20">
                                    <Users className="w-7 h-7 text-black" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter leading-none">CHAT<br /><span className="text-primary-500">COMUNITARIO</span></h2>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Choferes & Clientes en línea</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 rounded-2xl text-zinc-500 transition-all active:scale-90 border border-white/5">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-grow p-6 md:p-8 overflow-y-auto space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scroll-smooth">
                            {loading && messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                                    <p className="text-[10px] font-black uppercase text-zinc-700 italic tracking-[0.3em]">Cargando Transmisiones...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                                    <MessageSquare className="w-16 h-16 text-zinc-800 mb-6" />
                                    <p className="text-[11px] font-black uppercase text-zinc-700 italic tracking-[0.4em]">El chat está en silencio...</p>
                                    <p className="text-[8px] font-bold text-zinc-800 uppercase italic mt-2">¡SÉ EL PRIMERO EN ENVIAR UN MENSAJE!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === user.id
                                    const isDriver = msg.sender_role === 'driver'
                                    const isSystem = msg.sender_role === 'system'

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            key={msg.id}
                                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <span className={`text-[9px] font-black italic uppercase tracking-widest ${isMe ? 'text-primary-500' : 'text-zinc-400'}`}>
                                                    {msg.sender_name}
                                                </span>
                                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full italic border ${isDriver
                                                        ? 'bg-secondary-500/10 border-secondary-500/30 text-secondary-500'
                                                        : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                                                    }`}>
                                                    {isDriver ? 'CHOFER' : 'CLIENTE'}
                                                </span>
                                                {isDriver && <ShieldCheck className="w-2.5 h-2.5 text-secondary-500/50" />}
                                            </div>

                                            <div className={`max-w-[85%] md:max-w-[70%] p-5 md:p-6 rounded-[1.8rem] text-[13px] md:text-[14px] font-bold italic tracking-tight relative shadow-2xl ${isMe
                                                ? 'bg-primary-500 text-black rounded-tr-none shadow-primary-500/10'
                                                : 'bg-zinc-900 text-white rounded-tl-none border border-white/5'
                                                }`}>
                                                {msg.content}
                                                <div className={`flex items-center gap-2 mt-3 opacity-40 ${isMe ? 'justify-end text-black' : 'justify-start text-zinc-500'}`}>
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <p className="text-[8px] font-black uppercase italic">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 md:p-10 bg-zinc-950/80 border-t border-white/5 backdrop-blur-3xl">
                            <form onSubmit={handleSend} className="flex gap-4">
                                <div className="relative flex-grow group">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe algo a la comunidad..."
                                        className="w-full bg-zinc-900 border border-white/5 rounded-full px-8 py-5 text-[11px] font-black uppercase tracking-widest text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all placeholder:text-zinc-800 placeholder:italic"
                                    />
                                    <div className="absolute inset-0 rounded-full bg-primary-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSending || !newMessage.trim()}
                                    className="w-16 h-16 bg-primary-500 hover:bg-primary-400 rounded-full text-black transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shadow-2xl shadow-primary-500/40 active:scale-90 group"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                </button>
                            </form>
                            <p className="text-[7px] font-black text-zinc-800 uppercase italic tracking-widest mt-4 text-center">
                                Respeta las normas de la comunidad • RapiFletes Security System
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default GlobalChatModal
