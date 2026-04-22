/**
 * Centers management page.
 * Provides CRUD operations for centers.
 *
 * @author StockOps Team
 * @since 2.0
 */

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Center {
  id: number
  code: string
  name: string
  address?: string
  phone?: string
  status: string
}

export function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState<Center | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
  })

  useEffect(() => {
    fetchCenters()
  }, [])

  const fetchCenters = async () => {
    try {
      const response = await api.get('/v1/centers')
      setCenters(response.data)
    } catch (error) {
      console.error('Failed to fetch centers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCenter) {
        await api.put(`/v1/centers/${editingCenter.id}`, formData)
      } else {
        await api.post('/v1/centers', formData)
      }
      fetchCenters()
      setShowModal(false)
      setEditingCenter(null)
      setFormData({ code: '', name: '', address: '', phone: '' })
    } catch (error) {
      console.error('Failed to save center:', error)
    }
  }

  const handleEdit = (center: Center) => {
    setEditingCenter(center)
    setFormData({
      code: center.code,
      name: center.name,
      address: center.address || '',
      phone: center.phone || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 센터를 삭제하시겠습니까?')) return
    try {
      await api.delete(`/v1/centers/${id}`)
      fetchCenters()
    } catch (error) {
      console.error('Failed to delete center:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">센터 관리</h1>
        <button
          onClick={() => {
            setEditingCenter(null)
            setFormData({ code: '', name: '', address: '', phone: '' })
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          새 센터
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary">로딩 중...</div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">코드</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">센터명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">주소</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">상태</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {centers.map((center) => (
                <tr key={center.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-mono text-sm">{center.code}</td>
                  <td className="px-6 py-4 font-medium">{center.name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{center.address || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      center.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {center.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(center)}
                      className="p-2 hover:bg-neutral-100 rounded-lg text-text-secondary"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(center.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {centers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                    등록된 센터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCenter ? '센터 수정' : '새 센터'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">센터 코드 *</label>
               <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg disabled:bg-neutral-100 disabled:text-text-secondary disabled:cursor-not-allowed"
                  required
                  disabled={!!editingCenter}
                />
                {editingCenter && (
                  <p className="mt-1 text-xs text-text-secondary">코드는 변경할 수 없습니다</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">센터명 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">연락처</label>
                <input
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
