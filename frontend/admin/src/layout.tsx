import { Outlet } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { Separator } from "@/components/ui/separator";
import { FaSlackHash } from "react-icons/fa";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { QueryClient } from "@tanstack/react-query";
import { getUserSelf } from "./lib/queries/user";


export const loader = (queryClient: QueryClient) => {
  return async () => {
      if (!queryClient.getQueryData(getUserSelf.queryKey)) {
          await queryClient.fetchQuery(getUserSelf)
      }
      return null
  }
}


export default function Layout() {
  return (
    <UserProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="min-h-screen flex flex-col">
          <main className="content space-y-1 flex-1 flex flex-col">
            <Outlet />
          </main>

          <div>
            <Toaster />
            <Separator className="mt-4"/>
            <footer className="px-4 py-2 w-full bottom-0 grid grid-cols-2 text-sm items-center">
              <ModeToggle />
              <aside className="place-self-center justify-self-end items-center grid-flow-col grid gap-2 py-2">
                <FaSlackHash size={24} />
                <p>Powered by <Button variant={'link'} asChild className="p-0 m-0"><a href='https://github.com/Vin-Ren/Invetixia' target="_blank" className="link">Invetixia</a></Button></p>
              </aside>
            </footer>
          </div>
        </div>
      </ThemeProvider>
    </UserProvider>
  )
}

