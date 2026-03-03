import api from './api';

/**
 * Fetch a list of products based on optional filters.
 *
 * @param {Object} filters - Key-value pair for filters like search, category, etc.
 * @returns {Promise<Array>} Array of products.
 */
export const getProducts = async (filters = {}) => {
    const params = new URLSearchParams();

    // Convert filter object to query string safely
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    }

    // Passing the raw string directly is cleaner for axios `?` interpolation 
    // but let's use the explicit `?` notation to be safe. 
    // Axios also allows `{ params: filters }` which works inherently
    const queryString = params.toString();
    const url = queryString ? `/api/products?${queryString}` : '/api/products';

    const response = await api.get(url);
    return response.data;
};

/**
 * Fetch a single product by ID.
 *
 * @param {string|number} id - Product ID.
 * @returns {Promise<Object>} The product model.
 */
export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};
