import { Row, RowSelectionState, Table } from "@tanstack/react-table";
import { useToast } from "../ui/use-toast";
import { Toast } from "../ui/use-toast";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import useDS from "@/hooks/useDS";
import { arrayToKeyObject } from "@/lib/utils";
import { useMemo, useState } from "react";
import { BaseAction } from "./commons";

export interface ActionHandlerProps<TData, TDialogData = object> {
    rows: Row<TData>[],
    navigate: NavigateFunction,
    getDialogData?: () => TDialogData
}
export type ActionHandlerType<TData, TDialogData = object> = (props: ActionHandlerProps<TData, TDialogData>) => boolean | void | Promise<boolean | void>;

export interface InitializeDialogDataProps<TData, TDialogData> {
    rows: Row<TData>[],
    setDialogData: (dialogData: TDialogData) => void
}
export type InitializeDialogDataType<TData, TDialogData = object> = (props: InitializeDialogDataProps<TData, TDialogData>) => void;

export interface InternalActionHandlerProps<TData> {
    actionId: string,
    rows: Row<TData>[]
}
export type InternalActionHandlerType<TData> = (props: InternalActionHandlerProps<TData>) => Promise<void>;

export interface DialogContentProps<TData, TDialogData> {
    rows: Row<TData>[],
    internalActionHandler: InternalActionHandlerType<TData>,
    getDialogData: () => TDialogData,
    setDialogData: React.Dispatch<React.SetStateAction<TDialogData | undefined>>
}
export type DialogContentType<TData, TDialogData = object> = (props: DialogContentProps<TData, TDialogData>) => React.ReactNode

export interface BaseToastProps<TData> {
    rows: Row<TData>[]
}
export type BaseToast<TData> = (props:BaseToastProps<TData>) => Toast

export interface DialogToastProps<TData, TDialogData> extends BaseToastProps<TData> {
    getDialogData: () => TDialogData
}



export type HeaderBaseAction<TData> = BaseAction<Row<TData>[], BaseToast<TData>>


export interface HeaderButtonAction<TData> extends HeaderBaseAction<TData> {
    actionType: 'button';
    actionHandler: ActionHandlerType<TData>
}


export interface HeaderDropdownAction<TData> extends HeaderBaseAction<TData> {
    actionType: 'dropdown';
    actionHandler: ActionHandlerType<TData>
}


export interface HeaderDialogAction<TData, TDialogData = object> extends Omit<HeaderBaseAction<TData>, "toasts"> {
    actionType: 'dialog';
    actionHandler: ActionHandlerType<TData, TDialogData>
    initializeDialogData?: InitializeDialogDataType<TData, TDialogData>
    dialogContent: DialogContentType<TData, TDialogData>;
    toasts?: {
        onSuccess?: (props: DialogToastProps<TData, TDialogData>) => Toast;
        onFailure?: (props: DialogToastProps<TData, TDialogData>) => Toast;
    };
}



export interface DataTableActionsHeaderProps<TData> {
    table: Table<TData>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions?: (HeaderButtonAction<TData> | HeaderDropdownAction<TData> | HeaderDialogAction<TData, any>)[];
    options?: {
        clearRowSelectionOnSuccess?: boolean
    };
}


export function DataTableActionsHeader<
    TData extends { UUID: string; }
>({
    table,
    actions = [],
    options = {}
}: DataTableActionsHeaderProps<TData>
) {
    options = { clearRowSelectionOnSuccess: true, ...options };

    // Hooks for actions
    const navigate = useNavigate();
    const ds = useDS<unknown[]>()
    const { toast } = useToast();

    const [targetActionDialog, setTargetActionDialog] = useState(() => ((actions.length > 0) ? actions[0].actionId : "delete"));

    const actionMapping = useMemo(() => {

        // For duplicate actionId check
        const actionIdSet = new Set<string>()

        // Initializing ds
        actions.forEach((action) => {
            if (actionIdSet.has(action.actionId)) {
                throw new Error(`Violation to actionId constraint{unique}.\nActions in a table action cell should all have unique ids.\nViolator actionId='${action.actionId}'`)
            }
            actionIdSet.add(action.actionId)
            if (action.actionType === 'dialog') {
                action.initializeDialogData?.({ rows: table.getSelectedRowModel().rows, setDialogData: ds.createSetter(action.actionId) });
            }
        })

        // Actually converting actions to records
        return arrayToKeyObject(actions, 'actionId');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actions]);


    const handleAction = async ({ actionId, rows }: InternalActionHandlerProps<TData>) => {
        let success = false;
        const action = actionMapping[actionId];
        switch (action.actionType) {
            case 'dialog':
                success = await action.actionHandler({ rows, navigate, getDialogData: ds.createGetter(action.actionId) }) as boolean;
                break;
            case 'button':
                success = await action.actionHandler({ rows, navigate }) as boolean;
                break;
            default:
                success = true;
        }

        if (success && options.clearRowSelectionOnSuccess) {
            table.setRowSelection(() => ({} as RowSelectionState));
        }

        if (success && action.toasts?.onSuccess !== undefined) {
            toast(action.toasts?.onSuccess?.({ rows, getDialogData: ds.createGetter(action.actionId) }) || {});

            const queriesInvalidatorRetval = await action.queriesInvalidator?.(rows);
            if (queriesInvalidatorRetval === undefined) return;

            queriesInvalidatorRetval[1].map((query) => queriesInvalidatorRetval[0].invalidateQueries(query));
        } else if (!success && action.toasts?.onFailure !== undefined) {
            toast(action.toasts?.onFailure?.({ rows, getDialogData: ds.createGetter(action.actionId) }) || {});
        }
    };

    return (
        <Dialog>
            <DropdownMenu>
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Actions</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Actions</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {actions.map((action) => {
                        switch (action.actionType) {
                            case 'button':
                                return (
                                    <DropdownMenuItem key={action.actionId} onClick={async () => await handleAction({ actionId: action.actionId, rows: table.getSelectedRowModel().rows })}>
                                        {action.triggerNode}
                                    </DropdownMenuItem>
                                );
                            case 'dialog':
                                return (
                                    <DialogTrigger key={action.actionId} asChild>
                                        <DropdownMenuItem onClick={() => setTargetActionDialog(action.actionId)}>
                                            {action.triggerNode}
                                        </DropdownMenuItem>
                                    </DialogTrigger>
                                );
                            default:
                                return (
                                    <DropdownMenuItem key={action.actionId} asChild>
                                        {action.triggerNode}
                                    </DropdownMenuItem>
                                );
                        }
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
            {(() => {
                const action = actionMapping[targetActionDialog];
                return actions.length > 0 && action.actionType === 'dialog'
                    ? action.dialogContent({
                        rows: table.getSelectedRowModel().rows,
                        internalActionHandler: handleAction,
                        getDialogData: ds.createGetter(action.actionId),
                        setDialogData: ds.createSetter(action.actionId)
                    })
                    : null;
            })()}
        </Dialog>
    );
}
