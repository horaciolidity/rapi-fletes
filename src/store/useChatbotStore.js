import { create } from 'zustand'

// ─── BASE DE CONOCIMIENTO ────────────────────────────────────────────────────

const KB = [
    // SOLICITAR VIAJE
    {
        keywords: ['solicitar', 'pedir', 'crear', 'nuevo viaje', 'flete', 'cómo pido', 'como pido', 'quiero un viaje'],
        answer: `Para solicitar un servicio:\n\n1️⃣ Presiona **"Reservar"** en el menú inferior\n2️⃣ Ingresa tu dirección de **origen**\n3️⃣ Ingresa tu dirección de **destino**\n4️⃣ Selecciona el **tipo de vehículo**\n5️⃣ Revisa el precio estimado\n6️⃣ Confirma la solicitud\n\n¡Un chofer cercano la aceptará en minutos! 🚛`
    },
    // CANCELAR VIAJE
    {
        keywords: ['cancelar', 'anular', 'cancelación'],
        answer: `Para cancelar un viaje:\n\n📌 **Sin chofer asignado** (estado: Buscando)\n→ Ve a "Mis Servicios" → selecciona el viaje → presiona **"Cancelar Solicitud"**\n\n📌 **Con chofer asignado**\n→ Ve a "Mis Servicios" → selecciona el viaje → presiona **"Cancelar Viaje"**\n⚠️ Recuerda que el chofer ya está en camino.\n\n¿Necesitás más ayuda?`
    },
    // SEGUIMIENTO / ESTADO
    {
        keywords: ['dónde', 'donde', 'estado', 'seguimiento', 'rastrear', 'ubicación', 'llegó', 'llego', 'cuándo llega', 'cuando llega'],
        answer: `Podés ver el estado de tu viaje en tiempo real:\n\n1️⃣ Ve a **"Mis Servicios"**\n2️⃣ Selecciona el viaje activo\n3️⃣ Verás el estado actualizado:\n\n🔍 **Buscando chofer** → esperando aceptación\n🚗 **Aceptado** → chofer en camino al origen\n📍 **Llegó al origen** → chofer en el punto de carga\n🚛 **En tránsito** → viaje en curso\n✅ **Completado** → viaje finalizado\n\n¿Hay algo más en lo que pueda ayudarte?`
    },
    // PRECIO / TARIFA
    {
        keywords: ['precio', 'tarifa', 'costo', 'cuánto cuesta', 'cuanto cuesta', 'cobran', 'valor', 'presupuesto'],
        answer: `El precio se calcula automáticamente según:\n\n📏 **Distancia** entre origen y destino\n🚛 **Tipo de vehículo** seleccionado\n⏱️ **Tiempo estimado** del viaje\n\nVerás el precio estimado **antes de confirmar**, así podés decidir con tranquilidad.\n\n💡 Los tipos de vehículo disponibles son:\n• Pickup\n• Van\n• Camión pequeño\n• Camión mediano\n\n¿Querés saber algo más sobre precios?`
    },
    // PAGO
    {
        keywords: ['pago', 'pagar', 'efectivo', 'mercado pago', 'cómo pago', 'como pago', 'transferencia'],
        answer: `Métodos de pago disponibles:\n\n💵 **Efectivo** → se paga directamente al chofer al finalizar el viaje\n📱 **Mercado Pago** → próximamente disponible\n\n¿Tenés alguna otra consulta sobre pagos?`
    },
    // SER CHOFER
    {
        keywords: ['chofer', 'conductor', 'manejar', 'trabajar', 'registrarme como', 'quiero ser', 'cómo me registro', 'como me registro', 'ganar dinero'],
        answer: `Para convertirte en chofer:\n\n1️⃣ Ve a tu **Perfil**\n2️⃣ Cambia tu rol a **"Chofer"**\n3️⃣ Completá los datos de tu vehículo\n4️⃣ ¡Listo! Ya podés ver y aceptar viajes\n\n💰 **¿Cuánto ganás?**\nRecibís el **90%** del precio de cada viaje. La plataforma cobra solo un 10% de comisión.\n\n¿Querés saber más sobre cómo funciona para choferes?`
    },
    // CALIFICACIÓN
    {
        keywords: ['calificar', 'calificación', 'estrella', 'puntaje', 'rating', 'reseña'],
        answer: `Sistema de calificaciones:\n\n⭐ Al finalizar un viaje, el **cliente puede calificar al chofer** de 1 a 5 estrellas.\n\n📊 La calificación promedio del chofer se muestra en su perfil y en la tarjeta de información durante el viaje.\n\n¿Cómo calificar?\n1️⃣ Ve a "Mis Servicios"\n2️⃣ Selecciona el viaje completado\n3️⃣ Presiona **"Calificar Chofer"**\n4️⃣ Elegí las estrellas y dejá un comentario (opcional)\n\n¿Necesitás ayuda con algo más?`
    },
    // RECLAMO / PROBLEMA
    {
        keywords: ['reclamo', 'problema', 'queja', 'reportar', 'inconveniente', 'mal servicio', 'no llegó', 'no llego'],
        answer: `Para reportar un problema:\n\n1️⃣ Ve a **"Mis Servicios"**\n2️⃣ Selecciona el viaje con problema\n3️⃣ Presiona **"Reportar Problema"**\n4️⃣ Describí la situación\n5️⃣ Enviá el reclamo\n\n📋 Nuestro equipo lo revisará en **24 a 48 horas** y te contactará.\n\n¿Hay algo más en lo que pueda ayudarte?`
    },
    // CONTACTAR CHOFER
    {
        keywords: ['contactar', 'llamar', 'teléfono', 'telefono', 'hablar con el chofer', 'número del chofer'],
        answer: `Para contactar a tu chofer:\n\n1️⃣ Ve a **"Mis Servicios"**\n2️⃣ Selecciona el viaje activo\n3️⃣ En la tarjeta del chofer verás el botón **"Contactar Chofer"**\n4️⃣ Presionalo para llamar directamente\n\n📞 También podés usar el **chat** integrado durante el viaje.\n\n¿Necesitás algo más?`
    },
    // BILLETERA / SALDO
    {
        keywords: ['billetera', 'saldo', 'recargar', 'recarga', 'dinero', 'fondos', 'balance'],
        answer: `💰 **Billetera del Chofer**\n\nComo chofer tenés una billetera virtual donde se acreditan tus ganancias.\n\n📲 **Cómo recargar saldo:**\n1️⃣ Ve a **"Mi Billetera"**\n2️⃣ Presiona **"Recargar Saldo"**\n3️⃣ Seleccioná el monto\n4️⃣ Pagá con Mercado Pago\n\n📊 También podés ver el historial completo de movimientos (ganancias, comisiones, recargas).\n\n¿Tenés más preguntas?`
    },
    // PERFIL
    {
        keywords: ['perfil', 'datos', 'cambiar nombre', 'editar', 'foto', 'información personal'],
        answer: `Para editar tu perfil:\n\n1️⃣ Presiona **"Perfil"** en el menú inferior\n2️⃣ Actualizá tu nombre, teléfono o foto\n3️⃣ Guardá los cambios\n\n¿Necesitás ayuda con algo específico de tu perfil?`
    },
    // SEGURIDAD / BANEO
    {
        keywords: ['baneado', 'suspendido', 'bloqueado', 'no puedo entrar', 'cuenta bloqueada'],
        answer: `Si tu cuenta fue suspendida:\n\n📧 Contactá a nuestro equipo de soporte explicando la situación.\n\nLas suspensiones pueden ocurrir por:\n• Múltiples reclamos recibidos\n• Comportamiento inadecuado\n• Incumplimiento de los términos\n\n¿Hay algo más en lo que pueda ayudarte?`
    },
    // SALUDOS
    {
        keywords: ['hola', 'buenas', 'buen día', 'buen dia', 'buenas tardes', 'buenas noches', 'hey', 'hi'],
        answer: `¡Hola! 👋 Bienvenido al asistente virtual de **Rapi Fletes**.\n\n¿En qué puedo ayudarte hoy?\n\nPuedo orientarte sobre:\n• Cómo solicitar un viaje\n• Precios y pagos\n• Cómo ser chofer\n• Reclamos y problemas\n• Y mucho más...`
    },
    // GRACIAS
    {
        keywords: ['gracias', 'muchas gracias', 'ok gracias', 'perfecto', 'listo', 'entendí', 'entendi'],
        answer: `¡De nada! 😊 Estoy aquí para ayudarte cuando lo necesites.\n\n¿Hay algo más en lo que pueda asistirte?`
    },
]

