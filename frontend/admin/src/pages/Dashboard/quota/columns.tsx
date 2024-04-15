import { DataTableColumnHeader } from "@/components/data-table";
import { Quota, QuotaWithTicketOrganisationInfo, Ticket } from "@/lib/api/data-types";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { getDataTableSelectRowsColumn } from "@/components/data-table-custom-columns/select-rows-column";
import { QuotaViewDetailsAction, QuotaDeleteAction, QuotaHeaderDeleteAction, QuotaEditAction, QuotaViewQuotaTypeAction, QuotaViewTicketAction } from "./actions";
import { Link } from "react-router-dom";


export const getQuotaTableColumns = getGenericTableColumns<Quota>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        getDataTableSelectRowsColumn(),
        {
            id: "UUID",
            accessorKey: "UUID",
            header: DataTableColumnHeader,
            cell: ({row}) => (<Link to={`/dashboard/quota/details/${row.original.UUID}`}>{row.original.UUID}</Link>)
        },
        {
            id: "Quota Type",
            accessorKey: "quotaType.name",
            header: DataTableColumnHeader,
        },
        {
            id: "Ticket Owner",
            accessorKey: "ticket.ownerName",
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
                            QuotaHeaderDeleteAction()
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
                            QuotaViewDetailsAction(),
                            QuotaViewQuotaTypeAction(),
                            QuotaViewTicketAction(),
                            QuotaEditAction(),
                            QuotaDeleteAction()
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


export const getQuotaFilteredByOrganisationAndQuotaTypeTableColumns = getGenericTableColumns<QuotaWithTicketOrganisationInfo>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        getDataTableSelectRowsColumn(),
        {
            id: "UUID",
            accessorKey: "UUID",
            header: DataTableColumnHeader,
            cell: ({row}) => (<Link to={`/dashboard/quota/details/${row.original.UUID}`}>{row.original.UUID}</Link>)
        },
        {
            id: "Ticket Owner",
            accessorKey: "ticket.ownerName",
            header: DataTableColumnHeader
        },
        {
            id: "Quota Type",
            accessorKey: "quotaType.name",
            header: DataTableColumnHeader,
        },
        {
            id: "Affiliated Organisation",
            accessorKey: "ticket.ownerAffiliation.name",
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
                            QuotaHeaderDeleteAction()
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
                            QuotaViewDetailsAction(),
                            QuotaViewQuotaTypeAction(),
                            QuotaViewTicketAction(),
                            QuotaEditAction(),
                            QuotaDeleteAction()
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
