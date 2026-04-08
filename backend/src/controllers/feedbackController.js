const { db } = require('../db/index');
const { userFeedback } = require('../db/schema');

const VALID_CATEGORIES = [
    'UI/UX Bug',
    'Payment/Checkout Issue',
    'Account/Login Issue',
    'General Suggestion',
    'Other',
];

// ---------------------------------------------------------------------------
// POST /api/feedback/submit
// Accepts feedback from both authenticated users and guests.
// ---------------------------------------------------------------------------
const submitFeedback = async (req, res) => {
    try {
        // userId is optional — guests won't have a Firebase token
        const userId = req.user?.uid || null;
        const { category, message } = req.body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!category || typeof category !== 'string' || category.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Category is required.' });
        }
        if (!VALID_CATEGORIES.includes(category.trim())) {
            return res.status(400).json({
                success: false,
                message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
            });
        }
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }
        if (message.trim().length > 2000) {
            return res.status(400).json({ success: false, message: 'Message must be under 2000 characters.' });
        }

        // ── Insert ───────────────────────────────────────────────────────────
        const [inserted] = await db
            .insert(userFeedback)
            .values({
                userId,
                category: category.trim(),
                message: message.trim(),
                status: 'Open',
            })
            .returning({ id: userFeedback.id });

        console.log(`[Feedback] ✅ Submitted (id: ${inserted.id}) — category: "${category}" user: ${userId ?? 'guest'}`);

        return res.status(201).json({
            success: true,
            message: 'Thanks for your feedback! We will review it shortly.',
            feedbackId: inserted.id,
        });

    } catch (error) {
        console.error('[Feedback] ❌ Submit error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit feedback. Please try again.',
        });
    }
};

module.exports = { submitFeedback };
