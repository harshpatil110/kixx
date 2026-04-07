const express = require('express');
const router = express.Router();

/**
 * /api/payment
 * 
 * Legacy Razorpay route — DEPRECATED.
 * 
 * All payment processing is now handled client-side via the Mock Gateway
 * in PaymentPage.jsx, which calls POST /api/orders/save directly.
 * 
 * This stub exists solely to prevent server.js from crashing on
 * `require('./src/routes/payment')`.
 */
router.use((req, res) => {
    return res.status(410).json({
        error: true,
        message: 'Payment gateway routes have been deprecated. Use POST /api/orders/save.'
    });
});

module.exports = router;
