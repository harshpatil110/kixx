require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql } = require('drizzle-orm');

// Import database instance
const db = require('./src/db/index');

// Import routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');

const app = express();

// Middleware configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
};
app.use(cors(corsOptions));
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 Route Not Found Middleware
app.use((req, res, next) => {
    res.status(404).json({ error: true, message: "Route not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        error: true,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

/**
 * Server Startup & Database Verification
 */
const startServer = async () => {
    try {
        // Verify database connection using Drizzle
        await db.execute(sql`SELECT 1`);
        console.log('✅ Connected to Neon DB successfully. Database is reachable.');

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} in ${ENV} environment.`);
        });
    } catch (error) {
        console.error('❌ Database connection failed. Shutting down server.', error);
        process.exit(1); // Exit process with failure code
    }
};

// Execute startup
startServer();
