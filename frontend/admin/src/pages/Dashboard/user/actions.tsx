import { UserSanitized } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/user";
import { queryClient } from "@/lib/api";
import { deleteMany, deleteOne } from "@/lib/api/user";
import { DeleteDialogAction, GenericNavigatorButtonAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { Building2 } from "lucide-react";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";


export const UserViewDetailsAction = () => ViewDetailsAction((row: Row<UserSanitized>) => `/dashboard/user/details/${row.original.UUID}`);

export const UserViewOrganisationAction = () => GenericNavigatorButtonAction({
    actionId: "view_user_organisation",
    getTo: (row: Row<UserSanitized>) => `/dashboard/organisation/details/${row.original.organisationId}`,
    triggerNode: (
        <>
            <Building2 className="mr-2 w-4 h-4" />
            View user's organisation details
        </>
    )
});

export const UserDeleteAction = () => DeleteDialogAction<UserSanitized>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getAll);
        queryClient.invalidateQueries(getOne(row.original.UUID));
    }
});

export const UserHeaderDeleteAction = () => HeaderDeleteDialogAction<UserSanitized>({
    deleteHandler: async ({rows}) => await deleteMany(rows.map((row) => row.original.UUID)),
    queriesInvalidator: (rows) => {
        queryClient.invalidateQueries(getAll)
        rows.map((row) => queryClient.invalidateQueries(getOne(row.original.UUID)))
    }
})
