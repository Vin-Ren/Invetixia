import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout, { loader as UserSelfLoader } from './layout.tsx'
import './index.css'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Login } from './pages/login.tsx'
import { Dashboard } from './pages/Dashboard/layout.tsx'
import { Overview as OverviewDashboard } from './pages/Dashboard/overview.tsx'
import { OrganisationDashboard } from './pages/Dashboard/organisation/index.tsx'
import Error from './pages/error.tsx'
import { configureAxios } from './lib/api/index.ts'
import { UserDashboard } from './pages/Dashboard/user/index.tsx'
import { OrganisationDetails } from './pages/Dashboard/organisation/details.tsx'

configureAxios()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
      refetchInterval: import.meta.env.VITE_QUERY_STALE_TIME_AND_REFRESH_INTERVAL,
      refetchOnReconnect: true
    },
  },
})


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
            element: <Navigate to={'/dashboard/overview'} />
          },
          {
            path: '/dashboard/overview',
            element: <OverviewDashboard />
          },
          {
            path: '/dashboard/organisation',
            element: <OrganisationDashboard />,
          },
          {
            path: '/dashboard/organisation/:UUID',
            element: <OrganisationDetails />,
          },
          {
            path: '/dashboard/user',
            element: <UserDashboard />
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
