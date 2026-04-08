const { db } = require('../db/index');
const { userCollection, users } = require('../db/schema');
const { eq } = require('drizzle-orm');

// ---------------------------------------------------------------------------
// POST /api/user/collection/save
// Saves a shoe to the authenticated user's personal sneaker archive.
// ---------------------------------------------------------------------------
const saveToCollection = async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        const email = req.user?.email;

        if (!firebaseUid || !email) {
            return res.status(401).json({ success: false, message: 'Unauthorized: user identity could not be resolved.' });
        }

        const { shoeName, brand, releaseYear, sku, purchaseDate } = req.body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!shoeName || typeof shoeName !== 'string' || shoeName.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Shoe name is required.' });
        }
        if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Brand is required.' });
        }
        if (releaseYear !== undefined && releaseYear !== null && releaseYear !== '') {
            const year = parseInt(releaseYear, 10);
            if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
                return res.status(400).json({ success: false, message: 'Release year must be a valid 4-digit year.' });
            }
        }

        // ── Resolve DB userId (use Firebase UID as the key) ─────────────────
        // We store the Firebase UID in userId so there's no dependency on the
        // internal UUID — the user might not exist in users table if onboarding
        // is incomplete, but we still want to save collection entries.
        const userId = firebaseUid;

        // ── Insert ───────────────────────────────────────────────────────────
        const payload = {
            userId,
            shoeName: shoeName.trim(),
            brand: brand.trim(),
            releaseYear: releaseYear ? parseInt(releaseYear, 10) : null,
            sku: sku?.trim() || null,
            purchaseDate: purchaseDate || null,
        };

        const [inserted] = await db
            .insert(userCollection)
            .values(payload)
            .returning({ id: userCollection.id });

        console.log(`[UserCollection] ✅ Saved shoe for user ${userId}: "${payload.shoeName}" (id: ${inserted.id})`);

        return res.status(201).json({
            success: true,
            message: `"${payload.shoeName}" added to your archive.`,
            collectionId: inserted.id,
        });

    } catch (error) {
        console.error('[UserCollection] ❌ Save error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to save to collection. Please try again.',
        });
    }
};

// ---------------------------------------------------------------------------
// GET /api/user/collection
// Returns all shoes in the authenticated user's archive.
// ---------------------------------------------------------------------------
const getCollection = async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ success: false, message: 'Unauthorized.' });
        }

        const items = await db
            .select()
            .from(userCollection)
            .where(eq(userCollection.userId, firebaseUid))
            .orderBy(userCollection.addedAt);

        return res.status(200).json({ success: true, collection: items });

    } catch (error) {
        console.error('[UserCollection] ❌ Fetch error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch collection.' });
    }
};

module.exports = { saveToCollection, getCollection };
