
import { getAll, getOne, getTickets } from "@/lib/queries/invitation"
import { getAll as quotaTypeGetAll } from "@/lib/queries/quotaType"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DialogButton, GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/invitation"
import { useEffect, useState } from "react"
import QRCode from 'qrcode'
import { Button } from "@/components/ui/button"
import { getTicketTableColumns } from "../ticket/columns"
import { DataTable } from "@/components/data-table"
import { getDefaultQuotaTable } from "../defaultQuota/columns"
import { getOrganisationTableColumns } from "../organisation/columns"
import { Plus } from "lucide-react"
import { createOne as defaultQuotaCreateOne } from "@/lib/api/defaultQuota"
import { createOne as ticketCreateOne } from "@/lib/api/ticket"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/combo-box"
import { ViewQRDialogButton } from "../components/viewQrDialogButton"


export function CreateDefaultQuotaDialogButton({invitationId, quotaTypes} : {invitationId: string, quotaTypes: {value: string, label: string}[]}) {
    return DialogButton<{quotaTypeId?: string, value?: number}>({
        triggerNode: (
            <Button variant={'outline'}>
                <Plus className="mr-2 h-4 w-4" />
                Create Default Quota
            </Button>
        ),
        initializeDialogData: ({ setDialogData }) => { setDialogData({ quotaTypeId: "", value:1 }) },
        actionHandler: async ({ getDialogData }) => {
            const defaultQuota = await defaultQuotaCreateOne({invitationId, quotaTypeId: "", value: 0, ...(getDialogData() || {})});
            return (defaultQuota) ? true: false;
        },
        queriesInvalidator: () => [queryClient, [getOne(invitationId)]],
        dialogContent: ({internalActionHandler, getDialogData, setDialogData}) => {
            return (
                <DialogContent className="sm:max-w-[512px]">
                    <DialogHeader>
                        <DialogTitle>Create a default quota</DialogTitle>
                        <DialogDescription>
                            Click create when you're done. Default quotas can be added later on.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label>Quota Type</Label>
                            <div className="col-span-3">
                                <Combobox options={quotaTypes} onChange={(val) => setDialogData((data) => ({...data, quotaTypeId: val}))}
                                />
                            </div>
                            <Label>Value</Label>
                            <Input className="col-span-3"
                            value={(getDialogData?.().value) ? (getDialogData?.().value)?.toString() : ''}
                            onChange={(e) => setDialogData((data) => ({ ...data, value: parseInt(e.target.value || '0') }))}></Input>
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
                title: "Successfully created a default quota!"
            }),
            onFailure: () => ({
                title: "Failed to create a default quota!",
                variant: "destructive"
            }),
        }
    })
}


export function CreateTicketDialogButton({invitationId} : {invitationId: string}) {
    return DialogButton<{ownerName?: string, ownerEmail?: string, ownerPhoneNumber?: string}>({
        triggerNode: (
            <Button variant={'outline'}>
                <Plus className="mr-2 h-4 w-4" />
                Create a Ticket
            </Button>
        ),
        initializeDialogData: ({ setDialogData }) => { setDialogData({ ownerName: "", ownerEmail: "", ownerPhoneNumber: "" }) },
        actionHandler: async ({ navigate, getDialogData }) => {
            const ticket = await ticketCreateOne({invitationId, ownerName: "", ...(getDialogData() || {}), ownerContacts: { email: getDialogData?.().ownerEmail || "", phone_number: getDialogData?.().ownerPhoneNumber || ""}});
            if (ticket) {
                navigate(`/dashboard/ticket/details/${ticket.UUID}`)
                return true;
            }
            return false;
        },
        queriesInvalidator: () => [queryClient, [getOne(invitationId)]],
        dialogContent: ({internalActionHandler, getDialogData, setDialogData}) => {
            return (
                <DialogContent className="sm:max-w-[512px]">
                    <DialogHeader>
                        <DialogTitle>Create a ticket</DialogTitle>
                        <DialogDescription>
                            Click create when you're done. Default quotas can be added later on.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label>Owner Name</Label>
                            <Input className="col-span-3"
                                value={getDialogData?.().ownerName || ""}
                                onChange={(e) => setDialogData((data) => ({ ...data, ownerName: e.target.value }))} />
                            <Label>Email</Label>
                            <Input className="col-span-3"
                                value={getDialogData?.().ownerEmail || ""}
                                placeholder="example@mail.com"
                                onChange={(e) => setDialogData((data) => ({ ...data, ownerEmail: e.target.value }))} />
                            <Label>Owner Phone number</Label>
                            <Input className="col-span-3"
                                value={getDialogData?.().ownerPhoneNumber || ""}
                                placeholder="628xxxxxxxxxx"
                                onChange={(e) => setDialogData((data) => ({ ...data, ownerPhoneNumber: e.target.value }))} />
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
                title: "Successfully created a ticket!"
            }),
            onFailure: () => ({
                title: "Failed to create a ticket!",
                variant: "destructive"
            }),
        }
    })
}


export const InvitationDetails = () => {
    const { UUID = '' } = useParams()
    const { data: invitation } = useQuery(getOne(UUID), queryClient)
    const { data: tickets } = useQuery(getTickets(UUID), queryClient)
    const { data: quotaTypes } = useQuery(quotaTypeGetAll, queryClient)
    const [qr, setQr] = useState("");

    const defaultQuotaTableColumns = getDefaultQuotaTable({
        disableColumnsById: ['Invitation'],
        actionsHeaderProps: {
            actions: []
        },
    })

    const ticketTableColumns = getTicketTableColumns({
        disableColumnsById: ['Invited with'],
        actionsHeaderProps: {
            actions: []
        }
    })

    const organisationTableColumns = getOrganisationTableColumns({
        disableColumnsById: ['select'],
        actionsHeaderProps: {
            actions: []
        }
    })

    useEffect(() => {
        QRCode.toDataURL(
            `${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_INVITATION_URL}/${UUID}`, 
            { errorCorrectionLevel: 'Q', scale:8, margin:2 }
        ).then((res: string) => setQr(res))
    }, [UUID])
    if (invitation === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${invitation.name}`}</CardTitle>
                            <CardDescription>{invitation.publisher?.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - Invitation{${invitation.UUID}}`}</CardDescription>
                            <CardDescription>{`Usage Quota - ${invitation.usageQuota}`}</CardDescription>
                            <CardDescription>{`Usage Left - ${invitation.usageLeft}`}</CardDescription>
                            <CardDescription>{`Created Tickets Count - ${invitation.createdTicketCount}`}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <ViewQRDialogButton QrLink={`${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_INVITATION_URL}/${UUID}`} QrImgSource={qr} />
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Default Quotas</CardTitle>
                            <CardDescription>{invitation.defaultQuotas?.length} Default Quota(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreateDefaultQuotaDialogButton invitationId={UUID} quotaTypes={quotaTypes?.map((e)=>({value:e.UUID, label:e.name})) || []}/>
                            <DataTable columns={defaultQuotaTableColumns} data={invitation.defaultQuotas || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tickets</CardTitle>
                            <CardDescription>{tickets?.length} Ticket(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreateTicketDialogButton invitationId={UUID} />
                            <DataTable columns={ticketTableColumns} data={tickets || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Organisation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={organisationTableColumns} data={invitation.publisher ? [invitation.publisher] : []} options={{enablePagination: false, enableFilters: false, enableViewColumnCheckbox: false}}/>
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
