import { getAll as apiGetAll, getOne as apiGetOne } from "../api/organisation";

export const getAll = {
    queryKey: ['organisation', 'all'],
    queryFn: apiGetAll
}

export const getOne = (UUID:string) => ({
    queryKey: ['organisation', 'info', UUID],
    queryFn: () => apiGetOne(UUID)
})
