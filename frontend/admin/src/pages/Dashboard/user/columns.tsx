import { DataTableColumnHeader } from "@/components/data-table";
import { UserSanitized } from "@/lib/api/data-types";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column";
import { Row, Table } from "@tanstack/react-table";
import { UserViewDetailsAction, UserViewOrganisationAction, UserDeleteAction, UserHeaderDeleteAction, UserEditAction } from "./actions";
import { Link } from "react-router-dom";


export const getUserTableColumns = getGenericTableColumns<UserSanitized>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        getDataTableSelectRowsColumn(),
        {
            id: "UUID",
            accessorKey: "UUID",
            header: DataTableColumnHeader,
            cell: ({row}) => (<Link to={`/dashboard/user/details/${row.original.UUID}`}>{row.original.UUID}</Link>)
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
                        actions={[
                            UserHeaderDeleteAction()
                        ]}
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
                            UserEditAction(),
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
