import axios from "axios"
import { DefaultQuota, Invitation, Ticket } from "./data-types"


export const getAll = async (): Promise<Invitation[]> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/invitation/`,
        })
        return res.data.invitations
    } catch (e) {
        return []
    }
}

export const getOne = async (UUID: string): Promise<Invitation> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitation/info/${UUID}`,
    })
    return res.data.invitation
}


export const getTickets = async (UUID: string): Promise<Ticket[]> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitation/info/${UUID}/tickets`,
    })
    return res.data.tickets
}


export const getDefaultQuotas = async (UUID: string): Promise<DefaultQuota[]> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitation/info/${UUID}/defaultQuotas`,
    })
    return res.data.defaultQuotas
}


export const createOne = async (data: {name: string, organisationId: string, usageQuota: number, defaultQuotas: {quotaTypeId: string, value: number}[]}): Promise<Invitation> => {
    const res = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitation/create`,
        data,
    })
    return res.data.invitation
}


export const createMany = async (
    data: {name: string, organisationId: string, usageQuota: number, defaultQuotas: {quotaTypeId: string, value: number}[]}[]
) => await Promise.all(data.map((entry) => createOne(entry)))


export const updateOne = async (data: {UUID: string, name: string, organisationId: string, usageQuota: number, newDefaults?: {quotaTypeId: string, value: number}[]}): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `${import.meta.env.VITE_API_BASE_URL}/invitation/update`,
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
            url: `${import.meta.env.VITE_API_BASE_URL}/invitation/delete`,
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
