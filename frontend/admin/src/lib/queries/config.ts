import { getConfig as apiGetConfig, getEventInfo as apiGetEventInfo, getEventSocials as apiGetEventSocials, getEventDetails as apiGetEventDetails } from "../api/config";


export const getConfig = (name: string) => ({
    queryKey: ['config', 'info', name],
    queryFn: () => apiGetConfig(name)
})

export const getEventInfo = {
    queryKey: ['config', 'info', 'event_info'],
    queryFn: () => apiGetEventInfo()
}

export const getEventSocials = {
    queryKey: ['config', 'info', 'event_socials'],
    queryFn: () => apiGetEventSocials()
}

export const getEventDetails = {
    queryKey: ['config', 'info', 'event_details'],
    queryFn: () => apiGetEventDetails()
}
