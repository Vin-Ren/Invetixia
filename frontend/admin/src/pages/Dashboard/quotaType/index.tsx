import { DataTable } from "@/components/data-table"
import { getAll } from "@/lib/queries/quotaType"
import { useQuery } from "@tanstack/react-query"


import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { getQuotaTypeTableColumns } from "./columns"


export const QuotaTypeDashboard = () => {
    const { data } = useQuery(getAll, queryClient)
    if (data === undefined) return <></>

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={getQuotaTypeTableColumns()} data={data} />
            <RefreshDataButton query={getAll}/>
        </div>
    )
}
