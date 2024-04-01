import { QuotaType } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/quotaType";
import { queryClient } from "@/lib/api";
import { deleteOne } from "@/lib/api/quotaType";
import { DeleteDialogAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";


export const QuotaTypeViewDetailsAction = () => ViewDetailsAction((row: Row<QuotaType>) => `/dashboard/quotaType/details/${row.original.UUID}`);

export const QuotaTypeDeleteAction = () => DeleteDialogAction<QuotaType>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getAll);
        queryClient.invalidateQueries(getOne(row.original.UUID));
    }
});