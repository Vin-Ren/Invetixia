import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import { Outlet } from "react-router-dom"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import NavItem from "@/components/nav-item"
import { CircleUserRound } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"


export const Dashboard = () => {
    return (
        <ProtectedRoute>
            <div className="flex-1 flex">
                <div className="flex flex-row w-fit">
                    <div className="flex flex-col">
                        <div className="p-4 pr-0 pb-0 flex justify-center">
                            <TooltipProvider delayDuration={250}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <NavItem to={'/dashboard/profile'}><CircleUserRound /></NavItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>User Details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <ScrollArea>
                            <div className="p-4 pr-0 flex flex-col gap-4">
                                <NavItem to={'/dashboard/overview'}>Overview</NavItem>
                                <NavItem to={'/dashboard/organisation'}>Organisation</NavItem>
                                <NavItem to={'/dashboard/user'}>User</NavItem>
                                <NavItem to={'/dashboard/quotaType'}>Quota Type</NavItem>
                            </div>
                        </ScrollArea>
                    </div>
                    <Separator orientation="vertical" className="ml-4 my-4 place-self-end self-center" />
                </div>

                <ScrollArea className="flex-1 max-h-[90vh] max-w-full">
                    <Outlet />
                    <ScrollBar orientation="vertical" />
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </ProtectedRoute>
    )
}
