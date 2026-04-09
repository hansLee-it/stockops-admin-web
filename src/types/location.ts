/**
 * Location master types for StockOps frontend.
 * Matches backend DTOs for API communication.
 *
 * @author StockOps Team
 * @since 1.0
 */

/**
 * Location response from API.
 */
export interface Location {
  id: number
  code: string
  name: string
  type: string
  zone: string | null
  shelf: string | null
  level: string | null
  createdAt: string
  updatedAt: string
}