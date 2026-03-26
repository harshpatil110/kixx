require('dotenv').config();
const { db, dbReadyPromise } = require('../db/index');
const { products } = require('../db/schema');
const { eq } = require('drizzle-orm');

// Mapping of product category → tags, colorPalette, styleType
const STYLE_MAP = {
    'Running':    { tags: ['athletic', 'performance', 'sport', 'everyday'], styleType: 'athletic', colors: ['white', 'black', 'grey', 'neon'] },
    'Lifestyle':  { tags: ['casual', 'streetwear', 'everyday', 'trendy'],  styleType: 'casual',   colors: ['white', 'beige', 'grey', 'black'] },
    'Classic':    { tags: ['casual', 'retro', 'timeless', 'heritage'],     styleType: 'retro',    colors: ['white', 'red', 'navy', 'black'] },
    'Basketball': { tags: ['basketball', 'sport', 'streetwear', 'bold'],   styleType: 'sporty',   colors: ['black', 'red', 'white', 'gold'] },
    'Exclusive':  { tags: ['luxury', 'hype', 'exclusive', 'streetwear'],   styleType: 'luxury',   colors: ['beige', 'black', 'white'] },
    'Performance':{ tags: ['performance', 'athletic', 'sport', 'support'], styleType: 'athletic', colors: ['black', 'blue', 'white'] },
};

const DEFAULT = { tags: ['casual', 'everyday'], styleType: 'casual', colors: ['black', 'white'] };

async function seedRecommendationMetadata() {
    console.log('⏳ Waiting for DB...');
    await dbReadyPromise;
    const allProducts = await db.select().from(products);
    console.log(`🏷  Updating ${allProducts.length} products with recommendation metadata...`);

    for (const product of allProducts) {
        const map = STYLE_MAP[product.category] || DEFAULT;
        await db.update(products)
            .set({
                tags: map.tags,
                colorPalette: map.colors,
                styleType: map.styleType,
            })
            .where(eq(products.id, product.id));
    }

    console.log('✅ Recommendation metadata seeded for all products!');
    process.exit(0);
}

seedRecommendationMetadata().catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
});
