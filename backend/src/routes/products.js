const express = require('express');
const router = express.Router();
const ProductService = require('../services/ProductService');
const { verifyToken } = require('../middleware/auth');
const { submitReview } = require('../controllers/reviewController');

// Custom UUID validation regex to avoid extra dependencies for simple checks
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;

/**
 * GET /api/products
 * Retrieves products with optional brandId and category filters
 */
router.get('/', async (req, res) => {
    try {
        const { brandId, category } = req.query;

        // Pass the extracted query parameters to the service
        const products = await ProductService.getAllProducts({ brandId, category });

        return res.status(200).json({ error: false, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: true, message: 'Internal Server Error while fetching products.' });
    }
});

/**
 * GET /api/products/:id
 * Retrieves a single product by ID, returning 404 if not found
 */
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // 1. Validate UUID format
        if (!uuidRegex.test(productId)) {
            return res.status(400).json({ error: true, message: 'Bad Request: Invalid product ID format. Must be a UUID.' });
        }

        // 2. Query the Product Service
        const product = await ProductService.getProductById(productId);

        // 3. Handle 'Not Found' State
        if (!product) {
            return res.status(404).json({ error: true, message: 'Not Found: Product does not exist.' });
        }

        // 4. Return success response
        return res.status(200).json({ error: false, product });
    } catch (error) {
        console.error(`Error fetching product data for ID ${req.params.id}:`, error);
        return res.status(500).json({ error: true, message: 'Internal Server Error while fetching product.' });
    }
});

// POST /api/products/review — authenticated users only
router.post('/review', verifyToken, submitReview);

module.exports = router;
