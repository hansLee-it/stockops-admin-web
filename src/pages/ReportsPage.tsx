/**
 * Reports page component.
 * Displays five Phase 2 BI metric groups with filter controls
 * and PDF/XLSX export actions.
 *
 * @author StockOps Team
 * @since 2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import {
  useStockAgingReport,
  useStockoutRateReport,
  useExpiryWasteReport,
  usePurchaseOrderLeadTimeReport,
  useFillRateReport,
  useAnalyticsExport,
} from '@/hooks/useAnalytics'
import type { AnalyticsQueryFilter, AnalyticsMetric } from '@/types/analytics'
import api from '@/lib/api'
import {
  BarChart3,
  TrendingDown,
  AlertTriangle,
  Clock,
  PackageCheck,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

interface CenterOption {
  id: number
  code: string
  name: string
}

interface WarehouseOption {
  id: number
  code: string
  name: string
  centerId: number
}

const METRIC_CONFIG: { key: AnalyticsMetric; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'stock-aging', label: '재고 에이징', icon: BarChart3 },
  { key: 'stockout-rate', label: '품절률', icon: TrendingDown },
  { key: 'expiry-waste', label: '유통기한 폐기', icon: AlertTriangle },
  { key: 'purchase-order-lead-time', label: '발주 리드타임', icon: Clock },
  { key: 'fill-rate', label: '충족률', icon: PackageCheck },
]

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${(value * 100).toFixed(1)}%`
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return '-'
  return value.toLocaleString('ko-KR')
}



export function ReportsPage() {
  const user = useAuthStore((s) => s.user)
  const isOnline = useOnlineStatus()
  const scopeMetadata = user?.scopeMetadata

  const [centerId, setCenterId] = useState<number | undefined>(undefined)
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [activeMetric, setActiveMetric] = useState<AnalyticsMetric>('stock-aging')
  const [centers, setCenters] = useState<CenterOption[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([])

  const filter: AnalyticsQueryFilter = useMemo(
    () => ({
      from: dateFrom || undefined,
      to: dateTo || undefined,
      centerId,
      warehouseId,
    }),
    [centerId, dateFrom, dateTo, warehouseId],
  )

  const stockAgingQuery = useStockAgingReport(filter)
  const stockoutRateQuery = useStockoutRateReport(filter)
  const expiryWasteQuery = useExpiryWasteReport(filter)
  const purchaseOrderLeadTimeQuery = usePurchaseOrderLeadTimeReport(filter)
  const fillRateQuery = useFillRateReport(filter)

  const pdfExport = useAnalyticsExport(activeMetric, 'pdf')
  const xlsxExport = useAnalyticsExport(activeMetric, 'xlsx')

  useEffect(() => {
    async function loadFilters() {
      try {
        const [centersRes, warehousesRes] = await Promise.all([
          api.get<CenterOption[]>('/v1/centers'),
          api.get<WarehouseOption[]>('/v1/warehouses'),
        ])
        setCenters(centersRes.data)
        setWarehouses(warehousesRes.data)
      } catch {
        // Filter data will remain empty; user can still use date filters
      }
    }
    loadFilters()
  }, [])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (scopeMetadata && !scopeMetadata.global) {
      if (scopeMetadata.centerIds.length === 1) {
        setCenterId(scopeMetadata.centerIds[0])
      }
      if (scopeMetadata.warehouseIds.length === 1) {
        setWarehouseId(scopeMetadata.warehouseIds[0])
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [scopeMetadata])

  const scopedCenters = scopeMetadata?.global
    ? centers
    : centers.filter((c) => scopeMetadata?.centerIds.includes(c.id) ?? false)

  const scopedWarehouses = centerId
    ? warehouses.filter((w) => w.centerId === centerId)
    : warehouses

  const filteredWarehouses = scopeMetadata?.global
    ? scopedWarehouses
    : scopedWarehouses.filter((w) => scopeMetadata?.warehouseIds.includes(w.id) ?? false)

  const handleCenterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setCenterId(value ? Number(value) : undefined)
    setWarehouseId(undefined)
  }, [])

  const handleWarehouseChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setWarehouseId(value ? Number(value) : undefined)
  }, [])

  const handleExportPdf = useCallback(() => {
    pdfExport.mutate(filter)
  }, [pdfExport, filter])

  const handleExportXlsx = useCallback(() => {
    xlsxExport.mutate(filter)
  }, [xlsxExport, filter])

  const activeQuery = (() => {
    switch (activeMetric) {
      case 'stock-aging': return stockAgingQuery
      case 'stockout-rate': return stockoutRateQuery
      case 'expiry-waste': return expiryWasteQuery
      case 'purchase-order-lead-time': return purchaseOrderLeadTimeQuery
      case 'fill-rate': return fillRateQuery
    }
  })()

  return (
    <div className="space-y-6" data-testid="reports-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">리포트 & 분석</h1>
          <p className="text-text-secondary mt-1">
            재고 에이징, 품절률, 폐기, 리드타임, 충족률 지표를 확인하세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              stockAgingQuery.refetch()
              stockoutRateQuery.refetch()
              expiryWasteQuery.refetch()
              purchaseOrderLeadTimeQuery.refetch()
              fillRateQuery.refetch()
            }}
            disabled={activeQuery.isLoading || !isOnline}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            data-testid="report-run"
          >
            조회
          </button>
          <button
            type="button"
            onClick={() => activeQuery.refetch()}
            disabled={activeQuery.isLoading || !isOnline}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            data-testid="report-refresh"
          >
            <RefreshCw className={`w-4 h-4 ${activeQuery.isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200" data-testid="report-filters">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-text-secondary" />
          <h2 className="text-sm font-semibold text-text-primary">필터</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="report-center-filter" className="block text-xs font-medium text-text-secondary mb-1">센터</label>
            <select
              id="report-center-filter"
              value={centerId ?? ''}
              onChange={handleCenterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              data-testid="report-center-filter"
            >
              <option value="">전체 센터</option>
              {scopedCenters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-warehouse-filter" className="block text-xs font-medium text-text-secondary mb-1">창고</label>
            <select
              id="report-warehouse-filter"
              value={warehouseId ?? ''}
              onChange={handleWarehouseChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              data-testid="report-warehouse-filter"
            >
              <option value="">전체 창고</option>
              {filteredWarehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-date-from" className="block text-xs font-medium text-text-secondary mb-1">시작일</label>
            <input
              id="report-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              data-testid="report-date-from"
            />
          </div>
          <div>
            <label htmlFor="report-date-to" className="block text-xs font-medium text-text-secondary mb-1">종료일</label>
            <input
              id="report-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              data-testid="report-date-to"
            />
          </div>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex flex-wrap gap-2" data-testid="report-metric-tabs">
        {METRIC_CONFIG.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveMetric(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMetric === key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-neutral-200 text-text-secondary hover:bg-neutral-50'
            }`}
            data-testid={`report-tab-${key}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Export Actions */}
      <div className="flex items-center gap-3" data-testid="report-export-actions">
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={pdfExport.isPending || activeQuery.isLoading || !isOnline}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70 text-sm font-medium"
          data-testid="report-export-pdf"
          title={!isOnline ? '오프라인에서는 내보내기를 실행할 수 없습니다.' : undefined}
        >
          <Download className="w-4 h-4" />
          {pdfExport.isPending ? '다운로드 중...' : 'PDF 다운로드'}
        </button>
        <button
          type="button"
          onClick={handleExportXlsx}
          disabled={xlsxExport.isPending || activeQuery.isLoading || !isOnline}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70 text-sm font-medium"
          data-testid="report-export-xlsx"
          title={!isOnline ? '오프라인에서는 내보내기를 실행할 수 없습니다.' : undefined}
        >
          <FileSpreadsheet className="w-4 h-4" />
          {xlsxExport.isPending ? '다운로드 중...' : 'XLSX 다운로드'}
        </button>
      </div>

      {/* Metric Content */}
      {activeQuery.isLoading && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 animate-pulse" data-testid="report-loading">
          <div className="space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-200 rounded w-2/3" />
            <div className="h-40 bg-neutral-100 rounded" />
          </div>
        </div>
      )}

      {activeQuery.error && (
        <EmptyState
          title="데이터를 불러오지 못했습니다"
          description="필터를 변경하거나 다시 시도해주세요."
          variant="error"
          actionLabel="다시 시도"
          onAction={() => activeQuery.refetch()}
        />
      )}

      {activeQuery.data && activeMetric === 'stock-aging' && stockAgingQuery.data && (
        <div data-testid="stock-aging-chart">
          <StockAgingContent summary={stockAgingQuery.data.summary} rows={stockAgingQuery.data.rows} />
        </div>
      )}

      {activeQuery.data && activeMetric === 'stockout-rate' && stockoutRateQuery.data && (
        <div data-testid="stockout-rate-chart">
          <StockoutRateContent summary={stockoutRateQuery.data.summary} rows={stockoutRateQuery.data.rows} />
        </div>
      )}

      {activeQuery.data && activeMetric === 'expiry-waste' && expiryWasteQuery.data && (
        <div data-testid="expiry-waste-chart">
          <ExpiryWasteContent summary={expiryWasteQuery.data.summary} rows={expiryWasteQuery.data.rows} />
        </div>
      )}

      {activeQuery.data && activeMetric === 'purchase-order-lead-time' && purchaseOrderLeadTimeQuery.data && (
        <div data-testid="purchase-order-lead-time-chart">
          <PurchaseOrderLeadTimeContent summary={purchaseOrderLeadTimeQuery.data.summary} rows={purchaseOrderLeadTimeQuery.data.rows} />
        </div>
      )}

      {activeQuery.data && activeMetric === 'fill-rate' && fillRateQuery.data && (
        <div data-testid="fill-rate-table">
          <FillRateContent summary={fillRateQuery.data.summary} rows={fillRateQuery.data.rows} />
        </div>
      )}
    </div>
  )
}

