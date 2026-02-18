// API endpoint para el chatbot con Google Gemini
// Este archivo debe ir en: api/chatbot.js (para Vercel Serverless Functions)

import { GoogleGenerativeAI } from '@google/generative-ai'

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Prompt del sistema con conocimiento de Rapi Fletes
const SYSTEM_PROMPT = `Eres el asistente virtual de Rapi Fletes, una aplicación de transporte de carga en Argentina.

INFORMACIÓN DE LA APLICACIÓN:
- Rapi Fletes conecta clientes que necesitan transportar carga con choferes disponibles
- Tipos de vehículos: Pickup, Van, Camión pequeño, Camión mediano
- La plataforma cobra una comisión del 10% a los choferes
- Los pagos se realizan en efectivo al chofer o mediante Mercado Pago
- Los clientes pueden calificar a los choferes (1-5 estrellas)

FUNCIONALIDADES PRINCIPALES:

Para Clientes:
1. Solicitar Servicio: Ingresar origen, destino, tipo de vehículo
2. Ver precio estimado antes de confirmar
3. Seguimiento en tiempo real del chofer
4. Chat con el chofer durante el viaje
5. Calificar al chofer al finalizar
6. Reportar problemas durante el viaje
7. Cancelar viaje (sin penalización si no hay chofer asignado)

Para Choferes:
1. Ver viajes disponibles en el marketplace
2. Aceptar viajes que les convengan
3. Navegar al origen con Google Maps
4. Confirmar llegada al origen
5. Iniciar viaje hacia destino
6. Confirmar llegada al destino
7. Finalizar viaje y calificar al cliente
8. Ver billetera con saldo y movimientos
9. Recargar saldo vía Mercado Pago

Estados del Viaje:
- pending: Buscando chofer
- accepted: Chofer asignado, en camino al origen
- arrived_pickup: Chofer arribó al origen
- in_transit: Viaje en curso hacia destino
- arrived_dropoff: Arribó al destino
- completed: Viaje finalizado
- cancelled: Viaje cancelado

CÓMO HACER UN RECLAMO:
1. Ir a "Mis Servicios"
2. Seleccionar el viaje con problema
3. Presionar "Reportar Problema"
4. Describir la situación
5. El equipo de soporte revisará en 24-48 horas

TARIFAS:
- Se calculan según distancia, tipo de vehículo y tiempo
- El cliente ve el precio estimado antes de confirmar
- El chofer recibe el 90% (10% es comisión de plataforma)

TU ROL:
- Responde de forma amigable, clara y concisa
- Usa emojis ocasionalmente para ser más cercano
- Si no sabes algo, admítelo y sugiere contactar soporte
- Prioriza la seguridad y satisfacción del usuario
- Sé breve pero informativo (máximo 3-4 párrafos)
- Usa formato markdown para listas y énfasis cuando sea apropiado

IMPORTANTE:
- Nunca inventes información que no esté en este prompt
- Si te preguntan sobre precios específicos, di que depende de la distancia y vehículo
- Si hay un problema urgente, recomienda contactar soporte inmediatamente
- Mantén un tono profesional pero amigable`

export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { message, context, conversationHistory } = req.body

        if (!message) {
            return res.status(400).json({ error: 'Message is required' })
        }

        // Verificar si tenemos API key
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not configured, using fallback')
            return res.status(200).json({
                response: getFallbackResponse(message)
            })
        }

        // Preparar el contexto del usuario
        const userContext = context ? `\n\nContexto del usuario:\n- Rol: ${context.userRole}\n- Nombre: ${context.userName}` : ''

        // Preparar historial de conversación
        const history = conversationHistory && conversationHistory.length > 0
            ? '\n\nConversación previa:\n' + conversationHistory.map(msg =>
                `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
            ).join('\n')
            : ''

        // Crear el modelo
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        // Generar respuesta
        const result = await model.generateContent(
            SYSTEM_PROMPT + userContext + history + '\n\nUsuario: ' + message
        )

        const response = await result.response
        const text = response.text()

        return res.status(200).json({
            response: text
        })

    } catch (error) {
        console.error('Chatbot API error:', error)

        // Si falla la IA, usar respuesta de fallback
        return res.status(200).json({
            response: getFallbackResponse(req.body.message)
        })
    }
}

// Respuestas de fallback (mismo que en el store)
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('solicitar') || lowerMessage.includes('pedir') || lowerMessage.includes('viaje')) {
        return `Para solicitar un viaje:\n\n1. Ve a la sección "Solicitar Servicio"\n2. Ingresa tu ubicación de origen\n3. Ingresa tu destino\n4. Selecciona el tipo de vehículo\n5. Confirma el precio estimado\n6. ¡Listo! Espera a que un chofer acepte\n\n¿Necesitas ayuda con algo más?`
    }

    if (lowerMessage.includes('chofer') || lowerMessage.includes('conductor') || lowerMessage.includes('trabajar')) {
        return `Para convertirte en chofer:\n\n1. Ve a tu perfil\n2. Cambia tu rol a "Chofer"\n3. Completa tu información\n4. Espera la verificación\n5. ¡Comienza a aceptar viajes!\n\n¿Tienes más preguntas?`
    }

    if (lowerMessage.includes('pago') || lowerMessage.includes('tarifa') || lowerMessage.includes('precio')) {
        return `Sobre pagos y tarifas:\n\n• El precio se calcula según distancia, tipo de vehículo y tiempo\n• Métodos de pago: Efectivo o Mercado Pago\n• Comisión de plataforma: 10%\n\n¿Necesitas más información?`
    }

    if (lowerMessage.includes('reclamo') || lowerMessage.includes('problema')) {
        return `Para hacer un reclamo:\n\n1. Ve a "Mis Servicios"\n2. Selecciona el viaje\n3. Presiona "Reportar Problema"\n4. Describe la situación\n\nNuestro equipo lo revisará en 24-48 horas.`
    }

    return `Gracias por tu pregunta. Puedo ayudarte con:\n\n• Cómo solicitar un viaje\n• Cómo convertirte en chofer\n• Información sobre pagos\n• Cómo hacer un reclamo\n\n¿Sobre qué te gustaría saber más?`
}
