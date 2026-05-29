/**
 * Authentication state management store.
 * Manages JWT token and user information in memory only (no localStorage persistence).
 *
 * @author StockOps Team
 * @since 1.0
 */

import { create } from 'zustand'
import type { AuthenticatedUser } from '@/types/auth'

/**
 * Authentication state interface.
 */
interface AuthState {
  /** JWT access token (memory only) */
  token: string | null
  /** Authenticated user information */
  user: AuthenticatedUser | null
  /** Store JWT token and user info after successful login */
  login: (token: string, user: AuthenticatedUser) => void
  /** Update access token after refresh */
  setToken: (token: string) => void
  /** Clear auth state on logout */
  logout: () => void
  /** Check if user is currently authenticated */
  isAuthenticated: () => boolean
}

/**
 * Auth store with Zustand state management.
 * No persist middleware — tokens live in memory only to prevent XSS token theft.
 *
 * @example
 * const { token, user, login, logout, isAuthenticated } = useAuthStore()
 *
 * // Login
 * login(accessToken, user)
 *
 * // Check authentication
 * if (isAuthenticated()) { ... }
 *
 * // Logout
 * logout()
 */
export const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  user: null,

  /**
   * Store authentication credentials.
   * @param token - JWT access token
   * @param user - User information object
   */
  login: (token, user) => set({ token, user }),

  /**
   * Update access token after a successful refresh.
   * @param token - New JWT access token
   */
  setToken: (token) => set({ token }),

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
}))
