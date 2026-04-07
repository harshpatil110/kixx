const { eq } = require('drizzle-orm');
const { db } = require('../db/index');
const { users } = require('../db/schema');

class AuthService {
    /**
     * Syncs a Firebase user with the Neon DB (upsert).
     * 
     * If the user already exists by email → return them.
     * If not → insert with safe defaults for every column.
     * 
     * @param {Object} firebaseUser - Decoded payload from Firebase ID Token
     * @returns {Object} User record from the database
     */
    static async syncUserWithDb(firebaseUser) {
        const { email, name, uid } = firebaseUser;

        console.log('[AuthService] syncUserWithDb called for:', { email, name, uid });

        if (!email) {
            throw new Error('Firebase token is missing the "email" claim. Cannot sync.');
        }

        // 1. Check if user already exists
        let existingUsers;
        try {
            existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
        } catch (dbErr) {
            console.error('[AuthService] ❌ DB SELECT failed during user lookup:', dbErr.message);
            console.error('[AuthService] Full error:', dbErr);
            throw new Error(`Database lookup failed for ${email}: ${dbErr.message}`);
        }

        if (existingUsers && existingUsers.length > 0) {
            console.log('[AuthService] ✅ Existing user found:', existingUsers[0].id);
            return existingUsers[0];
        }

        // 2. Create new user — safe defaults for every column
        console.log('[AuthService] Creating new user for:', email);
        try {
            const newUserResult = await db.insert(users).values({
                email: email,
                name: name || email.split('@')[0] || 'New User',
                passwordHash: 'EXTERNAL_FIREBASE_AUTH',
                role: 'customer',
                firstPurchaseDiscountUsed: false,
                browsingHistory: [],
                purchaseHistory: [],
                arInteractions: [],
                outfitInsights: { preferredColors: [], styles: [], occasions: [] },
            }).returning();

            if (!newUserResult || newUserResult.length === 0) {
                throw new Error('INSERT returned no rows — possible schema mismatch.');
            }

            console.log('[AuthService] ✅ New user created:', newUserResult[0].id);
            return newUserResult[0];
        } catch (insertErr) {
            console.error('[AuthService] ❌ DB INSERT failed during user creation:', insertErr.message);
            console.error('[AuthService] Full insert error:', insertErr);

            // Check for unique constraint violation (user was created between SELECT & INSERT)
            if (insertErr.message && insertErr.message.includes('unique')) {
                console.warn('[AuthService] Race condition: user was created by a parallel request. Fetching again...');
                const raceResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
                if (raceResult.length > 0) return raceResult[0];
            }

            throw new Error(`User creation failed for ${email}: ${insertErr.message}`);
        }
    }
}

module.exports = AuthService;
