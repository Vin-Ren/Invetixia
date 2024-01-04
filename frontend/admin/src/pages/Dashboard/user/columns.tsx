import { DataTableColumnHeader } from "@/components/data-table";
import { UserSanitized } from "@/lib/api/data-types";
import { DataTableActionsCell, DataTableActionsHeader, getDataTableSelectRowsColumn, getGenericTableColumns } from "@/components/data-table-custom-columns";
import { Row, Table } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/user";
import { queryClient } from "@/main";
import { deleteMany, deleteOne } from "@/lib/api/user";


export const getUserTableColumns = getGenericTableColumns<UserSanitized>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        getDataTableSelectRowsColumn(),
        {
            id: "UUID",
            accessorKey: "UUID",
            header: DataTableColumnHeader
        },
        {
            id: "Username",
            accessorKey: "username",
            header: DataTableColumnHeader,
        },
        {
            id: "Role",
            accessorKey: "role_string",
            header: DataTableColumnHeader
        },
        {
            id: "Organisation Managed",
            accessorKey: "organisationManaged.name",
            header: DataTableColumnHeader
        },
        {
            id: "actions",
            header: ({ table }: { table: Table<UserSanitized> }) => {
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
            cell: ({ row }: { row: Row<UserSanitized> }) => {
                return (
                    <DataTableActionsCell
                        row={row}
                        getDetailsPageUrl={(row) => `/dashboard/user/${row.original.UUID}`}
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
