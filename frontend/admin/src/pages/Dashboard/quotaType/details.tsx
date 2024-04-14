
import { getAll, getOne } from "@/lib/queries/quotaType"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/quotaType"
import { getQuotaTableColumns } from "../quota/columns"
import { DataTable } from "@/components/data-table"
import { getDefaultQuotaTable } from "../defaultQuota/columns"


export const QuotaTypeDetails = () => {
    const { UUID = '' } = useParams()
    const { data: quotaType } = useQuery(getOne(UUID), queryClient)

    const defaultQuotaTableColumn = getDefaultQuotaTable({
        disableColumnsById: ['Quota Type'],
        actionsHeaderProps: {
            actions: []
        }
    })

    const quotaTableColumns = getQuotaTableColumns({
        disableColumnsById: ['Quota Type'],
        actionsHeaderProps: {
            actions: []
        }
    })

    if (quotaType === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${quotaType.name}`}</CardTitle>
                            <CardDescription>{quotaType.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - QuotaType{${quotaType.UUID}}`}</CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Default Quotas</CardTitle>
                            <CardDescription>{quotaType.defaultQuotas?.length} Defaults Quota(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={defaultQuotaTableColumn} data={quotaType.defaultQuotas || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quotas</CardTitle>
                            <CardDescription>{quotaType.quotas?.length} Quota(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={quotaTableColumns} data={quotaType.quotas || []} />
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
