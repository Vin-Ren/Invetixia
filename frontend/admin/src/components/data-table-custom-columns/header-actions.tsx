import { Row, isFunction } from "@tanstack/react-table";
import { ActionHandlerType, DialogContentProps, DialogToastProps, HeaderDialogAction } from "./actions-header-experimental";
import { TrashIcon } from "lucide-react";
import { QueriesInvalidatorType } from "./commons";
import { Toast } from "../ui/use-toast";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericHeaderDialogConfirmActionDialogOptions<TData, TDialogData = any> {
    title?: string | ((props: DialogContentProps<TData, TDialogData>) => string),
    description?: string | ((props: DialogContentProps<TData, TDialogData>) => string),
    confirmButtonLabel?: string,
    confirmButtonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"
}

export interface GenericHeaderDialogConfirmActionProps<TData> {
    actionId: string,
    actionHandler: ActionHandlerType<TData>
    queriesInvalidator?: QueriesInvalidatorType<Row<TData>[]>,
    triggerNode: React.ReactNode | React.ReactNode[],
    dialogOptions?: GenericHeaderDialogConfirmActionDialogOptions<TData, object>,
    toasts: {
        onSuccess?: (props: DialogToastProps<TData, object>) => Toast,
        onFailure?: (props: DialogToastProps<TData, object>) => Toast
    }
}


export function GenericHeaderDialogConfirmAction<
    TData extends { UUID: string }
>({
    actionId,
    actionHandler,
    queriesInvalidator = () => { },
    triggerNode,
    dialogOptions = {},
    toasts = {}
}: GenericHeaderDialogConfirmActionProps<TData>): HeaderDialogAction<TData> {
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
                                onClick={async () => await props.internalActionHandler({ actionId, rows: props.rows })}>
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



export function HeaderDeleteDialogAction<
    TData extends { UUID: string }
>({
    deleteHandler,
    queriesInvalidator
}: {
    deleteHandler: (props: { rows: Row<TData>[] }) => Promise<boolean>,
    queriesInvalidator: (rows: Row<TData>[]) => void
}): HeaderDialogAction<TData> {
    return GenericHeaderDialogConfirmAction({
        actionId: 'delete',
        triggerNode: (
            <>
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete items
            </>
        ),
        actionHandler: deleteHandler,
        queriesInvalidator,
        dialogOptions: {
            title: "Confirm deletion",
            description: ({ rows }) => `This action cannot be undone. The ${rows.length} deleted items are not going to be recoverable afterwards. Are you sure you would like to proceed?`
        },
        toasts: {
            onSuccess: ({ rows }) => ({
                title: "Deleted items!",
                description: `Successfully deleted selected items [UUIDs=${rows.map((row) => row.original.UUID)}].`
            }),
            onFailure: () => ({
                title: "Failed to delete items",
                variant: "destructive"
            }),
        }
    })
}
