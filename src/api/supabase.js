import { createClient } from '@supabase/supabase-js'

// Estas variables se cargarán desde el entorno de Vercel en producción
// o desde un archivo .env local (que NO debe ser pusheado a GitHub)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found. Ensure environment variables are set.')
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)

export const unsubscribeAll = (channels) => {
    channels.forEach(channel => {
        supabase.removeChannel(channel)
    })
}
