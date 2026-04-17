const { db, dbReadyPromise } = require('../db/index');
const { promoCodes } = require('../db/schema');

const DUMMY_PROMOS = [
    { code: 'MOJO10', discountPercentage: 10, usageCount: 0, isActive: true },
    { code: 'STEP5', discountPercentage: 5, usageCount: 0, isActive: true },
    { code: 'KICK12', discountPercentage: 12, usageCount: 0, isActive: true },
    { code: 'SOLE8', discountPercentage: 8, usageCount: 0, isActive: true },
    { code: 'DRIP15', discountPercentage: 15, usageCount: 0, isActive: true },
    { code: 'FLEX7', discountPercentage: 7, usageCount: 0, isActive: true },
    { code: 'SWAG9', discountPercentage: 9, usageCount: 0, isActive: true },
    { code: 'TREND11', discountPercentage: 11, usageCount: 0, isActive: true },
    { code: 'RUN6', discountPercentage: 6, usageCount: 0, isActive: true },
    { code: 'STYLE13', discountPercentage: 13, usageCount: 0, isActive: true },
    { code: 'URBAN14', discountPercentage: 14, usageCount: 0, isActive: true },
    { code: 'WALK10', discountPercentage: 10, usageCount: 0, isActive: true },
    { code: 'VIBE8', discountPercentage: 8, usageCount: 0, isActive: true },
    { code: 'HYPE12', discountPercentage: 12, usageCount: 0, isActive: true },
    { code: 'LACE5', discountPercentage: 5, usageCount: 0, isActive: true },
];

async function seedPromos() {
    try {
        await dbReadyPromise;
        console.log('Seeding promo codes...');
        await db.insert(promoCodes).values(DUMMY_PROMOS).onConflictDoNothing();
        console.log('✅ Successfully seeded 15 affiliate promo codes!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to seed promos:', err);
        process.exit(1);
    }
}

seedPromos();
