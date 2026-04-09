/**
 * Protected route wrapper component.
 * Redirects unauthenticated users to login page.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * Props for ProtectedRoute component.
 */
interface ProtectedRouteProps {
  /** Child components to render if authenticated */
  children: React.ReactNode
}

/**
 * Protected route wrapper that checks authentication status.
 * Redirects to /login if user is not authenticated.
 *
 * @param props - Component props containing children
 * @returns Children if authenticated, otherwise redirects to login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}