
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
import { deleteOne } from "@/lib/api/organisation"
import { GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { getInvitationTableColumns } from "../invitation/columns"
import { getTicketTableColumns } from "../ticket/columns"


export const OrganisationDetails = () => {
    const { user } = useUser()
    const { UUID = '' } = useParams()
    const { data: organisation } = useQuery(getOne(UUID), queryClient)
    if (organisation === undefined) return <></>

    const userTableColumns = getUserTableColumns({
        disableColumnsById: ['Organisation'],
        actionsHeaderProps: {
            actions: [] // TODO: add actions. e.g. remove users in batch
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

    const invitationTableColumns = getInvitationTableColumns({
        disableColumnsById: ['Publisher Organisation'],
        actionsHeaderProps: {
            actions: []
        }
    })

    const ticketTableColumns = getTicketTableColumns({
        disableColumnsById: ['Affiliated Organisation'],
        actionsHeaderProps: {
            actions: []
        }
    })

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid w-full gap-4">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Invitations</CardTitle>
                            <CardDescription>{organisation.publishedInvitations?.length} Invitation(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={invitationTableColumns} data={organisation.publishedInvitations || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tickets</CardTitle>
                            <CardDescription>{organisation.createdTickets?.length} Ticket(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={ticketTableColumns} data={organisation.createdTickets || []} />
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
