import { Invitation } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/invitation";
import { queryClient } from "@/lib/api";
import { deleteOne, deleteMany, updateOne } from "@/lib/api/invitation";
import { DeleteDialogAction, GenericNavigatorButtonAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { Building2, Mail, PencilIcon, Plus } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendInvitation } from "@/lib/api/email";


export const InvitationViewDetailsAction = () => ViewDetailsAction((row: Row<Invitation>) => `/dashboard/invitation/details/${row.original.UUID}`);

export const InvitationViewOrganisationAction = () => GenericNavigatorButtonAction({
    actionId: "view_invitation_organisation",
    getTo: (row: Row<Invitation>) => `/dashboard/organisation/details/${row.original.organisationId}`,
    triggerNode: (
        <>
            <Building2 className="mr-2 w-4 h-4" />
            View ticket's invitation details
        </>
    )
});


export const InvitationSendEmailAction = (): CellDialogAction<Invitation, { to: { recipient: string, idx: number }[] }> => ({
    actionType: "dialog",
    actionId: "quick-email-item",
    triggerNode: (
        <>
            <Mail className="mr-2 h-4 w-4" />
            Send invitation email
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await sendInvitation({ UUID: row.original.UUID, to: (getDialogData?.().to.map((e) => (e.recipient))?.flatMap((e) => e).filter((e) => e.includes('@'))) || [] })
    },
    initializeDialogData: ({ setDialogData }) => { setDialogData({ to: [] }) },
    queriesInvalidator: () => { },
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Send invitation email</DialogTitle>
                    <DialogDescription>
                        Send an email containing this invitation.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Recipients</Label>
                        <div className="col-span-3 grid grid-flow-row gap-2">
                            {
                                getDialogData?.().to?.map((toe) => (
                                    <Input className="col-span-3"
                                        value={toe.recipient}
                                        onChange={(e) => setDialogData((data) => ({
                                            ...data, to: [...(data?.to?.filter((e) => e.idx < toe.idx) || []),
                                            { idx: toe.idx, recipient: e.target.value },
                                            ...(data?.to?.filter((e) => e.idx > toe.idx) || [])]
                                        }))}></Input>
                                )
                                )
                            }
                            <Button variant={'secondary'} className="w-full" onClick={() => setDialogData((data) => {
                                return { ...data, to: [...(data?.to || []), { idx: data?.to?.length || 0, recipient: "" }] }
                            })}>
                                <Plus />
                                Add Recipient
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler({ actionId: 'quick-email-item', row })}>Send</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )
    },
    toasts: {
        onSuccess: () => ({
            title: "Successfully sent the email!"
        }),
        onFailure: () => ({
            title: "Failed to sent the email!",
            variant: "destructive"
        })
    }
})


export const InvitationEditAction = (): CellDialogAction<Invitation, { name?: string, organisationId?: string, usageQuota?: number }> => ({
    actionType: "dialog",
    actionId: "quick-edit-item",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne({ UUID: row.original.UUID, name: "", organisationId: "", usageQuota: 0, ...(getDialogData?.() || {}) })
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ name: row.original.name, organisationId: row.original.organisationId, usageQuota: (row.original.usageQuota || 0) }) },
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]]),
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Invitation</DialogTitle>
                    <DialogDescription>
                        Make quick changes to the invitation here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Name</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().name || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, name: e.target.value }))}></Input>
                        <Label>Organisation Id</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().organisationId || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, organisationId: e.target.value }))}></Input>
                        <Label>Usage Quota</Label>
                        <Input className="col-span-3"
                            value={(getDialogData?.().usageQuota) ? (getDialogData?.().usageQuota)?.toString() : ''}
                            onChange={(e) => setDialogData((data) => ({ ...data, usageQuota: parseInt(e.target.value || '0') }))}></Input>
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
            title: "Successfully updated the invitation!"
        }),
        onFailure: () => ({
            title: "Failed to update the invitation!",
            variant: "destructive"
        })
    }
})

export const InvitationDeleteAction = () => DeleteDialogAction<Invitation>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]])
});

export const InvitationHeaderDeleteAction = () => HeaderDeleteDialogAction<Invitation>({
    deleteHandler: async ({ rows }) => await deleteMany(rows.map((row) => row.original.UUID)),
    queriesInvalidator: (rows) => ([queryClient, [getAll, ...rows.map((row) => getOne(row.original.UUID))]])
})
