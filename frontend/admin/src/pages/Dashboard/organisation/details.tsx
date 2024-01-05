
import { getAll, getOne } from "@/lib/queries/organisation"
import { getAll as userGetAll, getOne as userGetOne } from "@/lib/queries/user"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { UserViewDetailsAction, getUserTableColumns } from "../user/columns"
import { UserSelfData, sanitizeUsers, updateOne } from "@/lib/api/user"
import { Row } from "@tanstack/react-table"
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell"
import { TrashIcon } from "lucide-react"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Organisation, UserSanitized } from "@/lib/api/data-types"
import useUser from "@/hooks/useUser"
import { ToastAction } from "@/components/ui/toast"


export function RemoveUserFromOrganisationAction({
    removeOne,
    queriesInvalidator,
    undoRemove,
    organisation,
    executorUser,
}: {
    removeOne: (props: { row: Row<UserSanitized> }) => Promise<boolean>,
    undoRemove: (row: Row<UserSanitized>) => Promise<boolean>,
    queriesInvalidator: (row: Row<UserSanitized>) => void,
    organisation: Organisation,
    executorUser: UserSelfData
}): CellDialogAction<UserSanitized> {
    return ({
        actionType: 'dialog',
        actionId: "delete",
        triggerNode: (
            <>
                <TrashIcon className="mr-2 h-4 w-4" />
                Remove from organisation
            </>
        ),
        actionHandler: removeOne,
        queriesInvalidator,
        dialogContent: ({ row, internalActionHandler }) => {
            return (
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm deletion</DialogTitle>
                        <DialogDescription>
                            The user {row.original.username} is not going to be a manager of {organisation.name} afterwards, instead they will be a manager of your managed organisation({executorUser.organisationManaged?.name}). Are you sure you would like to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={"destructive"} onClick={async () => await internalActionHandler({ actionId: 'delete', row })}>Confirm</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )
        },
        toasts: {
            onSuccess: ({ row }) => ({
                title: "Removed user!",
                description: `User ${row.original.username} is no longer a manager of ${organisation.name}.`,
                action: <ToastAction onClick={async () => await undoRemove(row)} altText="Undo removal">Undo</ToastAction>
            }),
            onFailure: () => ({
                title: "Failed to remove user",
                variant: "destructive"
            }),
        }
    })
}



export const OrganisationDetails = () => {
    const { user } = useUser()
    const { UUID = '' } = useParams()
    const { data: organisation } = useQuery(getOne(UUID), queryClient)
    if (organisation === undefined) return <></>

    const userTableColumns = getUserTableColumns({
        disableColumnsById: ['Organisation'],
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
                            <CardTitle>{organisation.name} (Organisation)</CardTitle>
                            <CardDescription>Lead by {organisation.top_manager || "No manager"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Created invitations: {organisation.publishedInvitations?.length || '0'}</CardDescription>
                            <CardDescription>Created tickets: {organisation.createdTicketCount || '0'}</CardDescription>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Managers</CardTitle>
                            <CardDescription>{organisation.managers?.length} People</CardDescription>
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
