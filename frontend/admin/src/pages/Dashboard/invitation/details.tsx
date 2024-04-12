
import { getAll, getOne, getTickets } from "@/lib/queries/invitation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/invitation"
import { useEffect, useState } from "react"
import QRCode from 'qrcode'
import { Button } from "@/components/ui/button"
import { getTicketTableColumns } from "../ticket/columns"
import { DataTable } from "@/components/data-table"
import { getDefaultQuotaTable } from "../defaultQuota/columns"
import { getOrganisationTableColumns } from "../organisation/columns"


export const InvitationDetails = () => {
    const { UUID = '' } = useParams()
    const { data: invitation } = useQuery(getOne(UUID), queryClient)
    const { data: tickets } = useQuery(getTickets(UUID), queryClient)
    const [qr, setQr] = useState("");

    const defaultQuotaTableColumns = getDefaultQuotaTable({
        disableColumnsById: ['Invitation'],
        actionsHeaderProps: {
            actions: []
        },
    })

    const ticketTableColumns = getTicketTableColumns({
        disableColumnsById: ['Invited with'],
        actionsHeaderProps: {
            actions: []
        }
    })

    const organisationTableColumns = getOrganisationTableColumns({
        disableColumnsById: ['select'],
        actionsHeaderProps: {
            actions: []
        }
    })

    useEffect(() => {
        QRCode.toDataURL(
            `${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_INVITATION_URL}/${UUID}`, 
            { errorCorrectionLevel: 'Q', scale:8, margin:2 }
        ).then((res: string) => setQr(res))
    }, [UUID])
    if (invitation === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${invitation.name}`}</CardTitle>
                            <CardDescription>{invitation.publisher?.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - Invitation{${invitation.UUID}}`}</CardDescription>
                            <CardDescription>{`Usage Quota - ${invitation.usageQuota}`}</CardDescription>
                            <CardDescription>{`Usage Left - ${invitation.usageLeft}`}</CardDescription>
                            <CardDescription>{`Created Tickets Count - ${invitation.createdTicketCount}`}</CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{`Invitation QR Code`}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img src={qr} className="rounded-lg mb-2"></img>
                            <Button asChild variant={'link'}>
                                <a href={`${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_INVITATION_URL}/${UUID}`} target="_blank" className="text-wrap">
                                    {`${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_INVITATION_URL}/${UUID}`}
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Default Quotas</CardTitle>
                            <CardDescription>{invitation.defaultQuotas?.length} Default Quota(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={defaultQuotaTableColumns} data={invitation.defaultQuotas || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tickets</CardTitle>
                            <CardDescription>{tickets?.length} Ticket(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={ticketTableColumns} data={tickets || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Organisation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={organisationTableColumns} data={invitation.publisher ? [invitation.publisher] : []} options={{enablePagination: false, enableFilters: false, enableViewColumnCheckbox: false}}/>
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
