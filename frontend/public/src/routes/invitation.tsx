import { useState } from "react"
import { QueryClient, useQuery } from "@tanstack/react-query"
import { Params, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { IoCaretBackOutline } from "react-icons/io5";

import { TextInput } from "../components/form"
import { invitationQuery } from "../queries"

export const loader = (queryClient: QueryClient) => {
    return async ({ params }: { params: Params }) => {
        const UUID = params.UUID || ''
        if (!queryClient.getQueryData(invitationQuery(UUID).queryKey)) {
            await queryClient.fetchQuery(invitationQuery(UUID))
        }
        return null
    }
}


export default function Invitation() {
    interface Errors {
        name: string,
        email: string,
        number: string
    }
    const defaultErrors = { name: '', email: '', number: '' }
    const [errors, setErrors] = useState<Errors>(defaultErrors)
    const [status, setStatus] = useState<'idle' | 'loading'>('idle')
    const params = useParams()
    const navigate = useNavigate()
    const { data, isError } = useQuery(invitationQuery(params.UUID || ''))
    if (isError) navigate('/')

    const [ownerName, setOwnerName] = useState('')
    const [ownerEmail, setOwnerEmail] = useState('')
    const [ownerNumber, setOwnerNumber] = useState('')
    const [ownerOrganisation] = useState(data.invitation.publisher.name)

    const handleGoBack = async () => {
        navigate('/')
    }

    const handleSubmit = async () => {
        setStatus('loading')

        const errors = {...defaultErrors}

        if (ownerName.length > 50) {
            errors.name = 'Name is too long'
        }

        if (!ownerName) {
            errors.name = 'Name is required'
        }

        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
        if (!emailRegex.test(ownerEmail)) {
            errors.email = 'Invalid email'
        }

        const numberFormatRegex = /[0-9]{10,}$/
        if (!numberFormatRegex.test(ownerNumber)) {
            errors.number = 'Invalid number'
        }

        if (errors.name || errors.email || errors.number) {
            await setErrors(errors)
        } else {
            const res = await axios.request({
                method: 'POST',
                url: `${import.meta.env.VITE_API_BASE_URL}/ticket/create`,
                data: {
                    ownerName: (ownerName as string).toLowerCase(),
                    ownerContacts: [ownerEmail, ownerNumber],
                    invitationId: data.invitation.UUID
                },
                validateStatus: () => true
            })
            
            navigate(`/ticket/${res.data.ticket.UUID}`, {replace: true})
        }
        setStatus('idle')
    }

    return (
        <div className="hero min-h-screen bg-base-200 bg-opacity-60">
            <div className="hero-content justify-center">
                <div></div>
                <div className="max-w-lg bg-base-300 p-3 rounded-xl bg-opacity-70">
                    <button className="btn btn-ghost" disabled={status === 'loading'} onClick={() => handleGoBack()}><IoCaretBackOutline /><span>Back</span></button>
                    <form className="form-control p-9 pt-0" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                        <TextInput prompt="What is your name?" placeholder="John Doe" value={ownerName} stateSetter={setOwnerName} error={errors?.name} infoText="" />
                        <TextInput prompt="What is your Email?" placeholder="example@mail.com" value={ownerEmail} stateSetter={setOwnerEmail} error={errors?.email} infoText="Make sure to enter your active email" />
                        <TextInput prompt="What is your Whatsapp number?" placeholder="62xxxxxxxxxxx" value={ownerNumber} stateSetter={setOwnerNumber} error={errors?.number} infoText="Make sure to enter your active number" />
                        <TextInput prompt="What is your Organisation? (Autofilled)" placeholder="Your Organisation" value={ownerOrganisation} disabled={true} />
                        <button className="btn btn-accent btn-outline" disabled={status === 'loading'}>Register</button>
                    </form>
                </div>
                <div></div>
            </div>
        </div>
    )
}