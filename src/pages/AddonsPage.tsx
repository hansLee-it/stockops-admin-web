/**
 * Add-ons marketplace page.
 * Displays available add-ons for extending StockOps functionality.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState } from 'react'
import { Package, Star, Download, ExternalLink, Search } from 'lucide-react'

interface Addon {
  id: string
  name: string
  description: string
  author: string
  category: string
  rating: number
  downloads: number
  price: string
  icon: string
  installed?: boolean
}

const mockAddons: Addon[] = [
  { id: '1', name: '바코드 스캐너 연동', description: '다양한 바코드 리더기와 연동하여 입출고 작업을 더욱 빠르게', author: 'StockOps Team', category: '입출고', rating: 4.8, downloads: 1250, price: '무료', icon: '📱' },
  { id: '2', name: '포스(POS) 연동', description: '포스 시스템과 연동하여 실시간 재고 동기화', author: 'Solutions Inc', category: '연동', rating: 4.5, downloads: 890, price: '₩99,000', icon: '🖥️' },
  { id: '3', name: '배달 플랫폼 연동', description: '쿠팡, MARKETKURLY 등 배달 플랫폼과 자동 연동', author: 'DeliveryPlus', category: '연동', rating: 4.2, downloads: 567, price: '₩149,000', icon: '🚚' },
  { id: '4', name: '고급 보고서', description: '세밀한 분석 보고서 및 데이터 내보내기 기능', author: 'DataTools', category: '분석', rating: 4.9, downloads: 2100, price: '₩59,000', icon: '📊' },
  { id: '5', name: '자동 발주 시스템', description: 'AI 기반 최적의 발주 시점과 수량 자동 계산', author: 'StockOps Team', category: 'AI', rating: 4.7, downloads: 1820, price: '₩199,000', icon: '🤖' },
  { id: '6', name: '멀티 매장 관리', description: '여러 매장의 재고를 한 화면에서 관리', author: 'MultiStore', category: '관리', rating: 4.4, downloads: 450, price: '₩129,000', icon: '🏪' },
  { id: '7', name: '간편 결제', description: '다양한 결제 수단 지원 및 정산 기능', author: 'PayEasy', category: '결제', rating: 4.6, downloads: 780, price: '₩79,000', icon: '💳' },
  { id: '8', name: '공급업체 관리', description: '공급업체별 발주 및 정산 관리', author: 'SupplyHub', category: '관리', rating: 4.3, downloads: 320, price: '₩89,000', icon: '🏭' },
]

const categories = ['전체', '연동', '분석', 'AI', '관리', '결제', '입출고']

export function AddonsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('전체')
  const [installedAddons, setInstalledAddons] = useState<string[]>(['1'])

  const filteredAddons = mockAddons.filter((addon) => {
    const matchesSearch = addon.name.toLowerCase().includes(search.toLowerCase()) ||
      addon.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === '전체' || addon.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleInstall = (id: string) => {
    setInstalledAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">🧩 Add-on 마켓</h1>
        <p className="text-text-secondary mt-1">StockOps를 확장하는 다양한 추가 기능을 확인하세요.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Add-on 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAddons.map((addon) => (
          <div key={addon.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{addon.icon}</span>
                {installedAddons.includes(addon.id) && (
                  <span className="px-2 py-0.5 text-xs bg-success/10 text-success rounded">설치됨</span>
                )}
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{addon.name}</h3>
              <p className="text-sm text-text-secondary mb-3 line-clamp-2">{addon.description}</p>
              <div className="flex items-center gap-2 text-xs text-text-light mb-4">
                <span>{addon.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  {addon.rating}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {addon.downloads}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-primary-600">{addon.price}</span>
                <button
                  onClick={() => toggleInstall(addon.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    installedAddons.includes(addon.id)
                      ? 'border border-neutral-300 hover:bg-neutral-100'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {installedAddons.includes(addon.id) ? '제거' : '설치'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAddons.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-text-light mx-auto mb-4" />
          <p className="text-text-secondary">검색 결과가 없습니다.</p>
        </div>
      )}

      <div className="bg-primary-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-primary-900 mb-2">나만의 Add-on을 만들어보세요!</h3>
        <p className="text-sm text-primary-700 mb-4">StockOps API를 활용하여 나만의 Add-on을 개발하고 판매할 수 있습니다.</p>
        <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
          개발자 문서
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
