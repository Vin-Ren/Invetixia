import { EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";
import { CellDialogAction, CellButtonAction } from "./actions-cell";
import { To } from "react-router-dom";
import { Row } from "@tanstack/react-table";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";


export function ViewDetailsAction<TData>(
    getDetailsPageUrl: (row: Row<TData>) => To,
    label?: string,
): CellButtonAction<TData> {
    return ({
        actionType: 'button',
        actionId: "view_details",
        triggerNode: (
            <>
                <EyeOpenIcon className="mr-2 h-4 w-4" />
                {label ? label : "View details"}
            </>
        ),
        actionHandler: ({ row, navigate }) => navigate(getDetailsPageUrl(row))
    })
}


export function DeleteDialogAction<
    TData extends { UUID: string }
>({
    deleteOne,
    queriesInvalidator
}: {
    deleteOne: (props: { row: Row<TData> }) => Promise<boolean>,
    queriesInvalidator: (row: Row<TData>) => void
}): CellDialogAction<TData> {
    return ({
        actionType: 'dialog',
        actionId: "delete",
        triggerNode: (
            <>
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete item
            </>
        ),
        actionHandler: deleteOne,
        queriesInvalidator,
        dialogContent: ({ row, internalActionHandler }) => {
            return (
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm deletion</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The deleted item [UUID={row.original.UUID}] is not going to be recoverable afterwards. Are you sure you would like to proceed?
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
            onSuccess: ({row}) => ({
                title: "Deleted item!",
                description: `Successfully deleted an item [UUID=${row.original.UUID}].`
            }),
            onFailure: () => ({
                title: "Failed to delete item",
                variant: "destructive"
            }),
        }
    })
}
