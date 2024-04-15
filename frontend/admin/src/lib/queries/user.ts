import { getUserSelf as apiGetUserSelf, getAll as apiGetAll, getRoles as apiGetRoles, getOne as apiGetOne } from "../api/user";

export const getUserSelf = {
    queryKey: ['user', 'self'],
    queryFn: apiGetUserSelf
}

export const getRoles = {
    queryKey: ['user', 'roles'],
    queryFn: apiGetRoles
}

export const getAll = {
    queryKey: ['user', 'all'],
    queryFn: apiGetAll
}

export const getOne = (UUID: string) => ({
    queryKey: ['user', 'info', UUID],
    queryFn: () => apiGetOne(UUID)
})
