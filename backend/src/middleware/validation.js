// Regular expression to validate a standard UUID v4 format
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * Validates whether the incoming req.params.id is a properly formatted UUIDv4.
 * Protects Drizzle ORM from throwing silent errors when querying with malformed IDs.
 */
const validateUUID = (req, res, next) => {
    const { id } = req.params;

    // Some routes might not use 'id' as the param name, adjust if needed
    if (id && !UUID_REGEX.test(id)) {
        return res.status(400).json({
            error: true,
            message: "Invalid ID format"
        });
    }

    next();
};

/**
 * Validates the structure of the incoming checkout payload.
 * Ensures that the items array exists, is not empty, and every item has a valid numeric shape.
 */
const validateOrderPayload = (req, res, next) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            error: true,
            message: "Order items payload must contain a non-empty array of variants."
        });
    }

    // Validate that each variant payload object contains valid keys
    for (const item of items) {
        if (!item.variantId || !UUID_REGEX.test(item.variantId)) {
            return res.status(400).json({
                error: true,
                message: `Invalid or missing variantId UUID format in payload: ${item.variantId}`
            });
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            return res.status(400).json({
                error: true,
                message: `Invalid or missing valid integer quantity for variant: ${item.variantId}`
            });
        }
    }

    next();
};

module.exports = {
    validateUUID,
    validateOrderPayload
};
