import { DataTable } from "@/components/data-table"
import { getAll } from "@/lib/queries/user"
import { useQuery } from "@tanstack/react-query"


import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { getUserTableColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"


export const UserDashboard = () => {
    const navigate = useNavigate();
    const { data } = useQuery(getAll, queryClient)
    if (data === undefined) return <></>

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col w-full">
                <div className="place-self-end flex flex-row">
                    <Button variant={"outline"} size={"sm"} onClick={() => navigate('create')} className="ml-auto hidden h-8 lg:flex">
                        <PlusIcon className="mr-2 h-4 w-4"/>
                        Create
                    </Button>
                </div>
            </div>
            <DataTable columns={getUserTableColumns()} data={data} />
            <RefreshDataButton query={getAll}/>
        </div>
    )
}
