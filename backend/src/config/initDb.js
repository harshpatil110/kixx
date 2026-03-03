require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

/**
 * Utility to test Postgres Database connection
 */
async function testDbConnection() {
    try {
        const sql = neon(process.env.DATABASE_URL);
        // Simple query to verify connection
        const result = await sql`SELECT 1 as connected`;

        if (result && result[0].connected === 1) {
            console.log('✅ PostgreSQL / Neon connection established successfully.');
        } else {
            throw new Error("Unexpected query result during connection test.");
        }
    } catch (error) {
        console.error('❌ Failed to connect to the database:', error);
        //process.exit(1);
    }
}

module.exports = { testDbConnection };
