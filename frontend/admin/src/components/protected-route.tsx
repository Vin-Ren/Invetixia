import { UserSelfData } from "../lib/api/user";
import useUser from "@/hooks/useUser";
import { ReactNode } from "react"
import { Navigate, To } from "react-router-dom"


// Protects a route, depends on the output of the conditionFn, whether to redirect or proceed. By default, the conditionFn checks whether the user is logged in or not
export default function ProtectedRoute({ 
    children, 
    conditionFn = (user) => (user?.authenticated), 
    to = '/login' 
}: { 
    children: ReactNode, 
    conditionFn?: (user: UserSelfData) => boolean, 
    to?: To 
}) {
    const { user } = useUser();
    if (conditionFn(user)) return children
    return <Navigate to={to} />
}
