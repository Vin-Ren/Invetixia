
import { getAll, getOne } from "@/lib/queries/ticket"
import { getAll as quotaTypeGetAll } from "@/lib/queries/quotaType"
import { getOne as invitationGetOne } from "@/lib/queries/invitation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DialogButton, GenericDetailsDeleteButton } from "@/components/custom-buttons"
import { deleteOne } from "@/lib/api/ticket"
import { createOne as quotaCreateOne } from "@/lib/api/quota"
import { useEffect, useState } from "react"
import QRCode from 'qrcode'
import { getInvitationTableColumns } from "../invitation/columns"
import { getQuotaTableColumns } from "../quota/columns"
import { DataTable } from "@/components/data-table"
import { ViewQRDialogButton } from "../components/viewQrDialogButton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/combo-box"
import { Input } from "@/components/ui/input"


export function CreateQuotaDialogButton({ticketId, quotaTypes} : {ticketId: string, quotaTypes: {value: string, label: string}[]}) {
    return DialogButton<{quotaTypeId?: string, usageLeft?: number}>({
        triggerNode: (
            <Button variant={'outline'}>
                <Plus className="mr-2 h-4 w-4" />
                Add Quota
            </Button>
        ),
        initializeDialogData: ({ setDialogData }) => { setDialogData({ quotaTypeId: "", usageLeft:1 }) },
        actionHandler: async ({ getDialogData }) => {
            const defaultQuota = await quotaCreateOne({ticketId, quotaTypeId: "", usageLeft: 0, ...(getDialogData() || {})});
            return (defaultQuota) ? true: false;
        },
        queriesInvalidator: () => [queryClient, [getOne(ticketId)]],
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
                            value={(getDialogData?.().usageLeft) ? (getDialogData?.().usageLeft)?.toString() : ''}
                            onChange={(e) => setDialogData((data) => ({ ...data, usageLeft: parseInt(e.target.value || '0') }))}></Input>
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
                title: "Successfully created a quota!"
            }),
            onFailure: () => ({
                title: "Failed to create a quota!",
                variant: "destructive"
            }),
        }
    })
}


export const TicketDetails = () => {
    const { UUID = '' } = useParams()
    const { data: ticket } = useQuery(getOne(UUID), queryClient)
    const { data: invitation } = useQuery(invitationGetOne(ticket?.invitationId as string), queryClient)
    const { data: quotaTypes } = useQuery(quotaTypeGetAll, queryClient)
    const [qr, setQr] = useState("");

    const invitationTableColumns = getInvitationTableColumns({
        disableColumnsById: ['select'],
        actionsHeaderProps: {
            actions: []
        }
    })

    const quotaTableColumns = getQuotaTableColumns({
        disableColumnsById: ['Ticket Owner']
    })

    useEffect(() => {
        QRCode.toDataURL(
            `${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`, 
            { errorCorrectionLevel: 'Q', scale:8, margin:2 }
        ).then((res: string) => setQr(res))
    }, [UUID])

    if (!(ticket && invitation)) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${ticket.ownerName}'s Ticket`}</CardTitle>
                            <CardDescription>{`Invited with ${ticket.invitation?.name}`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - Ticket{${ticket.UUID}}`}</CardDescription>
                            <CardDescription>{`Affiliated Organisation - ${ticket.ownerAffiliation?.name}`}</CardDescription>
                            <CardDescription>{`Qoutas Count - ${ticket.quotas?.length}`}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <ViewQRDialogButton QrLink={`${import.meta.env.VITE_PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`} QrImgSource={qr} />
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quotas</CardTitle>
                            <CardDescription>{ticket.quotas?.length} Quota(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreateQuotaDialogButton ticketId={UUID} quotaTypes={quotaTypes?.map((e) => ({value:e.UUID, label:e.name})) || []}/>
                            <DataTable columns={quotaTableColumns} data={ticket.quotas || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invitation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={invitationTableColumns} data={[invitation]} options={{enablePagination: false, enableFilters: false, enableViewColumnCheckbox: false}}/>
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
