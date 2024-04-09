import { UserSanitized } from "@/lib/api/data-types";
import { Row } from "@tanstack/react-table";
import { getAll, getOne } from "@/lib/queries/user";
import { queryClient } from "@/lib/api";
import { deleteMany, deleteOne, updateOne } from "@/lib/api/user";
import { DeleteDialogAction, GenericNavigatorButtonAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { Building2, PencilIcon } from "lucide-react";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


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

export const UserEditAction = (): CellDialogAction<UserSanitized, { UUID?: string, username?: string, role?: number, organisationName?: string, password?: string }> => ({
    actionType: "dialog",
    actionId: "quick-edit-item",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne({ UUID: row.original.UUID, username: row.original.username, role: row.original.role, organisationName: row.original.organisationManaged?.name || "", password: "", ...(getDialogData?.() || {}) })
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ UUID: row.original.UUID, username: row.original.username, role: row.original.role, organisationName: row.original.organisationManaged?.name || "", password: ""}) },
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]]),
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Make changes to the user here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Username</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().username || ""}
                            placeholder="Username for the user to login as"
                            onChange={(e) => setDialogData((data) => ({ ...data, username: e.target.value }))}></Input>
                        <Label>Role</Label>
                        <Input className="col-span-3"
                            value={(getDialogData?.().role) ? (getDialogData?.().role)?.toString() : ''}
                            placeholder="Observer (1), Organisation Manager (2), Admin (4)"
                            onChange={(e) => setDialogData((data) => ({ ...data, role: parseInt(e.target.value || '0') }))}></Input>
                        <Label>Organisation Name</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().organisationName || ""}
                            placeholder="What organisation should the user be a part of"
                            onChange={(e) => setDialogData((data) => ({ ...data, organisationName: e.target.value }))}></Input>
                        <Label>Password</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().password || ""}
                            placeholder="Leave empty to keep using previous password"
                            onChange={(e) => setDialogData((data) => ({ ...data, password: e.target.value }))}></Input>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler({ actionId: 'quick-edit-item', row })}>Save</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )
    },
    toasts: {
        onSuccess: () => ({
            title: "Successfully updated the user!"
        }),
        onFailure: () => ({
            title: "Failed to update the user!",
            variant: "destructive"
        })
    }
})

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
