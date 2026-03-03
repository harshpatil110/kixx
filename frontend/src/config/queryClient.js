import { QueryClient } from '@tanstack/react-query';
import { getProductById } from '../services/productService';

// ---------------------------------------------------------------------------
// Centralized React Query client
//
// Key caching decisions:
//  • staleTime 5 min  — Product data is treated as fresh for 5 minutes.
//                        React Query will NOT fire a background refetch for
//                        any 'products' or 'product' query within this window,
//                        eliminating wasteful network requests on route changes.
//  • gcTime    10 min — Inactive (unmounted) query results stay in memory for
//                        10 minutes. If the user navigates away and comes back,
//                        the data is instantly available from the cache instead
//                        of triggering a loading state.
//  • retry     1      — Retry failed network requests once before surfacing an
//                        error to the UI — avoids hammering on transient 500s.
//  • refetchOnWindowFocus false — Prevents silent background refetches when the
//                        user alt-tabs back to the browser.
// ---------------------------------------------------------------------------
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,    // 5 minutes — data is "fresh"
            gcTime: 10 * 60 * 1000,      // 10 minutes — keep in memory after unmount
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
});

// ---------------------------------------------------------------------------
// Prefetch helper for ProductCard hover prefetching
//
// Usage: call prefetchProduct(id) inside an onMouseEnter handler.
// React Query will only fire the request if the data isn't already cached
// and fresh, so this is safe to call aggressively.
//
// This means by the time the user clicks the card and React navigates to
// /product/:id, the data is already sitting in the cache. With the 5-min
// staleTime, subsequent visits within the window cost zero network requests.
// ---------------------------------------------------------------------------
export const prefetchProduct = (id) => {
    if (!id) return;
    queryClient.prefetchQuery({
        queryKey: ['product', String(id)],
        queryFn: () => getProductById(id),
        // Don't prefetch if data is already fresh in the cache
        staleTime: 5 * 60 * 1000,
    });
};

export default queryClient;
