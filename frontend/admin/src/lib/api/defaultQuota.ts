import axios from "axios"
import { DefaultQuota } from "./data-types"


export const getOne = async (UUID: string): Promise<DefaultQuota> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitationDefaultQuota/info/${UUID}`,
    })
    return res.data.defaultQuota
}


export const createOne = async (data: { invitationId: string, quotaTypeId: string, value: number }): Promise<DefaultQuota> => {
    const res = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitationDefaultQuota/create`,
        data,
    })
    return res.data.defaultQuota
}


export const createMany = async (data: { invitationId: string, quotaTypeId: string, value: number }[]): Promise<DefaultQuota[]> => {
    return await Promise.all(data.map((entry) => createOne(entry)))
}


export const updateOne = async (data: { UUID: string, quotaTypeId: string, value: number }): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `${import.meta.env.VITE_API_BASE_URL}/invitationDefaultQuota/update`,
            data,
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
            url: `${import.meta.env.VITE_API_BASE_URL}/invitationDefaultQuota/delete`,
            data: { UUID }
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}


export const deleteMany = async (UUIDs: string[]): Promise<boolean> => {
    return (await Promise.all(UUIDs.map((UUID) => deleteOne(UUID)))).reduce((prv, cr) => prv && cr, true)
}
