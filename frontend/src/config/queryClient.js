import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,    // 5 minutes
            gcTime: 10 * 60 * 1000,      // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false, // Prevents unnecessary refetches across tabs
        },
        mutations: {
            retry: 0,
        },
    },
});

export default queryClient;
