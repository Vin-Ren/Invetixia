import axios from "axios"


export const getEvent = async () => {
    const res = await axios.request({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/event`
    })
    return res.data
}

export const getInvitation = async (UUID:string) => {
    const res = await axios.request({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitation/public/${UUID}`
    })
    return res.data
}

export const getTicket = async (UUID:string) => {
    const res = await axios.request({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/ticket/public/${UUID}`
    })
    return res.data
}


export const eventQuery = {
    queryKey: ['eventInfo'],
    queryFn: () => getEvent(),
}

export const invitationQuery = (UUID: string) => ({
    queryKey: ['invitation', UUID],
    queryFn: () => getInvitation(UUID)
})

export const ticketQuery = (UUID: string) => ({
    queryKey: ['ticket', UUID],
    queryFn: () => getTicket(UUID)
})
