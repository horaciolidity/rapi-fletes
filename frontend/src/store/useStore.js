import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            activeTrip: null,
            trips: [],

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, token: null, activeTrip: null }),

            setActiveTrip: (trip) => set({ activeTrip: trip }),
            setTrips: (trips) => set({ trips }),

            updateActiveTripStatus: (status) =>
                set((state) => ({
                    activeTrip: state.activeTrip ? { ...state.activeTrip, status } : null
                })),
        }),
        {
            name: 'rapi-fletes-storage',
        }
    )
);
