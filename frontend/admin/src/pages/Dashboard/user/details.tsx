
import { getAll, getOne } from "@/lib/queries/user"
import { getOne as organisationGetOne } from "@/lib/queries/organisation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { getOrganisationTableColumns } from "../organisation/columns"
import { deleteOne } from "@/lib/api/user";
import { GenericDetailsDeleteButton } from "@/components/custom-buttons";



export const UserDetails = () => {
    const { UUID = '' } = useParams()
    const { data: user } = useQuery(getOne(UUID), queryClient)
    const { data: organisation } = useQuery(organisationGetOne(user?.organisationId as string), queryClient)
    if (user === undefined || organisation === undefined) return <></>

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
                            <CardTitle>{`${user.username}`} </CardTitle>
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
                            <DataTable columns={organisationTableColumns} data={[organisation]} options={{ enableFilters: false, enableViewColumnCheckbox: false, enablePagination: false }} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-1">
                    <RefreshDataButton query={getOne(UUID)} />
                </div>
                <div className="flex flex-1">
                    <GenericDetailsDeleteButton
                        UUID={UUID}
                        deleteHandler={async () => await deleteOne(UUID)}
                        queriesInvalidator={() => [queryClient, [getAll, getOne(UUID)]]}
                    />
                </div>
            </div>
        </div>
    )
}