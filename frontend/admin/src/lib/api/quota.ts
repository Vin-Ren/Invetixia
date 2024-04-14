import axios from "axios"
import { Quota } from "./data-types"


export const getAll = async (): Promise<Quota[]> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/quota/`,
        })
        return res.data.quotas
    } catch (e) {
        return []
    }
}

export const getOne = async (UUID: string): Promise<Quota> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/quota/info/${UUID}`,
    })
    return res.data.quota
}


export const createOne = async (data: {quotaTypeId:string, ticketId:string, usageLeft:number}): Promise<Quota> => {
    const res = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_API_BASE_URL}/quota/create`,
        data,
    })
    return res.data.quota
}


export const createMany = async (quotas: {quotaTypeId:string, ticketId:string, usageLeft:number}[]) => await Promise.all(quotas.map((quota) => createOne(quota)))


export const updateOne = async (data: {UUID: string, quotaTypeId: string, usageLeft: number}): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `${import.meta.env.VITE_API_BASE_URL}/quota/update`,
            data,
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}


export const consumeOne = async (UUID: string): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_API_BASE_URL}/quota/consume`,
            data: { UUID },
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
            url: `${import.meta.env.VITE_API_BASE_URL}/quota/delete`,
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
