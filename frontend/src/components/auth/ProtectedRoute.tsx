import { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RouteLoadingSpinner } from '../shared/RouteLoadingSpinner'
import { ROUTES } from '../../route/routePaths'

interface ProtectedRouteProps {
  children?: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <RouteLoadingSpinner />
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to /login and preserve return destination
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
