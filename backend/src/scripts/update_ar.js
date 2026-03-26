require('dotenv').config();
const { db, dbReadyPromise } = require('../db/index');
const { products } = require('../db/schema');
const { eq } = require('drizzle-orm');

async function updateAR() {
    try {
        console.log('Connecting to database and updating products with AR sample data...');
        await dbReadyPromise;
        // Let's get all products (optional) or just update them all
        const allProducts = await db.select().from(products);
        
        if (allProducts.length === 0) {
            console.log('No products found to update.');
            process.exit(0);
        }

        // We will update the first few products, or just all of them. Let's do all.
        for (const product of allProducts) {
            await db.update(products)
                .set({ 
                    arModelUrl: 'https://modelviewer.dev/shared-assets/models/Shoe.glb',
                    arPlacement: 'world',
                    arScale: '1 1 1'
                })
                .where(eq(products.id, product.id));
        }

        console.log(`Successfully updated ${allProducts.length} products with AR try-on functionality!`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to update products:', err);
        process.exit(1);
    }
}

updateAR();
