/**
 * Warehouses management page.
 * Provides CRUD operations for warehouses within a center.
 *
 * @author StockOps Team
 * @since 2.0
 */

import { useState, useEffect, useMemo } from 'react'
import api from '@/lib/api'
import { Plus, Edit, Trash2, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface Center {
  id: number
  code: string
  name: string
}

interface WarehouseItem {
  id: number
  code: string
  name: string
  address?: string
  phone?: string
  status: string
  center?: Center
  centerId?: number
}

export function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    centerId: '',
  })

  useEffect(() => {
    fetchCenters()
    fetchWarehouses()
  }, [])

  const fetchCenters = async () => {
    try {
      const response = await api.get('/v1/centers')
      setCenters(response.data)
    } catch (error) {
      console.error('Failed to fetch centers:', error)
    }
  }

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/v1/warehouses')
      setWarehouses(response.data)
    } catch (err) {
      console.error('Failed to fetch warehouses:', err)
      setError('창고 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingWarehouse) {
        await api.put(`/v1/warehouses/${editingWarehouse.id}`, formData)
      } else {
        await api.post(`/v1/warehouses/center/${formData.centerId}`, formData)
      }
      fetchWarehouses()
      setShowModal(false)
      setEditingWarehouse(null)
      setFormData({ code: '', name: '', address: '', phone: '', centerId: '' })
    } catch (error) {
      console.error('Failed to save warehouse:', error)
    }
  }

  const handleEdit = (warehouse: WarehouseItem) => {
    setEditingWarehouse(warehouse)
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address || '',
      phone: warehouse.phone || '',
      centerId: warehouse.center?.id?.toString() || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/v1/warehouses/${id}`)
      fetchWarehouses()
    } catch (error) {
      console.error('Failed to delete warehouse:', error)
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const paginatedWarehouses = useMemo(() => {
    const start = currentPage * pageSize
    return warehouses.slice(start, start + pageSize)
  }, [warehouses, currentPage])

  const totalPages = Math.ceil(warehouses.length / pageSize)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">창고 관리</h1>
        <button
          type="button"
          onClick={() => {
            setEditingWarehouse(null)
            setFormData({ code: '', name: '', address: '', phone: '', centerId: '' })
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          새 창고
        </button>
      </div>

      {loading ? (
        <EmptyState
          title="Loading..."
          description="Fetching warehouse data"
          variant="empty"
        />
      ) : error ? (
        <EmptyState
          title="Failed to load data"
          description={error}
          variant="error"
          actionLabel="Retry"
          onAction={() => fetchWarehouses()}
        />
      ) : warehouses.length === 0 ? (
        <EmptyState
          title="No warehouses found"
          description="Add your first warehouse to get started"
          actionLabel="Add Warehouse"
          onAction={() => {
            setEditingWarehouse(null)
            setFormData({ code: '', name: '', address: '', phone: '', centerId: '' })
            setShowModal(true)
          }}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">코드</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">창고명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">센터</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">주소</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-mono text-sm">{warehouse.code}</td>
                    <td className="px-6 py-4 font-medium">{warehouse.name}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm">
                        <Building2 className="w-4 h-4" />
                        {warehouse.center?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{warehouse.address || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        warehouse.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {warehouse.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleEdit(warehouse)}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-text-secondary"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ open: true, id: warehouse.id })}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3">
              <div className="text-sm text-text-secondary">
                총 {warehouses.length}개 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, warehouses.length)}개 표시
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

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={() => {
          if (deleteConfirm.id !== null) {
            void handleDelete(deleteConfirm.id)
          }
        }}
        title="창고 삭제"
        description="이 창고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        variant="destructive"
        confirmLabel="삭제"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingWarehouse ? '창고 수정' : '새 창고'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingWarehouse && (
                <div>
                  <label htmlFor="warehouse-center" className="block text-sm font-medium mb-1">소속 센터 *</label>
                  <select
                    id="warehouse-center"
                    value={formData.centerId}
                    onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    required
                  >
                    <option value="">센터 선택</option>
                    {centers.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name} ({center.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="warehouse-code" className="block text-sm font-medium mb-1">창고 코드 *</label>
                <input
                  id="warehouse-code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  required
                  disabled={!!editingWarehouse}
                />
              </div>
              <div>
                <label htmlFor="warehouse-name" className="block text-sm font-medium mb-1">창고명 *</label>
                <input
                  id="warehouse-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label htmlFor="warehouse-address" className="block text-sm font-medium mb-1">주소</label>
                <input
                  id="warehouse-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="warehouse-phone" className="block text-sm font-medium mb-1">연락처</label>
                <input
                  id="warehouse-phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}