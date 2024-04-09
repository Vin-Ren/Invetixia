
import { getOne, getUserSelf } from "@/lib/queries/user"
import { getOne as organisationGetOne } from "@/lib/queries/organisation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import useUser from "@/hooks/useUser"
import { getOrganisationTableColumns } from "./organisation/columns"
import { DialogButton, GenericDialogConfirmButton, QueriesInvalidatorType } from "@/components/custom-buttons"
import { LogOutIcon, PencilIcon } from "lucide-react"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { changePassword } from "@/lib/api/user"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export function ChangePasswordDialogButton({
    queriesInvalidator = () => { },
}: {
    queriesInvalidator: QueriesInvalidatorType
}) {
    return DialogButton<{password?: string, newPassword?: string, newPassword2?: string}>({
        triggerNode: (
            <Button variant={'secondary'}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Change Password
            </Button>
        ),
        initializeDialogData: ({ setDialogData }) => { setDialogData({ password: "", newPassword: "", newPassword2: "" }) },
        actionHandler: async ({ getDialogData }) => {
            if (getDialogData().newPassword2 != getDialogData().newPassword) return false;
            return await changePassword({password: "", newPassword: "", ...(getDialogData() || {})})
        },
        queriesInvalidator,
        dialogContent: ({internalActionHandler, getDialogData, setDialogData}) => {
            return (
                <DialogContent className="sm:max-w-[512px]">
                    <DialogHeader>
                        <DialogTitle>Change Your Password</DialogTitle>
                        <DialogDescription>
                            Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label>Current Password</Label>
                            <Input className="col-span-3"
                                type={'password'}
                                value={getDialogData?.().password || ""}
                                onChange={(e) => setDialogData((data) => ({ ...data, password: e.target.value }))} />
                            <Label>New Password</Label>
                            <Input className="col-span-3"
                                type={'password'}
                                value={getDialogData?.().newPassword || ""}
                                onChange={(e) => setDialogData((data) => ({ ...data, newPassword: e.target.value }))} />
                            <Label>Confirm New Password</Label>
                            <Input className="col-span-3"
                                type={'password'}
                                value={getDialogData?.().newPassword2 || ""}
                                onChange={(e) => setDialogData((data) => ({ ...data, newPassword2: e.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler()}>Save</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )
        },
        toasts: {
            onSuccess: () => ({
                title: "Password changed successfully!"
            }),
            onFailure: () => ({
                title: "Failed to change password!",
                variant: "destructive"
            }),
        }
    })
}


export interface LogoutButtonProps {
    logoutHandler: () => boolean | Promise<boolean>,
    queriesInvalidator?: QueriesInvalidatorType
}

export function LogoutButton({
    logoutHandler,
    queriesInvalidator
}: LogoutButtonProps) {
    return GenericDialogConfirmButton({
        actionHandler: async () => await logoutHandler(),
        triggerNode: (
            <Button variant={"destructive"}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
            </Button>
        ),
        postSuccessActionHandler: ({ navigate }) => navigate('/login'),
        queriesInvalidator,
        dialogOptions: {
            title: "Confirm Logout",
            description: "Are you sure that you would like to be logged out?",
        },
        toasts: {
            onSuccess: () => ({
                title: "Logged Out!",
                description: `Successfully logged out.`
            }),
            onFailure: () => ({
                title: "Failed to log out",
                variant: "destructive"
            })
        }
    })
}

export const Profile = () => {
    const { user, logout } = useUser()
    const { data: organisation } = useQuery(organisationGetOne(user?.organisationManaged?.UUID as string), queryClient)
    if (user === undefined) return <></>

    const organisationTableColumns = getOrganisationTableColumns({ 
        disableColumnsById: ['select'],
        actionsHeaderProps: {
            actions: []
        }
    })

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${user.username}`}</CardTitle>
                            <CardDescription>Part of {user.organisationManaged?.name} organisation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{`Object Signature - User{${user.UUID}}`}</CardDescription>
                            <CardDescription>Role - {user.role_string}</CardDescription>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Organisation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={organisationTableColumns} data={organisation ? [organisation]: []} options={{ enableFilters: false, enableViewColumnCheckbox: false, enablePagination: false }} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-1">
                    <RefreshDataButton queries={[getOne(user.UUID as string), organisationGetOne(user.organisationManaged?.UUID as string)]} />
                </div>
                <div className="flex flex-1">
                    <ChangePasswordDialogButton queriesInvalidator={() => [queryClient, [getUserSelf]]}/>
                </div>
                <div className="flex flex-1">
                    <LogoutButton logoutHandler={logout} queriesInvalidator={() => [queryClient, [getUserSelf]]}/>
                </div>
            </div>
        </div>
    )
}
