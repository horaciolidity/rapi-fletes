import { create } from 'zustand'

export const useBookingStore = create((set) => ({
    pickup: null,
    dropoff: null,
    category: null,
    estimate: null,
    currentBooking: null,

    setPickup: (location) => set({ pickup: location }),
    setDropoff: (location) => set({ dropoff: location }),
    setCategory: (category) => set({ category }),
    setEstimate: (estimate) => set({ estimate }),
    setCurrentBooking: (booking) => set({ currentBooking: booking }),
    resetBooking: () => set({ pickup: null, dropoff: null, category: null, estimate: null })
}))
