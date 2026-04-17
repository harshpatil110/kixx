const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../db/index');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    getDashboardStats,
    getSalesByBrand,
    getLowStockAlerts,
    getInventory,
    updateInventory,
    getOrders,
    getCustomers,
    getCustomerOrders,
    updateAccountSettings,
    updateStoreSettings,
    getFeedbackStats,
    getAllFeedback,
    resolveFeedback,
    getReviewsStats,
    getReviewsSummary,
    getProductReviews,
    addProduct,
    getRetentionStats,
    getLaunchStats,
    getLaunchMetrics,
    getAudienceStats,
    getMarketingStats,
} = require('../controllers/adminController');

// ---------------------------------------------------------------------------
// Admin-only middleware — verifies Firebase token, then checks DB role
// ---------------------------------------------------------------------------
const isAdmin = async (req, res, next) => {
    try {
        const email = req.user?.email;
        if (!email) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No email in token.' });
        }

        const [dbUser] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!dbUser || dbUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        next();
    } catch (error) {
        console.error('[Admin Middleware] ❌ Role check failed:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error during authorization.' });
    }
};

// All admin routes require a valid Firebase token + admin role
router.use(verifyToken);
router.use(isAdmin);

// Analytics endpoints
router.get('/stats', getDashboardStats);
router.get('/sales-by-brand', getSalesByBrand);
router.get('/inventory-alerts', getLowStockAlerts);
router.get('/feedback-stats', getFeedbackStats);
router.get('/retention-stats', getRetentionStats);
router.get('/launch-stats', getLaunchStats);
router.get('/launch-metrics', getLaunchMetrics);
router.get('/audience-stats', getAudienceStats);
router.get('/marketing-stats', getMarketingStats);

// Feedback management
router.get('/feedback', getAllFeedback);
router.patch('/feedback/:id/resolve', resolveFeedback);

// Inventory management endpoints
router.get('/inventory', getInventory);
router.put('/inventory/:id', updateInventory);
router.post('/products/add', upload.single('image'), addProduct);

// Sales ledger
router.get('/orders', getOrders);

// Customer directory
router.get('/customers', getCustomers);
router.get('/customers/:email/orders', getCustomerOrders);

// Settings
router.put('/settings/account', updateAccountSettings);
router.put('/settings/store', updateStoreSettings);

// Reviews analytics
router.get('/reviews/summary', getReviewsSummary);
router.get('/reviews/product/:productId', getProductReviews);
router.get('/reviews-stats', getReviewsStats);

module.exports = router;
