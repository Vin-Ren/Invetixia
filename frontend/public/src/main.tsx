import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout, { loader as EventInfoLoader } from './layout.tsx'
import ErrorPage from './errorPage.tsx'
import Index from './routes/index.tsx'
import Invitation, { loader as InvitationLoader } from './routes/invitation.tsx'
import Ticket, { loader as TicketLoader } from './routes/ticket.tsx'
import EditTicket, { loader as EditTicketLoader } from './routes/editTicket.tsx'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/api/index.ts'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
        loader: EditTicketLoader(queryClient)
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
