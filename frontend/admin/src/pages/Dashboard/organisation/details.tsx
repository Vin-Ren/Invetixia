
import { getAll, getOne } from "@/lib/queries/organisation"
import { getAll as userGetAll, getOne as userGetOne } from "@/lib/queries/user"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { getUserTableColumns } from "../user/columns"
import { UserViewDetailsAction } from "../user/actions"
import { sanitizeUsers, updateOne } from "@/lib/api/user"
import useUser from "@/hooks/useUser"
import { RemoveUserFromOrganisationAction } from "./actions"


export const OrganisationDetails = () => {
    const { user } = useUser()
    const { UUID = '' } = useParams()
    const { data: organisation } = useQuery(getOne(UUID), queryClient)
    if (organisation === undefined) return <></>

    const userTableColumns = getUserTableColumns({
        disableColumnsById: ['Organisation'],
        actionsHeaderProps: {
            options: {
                enableDeleteSelected: false
            }
        },
        actionsCellProps: {
            actions: [
                UserViewDetailsAction(),
                RemoveUserFromOrganisationAction({
                    removeOne: async ({ row }) => await updateOne({ ...row.original, organisationName: user.organisationManaged?.name as string }),
                    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(UUID), userGetAll, userGetOne(row.original.UUID)]]),
                    organisation,
                    undoRemove: async (row) => {
                        const success = await updateOne({ ...row.original, organisationName: organisation.name })
                        if (success) {
                            [getAll, getOne(UUID), userGetAll, userGetOne(row.original.UUID)].map((query) => queryClient.invalidateQueries(query))
                        }
                        return success
                    },
                    executorUser: user
                })
            ]
        }
    })

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid max-xl:grid-cols-1 xl:grid-cols-2 w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${organisation.name}`}</CardTitle>
                            <CardDescription>Lead by {organisation.top_manager || "No manager"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - Organisation{${organisation.UUID}}`}</CardDescription>
                            <CardDescription>Created invitation count - {organisation.publishedInvitations?.length || '0'}</CardDescription>
                            <CardDescription>Created ticket count - {organisation.createdTicketCount || '0'}</CardDescription>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Managers</CardTitle>
                            <CardDescription>{organisation.managers?.length} Personel(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={userTableColumns} data={sanitizeUsers(organisation.managers || [])} />
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
