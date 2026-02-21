import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
                    // Sound
                    const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_783424ffc4.mp3')
                    audio.volume = 0.7
                    audio.play().catch(e => console.log('Audio play failed:', e))

                    // Vibration
                    if ('vibrate' in navigator) {
                        navigator.vibrate([200, 100, 200]) // Vibrate pattern: pulse, pause, pulse
                    }
                }

                triggerAlert()
                setTimeout(triggerAlert, 600)

                // Browser Notification
                if (get().permission === 'granted') {
                    try {
                        new Notification('RapiFletes Logistics', {
                            body: notification.message,
                            icon: '/imagenes/1.jpg',
                            vibrate: [200, 100, 200]
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
