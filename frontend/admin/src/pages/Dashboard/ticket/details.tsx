
import { getAll, getOne } from "@/lib/queries/ticket"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/ticket"
import { useEffect, useState } from "react"
import QRCode from 'qrcode'
import { Button } from "@/components/ui/button"


export const TicketDetails = () => {
    const { UUID = '' } = useParams()
    const { data: ticket } = useQuery(getOne(UUID), queryClient)
    const [qr, setQr] = useState("");

    useEffect(() => {
        QRCode.toDataURL(
            `${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`, 
            { errorCorrectionLevel: 'Q', scale:8, margin:2 }
        ).then((res: string) => setQr(res))
    }, [UUID])
    if (ticket === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid max-xl:grid-cols-1 xl:grid-cols-2 w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${ticket.ownerName}'s Ticket`}</CardTitle>
                            <CardDescription>{`Invited with ${ticket.invitation?.name}`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - Ticket{${ticket.UUID}}`}</CardDescription>
                            <CardDescription>{`Affiliated Organisation - ${ticket.ownerAffiliation?.name}`}</CardDescription>
                            <CardDescription>{`Qoutas Count - ${ticket.quotas?.length}`}</CardDescription>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>{`Ticket QR Code`}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img src={qr} className="rounded-lg mb-2"></img>
                            <Button asChild variant={'link'}>
                                <a href={`${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`} target="_blank" className="text-wrap">
                                    {`${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`}
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-1">
                    <RefreshDataButton query={getOne(UUID)} />
                </div>
                <div className="flex flex-1">
                    <GenericDetailsDeleteButton
                        UUID={UUID}
                        deleteHandler={async () => await deleteOne(UUID)}
                        queriesInvalidator={() => [queryClient, [getAll, getOne(UUID)]]}
                    />
                </div>
            </div>
        </div>
    )
}
