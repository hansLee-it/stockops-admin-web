/**
 * Product master types for StockOps frontend.
 * Matches backend DTOs for API communication.
 *
 * @author StockOps Team
 * @since 1.0
 */

/**
 * Product response from API.
 */
export interface ProductDTO {
  id: number
  barcode: string
  name: string
  description: string
  category: string
  unit: string
  expiryManaged: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Request payload for creating a new product.
 */
export interface CreateProductRequest {
  barcode: string
  name: string
  description?: string
  category?: string
  unit: string
  expiryManaged: boolean
}