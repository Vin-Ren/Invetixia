import { getConfig } from "@/lib/queries/config"
import { EventInfoCard } from "./components/eventInfoCard"
import { EventSocialsCard } from "./components/eventSocialsCard"
import { EventDetailsCard } from "./components/eventDetailsCard"
import { createLoader } from "@/lib/queries/_loader"



export const loader = createLoader({queries:[getConfig('event_info'), getConfig('event_socials'), getConfig('event_details')]})


export const ConfigPage = () => {
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
