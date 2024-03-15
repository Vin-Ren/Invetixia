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
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
