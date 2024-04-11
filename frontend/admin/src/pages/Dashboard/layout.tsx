import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import { Outlet } from "react-router-dom"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import NavItem from "@/components/nav-item"
import { AreaChart, ArrowDownToLineIcon, ArrowLeftFromLineIcon, ArrowRightFromLineIcon, ArrowUpFromLine, Building, CircleUserRound, Settings, Tags, TicketPercent, TicketSlash, User } from "lucide-react"
import useUser from "@/hooks/useUser"
import { useState } from "react"
import { Button } from "@/components/ui/button"


export const Dashboard = () => {
    const { user } = useUser()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    
    return (
        <ProtectedRoute>
            <div className="flex-1 flex md:flex-row max-md:flex-col">
                <div className="flex max-md:flex-col md:flex-row w-fit max-md:w-full">
                    <div className="flex flex-col">
                        <ScrollArea>
                            <div className="p-4 lg:pr-0 flex flex-col gap-4">
                                {
                                    sidebarOpen 
                                    ? ( 
                                    <>
                                        <Button onClick={() => setSidebarOpen((prv) => !prv)} variant={'ghost'} className="md:place-self-end">
                                            <ArrowLeftFromLineIcon className="max-md:hidden"/>
                                            <ArrowUpFromLine className="md:hidden"/>
                                        </Button>
                                        <NavItem to={'/dashboard/profile'}>Profile</NavItem>
                                        <NavItem to={'/dashboard/overview'}>Overview</NavItem>
                                        {(user.role||0) < 4 || <NavItem to={'/dashboard/eventConfig'}>Event Config</NavItem>}
                                        {(user.role||0) < 4 || <NavItem to={'/dashboard/user'}>User</NavItem>}
                                        {(user.role||0) < 4 || <NavItem to={'/dashboard/organisation'}>Organisation</NavItem>}
                                        {(user.role||0) < 4 || <NavItem to={'/dashboard/quotaType'}>Quota Type</NavItem>}
                                        {(user.role||0) < 4 || <NavItem to={'/dashboard/invitation'}>Invitation</NavItem>}
                                        {(user.role||0) < 4 || <NavItem to={'/dashboard/quota'}>Quota</NavItem>}
                                    </>
                                    )
                                    : (
                                    <>
                                        <Button onClick={() => setSidebarOpen((prv) => !prv)} variant={'ghost'}>
                                            <ArrowRightFromLineIcon className="max-md:hidden"/>
                                            <ArrowDownToLineIcon className="md:hidden"/>
                                        </Button>
                                        <div className="max-md:hidden w-min flex flex-col gap-4">
                                            <NavItem to={'/dashboard/profile'}> <CircleUserRound /> </NavItem>
                                            <NavItem to={'/dashboard/overview'}> <AreaChart /> </NavItem>
                                            {(user.role||0) < 4 || <NavItem to={'/dashboard/eventConfig'}> <Settings /> </NavItem>}
                                            {(user.role||0) < 4 || <NavItem to={'/dashboard/user'}> <User /> </NavItem>}
                                            {(user.role||0) < 4 || <NavItem to={'/dashboard/organisation'}> <Building /> </NavItem>}
                                            {(user.role||0) < 4 || <NavItem to={'/dashboard/quotaType'}> <Tags /> </NavItem>}
                                            {(user.role||0) < 4 || <NavItem to={'/dashboard/invitation'}> <TicketSlash /> </NavItem>}
                                            {(user.role||0) < 4 || <NavItem to={'/dashboard/quota'}> <TicketPercent /> </NavItem>}
                                        </div>
                                    </>
                                    )
                                }
                            </div>
                        </ScrollArea>
                    </div>
                    <Separator orientation="vertical" className="ml-4 my-4 place-self-end self-center max-md:hidden" />
                    <Separator orientation="horizontal" className="mx-4 my-2 place-self-end self-center md:hidden" />
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
