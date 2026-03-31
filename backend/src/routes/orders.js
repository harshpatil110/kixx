const express = require('express');
const router = express.Router();
const OrderService = require('../services/OrderService');
const { verifyToken } = require('../middleware/auth');
const { db } = require('../db/index');
const { users, pastOrders, products, inventoryLogs } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');

// Internal helper for mapping Firebase email payload to the pure DB UUID
async function getDbUserId(email) {
    const userList = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return userList.length > 0 ? userList[0].id : null;
}

// Ensure all routes require Firebase Authentication
router.use(verifyToken);

/**
 * POST /api/orders/save
 * Saves a completed transaction snapshot (post-payment) into the past_orders table.
 * Payload: { email, shippingAddress, items, totalAmount }
 */
router.post('/save', async (req, res) => {
    try {
        const { email, shippingAddress, items, promoCode } = req.body;

        // Basic validation
        if (!email || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Bad Request: email, shippingAddress, and items are required.' });
        }

        console.log("RECEIVED ORDER ITEMS:", req.body.items);
        console.log("PROMO CODE APPLIED:", promoCode);

        const result = await db.transaction(async (tx) => {
            const [user] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
            if (!user) {
                throw new Error("User not found");
            }

            let calculatedTotal = 0;

            for (const item of items) {
                if (!item.id) { throw new Error("Invalid item payload: Missing product ID"); }
                
                const [product] = await tx.select().from(products).where(eq(products.id, item.id));

                // DIAGNOSTIC LOGGING — exposes exact types at runtime
                console.log("📊 STOCK CHECK:", {
                    product: product?.name,
                    dbStock: product?.stock,
                    dbStockType: typeof product?.stock,
                    cartQty: item.quantity,
                    cartQtyType: typeof item.quantity
                });

                // STRICT NUMERIC CASTING — eliminates string comparison bug
                const currentStock = parseInt(product?.stock, 10);
                const requestedQty = parseInt(item.quantity, 10);

                if (!product || isNaN(currentStock) || isNaN(requestedQty) || currentStock < requestedQty) {
                    throw new Error(`Insufficient stock for ${product ? product.name : 'Unknown Item'}. Only ${currentStock} left.`);
                }

                calculatedTotal += parseFloat(product.basePrice) * requestedQty;

                // ATOMIC DEDUCTION — uses parsed integer to prevent PostgreSQL type rejection
                await tx.update(products)
                    .set({ stock: sql`${products.stock} - ${requestedQty}` })
                    .where(eq(products.id, item.id));

                await tx.insert(inventoryLogs).values({
                    productId: item.id,
                    changeType: 'SALE',
                    quantityChanged: -requestedQty
                });
            }

            // Apply 'FIRSTDROP' Promo Code
            if (promoCode === 'FIRSTDROP') {
                if (user.firstPurchaseDiscountUsed) {
                    throw new Error('You have already used the first purchase discount.');
                }
                
                // 10% discount
                calculatedTotal = calculatedTotal * 0.90;

                // Flip the bit immediately to prevent multiple uses
                await tx.update(users)
                    .set({ firstPurchaseDiscountUsed: true })
                    .where(eq(users.id, user.id));
            }

            const [inserted] = await tx.insert(pastOrders).values({
                email,
                shippingAddress,
                items,
                totalAmount: Math.round(calculatedTotal),
                paymentStatus: 'SUCCESS',
            }).returning();

            return inserted;
        });

        console.log(`[Orders] ✅ Past order saved transactionally: ${result.id}`);
        return res.status(200).json({ success: true, order: result });
    } catch (error) {
        console.error('[Orders] ❌ Transaction Error:', error.message);
        return res.status(400).json({ success: false, message: error.message || "Transaction failed" });
    }
});

/**
 * POST /api/orders
 * Creates a new Cart Order checking atomic stock via Drizzle Transactions.
 */
router.post('/', async (req, res) => {
    try {
        const { items } = req.body;

        // Explicit array checking avoids server dumps on malformed posts
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: true, message: 'Bad Request: "items" must be a non-empty array' });
        }

        // Determine target Drizzle UUID
        const userId = await getDbUserId(req.user.email);
        if (!userId) {
            return res.status(404).json({ error: true, message: 'User DB mapping not found' });
        }

        const order = await OrderService.createOrder(userId, items);
        return res.status(201).json({ error: false, message: 'Order created successfully', order });
    } catch (error) {
        console.error('Order Creation Context Error:', error.message);

        // Distinguish expected errors defined internally vs unexpected Node.js stack errors
        if (error.message.includes('Variant not found') || error.message.includes('Insufficient stock')) {
            return res.status(400).json({ error: true, message: error.message });
        }
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
});

/**
 * POST /api/orders/:id/payment
 * Processes raw payment, changes status, and subtracts explicit raw SQL quantity increments.
 */
router.post('/:id/payment', async (req, res) => {
    try {
        const orderId = req.params.id;
        const paymentDetails = req.body;

        const userId = await getDbUserId(req.user.email);

        // Initial boundary check restricting unauthorized tampering 
        const isOwner = await OrderService.getOrderById(orderId, userId);
        if (!isOwner) {
            return res.status(404).json({ error: true, message: 'Target order not found or does not belong to user.' });
        }

        const paidOrder = await OrderService.processPayment(orderId, paymentDetails);
        return res.status(200).json({ error: false, message: 'Payment processed successfully', order: paidOrder });
    } catch (error) {
        console.error(`Error processing payment on order ${req.params.id}:`, error.message);
        return res.status(500).json({ error: true, message: 'Payment Processing Failed' });
    }
});

/**
 * GET /api/orders/user/:userId
 * Retrieves ordered items historically mapping from the user Firebase token mapping.
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const dbUserId = await getDbUserId(req.user.email);

        // Provide some authorization to make sure the token mapping logic handles scopes
        if (!dbUserId) {
            return res.status(403).json({ error: true, message: 'Forbidden' });
        }

        const ordersData = await OrderService.getUserOrders(dbUserId);
        return res.status(200).json({ error: false, orders: ordersData });
    } catch (error) {
        console.error('Historic Orders Retrieval Error:', error.message);
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
});

/**
 * GET /api/orders/:id
 * Retrieves unique isolated orders by target params matching DB User scopes.
 */
router.get('/:id', async (req, res) => {
    try {
        const dbUserId = await getDbUserId(req.user.email);
        const orderData = await OrderService.getOrderById(req.params.id, dbUserId);

        if (!orderData) {
            return res.status(404).json({ error: true, message: 'Isolated Order Not Found.' });
        }

        return res.status(200).json({ error: false, order: orderData });
    } catch (error) {
        console.error('Order ID Fetch Error:', error.message);

        if (error.message.includes('Forbidden')) {
            return res.status(403).json({ error: true, message: error.message });
        }

        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
});

module.exports = router;
