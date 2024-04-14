import { FetchQueryOptions, QueryClient } from "@tanstack/react-query"


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLoader = ({queries}: {queries: FetchQueryOptions<any, Error, any, string[], never>[]}) => ((queryClient: QueryClient) => {
    return async () => {
        const queriesToFetch = []
        for (const query of queries) {
            if (!queryClient.getQueryData(query.queryKey)) queriesToFetch.push(queryClient.fetchQuery(query))
        }
        await Promise.all(queries)
        return null // Is neccessary, IDK WHY, DO NOT REMOVE.
    }
})
