require('./dnsHack');
require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./schema');

// ---------------------------------------------------------------------------
// Neon DB Cold-Start Resilience
//
// Neon serverless computes "pause" after a period of inactivity and take
// ~1-3 seconds to resume ("cold start"). The first TCP connection attempt
// during a cold start will be refused or time out. We wrap the initial
// connection probe in an exponential-backoff retry loop so the backend
// stays up instead of crashing on startup.
//
// Strategy:
//  • Max 4 attempts (1 initial + 3 retries), 4-second base delay, doubles each try
//  • The postgres.js client itself is lazy — it won't attempt a real TCP
//    connection until the first query. We send a lightweight SELECT 1 probe
//    to force the connection open early, so cold-start pain happens once at
//    server boot rather than on the first real user request.
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 4000; // 4s → 8s → 16s

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a postgres-js client with Neon-optimised settings.
 * Called fresh on each retry attempt so we don't reuse a broken socket.
 */
function createClient() {
    return postgres(process.env.DATABASE_URL, {
        // Maximum connections in the pool
        max: 5,
        // Abort queries that hang for more than 10 seconds
        idle_timeout: 20,
        // Close idle connections after 20s to let Neon compute scale down
        connect_timeout: 10,
        // Disable SSL certificate hostname verification in dev if needed;
        // remove this line in production for full certificate validation.
        ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
    });
}

/**
 * Probe the active client with a trivial query.
 * Returns true on success, throws on failure.
 */
async function probeConnection(client) {
    const result = await client`SELECT 1 AS probe`;
    return result[0]?.probe === 1;
}

/**
 * Attempt to connect with exponential back-off.
 * Logs each attempt so you can see Neon waking up in the server console.
 */
async function connectWithRetry() {
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        const client = createClient();
        try {
            console.log(`[DB] Connection attempt ${attempt}/${MAX_RETRIES + 1}…`);
            await probeConnection(client);
            console.log(`[DB] ✅ Connected to Neon DB successfully (attempt ${attempt})`);
            return client; // ← healthy client, exit the loop
        } catch (err) {
            lastError = err;
            // Clean up this broken client before retrying
            try { await client.end({ timeout: 2 }); } catch (_) { /* ignore */ }

            if (attempt <= MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                console.warn(
                    `[DB] ⚠️  Attempt ${attempt} failed (${err.message}). ` +
                    `Neon compute may be waking up. Retrying in ${delay / 1000}s…`
                );
                await sleep(delay);
            }
        }
    }

    // All retries exhausted
    console.error('[DB] ❌ Could not connect to Neon DB after all retries:', lastError?.message);
    throw new Error(`Database connection failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}

// ---------------------------------------------------------------------------
// Bootstrap — connect once at module load time.
// We use a module-level promise so that any service that imports { db }
// will await the same single connection flow (no thundering herd).
// ---------------------------------------------------------------------------

let db;
let resolvedQueryClient;

// Immediately kick off the connection so it's warm by the time the first
// HTTP request arrives. If it fails we log and let the process stay up —
// individual route handlers will see DB errors via asyncHandler → errorHandler.
const dbReadyPromise = connectWithRetry()
    .then((client) => {
        resolvedQueryClient = client;
        db = drizzle(client, { schema });
        console.log('[DB] Drizzle ORM initialised.');
    })
    .catch((err) => {
        console.error('[DB] Fatal: could not initialise Drizzle ORM.', err.message);
        // Don't crash the process — routes will handle gracefully
    });

// Proxy that waits for DB to be ready before allowing any query.
// This prevents "db is undefined" crashes if a request arrives
// before the retry loop finishes.
const dbProxy = new Proxy({}, {
    get(_target, prop) {
        if (!db) {
            throw new Error('Database is still connecting. Please retry in a moment.');
        }
        return db[prop];
    },
});

module.exports = {
    get db() {
        if (!db) throw new Error('Database is still connecting. Please retry in a moment.');
        return db;
    },
    get queryClient() {
        return resolvedQueryClient;
    },
    dbReadyPromise,
};
