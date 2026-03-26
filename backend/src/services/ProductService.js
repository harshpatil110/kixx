const { eq, and } = require('drizzle-orm');
const { db } = require('../db/index');
const { products, productVariants } = require('../db/schema');

class ProductService {
    /**
     * Retrieves all products, optionally filtered by brandId and category.
     * Uses Drizzle Relational Queries API.
     * @param {Object} filters - Optional filters { brandId, category }
     * @returns {Array} List of products
     */
    static async getAllProducts(filters = {}) {
        try {
            const { brandId, category } = filters;
            const conditions = [];

            if (brandId) {
                conditions.push(eq(products.brandId, brandId));
            }
            if (category) {
                conditions.push(eq(products.category, category));
            }

            const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined;

            return await db.query.products.findMany({
                where: whereClause,
                with: {
                    brand: true,
                },
            });
        } catch (error) {
            console.error("PRODUCT FETCH ERROR:", error);
            throw error;
        }
    }

    /**
     * Retrieves a single product by ID, eager loading its brand and variants.
     * @param {String} productId - UUID of the product
     * @returns {Object|null} The product with brand and variants, or null if not found
     */
    static async getProductById(productId) {
        return await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                brand: true,
                variants: true,
            },
        });
    }

    /**
     * Retrieves all variants for a specific product.
     * @param {String} productId - UUID of the product
     * @returns {Array} List of product variants
     */
    static async getProductVariants(productId) {
        return await db.query.productVariants.findMany({
            where: eq(productVariants.productId, productId),
        });
    }
}

module.exports = ProductService;
