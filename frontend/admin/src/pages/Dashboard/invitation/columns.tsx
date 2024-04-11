import { DataTableColumnHeader } from "@/components/data-table";
import { Invitation } from "@/lib/api/data-types";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column";
import { InvitationViewDetailsAction, InvitationDeleteAction, InvitationHeaderDeleteAction, InvitationEditAction, InvitationViewOrganisationAction } from "./actions";


export const getInvitationTableColumns = getGenericTableColumns<Invitation>(
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
            id: "Publisher Organisation",
            accessorKey: "publisher.name",
            header: DataTableColumnHeader
        },
        {
            id: "Usage Quota",
            accessorKey: "usageQuota",
            header: DataTableColumnHeader
        },
        {
            id: "Usage Left",
            accessorKey: "usageLeft",
            header: DataTableColumnHeader
        },
        {
            id: "actions",
            header: ({ table }) => {
                return (
                    <DataTableActionsHeader
                        table={table}
                        actions={[
                            InvitationHeaderDeleteAction()
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
                            InvitationViewDetailsAction(),
                            InvitationViewOrganisationAction(),
                            InvitationEditAction(),
                            InvitationDeleteAction()
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
