import { getAll as apiGetAll, getOne as apiGetOne } from "../api/quota";

export const getAll = {
    queryKey: ['quota', 'all'],
    queryFn: apiGetAll
}

export const getOne = (UUID:string) => ({
    queryKey: ['quota', 'info', UUID],
    queryFn: () => apiGetOne(UUID)
})
