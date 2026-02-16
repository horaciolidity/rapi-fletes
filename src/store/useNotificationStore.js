import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',

    requestPermission: async () => {
        if (typeof Notification === 'undefined') return
        const permission = await Notification.requestPermission()
        set({ permission })
    },

    addNotification: (notification) => {
        const id = Date.now()
        set((state) => ({
            notifications: [{ ...notification, id }, ...state.notifications].slice(0, 5)
        }))

        // Play Sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
        audio.play().catch(e => console.log('Audio play failed:', e))

        // Browser Notification
        if (get().permission === 'granted') {
            new Notification('RapiFletes', {
                body: notification.message,
                icon: '/icons/icon-192x192.png', // Assuming standard PWA path
            })
        }

        // Auto remove in-app notification after 5s
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            }))
        }, 5000)
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        }))
    }
}))
