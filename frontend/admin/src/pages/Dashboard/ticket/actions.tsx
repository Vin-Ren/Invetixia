import { Ticket } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/ticket";
import { getOne as invitationGetOne } from "@/lib/queries/invitation";
import { queryClient } from "@/lib/api";
import { deleteOne, deleteMany, updateOne } from "@/lib/api/ticket";
import { DeleteDialogAction, GenericDialogConfirmAction, GenericNavigatorButtonAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { Building2, Mail, PencilIcon, TicketSlash } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendTicket } from "@/lib/api/email";


export const TicketViewDetailsAction = () => ViewDetailsAction((row: Row<Ticket>) => `/dashboard/ticket/details/${row.original.UUID}`);

export const TicketViewOrganisationAction = () => GenericNavigatorButtonAction({
    actionId: "view_ticket_organisation",
    getTo: (row: Row<Ticket>) => `/dashboard/organisation/details/${row.original.ownerAffiliationId}`,
    triggerNode: (
        <>
            <Building2 className="mr-2 w-4 h-4" />
            View ticket's organisation details
        </>
    )
});

export const TicketViewInvitationAction = () => GenericNavigatorButtonAction({
    actionId: "view_ticket_invitation",
    getTo: (row: Row<Ticket>) => `/dashboard/invitation/details/${row.original.invitationId}`,
    triggerNode: (
        <>
            <TicketSlash className="mr-2 w-4 h-4" />
            View ticket's invitation details
        </>
    )
});


export const SendEmailDialogAction = (): CellDialogAction<Ticket> => {
    return GenericDialogConfirmAction<Ticket>({
        actionId: 'send-email',
        triggerNode: (
            <>
                <Mail className="mr-2 h-4 w-4" />
                Send ticket email
            </>
        ),
        actionHandler: async ({row}) => await sendTicket({UUID: row.original.UUID}),
        dialogOptions: {
            title: "Confirm action",
            description: ({ row }) => `Are you sure you would like to send an email to the owner of this ticket(email: ${row.original.ownerContacts.email})?`,
            confirmButtonVariant: 'default'
        },
        toasts: {
            onSuccess: ({ row }) => ({
                title: "Sent an email!",
                description: `Successfully sent an email to ${row.original.ownerContacts.email}.`
            }),
            onFailure: () => ({
                title: "Failed to send an email.",
                variant: "destructive"
            }),
        }
    })
}


export const TicketEditAction = (): CellDialogAction<Ticket, {ownerName?:string, ownerContacts?: {email:string, phone_number:string}}> => ({
    actionType: "dialog",
    actionId: "quick-edit-item",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne({UUID: row.original.UUID, ownerName: "", ownerContacts: {email: "", phone_number: ""}, ...(getDialogData?.() || {})})
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ ownerName: row.original.ownerName, ownerContacts: row.original.ownerContacts }) },
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]]),
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Ticket</DialogTitle>
                    <DialogDescription>
                        Make quick changes to the ticket here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Owner Name</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().ownerName || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, ownerName: e.target.value }))}></Input>
                        <Label>Email</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().ownerContacts?.email || ""}
                            placeholder="example@mail.com"
                            onChange={(e) => setDialogData((data) => ({ ...data, ownerContacts: { email: e.target.value, phone_number: data?.ownerContacts?.phone_number || ""} }))}></Input>
                        <Label>Phone Number</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().ownerContacts?.phone_number || ""}
                            placeholder="628xxxxxxxxxx"
                            onChange={(e) => setDialogData((data) => ({ ...data, ownerContacts: { phone_number: e.target.value, email: data?.ownerContacts?.email || ""} }))}></Input>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler({ actionId: 'quick-edit-item', row })}>Save</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )
    },
    toasts: {
        onSuccess: () => ({
            title: "Successfully updated the ticket!"
        }),
        onFailure: () => ({
            title: "Failed to update the ticket!",
            variant: "destructive"
        })
    }
})

export const TicketDeleteAction = () => DeleteDialogAction<Ticket>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID), invitationGetOne(row.original.invitationId)]])
});

export const TicketHeaderDeleteAction = () => HeaderDeleteDialogAction<Ticket>({
    deleteHandler: async ({rows}) => await deleteMany(rows.map((row) => row.original.UUID)),
    queriesInvalidator: (rows) => ([queryClient, [getAll, ...(rows.map((row) => [
        getOne(row.original.UUID), invitationGetOne(row.original.invitationId)
        ]).flatMap((e)=>e))
    ]])
})
