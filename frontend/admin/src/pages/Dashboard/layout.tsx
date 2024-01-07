import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import { Outlet, useNavigate } from "react-router-dom"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import NavItem from "@/components/nav-item"
import { Button } from "@/components/ui/button"
import { CircleUserRound } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"


export const Dashboard = () => {
    const navigate = useNavigate()

    return (
        <ProtectedRoute>
            <div className="flex-1 flex">
                <div className="flex flex-row w-fit">
                    <div className="flex flex-col">
                        {/* This should be a special page instead of details. will be changed later. */}
                        <div className="p-4 pr-0 pb-0 flex justify-center">
                            <TooltipProvider delayDuration={250}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={'ghost'} onClick={() => navigate(`/dashboard/profile`)}>
                                            <CircleUserRound />
                                        </Button>
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
                    <Separator orientation="vertical" className="mx-4 mt-4 place-self-end self-center" />
                </div>

                <ScrollArea className="flex-1 border m-2 ml-0 mb-0 max-h-[88vh] max-w-full">
                {/* <ScrollArea className="flex-1 m-2 ml-0 mb-0" > */}
                    <Outlet />
                    <ScrollBar orientation="vertical" />
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </ProtectedRoute>
    )
}
