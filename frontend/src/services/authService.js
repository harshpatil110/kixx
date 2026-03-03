import api from './api';

/**
 * Synchronize the authenticated Firebase user with the PostgreSQL database.
 * The Authorization header containing the Firebase ID Token is automatically
 * attached by the Axios interceptor.
 * 
 * @returns {Promise<Object>} The synchronized user object from the backend.
 */
export const syncUserWithBackend = async () => {
    const response = await api.post('/api/auth/sync');
    return response.data;
};
