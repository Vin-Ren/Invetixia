import { getOne as apiGetOne } from "../api/defaultQuota";

export const getOne = (UUID: string) => ({
    queryKey: ['defaultQuota', 'info', UUID],
    queryFn: () => apiGetOne(UUID)
})
