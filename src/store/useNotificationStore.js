import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../api/supabase'

export const useNotificationStore = create(
    persist(
        (set, get) => ({
            notifications: [],
            popups: [],
            permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',

            requestPermission: async () => {
                if (typeof Notification === 'undefined') return
                const permission = await Notification.requestPermission()
                set({ permission })
                return permission
            },



            addNotification: (notification) => {
                const id = Date.now()

                // Add to list and popups
                set((state) => ({
                    notifications: [{ ...notification, id, read: false, createdAt: new Date() }, ...state.notifications].slice(0, 20),
                    popups: [{ ...notification, id }, ...state.popups]
                }))

                // Haptic Feedback & Sound (Repeat for better awareness)
                const triggerAlert = () => {
                    // Reliable sound from Google Actions Library without CORS/403 issues
                    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
                    audio.volume = 1.0 // Fuerza máxima
                    audio.play().catch(e => console.log('Audio play failed (maybe tab backgrounded):', e))

                    // Vibration
                    if ('vibrate' in navigator) {
                        navigator.vibrate([200, 100, 200]) // Vibrate pattern: pulse, pause, pulse
                    }
                }

                triggerAlert()
                setTimeout(triggerAlert, 600)

                // Browser Notification (Forces OS sound if tab is in background)
                if (get().permission === 'granted') {
                    try {
                        // Some mobile browsers need a service worker for this, but desktop handles it
                        new Notification('RapiFletes Logistics', {
                            body: notification.message,
                            icon: '/imagenes/1.jpg',
                            vibrate: [200, 100, 200],
                            silent: false, // Force the OS to play a default notification sound
                            requireInteraction: notification.type === 'error' // Keep errors on screen until dismissed
                        })
                    } catch (e) {
                        console.error('Browser notification error:', e)
                    }
                }

                // Auto remove in-app POPUP after 5s
                setTimeout(() => {
                    set((state) => ({
                        popups: state.popups.filter((n) => n.id !== id)
                    }))
                }, 5000)
            },

            removePopup: (id) => {
                set((state) => ({
                    popups: state.popups.filter((n) => n.id !== id)
                }))
            },

            markAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map(n => ({ ...n, read: true }))
                }))
            },

            clearNotifications: () => {
                set({ notifications: [] })
            }
        }),
        {
            name: 'rafifletes-notifications',
            partialize: (state) => ({ notifications: state.notifications }), // Only persist notifications, not popups
        }
    )
)
