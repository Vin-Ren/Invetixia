import { DataTableColumnHeader } from "@/components/data-table"
import { Organisation } from "@/lib/api/data-types"
import { Row, Table } from "@tanstack/react-table"
import { deleteMany, deleteOne } from "@/lib/api/organisation"
import { queryClient } from "@/main"
import { getAll, getOne } from "@/lib/queries/organisation"
import { getDataTableSelectRowsColumn, DataTableActionsCell, DataTableActionsHeader, getGenericTableColumns } from "@/components/data-table-custom-columns"


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
                        getDetailsPageUrl={(row) => `/dashboard/organisation/${row.original.UUID}`}
                        deleteSelected={async (row) => await deleteOne(row.original.UUID)}
                        queriesInvalidator={(row) => {
                            queryClient.invalidateQueries(getAll)
                            queryClient.invalidateQueries(getOne(row.original.UUID))
                        }}
                        {...actionsCellProps}
                    />
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
    ])
)
