import axios from "axios"
import { Organisation } from "./data-types"


export const getAll = async (): Promise<Organisation[]> => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/organisation/`,
        })
        return res.data.organisations.map((organisation: Organisation) => ({ top_manager: organisation.managers?.at(0)?.username || "No manager", ...organisation }))
    } catch (e) {
        return []
    }
}

export const getOne = async (UUID: string): Promise<Organisation> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/organisation/info/${UUID}`,
    })
    return { top_manager: res.data.organisation.managers?.at(0)?.username || "No manager", ...res.data.organisation }
}


export const deleteOne = async (UUID: string): Promise<boolean> => {
    const res = await axios({
        method: 'DELETE',
        url: `${import.meta.env.VITE_API_BASE_URL}/organisation/delete`,
        data: { UUID }
    })
    return res.status<400
}


export const deleteMany = async (UUIDs: string[]): Promise<boolean> => {
    const res = await axios({
        method: 'DELETE',
        url: `${import.meta.env.VITE_API_BASE_URL}/organisation/deleteMany`,
        data: { UUIDs },
        validateStatus: () => true
    })
    return res.status<400
}
