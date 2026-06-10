/**
 * AiExplanationPanel — lazy-loaded AI recommendation explanation dialog.
 *
 * Renders an "AI 설명 보기" button next to a recommendation row.
 * On first click it fetches the explanation from Bedrock (server-cached),
 * then shows a card with summary, reasons, reviewer checklist, and risk level.
 *
 * @author StockOps Team
 * @since 2.0
 */

import { useState, type KeyboardEvent } from 'react'
import { fetchRecommendationExplanation } from '@/api/aiExplanation'
import type { AiRecommendationExplanation, RiskLevel } from '@/types/aiExplanation'
import { Bot, X, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

interface Props {
  recommendationId: number
}

const RISK_STYLES: Record<RiskLevel, { badge: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  LOW: { badge: 'bg-emerald-100 text-emerald-700', label: '낮음', icon: CheckCircle2 },
  MEDIUM: { badge: 'bg-amber-100 text-amber-700', label: '보통', icon: Info },
  HIGH: { badge: 'bg-red-100 text-red-700', label: '높음', icon: AlertTriangle },
}

/**
 * Button + inline panel that fetches and displays an AI explanation for a recommendation.
 */
export function AiExplanationPanel({ recommendationId }: Props) {
  const [explanation, setExplanation] = useState<AiRecommendationExplanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function handleOpen() {
    if (open) {
      setOpen(false)
      return
    }
    // Cache: if already fetched, just open without re-fetching
    if (explanation) {
      setOpen(true)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRecommendationExplanation(recommendationId)
      setExplanation(data)
      setOpen(true)
    } catch {
      setError('AI 설명을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void handleOpen()
    }
  }

  const riskConfig = explanation ? RISK_STYLES[explanation.riskLevel] : null

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => void handleOpen()}
        onKeyDown={handleKeyDown}
        disabled={loading}
        aria-label="AI 설명 보기"
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Bot className="w-3.5 h-3.5" />
        {loading ? '분석 중...' : open ? 'AI 설명 닫기' : 'AI 설명 보기'}
      </button>

      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}

      {open && explanation && riskConfig && (
        <div
          role="dialog"
          aria-label="AI 추천 설명"
          className="mt-2 p-3 rounded-lg border border-indigo-100 bg-indigo-50 text-sm space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-500" />
              <span className="font-medium text-indigo-800">AI 추천 설명</span>
              <span
                aria-label={`위험도: ${riskConfig.label}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${riskConfig.badge}`}
              >
                <riskConfig.icon className="w-3 h-3" />
                위험도: {riskConfig.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="닫기"
              className="text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Summary */}
          <p className="text-gray-700 leading-relaxed">{explanation.summary}</p>

          {/* Reasons */}
          {explanation.reasons.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                판단 근거
              </p>
              <ul aria-label="판단 근거" className="space-y-1">
                {explanation.reasons.map((reason, i) => (
                  <li key={i} className="flex gap-2 text-gray-600 text-xs">
                    <span className="mt-0.5 text-indigo-400">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviewer checklist */}
          {explanation.reviewerChecklist.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                검토 체크리스트
              </p>
              <ul aria-label="검토 체크리스트" className="space-y-1">
                {explanation.reviewerChecklist.map((item, i) => (
                  <li key={i} className="flex gap-2 text-gray-600 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <p aria-label="생성 모델" className="text-xs text-gray-400">
            모델: {explanation.modelId} · {new Date(explanation.generatedAt).toLocaleString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  )
}
