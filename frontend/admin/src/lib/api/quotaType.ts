import axios from "axios"
import { QuotaType } from "./data-types"


export const getAll = async (): Promise<QuotaType[]> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/quotaType/`,
        })
        return res.data.quotaTypes
    } catch (e) {
        return []
    }
}

export const getOne = async (UUID: string): Promise<QuotaType> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/quotaType/info/${UUID}`,
    })
    return res.data.quotaType
}


export const createOne = async ({name, description}: {name:string, description:string}): Promise<QuotaType> => {
    const res = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_API_BASE_URL}/quotaType/create`,
        data: { name, description },
    })
    return res.data.quotaType
}


export const createMany = async (quotaTypes: {name: string, description: string}[]) => await Promise.all(quotaTypes.map((quotaType) => createOne(quotaType)))


export const updateOne = async (UUID: string, name: string, description: string): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `${import.meta.env.VITE_API_BASE_URL}/quotaType/update`,
            data: { UUID, name, description },
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
            url: `${import.meta.env.VITE_API_BASE_URL}/quotaType/delete`,
            data: { UUID }
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}


export const deleteMany = async (UUIDs: string[]): Promise<boolean> => {
    return (await Promise.all(UUIDs.map((UUID) => deleteOne(UUID)))).reduce((prv,cr) => prv && cr, true)
}
