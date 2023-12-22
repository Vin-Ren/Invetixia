import { useQuery } from "@tanstack/react-query"
import { eventQuery } from "../queries"
import { useEffect, useState } from "react"
import { Countdown } from "../components/countdown"
import { format } from 'date-fns'


export default function CountdownPage() {
    const { data: { event = {} } } = useQuery({
        refetchInterval: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
        ...eventQuery
    })
    const [targetDate, setTargetDate] = useState<Date>(new Date(event?.startTime))

    useEffect(() => {
        setTargetDate(new Date(event?.startTime))
    }, [event?.startTime])

    return (
        <div className="hero min-h-screen bg-base-200 bg-opacity-60">
            <div className="hero-content text-center">
                <div className="max-w-xl flex flex-col items-center">
                    <div className="divider divider-accent"></div>
                    <div className="self-center mb-4">
                        <p className="text-3xl font-bold whitespace-break-spaces">The event will take place at {event?.locationName} on {format(targetDate, 'PPPP')}, at {format(targetDate, 'pp')} in your local time</p>
                    </div>
                    <Countdown targetDate={targetDate} />
                    <div className="divider divider-accent"></div>
                </div>
            </div>
        </div>
    )
}
