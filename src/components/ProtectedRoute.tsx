/**
 * Protected route wrapper component.
 * Redirects unauthenticated users to login page.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'

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
 * Waits for Zustand persist to rehydrate before checking.
 *
 * @param props - Component props containing children
 * @returns Children if authenticated, otherwise redirects to login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isRehydrated, setIsRehydrated] = useState(false)

  // Wait for Zustand persist to rehydrate from localStorage
  useEffect(() => {
    // Check if persist has rehydrated by checking if token exists in storage
    const storedAuth = localStorage.getItem('auth-storage')
    if (storedAuth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRehydrated(true)
    } else {
      // Set a small timeout to allow persist to complete
      const timer = setTimeout(() => setIsRehydrated(true), 100)
      return () => clearTimeout(timer)
    }
  }, [])

  // Show nothing while rehydrating to prevent flash of login page
  if (!isRehydrated) {
    return null
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
