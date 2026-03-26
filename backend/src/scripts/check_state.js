require('dotenv').config();
const { db, dbReadyPromise } = require('../db/index');
const { products, users } = require('../db/schema');

async function debugState() {
    await dbReadyPromise;
    const prodCount = await db.select().from(products);
    const userCount = await db.select().from(users);
    
    console.log('--- DATABASE STATE ---');
    console.log('Total Products:', prodCount.length);
    console.log('Total Users:', userCount.length);
    
    if (prodCount.length > 0) {
        console.log('Sample Product Media:', {
            name: prodCount[0].name,
            arModelUrl: prodCount[0].arModelUrl,
            tags: prodCount[0].tags,
            styleType: prodCount[0].styleType
        });
    }
    process.exit(0);
}

debugState();
