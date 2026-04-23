/**
 * Inventory management page component.
 * Displays inventory list with search, filters, and pagination.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState, useMemo } from 'react'
import { InventoryAdjustModal } from '@/components/inventory/InventoryAdjustModal'
import { useInventory } from '@/hooks/useInventory'
import type { Inventory } from '@/types/inventory'
import { Search, Filter, Eye, History, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

/**
 * Inventory page with table, search, filters, and pagination.
 *
 * @returns Inventory page JSX element
 */
export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const pageSize = 10

  const { data: inventory = [], isLoading, error } = useInventory()

  const selectedInventory = useMemo(
    () => inventory.find((item: Inventory) => item.id === selectedInventoryId) ?? null,
    [inventory, selectedInventoryId],
  )

  const filteredInventory = useMemo(() => {
    return inventory.filter((item: Inventory) => {
      const matchesSearch =
        searchTerm === '' ||
        item.productBarcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || getInventoryStatus(item) === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [inventory, searchTerm, statusFilter])

  const paginatedInventory = useMemo(() => {
    const start = currentPage * pageSize
    return filteredInventory.slice(start, start + pageSize)
  }, [filteredInventory, currentPage, pageSize])

  const totalPages = Math.ceil(filteredInventory.length / pageSize)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Inventory</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => selectedInventory && setIsAdjustModalOpen(true)}
            disabled={!selectedInventory}
            className="flex items-center gap-2 rounded bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            <Package className="w-4 h-4" />
            {selectedInventory ? 'Adjust Selected Stock' : 'Select Stock to Adjust'}
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
                placeholder="Search by barcode or product name..."
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
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(0)
                }}
                className="px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="RESERVED">Reserved</option>
                <option value="QUARANTINE">Quarantine</option>
                <option value="EXPIRED">Expired</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <EmptyState
            title="Loading..."
            description="Fetching inventory data"
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
        ) : paginatedInventory.length === 0 ? (
          <EmptyState
            title="No inventory found"
            description="Add products to your inventory to get started"
            actionLabel="Add Product"
            onAction={() => {}}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Lot Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Expiry Date</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700">Quantity</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedInventory.map((item: Inventory) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedInventoryId(item.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedInventoryId === item.id ? 'bg-primary-50' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-neutral-900">{item.productName}</div>
                          <div className="text-sm text-neutral-500">{item.productBarcode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-neutral-900">{item.locationCode}</div>
                          <div className="text-sm text-neutral-500">{item.locationName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-900">{item.lotNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-neutral-900">{formatDate(item.expiryDate)}</div>
                        {(() => {
                          const status = getExpiryStatus(item.expiryDate)
                          return status ? (
                            <div className={`text-sm ${status.color}`}>
                              {status.label}
                            </div>
                          ) : null
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-neutral-900">{item.quantity}</div>
                        {item.reservedQuantity > 0 && (
                          <div className="text-sm text-neutral-500">
                            Reserved: {item.reservedQuantity}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(getInventoryStatus(item))}`}>
                          {getInventoryStatus(item)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedInventoryId(item.id)
                              setIsAdjustModalOpen(true)
                            }}
                            className="rounded px-2 py-1 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
                            title="Adjust Stock"
                          >
                            Adjust
                          </button>
                          <button
                            type="button"
                            onClick={(event) => event.stopPropagation()}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-neutral-600" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => event.stopPropagation()}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
                            title="Transaction History"
                          >
                            <History className="w-4 h-4 text-neutral-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <div className="text-sm text-neutral-500">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredInventory.length)} of {filteredInventory.length} results
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

      <InventoryAdjustModal
        isOpen={isAdjustModalOpen}
        inventory={selectedInventory}
        onClose={() => setIsAdjustModalOpen(false)}
      />
    </div>
  )
}

/**
 * Determines inventory status based on backend status and expiry date.
 * Backend status takes precedence, but expired items are always shown as EXPIRED.
 */
function getInventoryStatus(item: Inventory): string {
  if (item.status === 'QUARANTINE' || item.status === 'EXPIRED') {
    return item.status
  }

  const today = new Date()
  const expiryDate = new Date(item.expiryDate)

  if (expiryDate < today) {
    return 'EXPIRED'
  }

  if (item.status === 'RESERVED') {
    return 'RESERVED'
  }

  if (item.quantity === 0) {
    return 'OUT_OF_STOCK'
  }

  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry <= 7) {
    return 'EXPIRING_SOON'
  }

  return 'ACTIVE'
}

/**
 * Returns status badge color classes.
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-success/10 text-success'
    case 'RESERVED':
      return 'bg-info/10 text-info'
    case 'EXPIRING_SOON':
      return 'bg-warning/10 text-warning'
    case 'EXPIRED':
      return 'bg-error/10 text-error'
    case 'QUARANTINE':
      return 'bg-warning/10 text-warning'
    case 'OUT_OF_STOCK':
      return 'bg-neutral-200 text-neutral-600'
    default:
      return 'bg-neutral-100 text-neutral-600'
  }
}

/**
 * Formats ISO date string to locale date string.
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

/**
 * Returns expiry status label and color if expiring soon.
 */
function getExpiryStatus(dateString: string): { label: string; color: string } | null {
  const today = new Date()
  const expiryDate = new Date(dateString)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry <= 0) {
    return { label: 'Expired', color: 'text-error' }
  }

  if (daysUntilExpiry <= 7) {
    return { label: `${daysUntilExpiry} days left`, color: 'text-error' }
  }

  if (daysUntilExpiry <= 14) {
    return { label: `${daysUntilExpiry} days left`, color: 'text-warning' }
  }

  if (daysUntilExpiry <= 30) {
    return { label: `${daysUntilExpiry} days left`, color: 'text-info' }
  }

  return null
}
