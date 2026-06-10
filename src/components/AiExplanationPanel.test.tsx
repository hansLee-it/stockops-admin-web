/**
 * AiExplanationPanel component tests.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AiExplanationPanel } from './AiExplanationPanel'
import * as aiExplanationApi from '@/api/aiExplanation'
import type { AiRecommendationExplanation } from '@/types/aiExplanation'

vi.mock('@/api/aiExplanation')

const fetchMock = vi.mocked(aiExplanationApi.fetchRecommendationExplanation)

function sampleExplanation(overrides: Partial<AiRecommendationExplanation> = {}): AiRecommendationExplanation {
  return {
    recommendationId: 1,
    summary: '현재 재고가 안전 재고 이하입니다. 즉시 보충을 권장합니다.',
    reasons: ['7일 예측 수요가 현재 재고를 초과합니다.', '안전 재고 이하로 감소했습니다.'],
    reviewerChecklist: ['공급업체 납기 가능 여부 확인', '긴급 입고 절차 검토'],
    riskLevel: 'HIGH',
    modelId: 'anthropic.claude-3-haiku',
    generatedAt: '2026-06-10T08:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AiExplanationPanel', () => {
  it('renders the "AI 설명 보기" button initially', () => {
    render(<AiExplanationPanel recommendationId={1} />)
    expect(screen.getByRole('button', { name: 'AI 설명 보기' })).toBeInTheDocument()
  })

  it('shows loading state while fetching', async () => {
    fetchMock.mockImplementation(() => new Promise(() => {})) // never resolves
    render(<AiExplanationPanel recommendationId={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))

    expect(await screen.findByText('분석 중...')).toBeInTheDocument()
  })

  it('shows explanation summary after successful fetch', async () => {
    fetchMock.mockResolvedValueOnce(sampleExplanation())
    render(<AiExplanationPanel recommendationId={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))

    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'AI 추천 설명' })).toBeInTheDocument()
    )
    expect(screen.getByText(/즉시 보충을 권장합니다/)).toBeInTheDocument()
  })

  it('displays risk level badge', async () => {
    fetchMock.mockResolvedValueOnce(sampleExplanation({ riskLevel: 'HIGH' }))
    render(<AiExplanationPanel recommendationId={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))

    await waitFor(() => expect(screen.getByRole('dialog', { name: 'AI 추천 설명' })).toBeInTheDocument())
    expect(screen.getByLabelText('위험도: 높음')).toBeInTheDocument()
  })

  it('displays reviewer checklist items', async () => {
    fetchMock.mockResolvedValueOnce(sampleExplanation())
    render(<AiExplanationPanel recommendationId={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))

    await waitFor(() => expect(screen.getByRole('dialog', { name: 'AI 추천 설명' })).toBeInTheDocument())
    expect(screen.getByRole('list', { name: '검토 체크리스트' })).toBeInTheDocument()
    expect(screen.getByText('공급업체 납기 가능 여부 확인')).toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    render(<AiExplanationPanel recommendationId={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent('AI 설명을 불러오지 못했습니다')
  })

  it('does not re-fetch if explanation is already loaded', async () => {
    fetchMock.mockResolvedValueOnce(sampleExplanation())
    render(<AiExplanationPanel recommendationId={1} />)

    // First click: fetches
    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'AI 추천 설명' })).toBeInTheDocument())

    // Close the panel
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'AI 추천 설명' })).not.toBeInTheDocument())

    // Reopen: should NOT call fetchMock again
    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'AI 추천 설명' })).toBeInTheDocument())

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('displays model name in footer', async () => {
    fetchMock.mockResolvedValueOnce(sampleExplanation({ modelId: 'anthropic.claude-3-haiku' }))
    render(<AiExplanationPanel recommendationId={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'AI 설명 보기' }))

    await waitFor(() => expect(screen.getByRole('dialog', { name: 'AI 추천 설명' })).toBeInTheDocument())
    expect(screen.getByLabelText('생성 모델')).toHaveTextContent('anthropic.claude-3-haiku')
  })
})
