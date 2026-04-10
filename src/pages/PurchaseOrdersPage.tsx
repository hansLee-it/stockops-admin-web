/**
 * Purchase Orders management page.
 * Provides PO request, acceptance, shipment, and inbound workflow.
 *
 * @author StockOps Team
 * @since 2.0
 */

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Plus, Eye, X } from 'lucide-react'

interface Center {
  id: number
  code: string
  name: string
}

interface Warehouse {
  id: number
  code: string
  name: string
}

interface PurchaseOrder {
  id: number
  poNumber: string
  status: string
  supplierName?: string
  requestedAt?: string
  erpRespondedAt?: string
  totalRequestedAmount?: number
  requestingCenter?: Center
  targetWarehouse?: Warehouse
  items?: PurchaseOrderItem[]
}

interface PurchaseOrderItem {
  id: number
  productId: number
  requestedQuantity: number
  acceptedQuantity?: number
  cancelledQuantity?: number
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-600',
  REQUESTED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  PARTIALLY_ACCEPTED: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  SHIPMENT_CREATED: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '초안',
  REQUESTED: '요청됨',
  ACCEPTED: '수락됨',
  PARTIALLY_ACCEPTED: '부분수락',
  REJECTED: '거절됨',
  CANCELLED: '취소됨',
  SHIPMENT_CREATED: '발송등록',
  COMPLETED: '완료',
}

export function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [formData, setFormData] = useState({
    centerId: '',
    warehouseId: '',
  })

  useEffect(() => {
    fetchCenters()
    fetchPurchaseOrders()
  }, [])

  useEffect(() => {
    if (formData.centerId) {
      fetchWarehousesByCenter(formData.centerId)
    }
  }, [formData.centerId])

  const fetchCenters = async () => {
    try {
      const response = await api.get('/api/v1/centers')
      setCenters(response.data)
    } catch (error) {
      console.error('Failed to fetch centers:', error)
    }
  }

  const fetchWarehousesByCenter = async (centerId: string) => {
    try {
      const response = await api.get(`/api/v1/warehouses/center/${centerId}`)
      setWarehouses(response.data)
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const response = await api.get('/api/v1/purchase-orders')
      setPurchaseOrders(response.data)
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/v1/purchase-orders', null, {
        params: {
          centerId: formData.centerId,
          warehouseId: formData.warehouseId || null,
        },
      })
      fetchPurchaseOrders()
      setShowModal(false)
      setFormData({ centerId: '', warehouseId: '' })
    } catch (error) {
      console.error('Failed to create purchase order:', error)
    }
  }

  const handleStatusAction = async (poId: number, action: string, data?: any) => {
    try {
      switch (action) {
        case 'submit':
          await api.post(`/api/v1/purchase-orders/${poId}/submit`)
          break
        case 'accept':
          await api.post(`/api/v1/purchase-orders/${poId}/accept`, null, {
            params: { erpReference: data?.erpReference || 'ERP-REF' }
          })
          break
        case 'reject':
          await api.post(`/api/v1/purchase-orders/${poId}/reject`, null, {
            params: { reason: data?.reason || '재고 부족' }
          })
          break
        case 'cancel':
          await api.post(`/api/v1/purchase-orders/${poId}/cancel`, null, {
            params: { reason: data?.reason || '요청에 의한 취소' }
          })
          break
        case 'complete':
          await api.post(`/api/v1/purchase-orders/${poId}/complete`)
          break
      }
      fetchPurchaseOrders()
      if (selectedPO) {
        const updated = await api.get(`/api/v1/purchase-orders/${poId}`)
        setSelectedPO(updated.data)
      }
    } catch (error) {
      console.error(`Failed to ${action} purchase order:`, error)
    }
  }

  const getActionButtons = (po: PurchaseOrder) => {
    const buttons = []
    switch (po.status) {
      case 'DRAFT':
        buttons.push(
          <button
            key="submit"
            onClick={() => handleStatusAction(po.id, 'submit')}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            요청
          </button>
        )
        break
      case 'REQUESTED':
        buttons.push(
          <button
            key="accept"
            onClick={() => handleStatusAction(po.id, 'accept')}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            수락
          </button>,
          <button
            key="reject"
            onClick={() => handleStatusAction(po.id, 'reject')}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            거절
          </button>
        )
        break
      case 'ACCEPTED':
        buttons.push(
          <button
            key="cancel"
            onClick={() => handleStatusAction(po.id, 'cancel')}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            취소
          </button>
        )
        break
      case 'COMPLETED':
        buttons.push(
          <span key="done" className="text-green-600 text-sm font-medium">
            완료됨
          </span>
        )
        break
    }
    return buttons
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">발주 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          새 발주
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary">로딩 중...</div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">발주번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">센터</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">창고</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">요청일</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-mono text-sm">{po.poNumber}</td>
                  <td className="px-6 py-4 text-sm">{po.requestingCenter?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm">{po.targetWarehouse?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[po.status] || 'bg-neutral-100'}`}>
                      {STATUS_LABELS[po.status] || po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {po.requestedAt ? new Date(po.requestedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedPO(po)}
                      className="p-2 hover:bg-neutral-100 rounded-lg text-text-secondary"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <div className="inline-flex gap-2 ml-2">
                      {getActionButtons(po)}
                    </div>
                  </td>
                </tr>
              ))}
              {purchaseOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                    등록된 발주가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create PO Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">새 발주</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">요청 센터 *</label>
                <select
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
              <div>
                <label className="block text-sm font-medium mb-1">입고 창고</label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option value="">창고 선택</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
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
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">발주 상세</h2>
              <button onClick={() => setSelectedPO(null)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">발주번호</p>
                  <p className="font-mono font-medium">{selectedPO.poNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">상태</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[selectedPO.status]}`}>
                    {STATUS_LABELS[selectedPO.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">센터</p>
                  <p className="font-medium">{selectedPO.requestingCenter?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">창고</p>
                  <p className="font-medium">{selectedPO.targetWarehouse?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">요청일</p>
                  <p className="font-medium">{selectedPO.requestedAt ? new Date(selectedPO.requestedAt).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">ERP 응답</p>
                  <p className="font-medium">{selectedPO.erpRespondedAt ? new Date(selectedPO.erpRespondedAt).toLocaleString() : '-'}</p>
                </div>
              </div>

              {selectedPO.items && selectedPO.items.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">품목</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-3 py-2 text-left">품목ID</th>
                        <th className="px-3 py-2 text-right">요청수량</th>
                        <th className="px-3 py-2 text-right">수락수량</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedPO.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2">{item.productId}</td>
                          <td className="px-3 py-2 text-right">{item.requestedQuantity}</td>
                          <td className="px-3 py-2 text-right">{item.acceptedQuantity || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
