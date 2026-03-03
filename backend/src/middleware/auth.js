const admin = require('../config/firebase');

/**
 * Middleware to verify a Firebase ID Token using the Admin SDK
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: true, message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Validate the token and get the decoded payload
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Attach decoded token to request object for use in controllers
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Firebase Auth Error:', error.message);
        return res.status(401).json({
            error: true,
            message: 'Unauthorized: Invalid or expired token'
        });
    }
};

module.exports = { verifyToken };
