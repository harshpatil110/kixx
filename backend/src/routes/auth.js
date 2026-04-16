const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/auth/sync
 * Syncs an authenticated Firebase user to the local Neon database. 
 * Expected payload: JWT Bearer Token in the Authorization Header.
 */
router.post('/sync', verifyToken, async (req, res) => {
    try {
        console.log('[Auth Sync] Incoming sync request for:', req.user?.email);

        if (!req.user || !req.user.email) {
            console.error('[Auth Sync] ❌ req.user or req.user.email is missing after verifyToken.');
            return res.status(400).json({
                error: true,
                message: 'Bad Request: Firebase token did not contain a valid email.'
            });
        }

        const { wantsNewsletter } = req.body;
        const dbUser = await AuthService.syncUserWithDb(req.user, { wantsNewsletter });

        console.log('[Auth Sync] ✅ User synced successfully:', dbUser.id, dbUser.email);

        return res.status(200).json({
            error: false,
            message: 'User synchronized successfully',
            user: dbUser
        });
    } catch (error) {
        console.error('[Auth Sync] ❌ Sync Error:', error.message);
        console.error('[Auth Sync] Full error object:', error);

        return res.status(500).json({
            error: true,
            message: `User synchronization failed: ${error.message}`
        });
    }
});

module.exports = router;
