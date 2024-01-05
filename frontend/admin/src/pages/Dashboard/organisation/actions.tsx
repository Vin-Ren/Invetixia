import { UserSelfData } from "@/lib/api/user";
import { Row } from "@tanstack/react-table";
import { CellDialogAction } from "@/components/data-table-custom-columns/actions-cell";
import { TrashIcon, UserMinus } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Organisation, UserSanitized } from "@/lib/api/data-types";
import { ToastAction } from "@/components/ui/toast";
import { DeleteDialogAction, ViewDetailsAction } from "@/components/data-table-custom-columns/cell-actions";
import { queryClient } from "@/lib/api";
import { deleteOne, updateOne } from "@/lib/api/organisation";
import { getAll, getOne } from "@/lib/queries/organisation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon } from "lucide-react";

export const OrganisationViewDetailsAction = () => ViewDetailsAction((row: Row<Organisation>) => `/dashboard/organisation/${row.original.UUID}`);

export const OrganisationDeleteAction = () => DeleteDialogAction<Organisation>({
    deleteHandler: async ({ row }) => await deleteOne(row.original.UUID),
    queriesInvalidator: (row) => {
        queryClient.invalidateQueries(getAll)
        queryClient.invalidateQueries(getOne(row.original.UUID))
    }
});

export const OrganisationEditAction = (): CellDialogAction<Organisation, { newName: string }> => ({
    actionType: "dialog",
    actionId: "edit-organisation",
    triggerNode: (
        <>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit item
        </>
    ),
    actionHandler: async ({ row, getDialogData }) => {
        return await updateOne(row.original.UUID, getDialogData?.().newName || "")
    },
    initializeDialogData: ({ row, setDialogData }) => { setDialogData({ newName: row.original.name }) },
    queriesInvalidator: (row) => { [getAll, getOne(row.original.UUID)].map((query) => queryClient.invalidateQueries(query)) },
    dialogContent: ({ row, internalActionHandler, getDialogData, setDialogData }) => {
        return (
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit item</DialogTitle>
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
                        <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler({ actionId: 'edit-organisation', row })}>Save</Button>
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
    return ({
        actionType: 'dialog',
        actionId: "delete",
        triggerNode: (
            <>
                <UserMinus className="mr-2 h-4 w-4" />
                Remove from organisation
            </>
        ),
        actionHandler: removeOne,
        queriesInvalidator,
        dialogContent: ({ row, internalActionHandler }) => {
            return (
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm deletion</DialogTitle>
                        <DialogDescription>
                            The user {row.original.username} is not going to be a manager of {organisation.name} afterwards, instead they will be a manager of your managed organisation({executorUser.organisationManaged?.name}). Are you sure you would like to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end">
                        <DialogClose asChild>
                            <Button variant={"destructive"} onClick={async () => await internalActionHandler({ actionId: 'delete', row })}>Confirm</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            );
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