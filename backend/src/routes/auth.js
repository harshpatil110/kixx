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
        // req.user contains the decoded Firebase token attached by verifyToken middleware
        const dbUser = await AuthService.syncUserWithDb(req.user);

        return res.status(200).json({
            error: false,
            message: 'User synchronized successfully',
            user: dbUser
        });
    } catch (error) {
        console.error('Error synchronizing user:', error);
        return res.status(500).json({
            error: true,
            message: 'Internal server error during user synchronization'
        });
    }
});

module.exports = router;
