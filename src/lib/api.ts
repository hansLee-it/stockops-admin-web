/**
 * Axios HTTP client with JWT authentication interceptor.
 * Automatically attaches Bearer token to requests and handles 401 responses.
 *
 * @author StockOps Team
 * @since 1.0
 */

import axios from 'axios'
import { getErrorMessage, showErrorToast } from '@/lib/httpError'
import { showToast } from '@/lib/toast'
import { useAuthStore } from '@/stores/authStore'

/**
 * Axios instance configured for StockOps API.
 * Base URL is configurable via VITE_API_BASE_URL environment variable.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor that attaches JWT token to Authorization header.
 * Retrieves token from Zustand auth store.
 * Excludes login endpoint from adding Authorization header.
 */
api.interceptors.request.use((config) => {
  // Don't add Authorization header to login endpoint
  if (config.url === '/v1/auth/login') {
    return config
  }
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response interceptor that separates network failures from authentication errors.
 * Network and timeout failures surface a toast without clearing auth state,
 * while real 401 responses still force a logout and redirect to the login page.
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const message = getErrorMessage(error)

    if (message) {
      showErrorToast(message)
      return Promise.reject(error)
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }

    if (axios.isAxiosError(error) && (error.response?.status ?? 0) >= 500) {
      showToast({ message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', variant: 'error' })
    }

    return Promise.reject(error)
  }
)

export default api
