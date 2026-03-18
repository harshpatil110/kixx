const express = require('express');
const router = express.Router();
const OrderService = require('../services/OrderService');
const { verifyToken } = require('../middleware/auth');
const { db } = require('../db/index');
const { users, pastOrders } = require('../db/schema');
const { eq } = require('drizzle-orm');

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
        const { email, shippingAddress, items, totalAmount } = req.body;

        // Basic validation
        if (!email || !shippingAddress || !items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
            return res.status(400).json({ error: true, message: 'Bad Request: email, shippingAddress, items, and totalAmount are required.' });
        }

        const [inserted] = await db.insert(pastOrders).values({
            email,
            shippingAddress,
            items,
            totalAmount: Math.round(totalAmount),
            paymentStatus: 'SUCCESS',
        }).returning();

        console.log(`[Orders] ✅ Past order saved: ${inserted.id}`);
        return res.status(201).json({ error: false, message: 'Order saved successfully', orderId: inserted.id });
    } catch (error) {
        console.error('[Orders] ❌ Error saving past order:', error.message);
        return res.status(500).json({ error: true, message: 'Failed to save order. Please try again.' });
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
