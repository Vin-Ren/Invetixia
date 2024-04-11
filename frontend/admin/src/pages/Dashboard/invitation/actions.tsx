import { Invitation } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/invitation";
import { queryClient } from "@/lib/api";
import { deleteOne, deleteMany, updateOne } from "@/lib/api/invitation";
import { DeleteDialogAction, GenericNavigatorButtonAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { Building2, PencilIcon } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


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
        return await updateOne({UUID: row.original.UUID, name: "", organisationId: "", usageQuota: 0, ...(getDialogData?.() || {})})
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
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getAll);
        queryClient.invalidateQueries(getOne(row.original.UUID));
    }
});

export const InvitationHeaderDeleteAction = () => HeaderDeleteDialogAction<Invitation>({
    deleteHandler: async ({rows}) => await deleteMany(rows.map((row) => row.original.UUID)),
    queriesInvalidator: (rows) => {
        queryClient.invalidateQueries(getAll)
        rows.map((row) => queryClient.invalidateQueries(getOne(row.original.UUID)))
    }
})
