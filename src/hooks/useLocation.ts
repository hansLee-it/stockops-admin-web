/**
 * React Query hooks for location data fetching.
 * Provides hooks for fetching location list and single location.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import type { Location } from '@/types/location'

/**
 * Fetches all locations.
 *
 * @param type - Optional location type filter
 * @returns React Query result with location array
 * @example
 * const { data: locations, isLoading } = useLocations()
 */
export function useLocations(type?: string): UseQueryResult<Location[], AxiosError> {
  return useQuery({
    queryKey: ['locations', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : ''
      const response = await api.get<Location[]>(`/api/v1/locations${params}`)
      return response.data
    },
  })
}

/**
 * Fetches single location by ID.
 *
 * @param id - Location identifier
 * @returns React Query result with single location
 * @example
 * const { data: location } = useLocationById(1)
 */
export function useLocationById(id: number | null): UseQueryResult<Location, AxiosError> {
  return useQuery({
    queryKey: ['location', id],
    queryFn: async () => {
      if (!id) throw new Error('Location ID is required')
      const response = await api.get<Location>(`/api/v1/locations/${id}`)
      return response.data
    },
    enabled: id !== null,
  })
}