// ─── Metric Content Components ──────────────────────────────────────────────

function SummaryCard({ label, value, variant = 'default' }: { label: string; value: string; variant?: 'default' | 'warning' | 'success' | 'danger' }) {
  const variantClasses = {
    default: 'text-neutral-600',
    warning: 'text-amber-500',
    success: 'text-emerald-500',
    danger: 'text-red-500',
  }
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
      <h3 className="text-xs font-medium text-text-secondary mb-1">{label}</h3>
      <p className={`text-2xl font-bold ${variantClasses[variant]}`}>{value}</p>
    </div>
  )
}

function StockAgingContent({
  summary,
  rows,
}: {
  summary: import('@/types/analytics').StockAgingSummary
  rows: import('@/types/analytics').StockAgingRow[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <SummaryCard label="전체 품목" value={formatNumber(summary.rowCount)} />
        <SummaryCard label="총 재고량" value={formatNumber(summary.totalAvailableQuantity)} />
        <SummaryCard label="0-30일" value={formatNumber(summary.zeroToThirtyQuantity)} variant="success" />
        <SummaryCard label="31-60일" value={formatNumber(summary.thirtyOneToSixtyQuantity)} variant="default" />
        <SummaryCard label="61-90일" value={formatNumber(summary.sixtyOneToNinetyQuantity)} variant="warning" />
        <SummaryCard label="90일+" value={formatNumber(summary.overNinetyQuantity)} variant="danger" />
        <SummaryCard label="수요없음" value={formatNumber(summary.noDemandQuantity)} variant="warning" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">품목</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">센터</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">창고</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">가용재고</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">일평균수요</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">예상커버리지(일)</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">에이징</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">데이터가 없습니다</td></tr>
              ) : rows.map((row) => (
                <tr key={`${row.productId}-${row.warehouseId}`} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.productName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.centerName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.warehouseName}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.availableQuantity)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.averageDailyDemand)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.estimatedCoverageDays)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      row.agingBucket === '0-30' ? 'bg-emerald-100 text-emerald-700' :
                      row.agingBucket === '31-60' ? 'bg-blue-100 text-blue-700' :
                      row.agingBucket === '61-90' ? 'bg-amber-100 text-amber-700' :
                      row.agingBucket === '90+' ? 'bg-red-100 text-red-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {row.agingBucket}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StockoutRateContent({
  summary,
  rows,
}: {
  summary: import('@/types/analytics').StockoutRateSummary
  rows: import('@/types/analytics').StockoutRateRow[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="전체 품목" value={formatNumber(summary.rowCount)} />
        <SummaryCard label="관측일수" value={formatNumber(summary.observedDayCount)} />
        <SummaryCard label="품절일수" value={formatNumber(summary.stockoutDayCount)} variant="danger" />
        <SummaryCard label="전체 품절률" value={formatPercent(summary.overallStockoutRate)} variant={summary.overallStockoutRate > 0.1 ? 'danger' : 'warning'} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">품목</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">센터</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">창고</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">관측일수</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">품절일수</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">품절률</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">최근가용재고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">데이터가 없습니다</td></tr>
              ) : rows.map((row) => (
                <tr key={`${row.productId}-${row.warehouseId}`} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.productName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.centerName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.warehouseName}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.observedDayCount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.stockoutDayCount)}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      row.stockoutRate > 0.1 ? 'bg-red-100 text-red-700' :
                      row.stockoutRate > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {formatPercent(row.stockoutRate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.latestAvailableQuantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ExpiryWasteContent({
  summary,
  rows,
}: {
  summary: import('@/types/analytics').ExpiryWasteSummary
  rows: import('@/types/analytics').ExpiryWasteRow[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard label="전체 품목" value={formatNumber(summary.rowCount)} />
        <SummaryCard label="격리 수량" value={formatNumber(summary.quarantinedQuantity)} variant="danger" />
        <SummaryCard label="격리 LOT 수" value={formatNumber(summary.quarantinedLotCount)} variant="warning" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">품목</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">센터</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">창고</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">격리 수량</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">격리 LOT 수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-secondary">데이터가 없습니다</td></tr>
              ) : rows.map((row) => (
                <tr key={`${row.productId}-${row.warehouseId}`} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.productName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.centerName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.warehouseName}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.quarantinedQuantity)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.quarantinedLotCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PurchaseOrderLeadTimeContent({
  summary,
  rows,
}: {
  summary: import('@/types/analytics').PurchaseOrderLeadTimeSummary
  rows: import('@/types/analytics').PurchaseOrderLeadTimeRow[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="전체 품목" value={formatNumber(summary.rowCount)} />
        <SummaryCard label="발주 수" value={formatNumber(summary.purchaseOrderCount)} />
        <SummaryCard label="샘플 수" value={formatNumber(summary.leadTimeSampleCount)} />
        <SummaryCard label="평균 리드타임" value={`${formatNumber(summary.averageLeadTimeHours)}시간`} variant={summary.averageLeadTimeHours > 72 ? 'danger' : 'default'} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">품목</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">센터</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">창고</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">발주 수</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">샘플 수</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">총 리드타임(h)</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">평균 리드타임(h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">데이터가 없습니다</td></tr>
              ) : rows.map((row) => (
                <tr key={`${row.productId}-${row.warehouseId}`} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.productName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.centerName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.warehouseName}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.purchaseOrderCount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.leadTimeSampleCount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.totalLeadTimeHours)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.averageLeadTimeHours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function FillRateContent({
  summary,
  rows,
}: {
  summary: import('@/types/analytics').FillRateSummary
  rows: import('@/types/analytics').FillRateRow[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <SummaryCard label="전체 품목" value={formatNumber(summary.rowCount)} />
        <SummaryCard label="발주 수" value={formatNumber(summary.purchaseOrderCount)} />
        <SummaryCard label="요청 수량" value={formatNumber(summary.requestedQuantity)} />
        <SummaryCard label="수락 수량" value={formatNumber(summary.acceptedQuantity)} variant="success" />
        <SummaryCard label="취소 수량" value={formatNumber(summary.cancelledQuantity)} variant="danger" />
        <SummaryCard label="수락률" value={formatPercent(summary.acceptanceRate)} variant={summary.acceptanceRate >= 0.9 ? 'success' : 'warning'} />
        <SummaryCard label="출하 충족률" value={formatPercent(summary.shippedFillRate)} variant={summary.shippedFillRate >= 0.9 ? 'success' : 'warning'} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">품목</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">센터</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">창고</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">발주 수</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">요청</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">수락</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">취소</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">출하</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">수락률</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">충족률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-text-secondary">데이터가 없습니다</td></tr>
              ) : rows.map((row) => (
                <tr key={`${row.productId}-${row.warehouseId}`} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.productName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.centerName}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.warehouseName}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.purchaseOrderCount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.requestedQuantity)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.acceptedQuantity)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.cancelledQuantity)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumber(row.shippedQuantity)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      row.acceptanceRate >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                      row.acceptanceRate >= 0.7 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {formatPercent(row.acceptanceRate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      row.shippedFillRate >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                      row.shippedFillRate >= 0.7 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {formatPercent(row.shippedFillRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
