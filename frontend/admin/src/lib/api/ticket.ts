import axios from "axios"
import { Ticket } from "./data-types"


export const getAll = async (): Promise<Ticket[]> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/ticket/`,
        })
        return res.data.tickets
    } catch (e) {
        return []
    }
}

export const getOne = async (UUID: string): Promise<Ticket> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/ticket/info/${UUID}`,
    })
    return res.data.ticket
}


export const createOne = async (data: {invitationId:string, ownerName:string, ownerContacts: {email:string, phone_number:string}}): Promise<Ticket> => {
    const res = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_API_BASE_URL}/ticket/create`,
        data,
    })
    return res.data.ticket
}


export const createMany = async (quotas: {invitationId:string, ownerName:string, ownerContacts: {email:string, phone_number:string}}[]) => await Promise.all(quotas.map((ticket) => createOne(ticket)))


export const updateOne = async (data: {UUID:string, ownerName:string, ownerContacts: {email:string, phone_number:string}}): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `${import.meta.env.VITE_API_BASE_URL}/ticket/update`,
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
            url: `${import.meta.env.VITE_API_BASE_URL}/ticket/delete`,
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
