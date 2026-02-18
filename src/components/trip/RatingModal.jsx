import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Send } from 'lucide-react'

const RatingModal = ({ isOpen, onClose, onSubmit, title, subtitle }) => {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [notes, setNotes] = useState('')

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Por favor selecciona una calificación')
            return
        }
        onSubmit({ rating, notes })
        onClose()
    }

    const handleSkip = () => {
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-950 border border-white/10 rounded-3xl p-6 z-50 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">
                                {title}
                            </h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase italic">
                                {subtitle}
                            </p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`w-12 h-12 transition-colors ${star <= (hoveredRating || rating)
                                            ? 'fill-primary-500 text-primary-500'
                                            : 'text-zinc-700'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Notes Input */}
                        <div className="mb-6">
                            <label className="block text-[9px] font-black text-zinc-600 uppercase mb-2 italic">
                                Comentarios (Opcional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="¿Algo que quieras compartir?"
                                rows={3}
                                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 bg-zinc-900 text-zinc-400 font-black italic text-[10px] uppercase rounded-xl hover:bg-zinc-800 transition-colors"
                            >
                                OMITIR
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-3 bg-primary-500 text-black font-black italic text-[10px] uppercase rounded-xl hover:bg-primary-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                ENVIAR
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default RatingModal
