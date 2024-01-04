import { UserSelfData, login, logout, } from "@/lib/api/user";
import { getUserSelf } from "@/lib/queries/user";
import { queryClient } from "@/main";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, createContext, useMemo } from "react";


type UserContextType = { user: UserSelfData, login: typeof login, logout: typeof logout }

export const UserContext = createContext<UserContextType>({ user: { authenticated: false }, login, logout });


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: user = { authenticated: false } } = useQuery(getUserSelf, queryClient)

  const value = useMemo(() => ({ user, login, logout }), [user])

  return (<UserContext.Provider value={value}>{children}</UserContext.Provider>)
}
