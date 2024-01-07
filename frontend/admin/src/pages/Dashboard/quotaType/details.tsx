
import { getOne } from "@/lib/queries/quotaType"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export const QuotaTypeDetails = () => {
    const { UUID = '' } = useParams()
    const { data: quotaType } = useQuery(getOne(UUID), queryClient)
    if (quotaType === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid max-xl:grid-cols-1 xl:grid-cols-2 w-full">
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
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Managers</CardTitle>
                            <CardDescription>{quotaType.managers?.length} Personel(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={userTableColumns} data={sanitizeUsers(quotaType.managers || [])} />
                        </CardContent>
                    </Card> */}
                </div>
            </div>

            <div className="grid grid-cols-3">
                <div className="col-span-1">
                    <RefreshDataButton query={getOne(UUID)} />
                </div>
            </div>
        </div>
    )
}
