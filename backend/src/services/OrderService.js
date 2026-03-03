const { eq, desc, inArray, sql } = require('drizzle-orm');
const db = require('../db/index');
const { orders, orderItems, productVariants } = require('../db/schema');

class OrderService {
    /**
     * Creates an order with items within a database transaction.
     * @param {string} userId - Internal DB UUID of the user
     * @param {Array} cartItems - Array of objects { variantId, quantity }
     */
    static async createOrder(userId, cartItems) {
        return await db.transaction(async (tx) => {
            const variantIds = cartItems.map(item => item.variantId);

            // Fetch variants to validate stock. Eager-load product to access basePrice.
            const dbVariants = await tx.query.productVariants.findMany({
                where: inArray(productVariants.id, variantIds),
                with: {
                    product: true
                }
            });

            let totalPrice = 0;

            // Validate stock limits and calculate total price
            for (const item of cartItems) {
                const variant = dbVariants.find(v => v.id === item.variantId);
                if (!variant) {
                    throw new Error(`Variant not found: ${item.variantId}`);
                }
                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for variant SKU: ${variant.sku}. Available: ${variant.stock}`);
                }

                // Summing price
                const price = variant.product.basePrice;
                totalPrice += parseFloat(price) * item.quantity;
            }

            // Insert order into the database
            const [newOrder] = await tx.insert(orders).values({
                userId: userId,
                totalPrice: totalPrice.toFixed(2),
                status: 'pending'
            }).returning();

            // Format payload for orderItems
            const itemsToInsert = cartItems.map(item => {
                const variant = dbVariants.find(v => v.id === item.variantId);
                return {
                    orderId: newOrder.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: variant.product.basePrice
                };
            });

            // Insert all records concurrently via batch insert
            await tx.insert(orderItems).values(itemsToInsert);

            return newOrder;
        });
    }

    /**
     * Processes mock payment and decrements stock.
     * @param {string} orderId - UUID of the order
     * @param {Object} paymentDetails - Simulated payment info
     */
    static async processPayment(orderId, paymentDetails) {
        return await db.transaction(async (tx) => {
            // Mock payment simulation logic
            const generatedPaymentId = paymentDetails?.transactionId || `MOCK_TX_${Date.now()}`;

            // Update Order Status
            const [updatedOrder] = await tx.update(orders)
                .set({
                    status: 'paid',
                    paymentId: generatedPaymentId,
                    updatedAt: new Date()
                })
                .where(eq(orders.id, orderId))
                .returning();

            if (!updatedOrder) {
                throw new Error('Order not found or already processed');
            }

            // Fetch Items to adjust inventory gracefully
            const items = await tx.query.orderItems.findMany({
                where: eq(orderItems.orderId, orderId)
            });

            // Execute atomic decrements explicitly enforcing Drizzle raw SQL
            for (const item of items) {
                await tx.update(productVariants)
                    .set({
                        stock: sql`${productVariants.stock} - ${item.quantity}`,
                        updatedAt: new Date()
                    })
                    .where(eq(productVariants.id, item.variantId));
            }

            return updatedOrder;
        });
    }

    /**
     * Fetches all orders tied to a specific internal DB User.
     * @param {string} userId - Internal mapped DB UUID
     */
    static async getUserOrders(userId) {
        return await db.query.orders.findMany({
            where: eq(orders.userId, userId),
            orderBy: [desc(orders.createdAt)],
            with: {
                items: {
                    with: {
                        variant: {
                            with: {
                                product: true // Provide deep-level object to frontend efficiently
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Fetches specific order and guarantees correct ownership scopes.
     * @param {string} orderId 
     * @param {string} userId 
     */
    static async getOrderById(orderId, userId) {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                items: {
                    with: {
                        variant: {
                            with: {
                                product: {
                                    with: {
                                        brand: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (order && order.userId !== userId) {
            throw new Error('Forbidden: You are not allowed to view this order.');
        }

        return order;
    }
}

module.exports = OrderService;
