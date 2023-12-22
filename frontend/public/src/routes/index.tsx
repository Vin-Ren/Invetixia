import { useQuery } from "@tanstack/react-query"
import { eventQuery } from "../queries"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useState } from "react";


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
            <div className="hero-content flex-col lg:flex-row bg-base-200 bg-opacity-70 p-6 md:p-8 rounded-xl">
                <img src={import.meta.env.VITE_EVENT_POSTER_IMAGE} alt="Event Poster Background" className="max-w-sm rounded-lg shadow-2xl md:w-64 h-auto w-48" />
                <div>
                    {event?.name ? <h1 className="text-5xl font-bold">{event.name}</h1> : null}
                    {event?.description ? <p className="py-6 font-medium">{event.description}</p> : null}
                    <form className="join" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                        <input type="text" className="input join-item" name="invitationId" placeholder="Invitation Id" value={invitationId} onChange={(e) => setInvitationId(e.target.value)} disabled={status === 'loading'} />
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
