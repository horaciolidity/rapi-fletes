import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNotificationStore } from '../../store/useNotificationStore'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../api/supabase'

const NotificationManager = () => {
    const { popups, removePopup, requestPermission, addNotification } = useNotificationStore()
    const { user, profile } = useAuthStore()

    useEffect(() => {
        requestPermission()
    }, [])

    useEffect(() => {
        if (!user) return

        let fleteChannel = null
        let profileChannel = null

        // Global watcher for this user's fletes
        fleteChannel = supabase
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
                    if (!oldDriver && newDriver === user.id) {
                        message = '🔔 ¡Has sido asignado a un nuevo viaje!'
                    } else if (oldStatus !== newStatus && newStatus === 'cancelled') {
                        message = '❌ El cliente ha cancelado el viaje.'
                    }
                } else {
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

        // Profile/Account watcher
        profileChannel = supabase
            .channel(`profile_realtime_${user.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`
            }, (payload) => {
                const oldStatus = payload.old.verification_status
                const newStatus = payload.new.verification_status

                if (oldStatus !== newStatus) {
                    if (newStatus === 'verified') {
                        const msg = '🎊 ¡Tu cuenta ha sido verificada! Ya puedes aceptar fletes. Revisa tu Garaje para ver tu vehículo activo.'
                        addNotification({ message: msg, type: 'success' })
                    } else if (newStatus === 'none' && oldStatus === 'pending') {
                        const msg = '❌ Tu solicitud ha sido rechazada. Revisa los motivos en la sección de Vehículos de tu panel.'
                        addNotification({ message: msg, type: 'error' })
                    }
                }
            })
            .subscribe()

        return () => {
            if (fleteChannel) supabase.removeChannel(fleteChannel)
            if (profileChannel) supabase.removeChannel(profileChannel)
        }
    }, [user?.id, profile?.role]) // Solo re-suscribir si cambia el ID o el Rol

    return (
        <div className="fixed top-6 left-0 right-0 z-[9999] pointer-events-none flex flex-col items-center gap-3 px-6">
            <AnimatePresence>
                {popups.map((n) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="pointer-events-auto"
                    >
                        <div className="bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-4 shadow-2xl min-w-[300px] max-w-sm">
                            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-black uppercase italic tracking-widest leading-tight">
                                    {n.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removePopup(n.id)}
                                className="text-zinc-500 hover:text-primary-500 transition-colors"
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
