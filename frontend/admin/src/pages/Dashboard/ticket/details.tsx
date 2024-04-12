
import { getAll, getOne } from "@/lib/queries/ticket"
import { getOne as invitationGetOne } from "@/lib/queries/invitation"
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
import { getInvitationTableColumns } from "../invitation/columns"
import { getQuotaTableColumns } from "../quota/columns"
import { DataTable } from "@/components/data-table"


export const TicketDetails = () => {
    const { UUID = '' } = useParams()
    const { data: ticket } = useQuery(getOne(UUID), queryClient)
    const { data: invitation } = useQuery(invitationGetOne(ticket?.invitationId as string), queryClient)
    const [qr, setQr] = useState("");

    const invitationTableColumns = getInvitationTableColumns({
        disableColumnsById: ['select'],
        actionsHeaderProps: {
            actions: []
        }
    })

    const quotaTableColumns = getQuotaTableColumns({
        disableColumnsById: ['Ticket Owner'],
        actionsHeaderProps: {
            actions: []
        }
    })

    useEffect(() => {
        QRCode.toDataURL(
            `${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`, 
            { errorCorrectionLevel: 'Q', scale:8, margin:2 }
        ).then((res: string) => setQr(res))
    }, [UUID])

    if (!(ticket && invitation)) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid w-full">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Quotas</CardTitle>
                            <CardDescription>{ticket.quotas?.length} Quota(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={quotaTableColumns} data={ticket.quotas || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invitation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={invitationTableColumns} data={[invitation]} options={{enablePagination: false, enableFilters: false, enableViewColumnCheckbox: false}}/>
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
