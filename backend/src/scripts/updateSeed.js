const { db, dbReadyPromise } = require('../db/index');
const { promoCodes } = require('../db/schema');
const { eq } = require('drizzle-orm');

async function run() {
    await dbReadyPromise;
    const updates = [
        { code: 'DRIP15', usageCount: 240 },
        { code: 'MOJO10', usageCount: 185 },
        { code: 'STEP5', usageCount: 110 },
        { code: 'KICK12', usageCount: 85 },
        { code: 'SOLE8', usageCount: 65 },
        { code: 'FLEX7', usageCount: 42 },
        { code: 'STYLE13', usageCount: 28 },
        { code: 'VIBE8', usageCount: 15 },
        { code: 'HYPE12', usageCount: 12 },
    ];
    for (const u of updates) {
        await db.update(promoCodes).set({ usageCount: u.usageCount }).where(eq(promoCodes.code, u.code));
    }
    console.log("Updated!");
    process.exit(0);
}
run();
