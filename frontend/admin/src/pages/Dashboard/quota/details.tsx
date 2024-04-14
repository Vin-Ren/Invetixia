
import { getAll, getOne } from "@/lib/queries/quota"
import { getOne as ticketGetOne } from "@/lib/queries/ticket"
import { getOne as quotaTypeGetOne } from "@/lib/queries/quotaType"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/quota"
import { getTicketTableColumns } from "../ticket/columns"
import { DataTable } from "@/components/data-table"
import { getQuotaTypeTableColumns } from "../quotaType/columns"


export const QuotaDetails = () => {
    const { UUID = '' } = useParams()
    const { data: quota } = useQuery(getOne(UUID), queryClient)
    const { data: ticket } = useQuery(ticketGetOne(quota?.ticketId || ''), queryClient)
    const { data: quotaType } = useQuery(quotaTypeGetOne(quota?.quotaTypeId || ''), queryClient)

    const ticketTableColumns = getTicketTableColumns({
        disableColumnsById: ['select'],
        actionsHeaderProps: {
            actions: []
        }
    })

    const quotaTypeTableColumns = getQuotaTypeTableColumns({
        disableColumnsById: ['select'],
        actionsHeaderProps: {
            actions: []
        }
    })

    if (!(quota && ticket && quotaType)) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${quota.quotaType?.name} Quota`}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - Quota{${quota.UUID}}`}</CardDescription>
                            <CardDescription>{`Quota Type - ${quota.quotaType?.name}`}</CardDescription>
                            <CardDescription>{`Ticket's Owner - ${quota.ticket?.ownerName}`}</CardDescription>
                            <CardDescription>{`Usage Left - ${quota.usageLeft}`}</CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={ticketTableColumns} data={[ticket] || []} options={{enablePagination: false, enableFilters: false, enableViewColumnCheckbox: false}} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quota Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={quotaTypeTableColumns} data={[quotaType] || []} options={{enablePagination: false, enableFilters: false, enableViewColumnCheckbox: false}} />
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
