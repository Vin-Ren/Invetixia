import { useQuery } from "@tanstack/react-query"
import { eventQuery, ticketQuery } from "../queries"
import { useEffect, useState } from "react"
import { Countdown } from "../components/countdown"
import { format } from "date-fns"
import { useNavigate, useParams } from "react-router-dom"
import { IoWarning } from "react-icons/io5";


export default function Ticket() {
    const params = useParams()
    const navigate = useNavigate()
    const { data: { event = {} } } = useQuery({
        refetchInterval: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
        ...eventQuery
    })
    const { data: { ticket = {}}} = useQuery({
        refetchInterval: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
        ...ticketQuery(params.UUID as string)
    })
    const [targetDate, setTargetDate] = useState<Date>(new Date(event?.startTime))
    
    useEffect(() => {
        setTargetDate(new Date(event?.startTime))
    }, [event?.startTime])

    const handleEdit = async () => navigate(`/ticket/${params.UUID}/edit`)

    return (
        <div className="hero min-h-screen bg-base-200 bg-opacity-50 px-2 py-4">
            <div className="hero-content text-center bg-base-200 bg-opacity-70 rounded-2xl">
                <div className="max-w-2xl flex flex-col items-center">
                    <div className="self-center">
                        <p className="text-3xl font-bold whitespace-break-spaces outline-4 outline-red-400">Hello 👋 {ticket.ownerName[0].toUpperCase() + ticket.ownerName.slice(1)}!</p>
                        <p className="text-2xl font-bold whitespace-break-spaces">This link is your ticket 🎫</p>
                        <p className="text-sm whitespace-break-spaces text-neutral-content">The ticket will also be sent to your active contacts on <span>D-Day</span>.</p>
                    </div>
                    <div className="divider divider-primary"></div>
                    <Countdown targetDate={targetDate} />
                    <p className="text-xl font-bold whitespace-break-spaces mt-4">The event will take place at {event?.locationName} on {format(targetDate, 'PPPP')}, at {format(targetDate, 'pp')} in your local time.</p>
                    <div className="divider divider-primary"></div>
                    <div className="grid max-md:grid-rows-2 md:grid-cols-2 gap-4 w-full">
                        <button type="submit" className="btn btn-accent btn-outline font-bold h-full btn-block rounded-2xl" onClick={() => handleEdit()}>Edit your information</button>
                        <div role="alert" className="alert alert-warning">
                            <div>
                                <span className="font-bold flex flex-row items-center gap-2 mb-0"><i><IoWarning  size='1.25rem'/></i> <span>Warning</span></span>
                                <span className="whitespace-break-spaces">Do not share this link with others!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
