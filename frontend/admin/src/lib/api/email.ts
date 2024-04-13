import axios from "axios"


export const authEmailClient = async (data: { apiKey: string, domain?: string }): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_API_BASE_URL}/email/auth`,
            data
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}

export const sendInvitation = async (data: { UUID: string, to: string[] }): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_API_BASE_URL}/email/sendInvitation`,
            data
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}

export const sendTickets = async (data: { limit: number }): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_API_BASE_URL}/email/sendTickets`,
            data
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}

export const sendTicket = async (data: { UUID: string }): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_API_BASE_URL}/email/sendTicket`,
            data
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}
