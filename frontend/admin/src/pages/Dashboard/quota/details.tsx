
import { getAll, getOne } from "@/lib/queries/quota"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/quota"


export const QuotaDetails = () => {
    const { UUID = '' } = useParams()
    const { data: quota } = useQuery(getOne(UUID), queryClient)

    if (quota === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid max-xl:grid-cols-1 xl:grid-cols-2 w-full">
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
