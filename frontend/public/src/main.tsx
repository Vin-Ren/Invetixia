import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Root, { loader as EventInfoLoader } from './routes/root.tsx'
import ErrorPage from './errorPage.tsx'
import Index from './routes/index.tsx'
import Invitation, { loader as InvitationLoader } from './routes/invitation.tsx'
import Ticket from './routes/ticket.tsx'
import EditTicket, {loader as TicketLoader} from './routes/editTicket.tsx'
import CountdownPage from './routes/countdown.tsx'
import { HelmetProvider } from 'react-helmet-async'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: EventInfoLoader(queryClient),
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: '/invitation/:UUID',
        element: <Invitation />,
        loader: InvitationLoader(queryClient)
      },
      {
        path: '/ticket/:UUID',
        element: <Ticket />,
        loader: TicketLoader(queryClient)
      },
      {
        path: '/ticket/:UUID/edit',
        element: <EditTicket />,
        loader: TicketLoader(queryClient)
      },
      {
        path: '/countdown',
        element: <CountdownPage />,
        loader: EventInfoLoader(queryClient)
      },
      {
        path: '*',
        element: <ErrorPage />
      },
    ]
  }
])


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
