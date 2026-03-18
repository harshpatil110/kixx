const express = require('express');
const Razorpay = require('razorpay');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// Razorpay Instance
// Reads credentials from environment variables set in .env
// ---------------------------------------------------------------------------
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// All payment routes require Firebase authentication
router.use(verifyToken);

/**
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order that the frontend uses to launch the checkout modal.
 *
 * Body: { amount }  — amount in standard INR (e.g. 11209 for ₹11,209)
 * Razorpay expects the amount in *paise*, so we multiply by 100.
 *
 * Returns the full Razorpay order object (includes `id`, `amount`, `currency`, etc.)
 */
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;

        // Validate
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                error: true,
                message: 'Bad Request: "amount" must be a positive number (in INR).',
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert INR → paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        console.log(`[Payment] ✅ Razorpay order created: ${order.id} | ₹${amount}`);
        return res.status(201).json(order);
    } catch (error) {
        console.error('[Payment] ❌ Razorpay order creation failed:', error.message);
        return res.status(500).json({
            error: true,
            message: 'Failed to create Razorpay order. Please try again.',
        });
    }
});

module.exports = router;
