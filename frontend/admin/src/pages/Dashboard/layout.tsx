import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import { Outlet, useNavigate } from "react-router-dom"
import { ScrollArea } from "@/components/ui/scroll-area"
import NavItem from "@/components/nav-item"
import useUser from "@/hooks/useUser"
import { Button } from "@/components/ui/button"
import { CircleUserRound } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"


export const Dashboard = () => {
    const navigate = useNavigate()
    const { user } = useUser()

    return (
        <ProtectedRoute>
            <div className="flex-1 flex">
                <div className="flex flex-row w-fit">
                    <div className="flex flex-col max-h-screen">
                        <ScrollArea>
                            <div className="p-4 pr-0 flex flex-col gap-4">
                                <NavItem to={'/dashboard/overview'}>Overview</NavItem>
                                <NavItem to={'/dashboard/organisation'}>Organisation</NavItem>
                                <NavItem to={'/dashboard/user'}>User</NavItem>
                            </div>
                        </ScrollArea>

                        {/* This should be a special page instead of details. will be changed later. */}
                        <div className="p-4 pr-0 flex justify-center flex-1 place-items-end">
                            <TooltipProvider delayDuration={250}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={'ghost'} onClick={() => navigate(`/dashboard/user/details/${user.UUID}`)}>
                                            <CircleUserRound />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>User Details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="mx-4 mt-4 place-self-end self-center" />
                </div>

                <div className="flex-1">
                    <ScrollArea>
                        <Outlet />
                    </ScrollArea>
                </div>
            </div>
        </ProtectedRoute>
    )
}
