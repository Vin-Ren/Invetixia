
import { QueryClient } from "@tanstack/react-query"
import { getConfig } from "@/lib/queries/config"
import { EventInfoCard } from "./components/eventInfoCard"
import { EventSocialsCard } from "./components/eventSocialsCard"
import { EventDetailsCard } from "./components/eventDetailsCard"



export const loader = (queryClient: QueryClient) => {
    return async () => {
        if (!queryClient.getQueryData(getConfig('event_info').queryKey)) {
            await queryClient.fetchQuery(getConfig('event_info'))
        }
        if (!queryClient.getQueryData(getConfig('event_socials').queryKey)) {
            await queryClient.fetchQuery(getConfig('event_socials'))
        }
        if (!queryClient.getQueryData(getConfig('event_details').queryKey)) {
            await queryClient.fetchQuery(getConfig('event_details'))
        }
        return null
    }
}


export const EventConfigPage = () => {
    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 w-full">
                <div className="flex flex-col w-full gap-4">
                    <EventInfoCard />
                    <EventSocialsCard />
                    <EventDetailsCard />
                </div>
            </div>

            {/* <div className="flex flex-col gap-4">
            </div> */}
        </div>
    )
}
