const { db } = require('../db/index');
const { productReviews } = require('../db/schema');
const { eq, and } = require('drizzle-orm');

// ── Valid rating range ────────────────────────────────────────────────────────
const isValidRating = (r) => Number.isInteger(r) && r >= 1 && r <= 5;

/**
 * POST /api/products/review
 * Submits a verified-purchase review for a product.
 * Prevents duplicate reviews: one user can only review one product per order.
 */
const submitReview = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        const { productId, orderId, rating, comment } = req.body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!productId || typeof productId !== 'string' || productId.trim() === '') {
            return res.status(400).json({ success: false, message: 'productId is required.' });
        }
        if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
            return res.status(400).json({ success: false, message: 'orderId is required.' });
        }
        const ratingInt = parseInt(rating, 10);
        if (!isValidRating(ratingInt)) {
            return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
        }
        if (comment && comment.length > 1000) {
            return res.status(400).json({ success: false, message: 'Review comment must be under 1000 characters.' });
        }

        // ── Duplicate check — one review per (userId + productId + orderId) ─
        const [existing] = await db
            .select({ id: productReviews.id })
            .from(productReviews)
            .where(
                and(
                    eq(productReviews.userId, userId),
                    eq(productReviews.productId, productId.trim()),
                    eq(productReviews.orderId, orderId.trim())
                )
            )
            .limit(1);

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'You have already reviewed this product for this order.',
            });
        }

        // ── Insert ────────────────────────────────────────────────────────────
        const [inserted] = await db
            .insert(productReviews)
            .values({
                userId,
                productId: productId.trim(),
                orderId: orderId.trim(),
                rating: ratingInt,
                comment: comment?.trim() || null,
            })
            .returning({ id: productReviews.id });

        console.log(`[Reviews] ✅ Review #${inserted.id} saved — product: ${productId} user: ${userId} rating: ${ratingInt}★`);

        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully. Thank you!',
            reviewId: inserted.id,
        });

    } catch (error) {
        console.error('[Reviews] ❌ Submit error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to submit review. Please try again.' });
    }
};

module.exports = { submitReview };
