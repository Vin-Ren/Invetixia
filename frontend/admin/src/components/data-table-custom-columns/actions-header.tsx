import { Row, RowSelectionState, Table } from "@tanstack/react-table";
import { useToast } from "../ui/use-toast";
import { Toast } from "../ui/use-toast";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { MoreHorizontal, TrashIcon } from "lucide-react";



export interface DataTableActionsHeaderProps<TData> {
    table: Table<TData>;
    deleteSelected?: (rows: Row<TData>[]) => boolean | Promise<boolean>;
    successfulDeletionToastProps?: (table: Table<TData>) => Toast;
    failedDeletionToastProps?: (table: Table<TData>) => Toast;
    queriesInvalidator?: (rows: Row<TData>[]) => void;
    options?: {
        clearRowSelectionOnSuccess?: boolean,
        enableDeleteSelected?: boolean
    };
}


export function DataTableActionsHeader<
    TData extends { UUID: string; }
>({
    deleteSelected, table, successfulDeletionToastProps = (table) => ({
        title: "Deleted selected items!",
        description: `Deleted ${table.getSelectedRowModel().rows.length} items.`
    }), failedDeletionToastProps = () => ({
        title: "Failed to delete selected items",
        variant: "destructive"
    }), queriesInvalidator = () => null, options = {}
}: DataTableActionsHeaderProps<TData>
) {
    options = { clearRowSelectionOnSuccess: true, enableDeleteSelected: true, ...options };
    const { toast } = useToast();

    const handleDelete = async () => {
        const success = await deleteSelected?.(table.getSelectedRowModel().rows);
        if (success) {
            toast(successfulDeletionToastProps(table));
            queriesInvalidator(table.getSelectedRowModel().rows);
            if (options.clearRowSelectionOnSuccess) {
                table.setRowSelection(() => ({} as RowSelectionState));
            }
        } else {
            toast(failedDeletionToastProps(table));
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
                    <DropdownMenuSeparator />
                    {
                        options.enableDeleteSelected ?
                            <DialogTrigger asChild disabled={!(table.getSelectedRowModel().rows.length > 0)}>
                                <DropdownMenuItem>
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete {table.getSelectedRowModel().rows.length} selected items
                                </DropdownMenuItem>
                            </DialogTrigger>
                            : null
                    }
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The {table.getSelectedRowModel().rows.length} selected items are not going to be recoverable afterwards. Are you sure you would like to proceed?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"destructive"} onClick={handleDelete}>Confirm</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
