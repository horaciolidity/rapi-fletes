import React from 'react'
import { Check, Info, AlertCircle } from 'lucide-react'

const BookingSummary = ({ category, price, method }) => {
    return (
        <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Resumen del Flete
                <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">Procesando</span>
            </h3>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Categoría</span>
                    <span className="font-semibold">{category || 'Utilitario Eco'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Tarifa Base</span>
                    <span className="font-semibold">$2,500.00</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Peajes y Otros</span>
                    <span className="font-semibold">$350.00</span>
                </div>
                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-lg font-bold">Total estimado</span>
                    <span className="text-2xl font-black text-primary-400">$2,850.00</span>
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                        El precio final puede variar según el tiempo de carga y condiciones del tráfico local.
                    </p>
                </div>
            </div>

            <button className="premium-button w-full">
                Confirmar y Pagar
            </button>
        </div>
    )
}

export default BookingSummary
