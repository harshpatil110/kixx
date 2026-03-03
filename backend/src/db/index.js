require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('./schema'); // will be created in Task 3

// Neon provides a serverless PostgreSQL connection driver
const sql = neon(process.env.DATABASE_URL);

// Initialize drizzle with the neon sql connection and schema
const db = drizzle(sql, { schema });

module.exports = db;
