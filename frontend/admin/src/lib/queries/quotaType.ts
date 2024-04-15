import { getAll as apiGetAll, getOne as apiGetOne } from "../api/quotaType";

export const getAll = {
    queryKey: ['quotaType', 'all'],
    queryFn: apiGetAll
}

export const getOne = (UUID: string) => ({
    queryKey: ['quotaType', 'info', UUID],
    queryFn: () => apiGetOne(UUID)
})
