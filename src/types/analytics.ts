/**
 * Analytics and reporting TypeScript types.
 * Matches backend DTOs for the five Phase 2 BI metric groups
 * and shared query filter parameters.
 *
 * @author StockOps Team
 * @since 2.0
 */

/**
 * Shared analytics query filter parameters.
 * All fields are optional; the backend applies scope-based defaults.
 */
export interface AnalyticsQueryFilter {
  from?: string
  to?: string
  centerId?: number
  warehouseId?: number
}

// ─── Stock Aging ─────────────────────────────────────────────────────────────

/**
 * Stock-aging summary totals.
 */
export interface StockAgingSummary {
  rowCount: number
  totalAvailableQuantity: number
  zeroToThirtyQuantity: number
  thirtyOneToSixtyQuantity: number
  sixtyOneToNinetyQuantity: number
  overNinetyQuantity: number
  noDemandQuantity: number
}

/**
 * Detailed stock-aging row per product/warehouse.
 */
export interface StockAgingRow {
  productId: number
  productName: string
  centerId: number
  centerName: string
  warehouseId: number
  warehouseName: string
  businessDate: string
  availableQuantity: number
  averageDailyDemand: number | null
  estimatedCoverageDays: number | null
  agingBucket: string
}

/**
 * Stock-aging analytics response.
 */
export interface StockAgingReportResponse {
  summary: StockAgingSummary
  rows: StockAgingRow[]
}

// ─── Stockout Rate ───────────────────────────────────────────────────────────

/**
 * Stockout-rate summary totals.
 */
export interface StockoutRateSummary {
  rowCount: number
  observedDayCount: number
  stockoutDayCount: number
  overallStockoutRate: number
}

/**
 * Detailed stockout-rate row per product/warehouse.
 */
export interface StockoutRateRow {
  productId: number
  productName: string
  centerId: number
  centerName: string
  warehouseId: number
  warehouseName: string
  observedDayCount: number
  stockoutDayCount: number
  stockoutRate: number
  latestAvailableQuantity: number
}

/**
 * Stockout-rate analytics response.
 */
export interface StockoutRateReportResponse {
  summary: StockoutRateSummary
  rows: StockoutRateRow[]
}

// ─── Expiry Waste ────────────────────────────────────────────────────────────

/**
 * Expiry-waste summary totals.
 */
export interface ExpiryWasteSummary {
  rowCount: number
  quarantinedQuantity: number
  quarantinedLotCount: number
}

/**
 * Detailed expiry-waste row per product/warehouse.
 */
export interface ExpiryWasteRow {
  productId: number
  productName: string
  centerId: number
  centerName: string
  warehouseId: number
  warehouseName: string
  quarantinedQuantity: number
  quarantinedLotCount: number
}

/**
 * Expiry-waste analytics response.
 */
export interface ExpiryWasteReportResponse {
  summary: ExpiryWasteSummary
  rows: ExpiryWasteRow[]
}

// ─── Purchase Order Lead Time ────────────────────────────────────────────────

/**
 * Purchase-order lead-time summary totals.
 */
export interface PurchaseOrderLeadTimeSummary {
  rowCount: number
  purchaseOrderCount: number
  leadTimeSampleCount: number
  totalLeadTimeHours: number
  averageLeadTimeHours: number
}

/**
 * Detailed purchase-order lead-time row per product/warehouse.
 */
export interface PurchaseOrderLeadTimeRow {
  productId: number
  productName: string
  centerId: number
  centerName: string
  warehouseId: number
  warehouseName: string
  purchaseOrderCount: number
  leadTimeSampleCount: number
  totalLeadTimeHours: number
  averageLeadTimeHours: number
}

/**
 * Purchase-order lead-time analytics response.
 */
export interface PurchaseOrderLeadTimeReportResponse {
  summary: PurchaseOrderLeadTimeSummary
  rows: PurchaseOrderLeadTimeRow[]
}

// ─── Fill Rate ───────────────────────────────────────────────────────────────

/**
 * Fill-rate summary totals.
 */
export interface FillRateSummary {
  rowCount: number
  purchaseOrderCount: number
  requestedQuantity: number
  acceptedQuantity: number
  cancelledQuantity: number
  shippedQuantity: number
  acceptanceRate: number
  shippedFillRate: number
}

/**
 * Detailed fill-rate row per product/warehouse.
 */
export interface FillRateRow {
  productId: number
  productName: string
  centerId: number
  centerName: string
  warehouseId: number
  warehouseName: string
  purchaseOrderCount: number
  requestedQuantity: number
  acceptedQuantity: number
  cancelledQuantity: number
  shippedQuantity: number
  acceptanceRate: number
  shippedFillRate: number
}

/**
 * Fill-rate analytics response.
 */
export interface FillRateReportResponse {
  summary: FillRateSummary
  rows: FillRateRow[]
}

// ─── Metric type union ───────────────────────────────────────────────────────

/**
 * All available analytics metric identifiers.
 */
export type AnalyticsMetric =
  | 'stock-aging'
  | 'stockout-rate'
  | 'expiry-waste'
  | 'purchase-order-lead-time'
  | 'fill-rate'