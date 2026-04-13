/**
 * HTTP error utilities for user-facing network failure handling.
 * Distinguishes transport issues from server responses so auth state is only
 * cleared for real authentication failures.
 *
 * @author StockOps Team
 * @since 1.0
 */

import axios from 'axios'

const HTTP_ERROR_TOAST_ID = 'stockops-http-error-toast'
const HTTP_ERROR_TOAST_DURATION_MS = 4000

/**
 * User-facing message for timeout or network connectivity failures.
 */
export const NETWORK_ERROR_MESSAGE = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'

let activeToastTimeout: number | undefined

/**
 * Returns a user-facing message for timeout and network transport failures.
 * Authentication and other HTTP response errors return null so callers can
 * preserve their existing handling flow.
 *
 * @param error - Unknown error thrown during an HTTP request
 * @returns Network failure message when special handling is required, otherwise null
 * @example
 * const message = getErrorMessage(error)
 * if (message) {
 *   showErrorToast(message)
 * }
 */
export function getErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
    return NETWORK_ERROR_MESSAGE
  }

  return null
}

/**
 * Shows a temporary toast for network-related HTTP errors.
 * Reuses a single DOM element so repeated failures do not stack endlessly.
 *
 * @param message - Message shown to the user
 * @returns Nothing
 */
export function showErrorToast(message: string): void {
  if (typeof document === 'undefined' || !document.body) {
    return
  }

  document.getElementById(HTTP_ERROR_TOAST_ID)?.remove()

  const toast = document.createElement('div')
  toast.id = HTTP_ERROR_TOAST_ID
  toast.setAttribute('role', 'alert')
  toast.textContent = message

  Object.assign(toast.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    maxWidth: 'calc(100vw - 32px)',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500',
  } satisfies Partial<CSSStyleDeclaration>)

  document.body.appendChild(toast)

  if (activeToastTimeout !== undefined) {
    window.clearTimeout(activeToastTimeout)
  }

  activeToastTimeout = window.setTimeout(() => {
    document.getElementById(HTTP_ERROR_TOAST_ID)?.remove()
    activeToastTimeout = undefined
  }, HTTP_ERROR_TOAST_DURATION_MS)
}
