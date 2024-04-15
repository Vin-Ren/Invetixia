import { DataTable } from "@/components/data-table"
import { getAll } from "@/lib/queries/organisation"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { getOrganisationTableColumns } from "./columns"
import { GenericIndexCreateButton } from "@/components/custom-buttons"


export const OrganisationDashboard = () => {
    const { data } = useQuery(getAll, queryClient)
    if (data === undefined) return <></>

    return (
        <div className="container mx-auto py-10">
            <GenericIndexCreateButton />
            <DataTable columns={getOrganisationTableColumns()} data={data} />
            <RefreshDataButton query={getAll} />
        </div>
    )
}
