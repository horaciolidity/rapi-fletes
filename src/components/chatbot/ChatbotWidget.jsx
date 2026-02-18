import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useChatbotStore } from '../../store/useChatbotStore'
import { useAuthStore } from '../../store/useAuthStore'

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputMessage, setInputMessage] = useState('')
    const messagesEndRef = useRef(null)
    const { messages, loading, sendMessage, clearMessages } = useChatbotStore()
    const { profile } = useAuthStore()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Mensaje de bienvenida al abrir
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = {
                role: 'assistant',
                content: `¡Hola! 👋 Soy el asistente virtual de Rapi Fletes.\n\n¿En qué puedo ayudarte hoy?\n\nPuedo ayudarte con:\n• Cómo funciona la app\n• Problemas con viajes\n• Preguntas sobre pagos\n• Cómo hacer un reclamo\n• Y mucho más...`
            }
            useChatbotStore.setState({ messages: [welcomeMessage] })
        }
    }, [isOpen])

    const handleSend = async () => {
        if (!inputMessage.trim() || loading) return

        const userMessage = inputMessage.trim()
        setInputMessage('')

        // Agregar contexto del usuario
        const context = {
            userRole: profile?.role || 'guest',
            userName: profile?.full_name || 'Usuario'
        }

        await sendMessage(userMessage, context)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const quickQuestions = [
        '¿Cómo solicito un viaje?',
        '¿Cómo me convierto en chofer?',
        '¿Cuáles son las tarifas?',
        '¿Cómo hago un reclamo?'
    ]

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full shadow-2xl shadow-primary-500/30 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        <MessageCircle className="w-8 h-8 text-black" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-500 to-primary-400 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-black italic uppercase">
                                        Asistente Virtual
                                    </h3>
                                    <p className="text-[9px] text-black/60 font-bold italic">
                                        Siempre disponible
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-black" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                            ? 'bg-secondary-500'
                                            : 'bg-primary-500'
                                        }`}>
                                        {message.role === 'user' ? (
                                            <User className="w-5 h-5 text-black" />
                                        ) : (
                                            <Bot className="w-5 h-5 text-black" />
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`max-w-[70%] rounded-2xl p-3 ${message.role === 'user'
                                            ? 'bg-secondary-500 text-black'
                                            : 'bg-zinc-900 text-white border border-zinc-800'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-black" />
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length <= 1 && !loading && (
                            <div className="px-4 pb-2">
                                <p className="text-[9px] text-zinc-600 font-bold uppercase mb-2">
                                    Preguntas frecuentes:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {quickQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setInputMessage(question)
                                                setTimeout(handleSend, 100)
                                            }}
                                            className="text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 bg-zinc-950 border-t border-zinc-900">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu pregunta..."
                                    disabled={loading}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputMessage.trim() || loading}
                                    className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 text-black animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 text-black" />
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={clearMessages}
                                className="w-full mt-2 text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                                Limpiar conversación
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default ChatbotWidget
