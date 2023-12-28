import { useQuery } from "@tanstack/react-query"
import { eventQuery } from "../queries"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useState } from "react";
import { Helmet } from "react-helmet-async";


export default function Index() {
    const [err, setErr] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading'>('idle')
    const [invitationId, setInvitationId] = useState('')
    const { data: { event = null } } = useQuery(eventQuery)
    const navigate = useNavigate()

    const handleSubmit = async () => {
        setStatus('loading')

        const res = await axios.request({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}/invitation/public/${invitationId}`,
            validateStatus: () => true
        })


        if (res.status === 404) {
            await setErr('Invalid Invitation')
        } else {
            navigate(`/invitation/${invitationId}`, { preventScrollReset: false })
        }
        setStatus('idle')
    }


    return (
        <div className="hero min-h-screen bg-base-200 bg-opacity-50">
            <Helmet>
                <title>{event.name}</title>
            </Helmet>

            <div className="hero-content items-start flex-col lg:flex-row bg-base-200 p-6 rounded-xl bg-opacity-75 backdrop-blur-sm m-4">
                <img src={import.meta.env.VITE_EVENT_POSTER_IMAGE} alt="Event Poster Background" className="max-w-sm rounded-lg shadow-2xl h-auto w-[98%]" />
                <div>
                    {event?.name ? <h1 className="text-5xl font-bold">{event.name}</h1> : null}
                    {event?.description ? <p className="max-md:pb-2 md:pb-6 md:pt-2 font-medium pl-[3px]">{event.description}</p> : null}
                    <form className="join" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                        <input type="text" className="input join-item" name="invitationId" placeholder="Invitation Id" value={invitationId} onChange={(e) => setInvitationId(e.target.value.toLowerCase())} disabled={status === 'loading'} />
                        <button type="submit" className="btn btn-primary join-item" disabled={status === 'loading'}>Register</button>
                    </form>
                    <div className={'label ' + (!err ? 'invisible' : '')}>
                        <span className="label-text-alt text-error font-bold">{err}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
