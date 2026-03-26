/**
 * setupAdmin.js
 * ─────────────
 * Promotes an existing user to `admin` role by email address.
 *
 * Usage:
 *   node src/scripts/setupAdmin.js <email>
 *
 * Example:
 *   node src/scripts/setupAdmin.js admin@kixx.com
 */

require('../db/dnsHack');
require('dotenv').config();
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const { eq } = require('drizzle-orm');
const { users } = require('../db/schema');

const email = process.argv[2];

if (!email) {
  console.error('❌  Usage: node src/scripts/setupAdmin.js <email>');
  process.exit(1);
}

async function main() {
  const client = postgres(process.env.DATABASE_URL, { max: 1, ssl: 'prefer' });
  const db = drizzle(client);

  try {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      console.error(`❌  No user found with email: ${email}`);
      console.log('   Make sure the user has registered first.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`✅  ${email} is already an admin.`);
      process.exit(0);
    }

    // Promote to admin
    await db.update(users).set({ role: 'admin' }).where(eq(users.email, email));

    console.log(`✅  Successfully promoted ${email} to admin.`);
    console.log(`   Previous role: ${user.role}`);
  } catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
