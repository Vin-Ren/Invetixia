import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import { Outlet } from "react-router-dom"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import NavItem from "@/components/nav-item"
import { AreaChart, ArrowDownToLineIcon, ArrowLeftFromLineIcon, ArrowRightFromLineIcon, ArrowUpFromLine, Building, CircleUserRound, ScanBarcode, Settings, Tags, Ticket, TicketPercent, TicketSlash, User } from "lucide-react"
import useUser from "@/hooks/useUser"
import { useState } from "react"
import { Button } from "@/components/ui/button"


export const Dashboard = () => {
    const { user } = useUser()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <ProtectedRoute>
            <div className="w-full flex-1 flex md:flex-row max-md:flex-col">
                <div className="flex max-md:flex-col md:flex-row w-fit max-md:w-full">
                    <div className="flex flex-col">
                        <ScrollArea>
                            <div className="p-4 lg:pr-0 flex flex-col gap-4">
                                <Button onClick={() => setSidebarOpen((prv) => !prv)} variant={'ghost'} className={sidebarOpen ? `md:place-self-end` : ``}>
                                    {
                                        sidebarOpen
                                            ? <>
                                                <ArrowLeftFromLineIcon className="max-md:hidden" />
                                                <ArrowUpFromLine className="md:hidden" />
                                            </>
                                            : <>
                                                <ArrowRightFromLineIcon className="max-md:hidden" />
                                                <ArrowDownToLineIcon className="md:hidden" />
                                            </>
                                    }
                                </Button>
                                <div className={`w-full flex flex-col gap-4 ${sidebarOpen ? ' ' : 'max-md:hidden'}`}>
                                    <NavItem to={'/dashboard/profile'}> {sidebarOpen ? 'Profile' : <CircleUserRound />} </NavItem>
                                    <NavItem to={'/dashboard/overview'}> {sidebarOpen ? 'Overview' : <AreaChart />} </NavItem>
                                    {(user.role || 0) < 4 || <NavItem to={'/dashboard/config'}> {sidebarOpen ? 'Config' : <Settings />} </NavItem>}
                                    {(user.role || 0) < 2 || <NavItem to={'/dashboard/scanner'}> {sidebarOpen ? 'Scanner' : <ScanBarcode />} </NavItem>}
                                    {(user.role || 0) < 4 || <NavItem to={'/dashboard/user'}> {sidebarOpen ? 'User' : <User />} </NavItem>}
                                    {(user.role || 0) < 4 || <NavItem to={'/dashboard/organisation'}> {sidebarOpen ? 'Organisation' : <Building />} </NavItem>}
                                    {(user.role || 0) < 4 || <NavItem to={'/dashboard/invitation'}> {sidebarOpen ? 'Invitation' : <TicketSlash />} </NavItem>}
                                    {(user.role || 0) < 4 || <NavItem to={'/dashboard/ticket'}> {sidebarOpen ? 'Ticket' : <Ticket />} </NavItem>}
                                    {(user.role || 0) < 4 || <NavItem to={'/dashboard/quotaType'}> {sidebarOpen ? 'Quota Type' : <Tags />} </NavItem>}
                                    {(user.role || 0) < 4 || <NavItem to={'/dashboard/quota'}> {sidebarOpen ? 'Quota' : <TicketPercent />} </NavItem>}
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                    <Separator orientation="vertical" className="ml-4 my-4 place-self-end self-center max-md:hidden" />
                    <Separator orientation="horizontal" className="mx-4 my-2 place-self-end self-center md:hidden" />
                </div>

                {
                    window.innerWidth < 768
                        ? <Outlet />
                        : (
                            <ScrollArea className="flex-1 max-h-[90vh] max-w-full">
                                <Outlet />
                                <ScrollBar orientation="vertical" />
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        )
                }
            </div>
        </ProtectedRoute>
    )
}
