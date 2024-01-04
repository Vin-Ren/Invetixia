import { ColumnDef, Row, RowSelectionState, Table } from "@tanstack/react-table"
import { useToast } from "./ui/use-toast"
import { Toast } from "./ui/use-toast"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Button } from "./ui/button"
import { MoreHorizontal, TrashIcon } from "lucide-react"
import { EyeOpenIcon } from "@radix-ui/react-icons"
import { To, useNavigate } from "react-router-dom"
import { Checkbox } from "./ui/checkbox"


export function getDataTableSelectRowsColumn<TData, TValue>(): ColumnDef<TData, TValue> {
    return (
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }
    )
}


export interface DataTableActionsHeaderProps<TData> {
    table: Table<TData>,
    deleteSelected: (rows: Row<TData>[]) => boolean | Promise<boolean>,
    successfulDeletionToastProps?: (table: Table<TData>) => Toast,
    failedDeletionToastProps?: (table: Table<TData>) => Toast,
    queriesInvalidator?: (rows: Row<TData>[]) => void,
    options?: {
        clearRowSelectionOnSuccess?: boolean
    }
}


export function DataTableActionsHeader<
    TData extends { UUID: string }
>({
    deleteSelected,
    table,
    successfulDeletionToastProps = (table) => ({
        title: "Deleted selected items!",
        description: `Deleted ${table.getSelectedRowModel().rows.length} items.`
    }),
    failedDeletionToastProps = () => ({
        title: "Failed to delete selected items",
        variant: "destructive"
    }),
    queriesInvalidator = () => null,
    options = {}
}: DataTableActionsHeaderProps<TData>
) {
    options = {clearRowSelectionOnSuccess: true, ...options}
    const { toast } = useToast()

    const handleDelete = async () => {
        const success = await deleteSelected(table.getSelectedRowModel().rows)
        if (success) {
            toast(successfulDeletionToastProps(table))
            queriesInvalidator(table.getSelectedRowModel().rows)
            if (options.clearRowSelectionOnSuccess) {
                table.setRowSelection(() => ({} as RowSelectionState))
            }
        } else {
            toast(failedDeletionToastProps(table))
        }
    }

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
                    <DialogTrigger asChild disabled={!(table.getSelectedRowModel().rows.length > 0)}>
                        <DropdownMenuItem>
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete {table.getSelectedRowModel().rows.length} selected items
                        </DropdownMenuItem>
                    </DialogTrigger>
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
    )
}


export interface DataTableActionsCellProps<TData> {
    row: Row<TData>,
    deleteSelected?: (row: Row<TData>) => boolean | Promise<boolean>,
    successfulDeletionToastProps?: (row: Row<TData>) => Toast,
    failedDeletionToastProps?: (row: Row<TData>) => Toast,
    queriesInvalidator?: (row: Row<TData>) => void,
    getDetailsPageUrl?: (row: Row<TData>) => To,
    options?: {
        enableViewDetails?: boolean,
        enableDeleteItem?: boolean,
        enableCopyUUID?: boolean,
    }
}


export function DataTableActionsCell<
    TData extends { UUID: string }
>({
    row,
    deleteSelected = () => false,
    successfulDeletionToastProps = () => ({
        title: "Deleted item!",
        description: `Successfully deleted one item.`
    }),
    failedDeletionToastProps = () => ({
        title: "Failed to delete item",
        variant: "destructive"
    }),
    queriesInvalidator = () => null,
    getDetailsPageUrl = () => "",
    options = {}
}: DataTableActionsCellProps<TData>) {
    options = { enableCopyUUID: true, enableViewDetails: true, enableDeleteItem: true, ...options }

    const navigate = useNavigate()
    const { toast } = useToast()

    const handleDelete = async () => {
        const success = await deleteSelected(row)
        if (success) {
            toast(successfulDeletionToastProps(row))
            queriesInvalidator(row)
        } else {
            toast(failedDeletionToastProps(row))
        }
    }

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
                    {
                        options.enableCopyUUID ?
                            <>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.UUID)}>
                                    Copy UUID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                            : null
                    }
                    {
                        options.enableViewDetails ?
                            <DropdownMenuItem onClick={() => navigate(getDetailsPageUrl(row))}>
                                <EyeOpenIcon className="mr-2 h-4 w-4" />
                                View details
                            </DropdownMenuItem>
                            : null
                    }
                    {
                        options.enableDeleteItem ?
                            <DialogTrigger asChild>
                                <DropdownMenuItem>
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete item
                                </DropdownMenuItem>
                            </DialogTrigger>
                            : null
                    }
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm deletion</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The deleted item is not going to be recoverable afterwards. Are you sure you would like to proceed?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"destructive"} onClick={handleDelete}>Confirm</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export interface getGenericTableColumnsProps<TData> {
    disableColumnsById?: ("select" | "actions" | ColumnDef<TData>['id'])[],
    actionsHeaderProps?: Omit<DataTableActionsHeaderProps<TData>, "table" | "deleteSelected" | "queriesInvalidator">,
    actionsCellProps?: Omit<DataTableActionsCellProps<TData>, "row" | "getDetailsPageUrl" | "deleteSelected" | "queriesInvalidator">
}

export function getGenericTableColumns<TData>(
    columnsGenerator: (_props: getGenericTableColumnsProps<TData>) => ColumnDef<TData>[]
): ((props?: getGenericTableColumnsProps<TData>) => ColumnDef<TData>[]) {
    return (props: getGenericTableColumnsProps<TData> = { disableColumnsById: [], actionsHeaderProps: {}, actionsCellProps: {} }): ColumnDef<TData>[] => {
        return columnsGenerator(props).filter(({ id = "" }) => !(props.disableColumnsById || []).includes(id))
    }
}
