
import { getAll, getOne } from "@/lib/queries/quotaType"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/quotaType"
import { getQuotaFilteredByOrganisationAndQuotaTypeTableColumns, getQuotaTableColumns } from "../quota/columns"
import { DataTable } from "@/components/data-table"
import { getDefaultQuotaTable } from "../defaultQuota/columns"
import { useEffect, useState } from "react"
import { QuotaWithTicketOrganisationInfo } from "@/lib/api/data-types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


const FilteredQuotasByQuotaTypeAndOrganisationCard = ({ quotas }: { quotas: QuotaWithTicketOrganisationInfo[] }) => {
    const [filteredQuotas, setFilteredQuotas] = useState<QuotaWithTicketOrganisationInfo[]>([])
    const [organisationName, setOrganisationName] = useState("")

    const quotaFilteredTableColumns = getQuotaFilteredByOrganisationAndQuotaTypeTableColumns({
        disableColumnsById: ['Quota Type']
    })

    useEffect(() => {
        setFilteredQuotas(quotas.filter((quota) => quota.ticket?.ownerAffiliation.name.includes(organisationName)))
    }, [quotas, organisationName])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quotas Filtered by Organisation</CardTitle>
                <CardDescription>Search for quotas with this quota type and a certain organisation name.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-rows-2 items-center mb-4">
                    <Label>Organisation Name</Label>
                    <Input className="w-fit"
                        value={organisationName}
                        onChange={(e) => setOrganisationName(e.target.value)}></Input>
                </div>
                <DataTable columns={quotaFilteredTableColumns} data={filteredQuotas} />
            </CardContent>
        </Card>
    )
}


export const QuotaTypeDetails = () => {
    const { UUID = '' } = useParams()
    const { data: quotaType } = useQuery(getOne(UUID), queryClient)

    const defaultQuotaTableColumn = getDefaultQuotaTable({
        disableColumnsById: ['Quota Type']
    })

    const quotaTableColumns = getQuotaTableColumns({
        disableColumnsById: ['Quota Type']
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

                    <FilteredQuotasByQuotaTypeAndOrganisationCard quotas={quotaType.quotas || []} />
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
