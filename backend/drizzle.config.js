const { defineConfig } = require('drizzle-kit');
require('dotenv').config();

module.exports = defineConfig({
    out: './drizzle',
    schema: './src/db/schema.js',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});