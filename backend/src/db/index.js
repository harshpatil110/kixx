require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./schema');

// Initialize postgres connection
const client = postgres(process.env.DATABASE_URL, { prepare: false });

// Initialize drizzle
const db = drizzle(client, { schema });

module.exports = db;
