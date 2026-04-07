import { auth } from '../config/firebase';

/**
 * Saves a completed transaction snapshot to the database (post-payment).
 * 
 * This is the ONLY order API call. All other legacy routes (POST /, 
 * POST /:id/payment, GET /user/:userId) have been removed from the backend.
 *
 * @param {{ email: string, shippingAddress: object, items: Array, promoCode?: string, totalAmount: number }} payload
 * @returns {Promise<Object>} The saved order response with { success, order }.
 */
export const saveCompletedOrder = async (payload) => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${apiUrl}/api/orders/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Backend rejected the order payload.");
    }
    
    return response.json();
};

/**
 * Fetches all past orders for the authenticated user.
 * Calls GET /api/orders/history which filters by the JWT email.
 *
 * @returns {Promise<Array>} List of past orders.
 */
export const getUserOrders = async () => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${apiUrl}/api/orders/history`, {
        method: 'GET',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order history.");
    }
    
    return response.json();
};

/**
 * Fetches a single order by its ID from past_orders.
 * Used by OrderConfirmationPage and OrderDetailPage.
 *
 * @param {string} orderId - The order UUID.
 * @returns {Promise<Object>} The order details.
 */
export const getOrderById = async (orderId) => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order.");
    }
    
    const data = await response.json();
    // Backend returns { error: false, order: {...} } — unwrap it
    return data.order || data;
};
