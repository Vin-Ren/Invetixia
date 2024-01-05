import { DataTableColumnHeader } from "@/components/data-table"
import { Organisation } from "@/lib/api/data-types"
import { Row, Table } from "@tanstack/react-table"
import { deleteMany, deleteOne, updateOne } from "@/lib/api/organisation"
import { queryClient } from "@/lib/api"
import { getAll, getOne } from "@/lib/queries/organisation"
import { getGenericTableColumns } from "@/components/data-table-custom-columns"
import { DataTableActionsCell, CellDialogAction } from "@/components/data-table-custom-columns/actions-cell"
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header"
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column"
import { DeleteDialogAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions"
import { PencilIcon } from "lucide-react"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormItem } from "@/components/ui/form"


export const OrganisationViewDetailsAction = () => ViewDetailsAction((row: Row<Organisation>) => `/dashboard/organisation/${row.original.UUID}`)
export const OrganisationDeleteAction = () => DeleteDialogAction<Organisation>({
    deleteOne: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getAll)
        queryClient.invalidateQueries(getOne(row.original.UUID))
    }
})
export const OrganisationEditAction = (): CellDialogAction<Organisation, { newName: string }> => ({
    actionType: "dialog",
    actionId: "edit-organisation",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne(row.original.UUID, getDialogData?.().newName || "")
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ newName: row.original.name }) },
    queriesInvalidator: (row) => { [getAll, getOne(row.original.UUID)].map((query) => queryClient.invalidateQueries(query)) },
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm deletion</DialogTitle>
                    <DialogDescription>
                        Make changes to the organisation here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <FormItem className="w-full">
                        <Label>Organisation Name</Label>
                        <Input value={getDialogData?.().newName || ""} onChange={(e) => setDialogData((data) => ({ ...data, newName: e.target.value }))}></Input>
                        <DialogClose asChild>
                            <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler({ actionId: 'edit-organisation', row })}>Save</Button>
                        </DialogClose>
                    </FormItem>
                </DialogFooter>
            </DialogContent>
        )
    },
    toasts: {
        onSuccess: () => ({
            title: "Successfully updated the organisation!"
        }),
        onFailure: () => ({
            title: "Failed to update the organisation!",
            variant: "destructive"
        })
    }
})


export const getOrganisationTableColumns = getGenericTableColumns<Organisation>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        getDataTableSelectRowsColumn(),
        {
            id: "UUID",
            accessorKey: "UUID",
            header: DataTableColumnHeader
        },
        {
            id: "Name",
            accessorKey: "name",
            header: DataTableColumnHeader
        },
        {
            id: "Manager",
            accessorKey: "top_manager",
            header: DataTableColumnHeader
        },
        {
            id: "actions",
            header: ({ table }: { table: Table<Organisation> }) => {
                return (
                    <DataTableActionsHeader
                        table={table}
                        deleteSelected={async (rows) => await deleteMany(rows.map((row) => row.original.UUID))}
                        queriesInvalidator={(rows) => {
                            queryClient.invalidateQueries(getAll)
                            rows.map((row) => queryClient.invalidateQueries(getOne(row.original.UUID)))
                        }}
                        {...actionsHeaderProps}
                    />
                )
            },
            cell: ({ row }: { row: Row<Organisation> }) => {
                return (
                    <DataTableActionsCell
                        row={row}
                        actions={[
                            OrganisationViewDetailsAction(),
                            OrganisationEditAction(),
                            OrganisationDeleteAction()
                        ]}
                        {...actionsCellProps}
                    />
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
    ])
)
