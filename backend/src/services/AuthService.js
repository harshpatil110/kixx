const { eq } = require('drizzle-orm');
const { db } = require('../db/index');
const { users } = require('../db/schema');

class AuthService {
    /**
     * Syncs a Firebase user with the Neon DB
     * @param {Object} firebaseUser - Decoded payload from Firebase ID Token
     * @returns {Object} User record from the database
     */
    static async syncUserWithDb(firebaseUser) {
        const { email, name, uid } = firebaseUser; // 'name' might be missing depending on the sign-in provider

        // Check if user already exists
        const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUsers.length > 0) {
            return existingUsers[0];
        }

        // Create new user using Firebase credentials
        const newUserResult = await db.insert(users).values({
            email: email,
            name: name || 'New User',
            passwordHash: 'EXTERNAL_FIREBASE_AUTH', // Dummy string to satisfy notNull constraint since Firebase handles passwords
            role: 'user',
        }).returning();

        return newUserResult[0];
    }
}

module.exports = AuthService;
