import { DataTableColumnHeader } from "@/components/data-table";
import { UserSanitized } from "@/lib/api/data-types";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column";
import { Row, Table } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/user";
import { queryClient } from "@/lib/api";
import { deleteMany } from "@/lib/api/user";
import { UserViewDetailsAction, UserViewOrganisationAction, UserDeleteAction } from "./actions";


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
            id: "Organisation",
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
                        actions={[
                            UserViewDetailsAction(),
                            UserViewOrganisationAction(),
                            UserDeleteAction()
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
