import { DataTable } from "@/components/data-table"
import { getAll } from "@/lib/queries/organisation"
import { useQuery } from "@tanstack/react-query"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { queryClient } from "@/main"
import { RefreshDataButton } from "@/components/refresh-data-button"

import { getOrganisationTableColumns } from "./columns"


export const OrganisationDashboard = () => {
    const { data } = useQuery(getAll, queryClient)
    if (data === undefined) return <></>

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col w-full">
                <div className="place-self-end flex flex-row">
                    <Button variant={"outline"} size={"sm"}>
                        <PlusIcon className="mr-2 h-4 w-4"/>
                        Create
                    </Button>
                </div>
            </div>
            <DataTable columns={getOrganisationTableColumns()} data={data} />
            <RefreshDataButton query={getAll}/>
        </div>
    )
}
