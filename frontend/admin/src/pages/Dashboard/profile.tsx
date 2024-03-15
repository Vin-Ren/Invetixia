
import { getOne } from "@/lib/queries/user"
import { getOne as organisationGetOne } from "@/lib/queries/organisation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import useUser from "@/hooks/useUser"
import { getOrganisationTableColumns } from "./organisation/columns"



export const Profile = () => {
    const navigate = useNavigate()
    const { user, logout } = useUser()
    const { data: organisation } = useQuery(organisationGetOne(user?.organisationManaged?.UUID as string), queryClient)
    if (user === undefined) return <></>

    const handleLogout = async () => {
        const success = await logout()
        if (success) {
            await queryClient.invalidateQueries({ queryKey: ['user', 'self'] })
            navigate('/login')
        }
    }

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

            <div className="grid grid-cols-3">
                <div className="col-span-1">
                    <RefreshDataButton queries={[getOne(user.UUID as string), organisationGetOne(user.organisationManaged?.UUID as string)]} />
                </div>
                <div className="col-span-1"></div>
                <form onSubmit={(e) => { e.preventDefault(); handleLogout() }} className="flex justify-end flex-1 place-items-end">
                    <Button type="submit" variant={"destructive"}>Logout</Button>
                </form>
            </div>
        </div>
    )
}