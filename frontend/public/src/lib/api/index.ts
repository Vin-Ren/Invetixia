import { QueryClient } from "@tanstack/react-query";


export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
            refetchInterval: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
            refetchOnReconnect: true
        },
    },
})
