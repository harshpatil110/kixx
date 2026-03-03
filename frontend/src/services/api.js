import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
    // Use Vite environment variable for API URL or fallback to localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Request interceptor: Attach Firebase ID token to all requests if the user is authenticated
api.interceptors.request.use(
    async (config) => {
        if (auth.currentUser) {
            try {
                // Force refresh false (or true based on instructions, true ensures token is fresh but adds latency)
                const token = await auth.currentUser.getIdToken(true);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error getting Firebase ID token:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

import toast from 'react-hot-toast';

// Response interceptor: Globally catch errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized request - 401. User might be unauthenticated or token expired.');
            // NOTE: In a broader app, you might trigger a global logout action here or let Firebase handle the session.
        }
        toast.error(error.response?.data?.message || 'An unexpected error occurred');
        return Promise.reject(error);
    }
);

export default api;
