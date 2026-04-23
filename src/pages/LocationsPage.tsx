/**
 * Location management page component.
 * Displays location list with search, filters, and pagination.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState, useMemo } from 'react'
import { useLocations } from '@/hooks/useLocation'
import type { Location } from '@/types/location'
import { Search, Filter, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

/**
 * Locations page with table, search, filters, and pagination.
 *
 * @returns Locations page JSX element
 */
export function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10

  const { data: locations = [], isLoading, error } = useLocations()

  const filteredLocations = useMemo(() => {
    return locations.filter((item: Location) => {
      const matchesSearch =
        searchTerm === '' ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === 'all' || item.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [locations, searchTerm, typeFilter])

  const paginatedLocations = useMemo(() => {
    const start = currentPage * pageSize
    return filteredLocations.slice(start, start + pageSize)
  }, [filteredLocations, currentPage, pageSize])

  const totalPages = Math.ceil(filteredLocations.length / pageSize)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Locations</h1>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
            <MapPin className="w-4 h-4" />
            Add Location
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(0)
                }}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(0)
                }}
                className="px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="STORAGE">Storage</option>
                <option value="RECEIVING">Receiving</option>
                <option value="SHIPPING">Shipping</option>
                <option value="QUARANTINE">Quarantine</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <EmptyState
            title="Loading..."
            description="Fetching location data"
            variant="empty"
          />
        ) : error ? (
          <EmptyState
            title="Failed to load data"
            description="Please check your connection and try again"
            variant="error"
            actionLabel="Retry"
            onAction={() => window.location.reload()}
          />
        ) : paginatedLocations.length === 0 ? (
          <EmptyState
            title="No locations found"
            description="Add your first location to get started"
            actionLabel="Add Location"
            onAction={() => {}}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Zone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Shelf</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedLocations.map((item: Location) => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900">{item.code}</span>
                      </td>
                      <td className="px-4 py-3 text-neutral-900">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {item.zone || <span className="text-neutral-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {item.shelf || <span className="text-neutral-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {item.level || <span className="text-neutral-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <div className="text-sm text-neutral-500">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredLocations.length)} of {filteredLocations.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage < 3 ? i : currentPage - 2 + i
                      if (pageNum >= totalPages) return null
                      return (
<button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-neutral-100'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Returns type badge color classes.
 *
 * @param type - Location type
 * @returns Tailwind CSS classes for type badge
 */
function getTypeColor(type: string): string {
  switch (type) {
    case 'STORAGE':
      return 'bg-primary/10 text-primary'
    case 'RECEIVING':
      return 'bg-success/10 text-success'
    case 'SHIPPING':
      return 'bg-info/10 text-info'
    case 'QUARANTINE':
      return 'bg-warning/10 text-warning'
    default:
      return 'bg-neutral-100 text-neutral-600'
  }
}