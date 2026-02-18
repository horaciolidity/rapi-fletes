import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown } from 'lucide-react'
import { useChatbotStore } from '../../store/useChatbotStore'

const QUICK_QUESTIONS = [
    '¿Cómo solicito un viaje?',
    '¿Cuánto cuesta un flete?',
    '¿Cómo me convierto en chofer?',
    '¿Cómo cancelo un viaje?',
    '¿Cómo hago un reclamo?',
    '¿Cómo contacto al chofer?',
]

const WELCOME_MESSAGE = {
    role: 'assistant',
    content: `¡Hola! 👋 Soy el asistente virtual de **Rapi Fletes**.\n\n¿En qué puedo ayudarte hoy? Podés escribirme tu consulta o elegir una de las preguntas frecuentes de abajo. 😊`
}

// Renderiza el texto con **negrita** básica
const FormattedText = ({ text }) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return (
        <span>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**')
                    ? <strong key={i}>{part.slice(2, -2)}</strong>
                    : <span key={i}>{part}</span>
            )}
        </span>
    )
}

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputMessage, setInputMessage] = useState('')
    const [hasNewMessage, setHasNewMessage] = useState(true)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const { messages, loading, sendMessage, clearMessages } = useChatbotStore()

    // Scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Mensaje de bienvenida al abrir por primera vez
    useEffect(() => {
        if (isOpen) {
            setHasNewMessage(false)
            if (messages.length === 0) {
                useChatbotStore.setState({ messages: [WELCOME_MESSAGE] })
            }
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [isOpen])

    const handleSend = async (text) => {
        const msg = (text || inputMessage).trim()
        if (!msg || loading) return
        setInputMessage('')
        await sendMessage(msg)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const showQuickQuestions = messages.length <= 1

    return (
        <>
            {/* ── Botón flotante ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        id="chatbot-toggle-btn"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-28 right-5 z-[60] w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full shadow-2xl shadow-primary-500/40 flex items-center justify-center"
                    >
                        <MessageCircle className="w-7 h-7 text-black" />
                        {hasNewMessage && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse" />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Ventana de chat ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-28 right-4 z-[70] w-[calc(100vw-32px)] sm:w-[380px] h-[70vh] max-h-[550px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-black/20 rounded-full flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-black italic uppercase tracking-wide leading-none">
                                        Asistente Virtual
                                    </p>
                                    <p className="text-[9px] text-black/60 font-bold mt-0.5">
                                        🟢 En línea · Respuesta inmediata
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
                            >
                                <ChevronDown className="w-5 h-5 text-black" />
                            </button>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-secondary-500' : 'bg-primary-500'
                                        }`}>
                                        {msg.role === 'user'
                                            ? <User className="w-4 h-4 text-black" />
                                            : <Bot className="w-4 h-4 text-black" />
                                        }
                                    </div>

                                    {/* Burbuja */}
                                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-secondary-500 text-black rounded-tr-sm'
                                        : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-sm'
                                        }`}>
                                        {msg.role === 'assistant'
                                            ? msg.content.split('\n').map((line, j) => (
                                                <p key={j} className={j > 0 ? 'mt-1' : ''}>
                                                    <FormattedText text={line} />
                                                </p>
                                            ))
                                            : msg.content
                                        }
                                    </div>
                                </motion.div>
                            ))}

                            {/* Indicador de escritura */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-black" />
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1 items-center h-4">
                                            {[0, 150, 300].map(delay => (
                                                <div
                                                    key={delay}
                                                    className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                                                    style={{ animationDelay: `${delay}ms` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Preguntas rápidas */}
                        <AnimatePresence>
                            {showQuickQuestions && !loading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-4 pb-2 flex-shrink-0"
                                >
                                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-2">
                                        Preguntas frecuentes
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_QUESTIONS.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(q)}
                                                className="text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-primary-500/40 transition-all"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div className="px-4 pb-4 pt-2 border-t border-zinc-900 flex-shrink-0">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={e => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribí tu consulta..."
                                    disabled={loading}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 transition-all"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputMessage.trim() || loading}
                                    className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center hover:bg-primary-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    {loading
                                        ? <Loader2 className="w-4 h-4 text-black animate-spin" />
                                        : <Send className="w-4 h-4 text-black" />
                                    }
                                </button>
                            </div>
                            <button
                                onClick={clearMessages}
                                className="w-full mt-2 text-[9px] text-zinc-700 hover:text-zinc-500 transition-colors text-center"
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
