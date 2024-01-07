import { DataTableColumnHeader } from "@/components/data-table"
import { Organisation } from "@/lib/api/data-types"
import { Row, Table } from "@tanstack/react-table"
import { deleteMany } from "@/lib/api/organisation"
import { queryClient } from "@/lib/api"
import { getAll, getOne } from "@/lib/queries/organisation"
import { getGenericTableColumns } from "@/components/data-table-custom-columns"
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell"
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header"
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column"
import { OrganisationHeaderDeleteAction, OrganisationViewDetailsAction } from "./actions"
import { OrganisationDeleteAction } from "./actions"
import { OrganisationEditAction } from "./actions"


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
                        actions={[
                            OrganisationHeaderDeleteAction()
                        ]}
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
