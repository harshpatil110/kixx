const { db, dbReadyPromise, queryClient } = require('../db/index');
const { launchMetrics, goodieAllocations } = require('../db/schema');

async function seedLaunch() {
    console.log('[🌱 SEED] Starting Launch Command Center seeding...');
    try {
        await dbReadyPromise;
        console.log('[🌱 SEED] Clearing existing data to prevent duplicates...');
        await db.delete(launchMetrics);
        await db.delete(goodieAllocations);

        console.log('[🌱 SEED] Seeding launch metrics...');
        await db.insert(launchMetrics).values({
            foundingMembersCount: 412,
            listConversionRate: "14.8",
            promoCodeUses: 289
        });

        console.log('[🌱 SEED] Seeding goodie allocations...');
        await db.insert(goodieAllocations).values([
            { itemName: 'Cedar Shoe Trees', quantityAllocated: 150 },
            { itemName: 'KIXX Enamel Pins', quantityAllocated: 320 },
            { itemName: 'Heavyweight Canvas Totes', quantityAllocated: 85 },
            { itemName: 'NFC Authentication Tags', quantityAllocated: 412 }
        ]);

        console.log('[🌱 SEED] Successfully seeded Launch Command Center!');
        if (queryClient) {
            await queryClient.end();
        }
        process.exit(0);
    } catch (err) {
        console.error('[🚨 SEED ERROR]', err);
        process.exit(1);
    }
}

seedLaunch();
