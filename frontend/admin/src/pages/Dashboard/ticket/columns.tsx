import { DataTableColumnHeader } from "@/components/data-table";
import { Ticket } from "@/lib/api/data-types";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column";
import { TicketViewDetailsAction, TicketDeleteAction, TicketHeaderDeleteAction, TicketEditAction, TicketViewOrganisationAction, TicketViewInvitationAction } from "./actions";


export const getTicketTableColumns = getGenericTableColumns<Ticket>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        getDataTableSelectRowsColumn(),
        {
            id: "UUID",
            accessorKey: "UUID",
            header: DataTableColumnHeader
        },
        {
            id: "Owner Name",
            accessorKey: "ownerName",
            header: DataTableColumnHeader,
        },
        {
            id: "Affiliated Organisation",
            accessorKey: "ownerAffiliation.name",
            header: DataTableColumnHeader
        },
        {
            id: "Invited with",
            accessorKey: "invitation.name",
            header: DataTableColumnHeader
        },
        {
            id: "actions",
            header: ({ table }) => {
                return (
                    <DataTableActionsHeader
                        table={table}
                        actions={[
                            TicketHeaderDeleteAction()
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
                            TicketViewDetailsAction(),
                            TicketViewOrganisationAction(),
                            TicketViewInvitationAction(),
                            TicketEditAction(),
                            TicketDeleteAction()
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
