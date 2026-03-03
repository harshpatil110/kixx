/**
 * Wraps Express async routes in a Promise.
 * Automatically catches returned unhandled rejections inside controllers and shuttles them to next(err).
 * Relieves controllers from repetitive try-catch blocks.
 *
 * @param {Function} executionBlock - Async controller function.
 */
const asyncHandler = (executionBlock) => (req, res, next) => {
    Promise.resolve(executionBlock(req, res, next)).catch(next);
};

module.exports = asyncHandler;
