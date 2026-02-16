import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNotificationStore } from '../../store/useNotificationStore'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../api/supabase'

const NotificationManager = () => {
    const { notifications, removeNotification, addNotification, requestPermission } = useNotificationStore()
    const { user, profile } = useAuthStore()

    useEffect(() => {
        requestPermission()
    }, [])

    useEffect(() => {
        if (!user) return

        // Global watcher for this user's fletes
        const fleteChannel = supabase
            .channel(`fletes_realtime_${user.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'fletes',
                filter: profile?.role === 'driver' ? `driver_id=eq.${user.id}` : `user_id=eq.${user.id}`
            }, (payload) => {
                const oldStatus = payload.old.status
                const newStatus = payload.new.status
                const oldDriver = payload.old.driver_id
                const newDriver = payload.new.driver_id

                let message = ''

                if (profile?.role === 'driver') {
                    // Notification for driver when they get assigned (driver_id was null, now is theirs)
                    if (!oldDriver && newDriver === user.id) {
                        message = '🔔 ¡Has sido asignado a un nuevo viaje!'
                    } else if (oldStatus !== newStatus && newStatus === 'cancelled') {
                        message = '❌ El cliente ha cancelado el viaje.'
                    }
                } else {
                    // Notification for client
                    if (oldStatus === 'pending' && newStatus === 'accepted') {
                        message = '🚚 ¡Un chofer ha aceptado tu viaje!'
                    } else if (oldStatus !== newStatus && newStatus === 'picked_up') {
                        message = '📦 El chofer ya retiró la carga.'
                    } else if (newStatus === 'completed') {
                        message = '✅ ¡Viaje completado con éxito!'
                    }
                }

                if (message) {
                    addNotification({ message, type: 'info' })
                }
            })
            // Special case for drivers: New available fletes in marketplace
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'fletes'
            }, (payload) => {
                if (profile?.role === 'driver' && payload.new.status === 'pending') {
                    addNotification({ message: '¡Nuevo pedido disponible en el Marketplace!', type: 'success' })
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(fleteChannel)
        }
    }, [user, profile, addNotification])

    return (
        <div className="fixed top-24 left-0 right-0 z-[9999] pointer-events-none flex flex-col items-center gap-3 px-6">
            <AnimatePresence>
                {notifications.map((n) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="pointer-events-auto"
                    >
                        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl min-w-[300px] max-w-sm">
                            <div className={`p-2 rounded-xl bg-primary-500/10 text-primary-500`}>
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-black uppercase italic tracking-widest text-white leading-tight">
                                    {n.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeNotification(n.id)}
                                className="text-zinc-600 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default NotificationManager
