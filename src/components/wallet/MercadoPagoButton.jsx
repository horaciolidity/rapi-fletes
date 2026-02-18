import React from 'react'
import { Loader2 } from 'lucide-react'

// Este componente servirá como envoltorio para el SDK de Mercado Pago
const MercadoPagoButton = ({ preferenceId, loading = false }) => {
    if (loading) {
        return (
            <div className="w-full py-5 bg-zinc-900 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
        )
    }

    if (!preferenceId) return null

    return (
        <div className="mercadopago-button-container w-full">
            {/* El SDK de Mercado Pago renderizará aquí el botón oficial */}
            <button
                className="w-full py-5 bg-[#009EE3] text-white font-black italic rounded-2xl hover:bg-[#0089C7] transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20"
                onClick={() => {
                    console.log('Preference ID:', preferenceId)
                    // Aquí se inicializaría el Checkout Pro
                    window.alert('Checkout Pro: ' + preferenceId)
                }}
            >
                PAGAR CON MERCADO PAGO
            </button>
            <p className="mt-4 text-[8px] font-black text-zinc-600 uppercase italic tracking-widest text-center">
                Serás redirigido a la plataforma segura de Mercado Pago
            </p>
        </div>
    )
}

export default MercadoPagoButton
