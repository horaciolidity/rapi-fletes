import axios from 'axios';
import { useStore } from '../store/useStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
    const token = useStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
};

export const tripService = {
    create: (data) => api.post('/trips', data),
    getAll: () => api.get('/trips'),
    updateStatus: (id, status) => api.patch(`/trips/${id}`, { status }),
};

export const paymentService = {
    createPreference: (data) => api.post('/payments/create-preference', data),
};

export default api;
