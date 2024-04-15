import axios from "axios"
import { EventDetails, EventInfo, EventSocials } from "./data-types"


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getConfig = async (name: string): Promise<any> => {
    const res = await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_API_BASE_URL}/event/get`,
        params: { name }
    })
    return res.data.config
}

export const updateConfig = async (name: string, value: object): Promise<boolean> => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `${import.meta.env.VITE_API_BASE_URL}/event/update`,
            data: { name, value }
        })
        return res.status < 400
    } catch (e) {
        return false
    }
}


export const getEventInfo = async (): Promise<EventInfo> => getConfig('event_info')
export const getEventSocials = async (): Promise<EventSocials> => getConfig('event_socials')
export const getEventDetails = async (): Promise<EventDetails> => getConfig('event_details')

export const updateEventInfo = async (value: EventInfo) => updateConfig('event_info', value)
export const updateEventSocials = async (value: EventSocials) => updateConfig('event_socials', value)
export const updateEventDetails = async (value: EventDetails) => updateConfig('event_details', value)
