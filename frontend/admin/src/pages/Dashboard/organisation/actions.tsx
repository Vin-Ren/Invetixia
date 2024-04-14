import { UserSelfData } from "@/lib/api/user";
import { Row } from "@tanstack/react-table";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { UserMinus } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Organisation, UserSanitized } from "@/lib/api/data-types";
import { ToastAction } from "@/components/ui/toast";
import { DeleteDialogAction, GenericDialogConfirmAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { queryClient } from "@/lib/api";
import { deleteMany, deleteOne, updateOne } from "@/lib/api/organisation";
import { getAll, getOne } from "@/lib/queries/organisation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon } from "lucide-react";
import { HeaderDeleteDialogAction } from "@/components/data-table-custom-columns/header-actions";

export const OrganisationViewDetailsAction = () => ViewDetailsAction((row: Row<Organisation>) => `/dashboard/organisation/details/${row.original.UUID}`);

export const OrganisationDeleteAction = () => DeleteDialogAction<Organisation>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]])
});


export const OrganisationHeaderDeleteAction = () => HeaderDeleteDialogAction<Organisation>({
    deleteHandler: async ({ rows }) => await deleteMany(rows.map((row) => row.original.UUID)),
    queriesInvalidator: (rows) => ([queryClient,[getAll, ...rows.map((row) => getOne(row.original.UUID))]])
})


export const OrganisationEditNameAction = (): CellDialogAction<Organisation, { newName: string }> => ({
    actionType: "dialog",
    actionId: "quick-edit-item",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit organisation
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne(row.original.UUID, getDialogData?.().newName || "")
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ newName: row.original.name }) },
    queriesInvalidator: (row) => ([queryClient, [getAll, getOne(row.original.UUID)]]),
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Organisaiton</DialogTitle>
                    <DialogDescription>
                        Make changes to the organisation here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Organisation Name</Label>
                        <Input className="col-span-3"
                            value={getDialogData?.().newName || ""}
                            onChange={(e) => setDialogData((data) => ({ ...data, newName: e.target.value }))}></Input>
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
            title: "Successfully updated the organisation!"
        }),
        onFailure: () => ({
            title: "Failed to update the organisation!",
            variant: "destructive"
        })
    }
})

export function RemoveUserFromOrganisationAction({
    removeOne, queriesInvalidator, undoRemove, organisation, executorUser,
}: {
    removeOne: (props: { row: Row<UserSanitized>; }) => Promise<boolean>;
    undoRemove: (row: Row<UserSanitized>) => Promise<boolean>;
    queriesInvalidator: (row: Row<UserSanitized>) => void;
    organisation: Organisation;
    executorUser: UserSelfData;
}): CellDialogAction<UserSanitized> {
    return GenericDialogConfirmAction({
        actionId: "delete-user",
        triggerNode: (
            <>
                <UserMinus className="mr-2 h-4 w-4" />
                Remove from organisation
            </>
        ),
        actionHandler: removeOne,
        queriesInvalidator,
        dialogOptions: {
            title: "Confirm Removal",
            description: ({ row }) => `The user '${row.original.username}' is not going to be a part of '${organisation.name}' afterwards, instead they will be a part of your managed organisation( '${executorUser.organisationManaged?.name}' ). Are you sure you would like to proceed?`
        },
        toasts: {
            onSuccess: ({ row }) => ({
                title: "Removed user!",
                description: `User ${row.original.username} is no longer a manager of ${organisation.name}.`,
                action: <ToastAction onClick={async () => await undoRemove(row)} altText="Undo removal">Undo</ToastAction>
            }),
            onFailure: () => ({
                title: "Failed to remove user",
                variant: "destructive"
            }),
        }
    });
}
