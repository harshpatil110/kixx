const express = require('express');
const router = express.Router();
const RecommendationService = require('../services/RecommendationService');

// UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/recommendations/:userId
 * Returns personalized product feed sorted by style match score.
 * Falls back to trending (isNew) products for cold-start users.
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!uuidRegex.test(userId)) {
            return res.status(400).json({ error: true, message: 'Invalid userId format.' });
        }
        const products = await RecommendationService.getRecommendations(userId);
        return res.status(200).json({ error: false, products });
    } catch (err) {
        console.error('Recommendation error:', err);
        return res.status(500).json({ error: true, message: err.message || 'Recommendation engine error.' });
    }
});

/**
 * GET /api/recommendations/style-match/:userId/:productId
 * Returns the Style Match Score (0-100) and a two-sentence explanation for a
 * specific user-product pair.
 */
router.get('/style-match/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        if (!uuidRegex.test(userId) || !uuidRegex.test(productId)) {
            return res.status(400).json({ error: true, message: 'Invalid UUID format.' });
        }

        const { db } = require('../db/index');
        const { users, products } = require('../db/schema');
        const { eq } = require('drizzle-orm');

        const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
        const product = await db.query.products.findFirst({ where: eq(products.id, productId) });

        if (!user || !product) {
            return res.status(404).json({ error: true, message: 'User or product not found.' });
        }

        const score = RecommendationService.computeStyleMatchScore(user, product);

        // Build a simple human-readable explanation
        const reasons = [];
        const insights = user.outfitInsights || {};
        const preferredColors = (insights.preferredColors || []);
        const productColors = product.colorPalette || [];
        const matchingColors = productColors.filter(c =>
            preferredColors.map(x => x.toLowerCase()).includes(c.toLowerCase())
        );
        if (matchingColors.length > 0) {
            reasons.push(`Color match on ${matchingColors.join(', ')}`);
        }
        const arTried = (user.arInteractions || []).find(i => i.productId === productId);
        if (arTried) reasons.push('You previously tried this in AR');
        if ((user.browsingHistory || []).includes(productId)) reasons.push('In your browsing history');
        if (product.isNew) reasons.push('New arrival');
        if (product.isOnSale) reasons.push('Currently on sale');

        return res.status(200).json({
            error: false,
            score,
            reasons: reasons.length > 0 ? reasons : ['Based on trending styles'],
        });
    } catch (err) {
        console.error('Style match error:', err);
        return res.status(500).json({ error: true, message: 'Style match computation failed.' });
    }
});

/**
 * POST /api/recommendations/interaction
 * Logs a user interaction: view, ar_try_on, cart_add, purchase.
 * Body: { userId, productId, actionType, arDuration? }
 */
router.post('/interaction', async (req, res) => {
    try {
        const { userId, productId, actionType = 'view', arDuration } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({ error: true, message: 'userId and productId are required.' });
        }
        if (!uuidRegex.test(userId) || !uuidRegex.test(productId)) {
            return res.status(400).json({ error: true, message: 'Invalid UUID format.' });
        }
        await RecommendationService.logInteraction(userId, productId, actionType, arDuration);
        return res.status(200).json({ error: false, message: 'Interaction logged.' });
    } catch (err) {
        console.error('Interaction log error:', err);
        return res.status(500).json({ error: true, message: 'Failed to log interaction.' });
    }
});

module.exports = router;
