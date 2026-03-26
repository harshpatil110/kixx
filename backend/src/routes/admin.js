const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../db/index');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const {
    getDashboardStats,
    getSalesByBrand,
    getLowStockAlerts,
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

module.exports = router;
