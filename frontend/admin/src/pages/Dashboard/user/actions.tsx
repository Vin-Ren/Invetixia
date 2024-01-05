import { UserSanitized } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/user";
import { queryClient } from "@/lib/api";
import { deleteOne } from "@/lib/api/user";
import { DeleteDialogAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";


export const UserViewDetailsAction = () => ViewDetailsAction((row: Row<UserSanitized>) => `/dashboard/user/${row.original.UUID}`);

export const UserViewOrganisationAction = () => ViewDetailsAction((row: Row<UserSanitized>) => `/dashboard/organisation/${row.original.organisationId}`, "View user's organisation details");

export const UserDeleteAction = () => DeleteDialogAction<UserSanitized>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getAll);
        queryClient.invalidateQueries(getOne(row.original.UUID));
    }
});
