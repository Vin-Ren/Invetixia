import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout, { loader as UserSelfLoader } from './layout.tsx'
import './index.css'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Login } from './pages/login.tsx'
import { Dashboard } from './pages/Dashboard/layout.tsx'
import { Overview as OverviewDashboard } from './pages/Dashboard/overview.tsx'
import { OrganisationDashboard } from './pages/Dashboard/organisation/index.tsx'
import Error from './pages/error.tsx'
import { configureAxios, queryClient } from './lib/api/index.ts'
import { UserDashboard } from './pages/Dashboard/user/index.tsx'
import { OrganisationDetails } from './pages/Dashboard/organisation/details.tsx'
import { UserDetails } from './pages/Dashboard/user/details.tsx'
import { QuotaTypeDashboard } from './pages/Dashboard/quotaType/index.tsx'
import { QuotaTypeDetails } from './pages/Dashboard/quotaType/details.tsx'
import { Profile } from './pages/Dashboard/profile.tsx'
import { OrganisationCreatePage } from './pages/Dashboard/organisation/create.tsx'
import { UserCreatePage } from './pages/Dashboard/user/create.tsx'
import { QuotaTypeCreatePage } from './pages/Dashboard/quotaType/create.tsx'
import { ConfigPage, loader as ConfigLoader } from './pages/Dashboard/config.tsx'
import { InvitationDashboard } from './pages/Dashboard/invitation/index.tsx'
import { InvitationDetails } from './pages/Dashboard/invitation/details.tsx'
import { InvitationCreatePage } from './pages/Dashboard/invitation/create.tsx'
import { QuotaDashboard } from './pages/Dashboard/quota/index.tsx'
import { QuotaDetails } from './pages/Dashboard/quota/details.tsx'
import { QuotaCreatePage } from './pages/Dashboard/quota/create.tsx'
import { TicketDashboard } from './pages/Dashboard/ticket/index.tsx'
import { TicketDetails } from './pages/Dashboard/ticket/details.tsx'
import { TicketCreatePage } from './pages/Dashboard/ticket/create.tsx'
import { ScannerPage } from './pages/Dashboard/scanner/index.tsx'

configureAxios()


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // TODO: add error page
    errorElement: <Error />,
    loader: UserSelfLoader(queryClient),
    children: [
      {
        index: true,
        element: <Navigate to={'/login'} />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
        errorElement: <Error />,
        children: [
          {
            index: true,
            element: <Navigate to={'overview'} />
          },
          {
            path: 'profile',
            element: <Profile />
          },
          {
            path: 'overview',
            element: <OverviewDashboard />
          },
          {
            path: 'config',
            element: <ConfigPage />,
            loader: ConfigLoader(queryClient)
          },
          {
            path: 'scanner',
            element: <ScannerPage />
          },

          {
            path: 'organisation',
            children: [
              {
                index: true,
                element: <OrganisationDashboard />
              },
              {
                path: 'create',
                element: <OrganisationCreatePage />
              },
              {
                path: 'details/:UUID',
                element: <OrganisationDetails />,
              }
            ]
          },

          {
            path: 'user',
            children: [
              {
                index: true,
                element: <UserDashboard />
              },
              {
                path: 'details/:UUID',
                element: <UserDetails />
              },
              {
                path: 'create',
                element: <UserCreatePage />
              }
            ]
          },

          {
            path: 'quotaType',
            children: [
              {
                index: true,
                element: <QuotaTypeDashboard />
              },
              {
                path: 'details/:UUID',
                element: <QuotaTypeDetails />
              },
              {
                path: 'create',
                element: <QuotaTypeCreatePage />
              }
            ]
          },

          {
            path: 'invitation',
            children: [
              {
                index: true,
                element: <InvitationDashboard />
              },
              {
                path: 'details/:UUID',
                element: <InvitationDetails />
              },
              {
                path: 'create',
                element: <InvitationCreatePage />
              }
            ]
          },

          {
            path: 'quota',
            children: [
              {
                index: true,
                element: <QuotaDashboard />
              },
              {
                path: 'details/:UUID',
                element: <QuotaDetails />
              },
              {
                path: 'create',
                element: <QuotaCreatePage />
              }
            ]
          },

          {
            path: 'ticket',
            children: [
              {
                index: true,
                element: <TicketDashboard />
              },
              {
                path: 'details/:UUID',
                element: <TicketDetails />
              },
              {
                path: 'create',
                element: <TicketCreatePage />
              }
            ]
          }
        ]
      }
    ]
  }
])


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <RouterProvider router={router} />
        <div dangerouslySetInnerHTML={{ __html: import.meta.env.VITE_INJECT_HTML }}></div>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
