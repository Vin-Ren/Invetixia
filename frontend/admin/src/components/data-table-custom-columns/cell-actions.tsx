import { EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";
import { CellDialogAction, CellButtonAction, ActionHandlerType, QueriesInvalidatorType, DialogContentProps, DialogToastProps } from "./actions-cell";
import { To } from "react-router-dom";
import { Row, isFunction } from "@tanstack/react-table";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Toast } from "../ui/use-toast";


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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericDialogConfirmActionDialogOptions<TData, TDialogData = any> {
    title?: string | ((props: DialogContentProps<TData, TDialogData>) => string),
    description?: string | ((props: DialogContentProps<TData, TDialogData>) => string),
    confirmButtonLabel?: string,
    confirmButtonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"
}

export interface GenericDialogConfirmActionProps<TData> {
    actionId: string,
    actionHandler: ActionHandlerType<TData>
    queriesInvalidator?: QueriesInvalidatorType<TData>,
    triggerNode: React.ReactNode | React.ReactNode[],
    dialogOptions?: GenericDialogConfirmActionDialogOptions<TData, object>,
    toasts: {
        onSuccess?: (props: DialogToastProps<TData, object>) => Toast,
        onFailure?: (props: DialogToastProps<TData, object>) => Toast
    }
}


export function GenericDialogConfirmAction<
    TData extends { UUID: string }
>({
    actionId,
    actionHandler,
    queriesInvalidator = () => { },
    triggerNode,
    dialogOptions = {},
    toasts = {}
}: GenericDialogConfirmActionProps<TData>): CellDialogAction<TData> {
    dialogOptions = {
        title: "Confirm action",
        description: "Upon confirmation, The affected data will be lost. Are you sure to proceed?",
        confirmButtonLabel: "Confirm",
        confirmButtonVariant: "destructive",
        ...dialogOptions
    }
    toasts = {
        onSuccess: () => ({
            title: "Action completed successfully!"
        }),
        onFailure: () => ({
            title: "Action failed!",
            variant: "destructive"
        }),
        ...toasts
    }

    return ({
        actionType: 'dialog',
        actionId,
        triggerNode,
        actionHandler,
        queriesInvalidator,
        dialogContent: (props) => {
            return (
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isFunction(dialogOptions.title) ? dialogOptions.title(props) : dialogOptions.title}
                        </DialogTitle>
                        <DialogDescription>
                            {isFunction(dialogOptions.description) ? dialogOptions.description(props) : dialogOptions.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant={dialogOptions.confirmButtonVariant}
                                onClick={async () => await props.internalActionHandler({ actionId, row: props.row })}>
                                {dialogOptions.confirmButtonLabel}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )
        },
        toasts
    })
}



export function DeleteDialogAction<
    TData extends { UUID: string }
>({
    deleteHandler: deleteOne,
    queriesInvalidator
}: {
    deleteHandler: (props: { row: Row<TData> }) => Promise<boolean>,
    queriesInvalidator: (row: Row<TData>) => void
}): CellDialogAction<TData> {
    return GenericDialogConfirmAction({
        actionId: 'delete',
        triggerNode: (
            <>
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete item
            </>
        ),
        actionHandler: deleteOne,
        queriesInvalidator,
        dialogOptions: {
            title: "Confirm deletion",
            description: ({row}) => `This action cannot be undone. The deleted item [UUID=${row.original.UUID}] is not going to be recoverable afterwards. Are you sure you would like to proceed?`
        },
        toasts: {
            onSuccess: ({ row }) => ({
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
