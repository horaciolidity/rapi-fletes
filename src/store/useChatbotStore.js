import { create } from 'zustand'

export const useChatbotStore = create((set, get) => ({
    messages: [],
    loading: false,
    error: null,

    // Enviar mensaje y obtener respuesta de IA
    sendMessage: async (userMessage, context = {}) => {
        // Agregar mensaje del usuario
        const userMsg = {
            role: 'user',
            content: userMessage
        }
        set(state => ({ messages: [...state.messages, userMsg], loading: true, error: null }))

        try {
            // Llamar a la API de IA (usaremos Google Gemini por ahora)
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: context,
                    conversationHistory: get().messages.slice(-10) // Últimos 10 mensajes
                })
            })

            if (!response.ok) {
                throw new Error('Error al obtener respuesta del chatbot')
            }

            const data = await response.json()

            // Agregar respuesta del asistente
            const assistantMsg = {
                role: 'assistant',
                content: data.response
            }

            set(state => ({
                messages: [...state.messages, assistantMsg],
                loading: false
            }))
        } catch (err) {
            console.error('Error in chatbot:', err)

            // Respuesta de fallback si falla la IA
            const fallbackMsg = {
                role: 'assistant',
                content: getFallbackResponse(userMessage)
            }

            set(state => ({
                messages: [...state.messages, fallbackMsg],
                loading: false,
                error: err.message
            }))
        }
    },

    // Limpiar conversación
    clearMessages: () => {
        set({ messages: [], error: null })
    }
}))

// Respuestas de fallback si la IA no está disponible
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase()

    // Preguntas sobre viajes
    if (lowerMessage.includes('solicitar') || lowerMessage.includes('pedir') || lowerMessage.includes('viaje')) {
        return `Para solicitar un viaje:\n\n1. Ve a la sección "Solicitar Servicio"\n2. Ingresa tu ubicación de origen\n3. Ingresa tu destino\n4. Selecciona el tipo de vehículo\n5. Confirma el precio estimado\n6. ¡Listo! Espera a que un chofer acepte\n\n¿Necesitas ayuda con algo más?`
    }

    // Preguntas sobre ser chofer
    if (lowerMessage.includes('chofer') || lowerMessage.includes('conductor') || lowerMessage.includes('trabajar')) {
        return `Para convertirte en chofer:\n\n1. Ve a tu perfil\n2. Cambia tu rol a "Chofer"\n3. Completa tu información:\n   • Datos del vehículo\n   • Documentación\n   • Datos bancarios\n4. Espera la verificación\n5. ¡Comienza a aceptar viajes!\n\n¿Tienes más preguntas?`
    }

    // Preguntas sobre pagos
    if (lowerMessage.includes('pago') || lowerMessage.includes('tarifa') || lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
        return `Sobre pagos y tarifas:\n\n• El precio se calcula según:\n  - Distancia del viaje\n  - Tipo de vehículo\n  - Tiempo estimado\n\n• Métodos de pago:\n  - Efectivo al chofer\n  - Mercado Pago (próximamente)\n\n• Comisión de plataforma: 10%\n\n¿Necesitas más información?`
    }

    // Preguntas sobre reclamos
    if (lowerMessage.includes('reclamo') || lowerMessage.includes('problema') || lowerMessage.includes('queja')) {
        return `Para hacer un reclamo:\n\n1. Ve a "Mis Servicios"\n2. Selecciona el viaje con problema\n3. Presiona "Reportar Problema"\n4. Describe la situación\n5. Envía el reclamo\n\nNuestro equipo lo revisará en 24-48 horas.\n\n¿Puedo ayudarte con algo más?`
    }

    // Preguntas sobre cancelación
    if (lowerMessage.includes('cancelar')) {
        return `Para cancelar un viaje:\n\n• Antes de que el chofer acepte:\n  - Ve a "Mis Servicios"\n  - Presiona "Cancelar Solicitud"\n  - Sin penalización\n\n• Después de que el chofer aceptó:\n  - Presiona "Cancelar Viaje"\n  - Puede haber penalización\n\n¿Necesitas cancelar un viaje ahora?`
    }

    // Respuesta genérica
    return `Gracias por tu pregunta. Puedo ayudarte con:\n\n• Cómo solicitar un viaje\n• Cómo convertirte en chofer\n• Información sobre pagos y tarifas\n• Cómo hacer un reclamo\n• Cancelación de viajes\n\n¿Sobre qué te gustaría saber más?`
}
