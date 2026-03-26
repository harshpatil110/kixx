require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payment');
const adminRoutes = require('./src/routes/admin');
const recommendationRoutes = require('./src/routes/recommendations');
const outfitRoutes = require('./src/routes/outfit');

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
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/outfit', outfitRoutes);

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
 * Server Startup
 *
 * The HTTP server starts immediately so requests are accepted right away.
 * The DB retry / cold-start logic lives in src/db/index.js (dbReadyPromise).
 * Individual route handlers will receive a clear 503 error if the DB is
 * still waking up, which the frontend already handles gracefully.
 */
const { dbReadyPromise } = require('./src/db/index');

// Start accepting HTTP traffic immediately
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${ENV} environment.`);
});

// Log when the DB finishes its cold-start retry loop
dbReadyPromise
    .then(() => console.log('✅ Neon DB is fully ready. All routes are live.'))
    .catch((err) => console.error('❌ DB never became ready:', err?.message));
