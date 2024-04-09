import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import { Outlet } from "react-router-dom"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import NavItem from "@/components/nav-item"
import { CircleUserRound } from "lucide-react"
import useUser from "@/hooks/useUser"


export const Dashboard = () => {
    const { user } = useUser()
    return (
        <ProtectedRoute>
            <div className="flex-1 flex">
                <div className="flex flex-row w-fit">
                    <div className="flex flex-col">
                        <ScrollArea>
                            <div className="p-4 pr-0 flex flex-col gap-4">
                                <NavItem to={'/dashboard/profile'}><CircleUserRound /></NavItem>
                                <NavItem to={'/dashboard/overview'}>Overview</NavItem>
                                {(user.role||0) < 4 || <NavItem to={'/dashboard/eventConfig'}>Event Config</NavItem>}
                                {(user.role||0) < 4 || <NavItem to={'/dashboard/organisation'}>Organisation</NavItem>}
                                {(user.role||0) < 4 || <NavItem to={'/dashboard/user'}>User</NavItem>}
                                {(user.role||0) < 4 || <NavItem to={'/dashboard/quotaType'}>Quota Type</NavItem>}
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
