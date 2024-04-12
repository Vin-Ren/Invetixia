import { QuotaType } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/quotaType";
import { queryClient } from "@/lib/api";
import { deleteOne, deleteMany, updateOne } from "@/lib/api/quotaType";
import { DeleteDialogAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { PencilIcon } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


export const QuotaTypeViewDetailsAction = () => ViewDetailsAction((row: Row<QuotaType>) => `/dashboard/quotaType/details/${row.original.UUID}`);

export const QuotaTypeEditAction = (): CellDialogAction<QuotaType, { newName?: string, newDescription?: string }> => ({
    actionType: "dialog",
    actionId: "quick-edit-item",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne(row.original.UUID, getDialogData?.().newName || "", getDialogData?.().newDescription || "")
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ newName: row.original.name, newDescription: row.original.description }) },
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]]),
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Quota Type</DialogTitle>
                    <DialogDescription>
                        Make changes to the quota type here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Name</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().newName || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, newName: e.target.value }))}></Input>
                        <Label>Description</Label>
                        <Textarea className="col-span-3"
                            value={getDialogData?.().newDescription || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, newDescription: e.target.value }))}></Textarea>
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
            title: "Successfully updated the quota type!"
        }),
        onFailure: () => ({
            title: "Failed to update the quota type!",
            variant: "destructive"
        })
    }
})

export const QuotaTypeDeleteAction = () => DeleteDialogAction<QuotaType>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]])
});

export const QuotaTypeHeaderDeleteAction = () => HeaderDeleteDialogAction<QuotaType>({
    deleteHandler: async ({rows}) => await deleteMany(rows.map((row) => row.original.UUID)),
    queriesInvalidator: (rows) => ([queryClient, [getAll, ...rows.map((row) => getOne(row.original.UUID))]])
})
