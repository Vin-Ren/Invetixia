import { NavigateFunction, useNavigate } from "react-router-dom";
import { Toast, useToast } from "./ui/use-toast";
import useDS from "@/hooks/useDS";
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useEffect } from "react";
import { InvalidateQueryFilters, QueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { isFunction } from "@tanstack/react-table";
import { PlusIcon, TrashIcon } from "lucide-react";

export type QueriesInvalidatorType = () => [QueryClient, InvalidateQueryFilters[]] | Promise<void> | void;

export interface ActionHandlerProps<TDialogData = object> {
    navigate: NavigateFunction,
    getDialogData: () => TDialogData
}
export type ActionHandlerType<TDialogData = object> = (props: ActionHandlerProps<TDialogData>) => boolean | void | Promise<boolean | void>;

export interface InitializeDialogDataProps<TDialogData> {
    setDialogData: (dialogData: TDialogData) => void
}
export type InitializeDialogDataType<TDialogData = object> = (props: InitializeDialogDataProps<TDialogData>) => void;

export type InternalActionHandlerType = () => Promise<void>;

export interface DialogContentProps<TDialogData> {
    internalActionHandler: InternalActionHandlerType,
    getDialogData: () => TDialogData,
    setDialogData: React.Dispatch<React.SetStateAction<TDialogData | undefined>>
}
export type DialogContentType<TDialogData = object> = (props: DialogContentProps<TDialogData>) => React.ReactNode

export interface DialogToastProps<TDialogData> {
    getDialogData: () => TDialogData
}

export interface DialogButtonProps<TDialogData = object> {
    triggerNode: React.ReactNode | React.ReactNode[],
    actionHandler: ActionHandlerType<TDialogData>,
    queriesInvalidator: QueriesInvalidatorType,
    initializeDialogData?: InitializeDialogDataType<TDialogData>,
    dialogContent: DialogContentType<TDialogData>,
    postSuccessActionHandler?: ActionHandlerType<TDialogData>,
    toasts?: {
        onSuccess?: (props: DialogToastProps<TDialogData>) => Toast,
        onFailure?: (props: DialogToastProps<TDialogData>) => Toast
    }
}


export function DialogButton<TDialogData = object>({
    triggerNode,
    actionHandler,
    queriesInvalidator,
    initializeDialogData,
    dialogContent,
    postSuccessActionHandler,
    toasts
}: DialogButtonProps<TDialogData>
) {
    const navigate = useNavigate()
    const { toast } = useToast()
    const ds = useDS<TDialogData[]>();
    const dataGetter = ds.createGetter('')
    const dataSetter = ds.createSetter('')

    const handleAction = async () => {
        const success = await actionHandler({ navigate, getDialogData: dataGetter })
        if (success) {
            if (toasts?.onSuccess) {
                toast(toasts?.onSuccess?.({ getDialogData: dataGetter }))
            }
            const queriesInvalidatorRetval = await queriesInvalidator?.();
            if (queriesInvalidatorRetval === undefined) return;
            queriesInvalidatorRetval[1].map((query) => queriesInvalidatorRetval[0].invalidateQueries(query));
            await postSuccessActionHandler?.({ navigate, getDialogData: dataGetter })
        } else if (toasts?.onFailure) {
            toast(toasts?.onFailure?.({ getDialogData: dataGetter }))
        }
    }

    useEffect(() => {
        initializeDialogData?.({ setDialogData: dataSetter })
    }, [])

    return (
        <Dialog>
            <DialogTrigger>
                {triggerNode}
            </DialogTrigger>
            {dialogContent({ internalActionHandler: handleAction, getDialogData: dataGetter, setDialogData: dataSetter as never })}
        </Dialog>
    )
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericDialogConfirmActionDialogOptions<TDialogData = any> {
    title?: string | ((props: DialogContentProps<TDialogData>) => string),
    description?: string | ((props: DialogContentProps<TDialogData>) => string),
    confirmButtonLabel?: string,
    confirmButtonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"
}

export interface GenericDialogConfirmActionProps<TDialogData> {
    actionHandler: ActionHandlerType<TDialogData>
    queriesInvalidator?: QueriesInvalidatorType,
    triggerNode: React.ReactNode | React.ReactNode[],
    dialogOptions?: GenericDialogConfirmActionDialogOptions<TDialogData>,
    postSuccessActionHandler?: ActionHandlerType<TDialogData>,
    toasts: {
        onSuccess?: (props: DialogToastProps<TDialogData>) => Toast,
        onFailure?: (props: DialogToastProps<TDialogData>) => Toast
    }
}


export function GenericDialogConfirmButton<
    TDialogData
>({
    actionHandler,
    queriesInvalidator = () => { },
    triggerNode,
    dialogOptions = {},
    postSuccessActionHandler,
    toasts = {}
}: GenericDialogConfirmActionProps<TDialogData>) {
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

    return DialogButton({
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
                                onClick={async () => await props.internalActionHandler()}>
                                {dialogOptions.confirmButtonLabel}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )
        },
        postSuccessActionHandler,
        toasts
    })
}


export interface GenericDetailsDeleteButtonProps {
    UUID: string,
    deleteHandler: () => boolean | Promise<boolean>,
    queriesInvalidator?: QueriesInvalidatorType
}

export function GenericDetailsDeleteButton({
    UUID,
    deleteHandler,
    queriesInvalidator
}: GenericDetailsDeleteButtonProps) {
    return GenericDialogConfirmButton({
        actionHandler: async () => await deleteHandler(),
        triggerNode: (
            <Button variant={"destructive"}>
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
            </Button>
        ),
        postSuccessActionHandler: ({ navigate }) => navigate('../'),
        queriesInvalidator,
        dialogOptions: {
            title: "Confirm Deletion",
            description: "The deleted item is not going to be recoverable afterwards. Are you sure you would like to proceed?",
        },
        toasts: {
            onSuccess: () => ({
                title: "Deleted the item!",
                description: `Successfully deleted the item [UUID=${UUID}].`
            }),
            onFailure: () => ({
                title: "Failed to delete the item",
                variant: "destructive"
            })
        }
    })
}


export function GenericIndexCreateButton() {
    const navigate = useNavigate()
    const handleNavigate = () => navigate('create')
    return (
        <div className="flex flex-col w-full">
            <div className="place-self-end flex flex-row">
                <Button variant={"outline"} size={"sm"} onClick={handleNavigate} className="ml-auto hidden h-8 lg:flex">
                    <PlusIcon className="mr-2 h-4 w-4"/>
                    Create
                </Button>
            </div>
        </div>
    )
}

