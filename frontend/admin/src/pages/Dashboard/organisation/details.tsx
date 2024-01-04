
import { getOne } from "@/lib/queries/organisation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/main"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { getUserTableColumns } from "../user/columns"
import { sanitizeUsers } from "@/lib/api/user"


export const OrganisationDetails = () => {
    const { UUID = '' } = useParams()
    const { data: organisation } = useQuery(getOne(UUID), queryClient)
    if (organisation === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid max-lg:grid-cols-1 lg:grid-cols-2 w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{organisation.name} (Organisation)</CardTitle>
                            <CardDescription>Lead by: {organisation.top_manager || "No manager"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span>Created invitations: {organisation.publishedInvitations?.length || '0'}</span>
                            <br></br>
                            <span>Created tickets: {organisation.createdTicketCount || '0'}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Managers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={getUserTableColumns({disableColumnsById: ['Organisation Managed'], actionsCellProps: {options: {enableDeleteItem: false}}})} data={sanitizeUsers(organisation.managers || [])}/>
                        </CardContent>
                    </Card>
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
