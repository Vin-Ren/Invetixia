
import { getAll, getOne } from "@/lib/queries/organisation"
import { getAll as invitationGetAll } from "@/lib/queries/invitation"
import { getAll as quotaTypeGetAll } from "@/lib/queries/quotaType"
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
import { DialogButton, GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { getInvitationTableColumns } from "../invitation/columns"
import { getTicketTableColumns } from "../ticket/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createOne } from "@/lib/api/invitation"
import { Combobox } from "@/components/combo-box"



export function CreateInvitationDialogButton({ organisationId, quotaTypes }: { organisationId: string, quotaTypes: { value: string, label: string }[] }) {
    return DialogButton<{ name?: string, usageQuota?: number, defaultQuotas?: { idx: number, quotaTypeId: string, value: number }[] }>({
        triggerNode: (
            <Button variant={'outline'}>
                <Plus className="mr-2 h-4 w-4" />
                Create Invitation
            </Button>
        ),
        initializeDialogData: ({ setDialogData }) => { setDialogData({ name: "", usageQuota: 1 }) },
        actionHandler: async ({ navigate, getDialogData }) => {
            const invitation = await createOne({
                organisationId, name: "", usageQuota: 0, ...(getDialogData() || {}),
                defaultQuotas: (getDialogData?.().defaultQuotas?.map(({ quotaTypeId, value }) => ({ quotaTypeId, value }))) || []
            });
            if (invitation) {
                navigate(`/dashboard/invitation/details/${invitation.UUID}`)
                return true;
            }
            return false;
        },
        queriesInvalidator: () => [queryClient, [invitationGetAll, getOne(organisationId)]],
        dialogContent: ({ internalActionHandler, getDialogData, setDialogData }) => {
            return (
                <DialogContent className="sm:max-w-[512px]">
                    <DialogHeader>
                        <DialogTitle>Create an invitation</DialogTitle>
                        <DialogDescription>
                            Click create when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label>Invitation Name</Label>
                            <Input className="col-span-3"
                                value={getDialogData?.().name || ""}
                                onChange={(e) => setDialogData((data) => ({ ...data, name: e.target.value }))} />
                            <Label>Usage Quota</Label>
                            <Input className="col-span-3"
                                value={(getDialogData?.().usageQuota) ? (getDialogData?.().usageQuota)?.toString() : ''}
                                onChange={(e) => setDialogData((data) => ({ ...data, usageQuota: parseInt(e.target.value || '0') }))}></Input>
                            <Label className="col-span-4 align-middle justify-center">Default Quotas</Label>
                            <div className="col-span-4 grid grid-flow-row gap-2">
                                {
                                    getDialogData?.().defaultQuotas?.map((defaultQuota) => (
                                        <div className="grid grid-cols-4">
                                            <div className="col-span-2">
                                                <Combobox options={quotaTypes} onChange={(e) => setDialogData((data) => ({
                                                    ...data, defaultQuotas: [...(data?.defaultQuotas?.filter((e) => e.idx < defaultQuota.idx) || []),
                                                    { idx: defaultQuota.idx, quotaTypeId: e, value: defaultQuota.value },
                                                    ...(data?.defaultQuotas?.filter((e) => e.idx > defaultQuota.idx) || [])]
                                                }))} />
                                            </div>
                                            <Input className="col-span-2"
                                                value={(defaultQuota.value) ? (defaultQuota.value)?.toString() : ''}
                                                onChange={(e) => setDialogData((data) => ({
                                                    ...data, defaultQuotas: [...(data?.defaultQuotas?.filter((e) => e.idx < defaultQuota.idx) || []),
                                                    { idx: defaultQuota.idx, quotaTypeId: defaultQuota.quotaTypeId, value: parseInt(e.target.value) },
                                                    ...(data?.defaultQuotas?.filter((e) => e.idx > defaultQuota.idx) || [])]
                                                }))}></Input>
                                        </div>
                                    )
                                    )
                                }
                                <Button variant={'secondary'} onClick={() => setDialogData((data) => {
                                    return { ...data, defaultQuotas: [...(data?.defaultQuotas || []), { idx: data?.defaultQuotas?.length || 0, quotaTypeId: '', value: 0 }] }
                                })}>
                                    <Plus />
                                    Add Default Quota
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler()}>Create</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )
        },
        toasts: {
            onSuccess: () => ({
                title: "Successfully created an invitation!"
            }),
            onFailure: () => ({
                title: "Failed to create an invitation!",
                variant: "destructive"
            }),
        }
    })
}


export const OrganisationDetails = () => {
    const { user } = useUser()
    const { UUID = '' } = useParams()
    const { data: organisation } = useQuery(getOne(UUID), queryClient)
    const { data: quotaTypes = [] } = useQuery(quotaTypeGetAll, queryClient);
    if (!(organisation)) return <></>

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
        disableColumnsById: ['Publisher Organisation']
    })

    const ticketTableColumns = getTicketTableColumns({
        disableColumnsById: ['Affiliated Organisation']
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
                            <CreateInvitationDialogButton organisationId={UUID} quotaTypes={quotaTypes.map((e) => ({ value: e.UUID, label: e.name }))} />
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
