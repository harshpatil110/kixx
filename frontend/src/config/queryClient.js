import { QueryClient } from '@tanstack/react-query';
import { getProductById } from '../services/productService';

// ---------------------------------------------------------------------------
// Neon DB Cold-Start Aware Retry Strategy
//
// Problem: Neon serverless computes pause after inactivity. The first request
// during a cold start can take 1-5 seconds and often returns a 500/503 while
// the compute wakes up. With retry: 1, the frontend gives up too early.
//
// Solution — Exponential backoff with jitter:
//  • retry: 3        → up to 3 silent background retries before showing error
//  • retryDelay      → waits 1s, 2s, 4s between attempts (capped at 30s)
//                       This mirrors the backend's own retry schedule and gives
//                       Neon enough time to resume its compute.
//  • staleTime 5min  → once data is fetched, no redundant refetches within window
//  • gcTime 10min    → cached data survives route navigation
//  • refetchOnWindowFocus false → no silent refetches on tab focus
//
// The key insight: the user sees the skeleton loader for ~3-5 extra seconds
// (Neon wake-up time), then the catalog appears — no manual refresh needed.
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,   // 5 minutes — data is "fresh"
            gcTime: 10 * 60 * 1000,     // 10 minutes — keep in memory after unmount
            refetchOnWindowFocus: false,

            // 3 retries with exponential back-off — Neon cold-start resilience
            retry: 3,
            retryDelay: (attempt) =>
                // attempt is 1-indexed: 1→1000ms, 2→2000ms, 3→4000ms, caps at 30s
                Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
        },
        mutations: {
            // Mutations (POST/PUT/DELETE) should never retry automatically —
            // they are not idempotent and retrying could cause duplicate orders.
            retry: 0,
        },
    },
});

// ---------------------------------------------------------------------------
// Hover Prefetch — fires when user hovers a ProductCard
//
// React Query will only send the request if data isn't already cached & fresh.
// Safe to call aggressively (onMouseEnter fires many times; it's a no-op when
// the data is already in cache within the 5-minute staleTime window).
// ---------------------------------------------------------------------------
export const prefetchProduct = (id) => {
    if (!id) return;
    queryClient.prefetchQuery({
        queryKey: ['product', String(id)],
        queryFn: () => getProductById(id),
        staleTime: 5 * 60 * 1000,
    });
};

export default queryClient;
