import axios, { AxiosResponse } from "axios"
import { z } from "zod"
import { User, UserSanitized, userRole } from "./data-types"

export interface UserSelfData {
    authenticated: boolean,
    UUID?: string,
    username?: string,
    accessToken?: string,
    role?: string,
    organisationManaged?: {
        UUID: string,
        name: string,
    }
}


export const CredentialsSchema = z.object({
    username: z.string()
        .min(2, { message: 'Username is too short' })
        .max(50, { message: 'Username is too long' }),
    password: z.string()
        .min(2, { message: 'Password is too short' })
        .max(50, { message: 'Password is too long' }),
})


export const getUserSelf = async (): Promise<UserSelfData> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/self`,
        })
        return { authenticated: true, ...res.data.user }
    } catch (e) {
        return { authenticated: false }
    }
}

export const login = async (credentials: z.infer<typeof CredentialsSchema>): Promise<AxiosResponse> => {
    const res = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_API_BASE_URL}/user/login`,
        data: credentials,
        validateStatus: () => true
    })
    if (res.status < 400) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
    }
    return res
}

export const logout = async (): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/logout`,
            validateStatus: () => true
        })
        if (res.status < 400 || res.status === 403) {
            axios.defaults.headers.common["Authorization"] = ``;
            localStorage.setItem('accessToken', '')
            return true
        }
        return false
    } catch (e) {
        return false
    }
}

export const refreshToken = async (): Promise<string> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/refreshToken`
        });
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
        return res.data.accessToken;
    } catch (e) {
        return ''
    }
};


export const sanitizeUser = (user: User): UserSanitized => ({ ...user, role_string: userRole[user.role] })
export const sanitizeUsers = (users: User[]): UserSanitized[] => users.map(sanitizeUser)


export const getRoles = async (): Promise<{ userRole: object }> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/roles`,
        })
        return res.data.roles
    } catch (e) {
        return { userRole: {} }
    }
}


export const getAll = async (): Promise<UserSanitized[]> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/`,
        })
        return sanitizeUsers(res.data.users)
    } catch (e) {
        return []
    }
}


export const getOne = async (UUID: string): Promise<UserSanitized> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/user/info/${UUID}`,
    })
    return sanitizeUser(res.data.user)
}


export const updateOne = async ({ UUID, username, role, organisationName }: { UUID: string, username: string, role: number, organisationName: string }): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/update`,
            data: { UUID, username, role, organisationName }
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}


export const deleteOne = async (UUID: string): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'DELETE',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/delete`,
            data: { UUID }
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}


export const deleteMany = async (UUIDs: string[]): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'DELETE',
            url: `${import.meta.env.VITE_API_BASE_URL}/user/deleteMany`,
            data: { UUIDs }
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}
