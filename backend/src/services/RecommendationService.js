const { eq, desc, sql, ne } = require('drizzle-orm');
const { db } = require('../db/index');
const { products, users, recommendationsLogs } = require('../db/schema');

/**
 * RecommendationService
 * Implements a hybrid recommendation engine:
 *   1. Content-Based Filtering — match product tags/colors/style to user preferences
 *   2. Behavioral Signals     — boost products user has viewed/AR-tried
 *   3. Cold Start Fallback    — return trending/new products for users with no history
 */
class RecommendationService {

    /**
     * Compute a Style Match Score (0–100) for a given user-product pair.
     * Formula weights:
     *   ColorMatch      0.25
     *   StyleSimilarity 0.30
     *   OccasionFit     0.15
     *   ARInteraction   0.15
     *   UserBehavior    0.15
     */
    static computeStyleMatchScore(user, product) {
        const insights = user.outfitInsights || { preferredColors: [], styles: [], occasions: [] };
        const arInteractions = user.arInteractions || [];
        const browsingHistory = user.browsingHistory || [];
        const purchaseHistory = user.purchaseHistory || [];

        const productColors = (product.colorPalette || []).map(c => c.toLowerCase());
        const productTags = (product.tags || []).map(t => t.toLowerCase());
        const productStyle = (product.styleType || '').toLowerCase();

        // 1. Color Match (0–100)
        const preferredColors = (insights.preferredColors || []).map(c => c.toLowerCase());
        let colorMatch = 0;
        if (preferredColors.length > 0 && productColors.length > 0) {
            const matches = productColors.filter(c => preferredColors.includes(c)).length;
            colorMatch = Math.min(100, (matches / Math.max(preferredColors.length, productColors.length)) * 100);
        } else {
            colorMatch = 40; // neutral baseline when no preference data
        }

        // 2. Style Similarity (0–100)
        const preferredStyles = (insights.styles || []).map(s => s.toLowerCase());
        let styleSimilarity = 0;
        if (preferredStyles.length > 0) {
            const tagMatches = productTags.filter(t => preferredStyles.includes(t)).length;
            const styleMatch = preferredStyles.includes(productStyle) ? 30 : 0;
            styleSimilarity = Math.min(100, styleMatch + (tagMatches / Math.max(preferredStyles.length, productTags.length)) * 70);
        } else {
            styleSimilarity = product.isNew ? 60 : 40; // boost new arrivals on cold start
        }

        // 3. Occasion Fit (0–100)
        const occasions = (insights.occasions || []).map(o => o.toLowerCase());
        let occasionFit = 0;
        if (occasions.length > 0) {
            const matches = productTags.filter(t => occasions.includes(t)).length;
            occasionFit = Math.min(100, (matches / Math.max(occasions.length, 1)) * 100);
        } else {
            occasionFit = 50; // neutral
        }

        // 4. AR Interaction Boost (0–100) — has the user tried this product in AR?
        const arTried = arInteractions.find(i => i.productId === product.id);
        let arScore = 0;
        if (arTried) {
            // Longer AR sessions = higher interest
            arScore = Math.min(100, 40 + (arTried.duration || 0) / 30 * 60);
        }

        // 5. User Behavior Boost (0–100) — browsing or purchasing is a strong signal
        let behaviorScore = 0;
        if (purchaseHistory.includes(product.id)) behaviorScore = 90;
        else if (browsingHistory.includes(product.id)) behaviorScore = 55;
        else if (product.isOnSale) behaviorScore = 35;

        // Weighted final score
        const finalScore = (
            (colorMatch * 0.25) +
            (styleSimilarity * 0.30) +
            (occasionFit * 0.15) +
            (arScore * 0.15) +
            (behaviorScore * 0.15)
        );

        return Math.round(finalScore);
    }

    /**
     * Get personalized recommendations for a user.
     * Returns products sorted by Style Match Score descending.
     * Falls back to trending (isNew = true) for cold-start users.
     */
    static async getRecommendations(userId) {
        // 1. Fetch user with preference data
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) throw new Error('User not found');

        // 2. Fetch all products with brand info
        const allProducts = await db.query.products.findMany({
            with: { brand: true },
        });

        const history = user.browsingHistory || [];
        const purchases = user.purchaseHistory || [];

        // 3. Compute scores for each product
        const scored = allProducts.map(product => ({
            ...product,
            styleMatchScore: RecommendationService.computeStyleMatchScore(user, product),
        }));

        // 4. Sort descending by score
        scored.sort((a, b) => b.styleMatchScore - a.styleMatchScore);

        // 5. If total history is sparse (cold start), fall back to new/sale products at top
        const isColdStart = history.length === 0 && purchases.length === 0;
        if (isColdStart) {
            const boosted = scored.sort((a, b) => {
                if (a.isNew && !b.isNew) return -1;
                if (!a.isNew && b.isNew) return 1;
                return b.styleMatchScore - a.styleMatchScore;
            });
            return boosted.slice(0, 12);
        }

        return scored.slice(0, 12);
    }

    /**
     * Log a user interaction (view, ar_try_on, cart_add, purchase).
     * Also updates the user's browsingHistory / arInteractions jsonb cache.
     */
    static async logInteraction(userId, productId, actionType = 'view', arDuration = null) {
        // 1. Always insert an interaction log row
        await db.insert(recommendationsLogs).values({
            userId,
            productId,
            actionType,
            score: '0', // score computed separately
        });

        // 2. Update the user's cached preference fields
        const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
        if (!user) return;

        let browsingHistory = user.browsingHistory || [];
        let arInteractions = user.arInteractions || [];
        let purchaseHistory = user.purchaseHistory || [];

        if (actionType === 'view') {
            // Add unique, keep last 50
            if (!browsingHistory.includes(productId)) browsingHistory.unshift(productId);
            browsingHistory = browsingHistory.slice(0, 50);
        } else if (actionType === 'ar_try_on') {
            arInteractions = arInteractions.filter(i => i.productId !== productId);
            arInteractions.unshift({ productId, duration: arDuration || 0, timestamp: new Date().toISOString() });
            arInteractions = arInteractions.slice(0, 50);
        } else if (actionType === 'purchase') {
            if (!purchaseHistory.includes(productId)) purchaseHistory.unshift(productId);
            purchaseHistory = purchaseHistory.slice(0, 100);
        }

        await db.update(users)
            .set({ browsingHistory, arInteractions, purchaseHistory, updatedAt: new Date() })
            .where(eq(users.id, userId));
    }
}

module.exports = RecommendationService;
