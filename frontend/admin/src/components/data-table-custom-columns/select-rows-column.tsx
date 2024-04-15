import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";


export function getDataTableSelectRowsColumn<TData, TValue>(): ColumnDef<TData, TValue> {
    return (
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all" />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row" />
            ),
            enableSorting: false,
            enableHiding: false,
        }
    );
}
