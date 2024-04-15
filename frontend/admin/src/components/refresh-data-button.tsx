import { queryClient } from "@/lib/api"
import { InvalidateQueryFilters } from "@tanstack/react-query"
import { useToast } from "./ui/use-toast"
import { Button, ButtonProps } from "./ui/button"
import { RefreshCcwIcon } from "lucide-react"


export const RefreshDataButton = ({
    query = undefined,
    queries = [],
    text = "Refresh Data",
    buttonProps = { variant: "secondary" }
}: {
    query?: InvalidateQueryFilters,
    queries?: InvalidateQueryFilters[],
    text?: string,
    buttonProps?: Omit<ButtonProps, "onClick">
}) => {
    if (query !== undefined) queries.push(query)
    const { toast } = useToast()
    const handleRefreshData = () => {
        queries.map((q) => queryClient.invalidateQueries(q))
        toast({
            title: "Refresh data",
            description: "Successfully refreshed data."
        })
    }

    return (
        <Button {...buttonProps} onClick={handleRefreshData}>
            <RefreshCcwIcon className="h-4 w-4 mr-2" />
            {text}
        </Button>
    )
}