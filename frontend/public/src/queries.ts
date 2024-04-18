import axios from "axios"
import { Buffer } from "buffer";


export const getPosterImage = async () => {
    const res = await axios.request({
        method: 'GET',
        url: `/${import.meta.env.VITE_EVENT_POSTER_IMAGE}`,
        responseType: 'arraybuffer'
    })
    const base64Image = `data:${res.headers['content-type']};base64,` + Buffer.from(res.data).toString('base64');
    return base64Image
}


export const getEvent = async () => {
    const res = await axios.request({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/event`
    })
    return res.data
}

export const getEventDetails = async (UUID: string) => {
    const res = await axios.request({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/event/details`,
        params: { UUID }
    })
    return res.data
}

export const getInvitation = async (UUID: string) => {
    const res = await axios.request({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/invitation/public/${UUID}`
    })
    return res.data
}

export const getTicket = async (UUID: string) => {
    const res = await axios.request({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/ticket/public/${UUID}`
    })
    return res.data
}


export const posterImageQuery = {
    queryKey: ['posterImage'],
    queryFn: () => getPosterImage(),
}


export const eventQuery = {
    queryKey: ['eventInfo'],
    queryFn: () => getEvent(),
}

export const eventDetailsQuery = (UUID: string) => ({
    queryKey: ['eventDetails', UUID],
    queryFn: () => getEventDetails(UUID)
})

export const invitationQuery = (UUID: string) => ({
    queryKey: ['invitation', UUID],
    queryFn: () => getInvitation(UUID)
})

export const ticketQuery = (UUID: string) => ({
    queryKey: ['ticket', UUID],
    queryFn: () => getTicket(UUID)
})
