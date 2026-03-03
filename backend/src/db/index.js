require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./schema');

// Initialize postgres connection
const queryClient = postgres(process.env.DATABASE_URL);

// Initialize drizzle
const db = drizzle(queryClient, { schema });

// Export db and queryClient for tasks like seed scripts
module.exports = { db, queryClient };
