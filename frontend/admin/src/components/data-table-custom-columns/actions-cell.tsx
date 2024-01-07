import { Row } from "@tanstack/react-table";
import { useToast } from "../ui/use-toast";
import { Toast } from "../ui/use-toast";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ReactNode, useMemo, useState } from "react";
import { arrayToKeyObject } from "@/lib/utils";
import { InvalidateQueryFilters, QueryClient } from "@tanstack/react-query";
import useDS from "@/hooks/useDS";


export type QueriesInvalidatorType<TData> = (row: Row<TData>) => [QueryClient, InvalidateQueryFilters[]] | Promise<void> | void;

export interface ActionHandlerProps<TData, TDialogData = object> {
    row: Row<TData>,
    navigate: NavigateFunction,
    getDialogData?: () => TDialogData
}
export type ActionHandlerType<TData, TDialogData = object> = (props: ActionHandlerProps<TData, TDialogData>) => boolean | void | Promise<boolean | void>;

export interface InitializeDialogDataProps<TData, TDialogData> {
    row: Row<TData>,
    setDialogData: (dialogData: TDialogData) => void
}
export type InitializeDialogDataType<TData, TDialogData = object> = (props: InitializeDialogDataProps<TData, TDialogData>) => void;

export interface InternalActionHandlerProps<TData> {
    actionId: string,
    row: Row<TData>
}
export type InternalActionHandlerType<TData> = (props: InternalActionHandlerProps<TData>) => Promise<void>;

export interface DialogContentProps<TData, TDialogData> {
    row: Row<TData>,
    internalActionHandler: InternalActionHandlerType<TData>,
    getDialogData: () => TDialogData,
    setDialogData: React.Dispatch<React.SetStateAction<TDialogData | undefined>>
}
export type DialogContentType<TData, TDialogData = object> = (props: DialogContentProps<TData, TDialogData>) => ReactNode

export interface BaseToastProps<TData> {
    row: Row<TData>
}

export interface DialogToastProps<TData, TDialogData> extends BaseToastProps<TData> {
    getDialogData: () => TDialogData
}

export interface CellBaseAction<TData> {
    actionType: string;
    actionId: string;
    triggerNode: React.ReactNode | React.ReactNode[];
    queriesInvalidator?: QueriesInvalidatorType<TData>;
    toasts?: {
        onSuccess?: (props: BaseToastProps<TData>) => Toast;
        onFailure?: (props: BaseToastProps<TData>) => Toast;
    };
}


export interface CellButtonAction<TData> extends CellBaseAction<TData> {
    actionType: 'button';
    actionHandler: ActionHandlerType<TData>
}


export interface CellDropdownAction<TData> extends CellBaseAction<TData> {
    actionType: 'dropdown';
    actionHandler: ActionHandlerType<TData>
}


export interface CellDialogAction<TData, TDialogData = object> extends Omit<CellBaseAction<TData>, "toasts"> {
    actionType: 'dialog';
    actionHandler: ActionHandlerType<TData, TDialogData>
    initializeDialogData?: InitializeDialogDataType<TData, TDialogData>
    dialogContent: DialogContentType<TData, TDialogData>;
    toasts?: {
        onSuccess?: (props: DialogToastProps<TData, TDialogData>) => Toast;
        onFailure?: (props: DialogToastProps<TData, TDialogData>) => Toast;
    };
}


export interface DataTableActionsCellProps<TData> {
    row: Row<TData>;
    options?: {
        enableCopyUUID?: boolean;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions?: (CellButtonAction<TData> | CellDropdownAction<TData> | CellDialogAction<TData, any>)[];
}


export function DataTableActionsCell<
    TData extends { UUID: string; }
>({
    row, options = {}, actions = []
}: DataTableActionsCellProps<TData>) {
    options = { enableCopyUUID: true, ...options };

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
                action.initializeDialogData?.({ row, setDialogData: ds.createSetter(action.actionId) });
            }
        })

        // Actually converting actions to records
        return arrayToKeyObject(actions, 'actionId');
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actions]);


    const handleAction = async ({ actionId, row }: { actionId: string, row: Row<TData> }) => {
        let success = false;
        const action = actionMapping[actionId];
        switch (action.actionType) {
            case 'dialog':
                success = await action.actionHandler({ row, navigate, getDialogData: ds.createGetter(action.actionId) }) as boolean;
                break;
            case 'button':
                success = await action.actionHandler({ row, navigate }) as boolean;
                break;
            default:
                success = true;
        }

        if (success && action.toasts?.onSuccess !== undefined) {
            toast(action.toasts?.onSuccess?.({ row, getDialogData: ds.createGetter(action.actionId) }) || {});

            const queriesInvalidatorRetval = await action.queriesInvalidator?.(row);
            if (queriesInvalidatorRetval === undefined) return;

            queriesInvalidatorRetval[1].map((query) => queriesInvalidatorRetval[0].invalidateQueries(query));
        } else if (!success && action.toasts?.onFailure !== undefined) {
            toast(action.toasts?.onFailure?.({ row, getDialogData: ds.createGetter(action.actionId) }) || {});
        }
    };

    if (actions.length === 0 && !options.enableCopyUUID) return null

    return (
        <Dialog>
            <DropdownMenu>
                <TooltipProvider>
                    <Tooltip>
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
                    {options.enableCopyUUID ?
                        <>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.UUID)}>
                                Copy UUID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                        : null}
                    {actions.map((action) => {
                        switch (action.actionType) {
                            case 'button':
                                return (
                                    <DropdownMenuItem key={action.actionId} onClick={async () => await handleAction({ actionId: action.actionId, row })}>
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
                        row,
                        internalActionHandler: handleAction,
                        getDialogData: ds.createGetter(action.actionId),
                        setDialogData: ds.createSetter(action.actionId)
                    })
                    : null;
            })()}
        </Dialog>
    );
}
