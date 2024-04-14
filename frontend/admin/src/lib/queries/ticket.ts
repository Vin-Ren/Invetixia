import { getAll as apiGetAll, getOne as apiGetOne } from "../api/ticket";

export const getAll = {
    queryKey: ['ticket', 'all'],
    queryFn: apiGetAll
}

export const getOne = (UUID:string) => ({
    queryKey: ['ticket', 'info', UUID],
    queryFn: () => apiGetOne(UUID)
})
