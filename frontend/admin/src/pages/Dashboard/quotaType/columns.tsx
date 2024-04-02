import { DataTableColumnHeader } from "@/components/data-table";
import { QuotaType } from "@/lib/api/data-types";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column";
import { QuotaTypeViewDetailsAction, QuotaTypeDeleteAction, QuotaTypeHeaderDeleteAction } from "./actions";


export const getQuotaTypeTableColumns = getGenericTableColumns<QuotaType>(
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
            header: DataTableColumnHeader,
        },
        {
            id: "Description",
            accessorKey: "description",
            header: DataTableColumnHeader
        },
        {
            id: "actions",
            header: ({ table }) => {
                return (
                    <DataTableActionsHeader
                        table={table}
                        actions={[
                            QuotaTypeHeaderDeleteAction()
                        ]}
                        {...actionsHeaderProps}
                    />
                )
            },
            cell: ({ row }) => {
                return (
                    <DataTableActionsCell
                        row={row}
                        actions={[
                            QuotaTypeViewDetailsAction(),
                            QuotaTypeDeleteAction()
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