// ─── FUNCIÓN DE BÚSQUEDA ─────────────────────────────────────────────────────

function findAnswer(message) {
    const lower = message.toLowerCase().trim()

    // Buscar coincidencia por keywords
    for (const entry of KB) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
            return entry.answer
        }
    }

    // Respuesta por defecto
    return `No encontré información específica sobre eso, pero puedo ayudarte con:\n\n• 🚛 Cómo solicitar un viaje\n• 💰 Precios y formas de pago\n• 🚗 Cómo convertirte en chofer\n• 🚨 Cómo hacer un reclamo\n• ⭐ Sistema de calificaciones\n• 📞 Cómo contactar a tu chofer\n\n¿Sobre cuál de estos temas querés saber más?`
}

// ─── STORE ───────────────────────────────────────────────────────────────────

export const useChatbotStore = create((set) => ({
    messages: [],
    loading: false,

    sendMessage: async (userMessage) => {
        // Agregar mensaje del usuario
        set(state => ({
            messages: [...state.messages, { role: 'user', content: userMessage }],
            loading: true
        }))

        // Simular un pequeño delay para que se sienta natural
        await new Promise(resolve => setTimeout(resolve, 600))

        const response = findAnswer(userMessage)

        set(state => ({
            messages: [...state.messages, { role: 'assistant', content: response }],
            loading: false
        }))
    },

    clearMessages: () => set({ messages: [], loading: false })
}))
