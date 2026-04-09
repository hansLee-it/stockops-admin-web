/**
 * AI features page with demand forecasting and automated ordering.
 * Displays AI-powered insights, recommendations, and chatbot interface.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState } from 'react'
import { TrendingUp, ShoppingCart, AlertTriangle, BarChart3, Send, Bot } from 'lucide-react'

interface ReorderItem {
  name: string
  category: string
  current: number
  predicted: number
  recommended: number
  confidence: number
}

const mockReorderItems: ReorderItem[] = [
  { name: '생수 500ml', category: '음료', current: 120, predicted: 350, recommended: 300, confidence: 92 },
  { name: '칠면조 샌드위치', category: '식품', current: 25, predicted: 85, recommended: 80, confidence: 87 },
  { name: '감자칩 오리지널', category: '과자', current: 85, predicted: 120, recommended: 50, confidence: 78 },
]

const aiCards = [
  { icon: <TrendingUp className="w-8 h-8" />, title: '수요 예측', description: '과거 판매 데이터를 분석하여 미래 수요를 예측합니다', stats: [{ label: '예측 정확도', value: '87%' }, { label: '예측 기간', value: '7일' }] },
  { icon: <ShoppingCart className="w-8 h-8" />, title: '자동 발주', description: '최적의 발주량을 자동으로 계산하고 발주를 추천합니다', stats: [{ label: '발주 제안', value: '12' }, { label: '예상 금액', value: '₩1.2M' }], featured: true },
  { icon: <AlertTriangle className="w-8 h-8" />, title: '이상 감지', description: '재고와 판매 패턴의 이상을 자동으로 감지합니다', stats: [{ label: '감지됨', value: '3' }, { label: '모니터링', value: '24시간' }] },
  { icon: <BarChart3 className="w-8 h-8" />, title: '폐기율 분석', description: '유통기한 폐기 패턴을 분석하여 개선 방안을 제시합니다', stats: [{ label: '현재 폐기율', value: '2.3%' }, { label: '개선 목표', value: '-15%' }] },
]

const mockMessages = [
  { type: 'ai', content: '안녕하세요! StockOps AI 도우미입니다. 무엇을 도와드릴까요?', time: '13:00' },
  { type: 'user', content: '이번 주 어떤 상품을 더 주문해야 할까?', time: '13:01' },
  { type: 'ai', content: '분석 결과, 생수 500ml와 샌드위치류의 수요가 증가할 것으로 예측됩니다. 자동 발주 제안을 확인해보세요!', time: '13:01' },
]

export function AIFeaturesPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { type: 'user', content: input, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }])
    setInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">🤖 AI 기능</h1>
          <p className="text-text-secondary mt-1">머신러닝을 활용한 수요 예측과 자동 발주로 재고 관리를 더욱 스마트하게</p>
        </div>
        <span className="px-3 py-1 text-sm bg-info/10 text-info rounded-full">Beta</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiCards.map((card, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-xl border ${card.featured ? 'border-primary-500 shadow-lg' : 'border-neutral-200'}`}>
            {card.featured && <span className="inline-block px-2 py-0.5 text-xs bg-primary-100 text-primary-600 rounded mb-2">✨ 추천</span>}
            <div className="flex items-start gap-4">
              <div className="text-primary-500">{card.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary">{card.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{card.description}</p>
                <div className="flex gap-6 mt-4">
                  {card.stats.map((stat, sIdx) => (
                    <div key={sIdx}>
                      <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                      <p className="text-xs text-text-light">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  {card.title === '자동 발주' ? '발주 확인' : '자세히 보기'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold mb-4">🛒 이번 주 자동 발주 제안</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">상품</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">현재고</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">예측 수요</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">권장 발주량</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">신뢰도</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">관리</th>
              </tr>
            </thead>
            <tbody>
              {mockReorderItems.map((item, idx) => (
                <tr key={idx} className="border-b border-neutral-100">
                  <td className="py-3 px-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-text-light">{item.category}</p>
                  </td>
                  <td className="py-3 px-4">{item.current}</td>
                  <td className="py-3 px-4">{item.predicted}</td>
                  <td className="py-3 px-4 font-semibold">{item.recommended}개</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${item.confidence}%` }} />
                      </div>
                      <span className="text-sm font-medium">{item.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">발주</button>
                      <button className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-100">수정</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-200">
          <button className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">전체 발주 실행</button>
          <button className="px-4 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-100">발주 설정</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold mb-4">💬 AI 챗봇</h3>
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="h-64 overflow-y-auto p-4 bg-neutral-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`max-w-[70%] ${msg.type === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-neutral-200'} p-3 rounded-xl`}>
                  {msg.type === 'ai' && <Bot className="w-4 h-4 mb-1 text-primary-500" />}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white/70' : 'text-text-light'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t border-neutral-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="질문을 입력하세요... (예: 이번 주 판매 예측)"
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button onClick={handleSend} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-text-light mt-2 text-center">AI 챗봇은 Phase 2에서 실제 ML 모델과 연동됩니다.</p>
      </div>
    </div>
  )
}
