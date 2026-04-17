const { db } = require('../db/index');
const { promoCodes } = require('../db/schema');
const { eq } = require('drizzle-orm');

const applyPromo = async (req, res) => {
    const { promoCode, cartTotal } = req.body;

    if (!promoCode || !cartTotal) {
        return res.status(400).json({ success: false, message: 'Missing promo code or cart total.' });
    }

    try {
        const promos = await db.select().from(promoCodes).where(eq(promoCodes.code, promoCode.toUpperCase()));

        if (promos.length === 0 || !promos[0].isActive) {
            return res.status(400).json({ success: false, message: 'Invalid or expired code' });
        }

        const promo = promos[0];
        const discountAmount = Math.round((cartTotal * promo.discountPercentage) / 100);
        const newTotal = cartTotal - discountAmount;

        console.log(`[🛒 CHECKOUT] Code Applied: ${promo.code} | Original: ₹${cartTotal} | Discount: ₹${discountAmount} | New Total: ₹${newTotal}`);

        return res.status(200).json({
            success: true,
            discountAmount,
            newTotal,
            discountPercentage: promo.discountPercentage
        });
    } catch (err) {
        console.error('Error applying promo:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    applyPromo
};
