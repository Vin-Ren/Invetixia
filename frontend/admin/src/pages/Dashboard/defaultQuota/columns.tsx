import { DataTableColumnHeader } from "@/components/data-table";
import { DefaultQuota } from "@/lib/api/data-types";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column";
import { Row, Table } from "@tanstack/react-table";
import { DefaultQuotaDeleteAction, DefaultQuotaEditAction } from "./actions";
// import { UserViewDetailsAction, UserViewOrganisationAction, UserDeleteAction, UserHeaderDeleteAction, UserEditAction } from "./actions";


export const getDefaultQuotaTable = getGenericTableColumns<DefaultQuota>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        getDataTableSelectRowsColumn(),
        {
            id: "UUID",
            accessorKey: "UUID",
            header: DataTableColumnHeader
        },
        {
            id: "Invitation",
            accessorKey: "invitation.name",
            header: DataTableColumnHeader,
        },
        {
            id: "Quota Type",
            accessorKey: "quotaType.name",
            header: DataTableColumnHeader
        },
        {
            id: "value",
            accessorKey: "value",
            header: DataTableColumnHeader
        },
        {
            id: "actions",
            header: ({ table }: { table: Table<DefaultQuota> }) => {
                return (
                    <DataTableActionsHeader
                        table={table}
                        actions={[
                            // UserHeaderDeleteAction()
                        ]}
                        {...actionsHeaderProps}
                    />
                )
            },
            cell: ({ row }: { row: Row<DefaultQuota> }) => {
                return (
                    <DataTableActionsCell
                        row={row}
                        actions={[
                            DefaultQuotaEditAction(),
                            DefaultQuotaDeleteAction()
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
