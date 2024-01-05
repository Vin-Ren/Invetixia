
import { getOne } from "@/lib/queries/user"
import { getOne as organisationGetOne } from "@/lib/queries/organisation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { getOrganisationTableColumns } from "../organisation/columns"
import { Button } from "@/components/ui/button"
import useUser from "@/hooks/useUser"



export const UserDetails = () => {
    const navigate = useNavigate()
    const { user: userSelf, logout } = useUser()
    const { UUID = '' } = useParams()
    const { data: user } = useQuery(getOne(UUID), queryClient)
    const { data: organisation } = useQuery(organisationGetOne(user?.organisationId as string), queryClient)
    if (user === undefined || organisation === undefined) return <></>

    const handleLogout = async () => {
        const success = await logout()
        if (success) {
            await queryClient.invalidateQueries({ queryKey: ['user', 'self'] })
            navigate('/login')
        }
    }

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid max-xl:grid-cols-1 xl:grid-cols-2 w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`${user.username}`} </CardTitle>
                            <CardDescription>Manages {user.organisationManaged?.name} organisation</CardDescription>
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
                            <DataTable columns={getOrganisationTableColumns({ disableColumnsById: ['Manager', 'select'] })} data={[organisation]} options={{ enableFilters: false, enableViewColumnCheckbox: false, enablePagination: false }} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-3">
                <div className="col-span-1">
                    <RefreshDataButton query={getOne(UUID)} />
                </div>
                {
                    userSelf.UUID === user.UUID ?
                        <>
                            <div className="col-span-1"></div>
                            <form onSubmit={(e) => { e.preventDefault(); handleLogout() }} className="flex justify-end flex-1 place-items-end">
                                <Button type="submit" variant={"destructive"}>Logout</Button>
                            </form>
                        </>
                        : null
                }
            </div>
        </div>
    )
}