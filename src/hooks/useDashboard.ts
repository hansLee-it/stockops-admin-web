/**
 * React Query hooks for dashboard data fetching.
 * Provides hooks for fetching dashboard summary and recent transactions.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import type { DashboardSummary } from '@/types/dashboard'
import type { InventoryTransaction } from '@/types/inventory'

/**
 * Fetches dashboard summary data.
 * Keeps dashboard metrics fresh with a 30-second polling interval while
 * treating data as fresh for 15 seconds to avoid unnecessary refetches.
 *
 * @returns React Query result with dashboard summary
 * @example
 * const { data: summary, isLoading } = useDashboardSummary()
 */
export function useDashboardSummary(): UseQueryResult<DashboardSummary, AxiosError> {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const response = await api.get<DashboardSummary>('/v1/dashboard/summary')
      return response.data
    },
    staleTime: 15000,
    refetchInterval: 30000,
  })
}

/**
 * Fetches recent transactions for dashboard display.
 * Keeps activity data synchronized with the dashboard auto-refresh cadence.
 *
 * @param limit - Maximum number of transactions to fetch (default: 5)
 * @returns React Query result with recent transaction array
 * @example
 * const { data: transactions } = useDashboardTransactions(10)
 */
export function useDashboardTransactions(limit: number = 5): UseQueryResult<InventoryTransaction[], AxiosError> {
  return useQuery({
    queryKey: ['dashboard', 'transactions', limit],
    queryFn: async () => {
      const response = await api.get<InventoryTransaction[]>('/v1/inventory/transactions/recent')
      return response.data.slice(0, limit)
    },
    staleTime: 15000,
    refetchInterval: 30000,
  })
}
