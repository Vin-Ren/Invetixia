import { DefaultQuota } from "@/lib/api/data-types";
import { getOne } from "@/lib/queries/defaultQuota";
import { queryClient } from "@/lib/api";
import { deleteOne, updateOne } from "@/lib/api/defaultQuota";
import { DeleteDialogAction } from "@/components/data-table-custom-columns/cell-actions";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { PencilIcon } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


export const DefaultQuotaEditAction = (): CellDialogAction<DefaultQuota, { quotaTypeId?: string, value?: number }> => ({
    actionType: "dialog",
    actionId: "quick-edit-item",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne({ UUID: row.original.UUID, quotaTypeId: '', value: 0, ...(getDialogData?.() || {})})
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ quotaTypeId: row.original.quotaTypeId, value: row.original.value }) },
    queriesInvalidator: (row) => ([queryClient, [getOne(row.original.UUID)]]),
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Default Quota</DialogTitle>
                    <DialogDescription>
                        Make changes to the default quota here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Quota Type UUID</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().quotaTypeId || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, newName: e.target.value }))}></Input>
                        <Label>Description</Label>
                        <Textarea className="col-span-3"
                            value={(getDialogData?.().value) ? (getDialogData?.().value)?.toString() : ''}
                            onChange={(e) => setDialogData((data) => ({ ...data, value: parseInt(e.target.value || '0') }))}></Textarea>
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

export const DefaultQuotaDeleteAction = () => DeleteDialogAction<DefaultQuota>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getOne(row.original.UUID));
    }
});

// export const DefaultQuotaHeaderDeleteAction = () => HeaderDeleteDialogAction<DefaultQuota>({
//     deleteHandler: async ({rows}) => await deleteMany(rows.map((row) => row.original.UUID)),
//     queriesInvalidator: (rows) => {
//         queryClient.invalidateQueries(getAll)
//         rows.map((row) => queryClient.invalidateQueries(getOne(row.original.UUID)))
//     }
// })