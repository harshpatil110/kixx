const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../db/index');
const { users, pastOrders, products, inventoryLogs } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');

// Ensure all routes require Firebase Authentication
router.use(verifyToken);

/**
 * POST /api/orders/save
 * Phase 3: Full Inventory Transaction Engine.
 * 
 * Uses a Drizzle `db.transaction()` to atomically:
 *   1. Validate user exists
 *   2. Loop items → check stock → deduct stock → log inventory
 *   3. Apply promo code
 *   4. Insert into past_orders
 *   5. Commit or rollback
 * 
 * Payload: { email, shippingAddress, items: [{ id, quantity, size, price }], promoCode? }
 */
router.post('/save', async (req, res) => {
    try {
        const { email, shippingAddress, items, promoCode } = req.body;

        // ── Stage 0: Payload Validation ──────────────────────────────────
        if (!email || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
            console.error("🔥 ORDER SAVE FAILED: Missing or malformed required payload fields.");
            console.error("➡️ Received body:", JSON.stringify(req.body, null, 2));
            return res.status(400).json({
                success: false,
                message: 'Bad Request: email, shippingAddress, and items[] are required.'
            });
        }

        console.log(`[Orders] 📦 Processing order for ${email} — ${items.length} item(s), promo: ${promoCode || 'none'}`);

        // ── Stage 1: Drizzle Transaction ─────────────────────────────────
        const result = await db.transaction(async (tx) => {

            // 1a. Validate user exists in DB
            const [user] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
            if (!user) {
                throw new Error(`User not found for email: ${email}. Has auth/sync completed?`);
            }
            console.log(`[Orders] ✅ User resolved: ${user.id} (${user.email})`);

            let calculatedTotal = 0;

            // 1b. Loop items — validate stock + deduct
            for (const item of items) {
                const itemId = item.id || item.productId;
                if (!itemId) {
                    throw new Error(`Invalid item payload: Missing product ID. Received: ${JSON.stringify(item)}`);
                }

                // SELECT stock FROM products WHERE id = item.id
                const [product] = await tx.select().from(products).where(eq(products.id, itemId));

                if (!product) {
                    throw new Error(`Product not found in database: ${itemId}`);
                }

                const currentStock = parseInt(product.stock, 10);
                const requestedQty = parseInt(item.quantity, 10);

                console.log(`[Orders] 📊 Stock check: "${product.name}" — DB stock: ${currentStock}, requested: ${requestedQty}`);

                // VALIDATION: insufficient stock → rollback
                if (isNaN(currentStock) || isNaN(requestedQty) || currentStock < requestedQty) {
                    throw new Error(`Insufficient stock for "${product.name}". Available: ${currentStock}, requested: ${requestedQty}.`);
                }

                // DEDUCTION: UPDATE SET stock = stock - qty
                await tx.update(products)
                    .set({ stock: sql`${products.stock} - ${requestedQty}` })
                    .where(eq(products.id, itemId));

                // INVENTORY LOG
                await tx.insert(inventoryLogs).values({
                    productId: itemId,
                    changeType: 'SALE',
                    quantityChanged: -requestedQty
                });

                calculatedTotal += parseFloat(product.basePrice) * requestedQty;
            }

            // 1c. Apply FIRSTDROP promo if applicable
            if (promoCode === 'FIRSTDROP') {
                if (user.firstPurchaseDiscountUsed) {
                    throw new Error('Promo code FIRSTDROP has already been used on this account.');
                }

                calculatedTotal = calculatedTotal * 0.90; // 10% off
                console.log(`[Orders] 🏷️ FIRSTDROP applied. New total: ${calculatedTotal}`);

                await tx.update(users)
                    .set({ firstPurchaseDiscountUsed: true })
                    .where(eq(users.id, user.id));
            }

            // 1d. INSERT into past_orders + COMMIT
            const [inserted] = await tx.insert(pastOrders).values({
                email,
                shippingAddress,
                items,
                totalAmount: Math.round(calculatedTotal),
                paymentStatus: 'SUCCESS',
            }).returning();

            return inserted;
        });

        console.log(`[Orders] ✅ Order committed: ${result.id} for ${email}`);
        return res.status(200).json({ success: true, order: result });

    } catch (error) {
        console.error('[Orders] ❌ Transaction Error:', error.message);
        console.error("➡️ Payload that caused failure:", JSON.stringify(req.body, null, 2));

        return res.status(400).json({
            success: false,
            message: error.message || "Order transaction failed."
        });
    }
});

/**
 * GET /api/orders/history
 * Fetches all past orders for the authenticated user (by email from JWT).
 */
router.get('/history', async (req, res) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ error: true, message: 'Unauthorized' });
        }

        const userOrders = await db.select()
            .from(pastOrders)
            .where(eq(pastOrders.email, userEmail))
            .orderBy(sql`${pastOrders.createdAt} DESC`);

        return res.status(200).json(userOrders);
    } catch (error) {
        console.error('[Orders] History Error:', error.message);
        return res.status(500).json({ error: true, message: 'Failed to fetch order history.' });
    }
});

/**
 * GET /api/orders/:id
 * Retrieves a single order by its ID from past_orders.
 */
router.get('/:id', async (req, res) => {
    try {
        const [order] = await db.select().from(pastOrders).where(eq(pastOrders.id, req.params.id)).limit(1);

        if (!order) {
            return res.status(404).json({ error: true, message: 'Order not found.' });
        }

        // Verify the requester owns this order
        if (order.email !== req.user.email) {
            return res.status(403).json({ error: true, message: 'Forbidden: You do not own this order.' });
        }

        return res.status(200).json({ error: false, order });
    } catch (error) {
        console.error('[Orders] GET /:id Error:', error.message);
        return res.status(500).json({ error: true, message: 'Failed to retrieve order.' });
    }
});

module.exports = router;
