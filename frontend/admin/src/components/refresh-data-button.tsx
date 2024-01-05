import { queryClient } from "@/lib/api"
import { InvalidateQueryFilters } from "@tanstack/react-query"
import { useToast } from "./ui/use-toast"
import { Button, ButtonProps } from "./ui/button"


export const RefreshDataButton = ({
    query, 
    text = "Refresh Data",
    buttonProps = {variant: "secondary"}
} : {
    query: InvalidateQueryFilters, 
    text?: string,
    buttonProps?: Omit<ButtonProps, "onClick">
}) => {
    const {toast} = useToast()
    const handleRefreshData = () => {
        queryClient.invalidateQueries(query)
        toast({
            title: "Refresh data",
            description: "Successfully refreshed data."
        })
    }

    return (<Button {...buttonProps} onClick={handleRefreshData}>{text}</Button>)
}