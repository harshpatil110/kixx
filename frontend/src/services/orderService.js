import api from './api';

/**
 * Submits a new order to the backend.
 *
 * @param {Array<Object>} items - Array of order items.
 * @returns {Promise<Object>} The created order response.
 */
export const createOrder = async (items) => {
    const response = await api.post('/api/orders', { items });
    return response.data;
};

/**
 * Processes a mock payment for a specific order.
 *
 * @param {string|number} orderId - The Order ID.
 * @param {Object} paymentDetails - Object containing details for payment simulation.
 * @returns {Promise<Object>} Payment completion response.
 */
export const processPayment = async (orderId, paymentDetails) => {
    const response = await api.post(`/api/orders/${orderId}/payment`, paymentDetails);
    return response.data;
};

/**
 * Fetches all orders belonging to a specific user.
 *
 * @param {string|number} userId - The internal User ID or Firebase UID safely handled by backend.
 * @returns {Promise<Array>} List of orders for the user.
 */
export const getUserOrders = async (userId) => {
    const response = await api.get(`/api/orders/user/${userId}`);
    return response.data;
};

/**
 * Fetches a single order by its ID.
 *
 * @param {string|number} orderId - The precise order ID.
 * @returns {Promise<Object>} The order details inclusive of items.
 */
export const getOrderById = async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
};
