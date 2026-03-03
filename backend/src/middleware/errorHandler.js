/**
 * Central Error Intercept Middleware.
 * Analyzes the `err` payload cascaded via `next()` from routes and formats a compliant JSON response.
 */
const errorHandler = (err, req, res, next) => {
    console.error('SERVER ERROR 🚨', err);

    let finalStatus = 500;
    let finalMessage = err.message || "Internal Server Error";

    // 1. Firebase Auth Errors (usually invalid tokens cascaded from middleware)
    if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
        finalStatus = 401;
        finalMessage = "Authentication Failed: Firebase Identity Verification Error.";
    }

    // 2. Drizzle PostgreSQL Format / Query Errors
    // Catches common db constraint throws e.g. Foreign Key Violations if manipulating deleted items.
    else if (err.code === '23503' || err.message?.toLowerCase().includes('foreign key constraint')) {
        finalStatus = 400;
        finalMessage = "Database Conflict: Attempted operation targets non-existent relational parent.";
    }

    // 3. Simple fallback mapping for bad SQL syntax caught natively
    else if (err.cause?.name === 'PostgresError' || err.name === 'NeonDbError') {
        finalStatus = 400;
        finalMessage = "Database Query Exception. Ensure relationships and UUID targets exist.";
    }

    // Serve the finalized payload mapping standard KIXX format
    return res.status(finalStatus).json({
        error: true,
        message: finalMessage
    });
};

module.exports = errorHandler;
