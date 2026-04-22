/**
 * Authentication state management store.
 * Manages JWT token and user information with persistent storage.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthenticatedUser } from '@/types/auth'

/**
 * Authentication state interface.
 */
interface AuthState {
  /** JWT access token */
  token: string | null
  /** Authenticated user information */
  user: AuthenticatedUser | null
  /** Store JWT token and user info after successful login */
  login: (token: string, user: AuthenticatedUser) => void
  /** Clear auth state on logout */
  logout: () => void
  /** Check if user is currently authenticated */
  isAuthenticated: () => boolean
}

/**
 * Auth store with Zustand state management.
 * Uses persist middleware to save auth state to localStorage.
 *
 * @example
 * const { token, user, login, logout, isAuthenticated } = useAuthStore()
 * 
 * // Login
 * login(accessToken, { id: 1, email: 'user@example.com', name: 'User', role: 'ADMIN', permissions: [], scopeMetadata: { global: true, assignments: [{ scope: 'GLOBAL', centerId: null, warehouseId: null }], centerIds: [], warehouseIds: [] } })
 * 
 * // Check authentication
 * if (isAuthenticated()) { ... }
 * 
 * // Logout
 * logout()
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      
      /**
       * Store authentication credentials.
       * @param token - JWT access token
       * @param user - User information object
       */
      login: (token, user) => set({ token, user }),
      
      /**
       * Clear authentication state.
       * Removes token and user information from store.
       */
      logout: () => set({ token: null, user: null }),
      
      /**
       * Check if user has valid authentication.
       * @returns true if token exists, false otherwise
       */
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
)
