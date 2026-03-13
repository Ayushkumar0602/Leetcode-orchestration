import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 3 min by default;
            // individual hooks can override with their own staleTime.
            staleTime: 1000 * 60 * 3,

            // Keep unused cached data in memory for 10 min
            gcTime: 1000 * 60 * 10,

            // Only retry once on failure to avoid hammering the backend
            retry: 1,

            // Don't re-fetch on window focus in a dev/prod app like this
            refetchOnWindowFocus: false,

            // Reconnect-based refetch is fine
            refetchOnReconnect: true,
        },
    },
});

export default queryClient;
