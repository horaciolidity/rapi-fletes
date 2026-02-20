import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
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
        set((state) => ({
            notifications: [{ ...notification, id, read: false, createdAt: new Date() }, ...state.notifications].slice(0, 20),
            popups: [{ ...notification, id }, ...state.popups]
        }))

        // Play Sound (Repeat for better awareness)
        const playSound = () => {
            const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_783424ffc4.mp3') // A more distinct "ding"
            audio.volume = 0.5
            audio.play().catch(e => console.log('Audio play failed:', e))
        }

        playSound()
        // Optional: second beep after 500ms
        setTimeout(playSound, 500)

        // Browser Notification
        if (get().permission === 'granted') {
            new Notification('RapiFletes', {
                body: notification.message,
                icon: '/icons/icon-192x192.png',
            })
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
}))
