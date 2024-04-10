import { getAll as apiGetAll, getOne as apiGetOne, getTickets as apiGetTickets, getDefaultQuotas as apiGetDefaultQuotas } from "../api/invitation";

export const getAll = {
    queryKey: ['invitation', 'all'],
    queryFn: apiGetAll
}

export const getOne = (UUID:string) => ({
    queryKey: ['invitation', 'info', UUID],
    queryFn: () => apiGetOne(UUID)
})

export const getTickets = (UUID:string) => ({
    queryKey: ['invitation', 'info', UUID, 'tickets'],
    queryFn: () => apiGetTickets(UUID)
})

export const getDefaultQuotas = (UUID:string) => ({
    queryKey: ['invitation', 'info', UUID, 'defaultQuotas'],
    queryFn: () => apiGetDefaultQuotas(UUID)
})
