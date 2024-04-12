import { Quota } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/quota";
import { queryClient } from "@/lib/api";
import { deleteOne, deleteMany, updateOne } from "@/lib/api/quota";
import { DeleteDialogAction, GenericNavigatorButtonAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { PencilIcon, Tags, Ticket } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export const QuotaViewDetailsAction = () => ViewDetailsAction((row: Row<Quota>) => `/dashboard/quota/details/${row.original.UUID}`);

export const QuotaViewQuotaTypeAction = () => GenericNavigatorButtonAction({
    actionId: "view_quota_quotaType",
    getTo: (row: Row<Quota>) => `/dashboard/quotaType/details/${row.original.quotaTypeId}`,
    triggerNode: (
        <>
            <Tags className="mr-2 w-4 h-4" />
            View quota's type details
        </>
    )
});

export const QuotaViewTicketAction = () => GenericNavigatorButtonAction({
    actionId: "view_quota_ticket",
    getTo: (row: Row<Quota>) => `/dashboard/ticket/details/${row.original.ticketId}`,
    triggerNode: (
        <>
            <Ticket className="mr-2 w-4 h-4" />
            View quota's ticket details
        </>
    )
});


export const QuotaEditAction = (): CellDialogAction<Quota, { quotaTypeId?: string, usageLeft?: number }> => ({
    actionType: "dialog",
    actionId: "quick-edit-item",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne({UUID: row.original.UUID, quotaTypeId: row.original.quotaType?.UUID as string, usageLeft: 0, ...(getDialogData?.() || {})})
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ quotaTypeId: row.original.quotaType?.UUID as string, usageLeft: (row.original.usageLeft || 0) }) },
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]]),
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Quota</DialogTitle>
                    <DialogDescription>
                        Make quick changes to the quota here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Quota Type Id</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().quotaTypeId || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, quotaTypeId: e.target.value }))}></Input>
                        <Label>Usage Left</Label>
                        <Input className="col-span-3"
                            value={(getDialogData?.().usageLeft) ? (getDialogData?.().usageLeft)?.toString() : ''}
                            onChange={(e) => setDialogData((data) => ({ ...data, usageLeft: parseInt(e.target.value || '0') }))}></Input>
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
            title: "Successfully updated the quota!"
        }),
        onFailure: () => ({
            title: "Failed to update the quota!",
            variant: "destructive"
        })
    }
})

export const QuotaDeleteAction = () => DeleteDialogAction<Quota>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getAll);
        queryClient.invalidateQueries(getOne(row.original.UUID));
    }
});

export const QuotaHeaderDeleteAction = () => HeaderDeleteDialogAction<Quota>({
    deleteHandler: async ({rows}) => await deleteMany(rows.map((row) => row.original.UUID)),
    queriesInvalidator: (rows) => {
        queryClient.invalidateQueries(getAll)
        rows.map((row) => queryClient.invalidateQueries(getOne(row.original.UUID)))
    }
})
