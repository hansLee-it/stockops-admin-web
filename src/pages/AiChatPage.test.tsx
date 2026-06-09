import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AiChatPage } from './AiChatPage'
import * as aiChatApi from '@/api/aiChat'
import type { AiChatResponse } from '@/types/aiChat'

vi.mock('@/api/aiChat')

const sendChatMessageMock = vi.mocked(aiChatApi.sendChatMessage)

function successResponse(overrides: Partial<AiChatResponse> = {}): AiChatResponse {
  return {
    message: '재고 수준이 충분합니다.',
    provider: 'bedrock',
    serviceStatus: 'AVAILABLE',
    fallbackUsed: false,
    ...overrides,
  }
}

async function submitMessage(text: string) {
  const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/)
  fireEvent.change(textarea, { target: { value: text } })
  fireEvent.submit(textarea.closest('form')!)
  await waitFor(() => expect(sendChatMessageMock).toHaveBeenCalledTimes(1))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AiChatPage', () => {
  it('shows fallback notice banner when response has fallbackNotice', async () => {
    sendChatMessageMock.mockResolvedValueOnce(
      successResponse({
        provider: 'vertex',
        serviceStatus: 'FALLBACK_ACTIVE',
        fallbackUsed: true,
        fallbackNotice: '기본 제공 모델의 연결이 불안정하여 보조 시스템으로 우회합니다.',
      })
    )

    render(<AiChatPage />)
    await submitMessage('재고 현황 알려줘')

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        '기본 제공 모델의 연결이 불안정하여 보조 시스템으로 우회합니다.'
      )
    })
  })

  it('shows service notice banner when response has serviceNotice', async () => {
    sendChatMessageMock.mockResolvedValueOnce(
      successResponse({
        provider: 'none',
        serviceStatus: 'UNCONFIGURED',
        serviceNotice: '연동된 AI서비스가 없습니다.',
      })
    )

    render(<AiChatPage />)
    await submitMessage('질문')

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('연동된 AI서비스가 없습니다.')
    })
  })

  it('clears notice banner when Bedrock recovers', async () => {
    sendChatMessageMock
      .mockResolvedValueOnce(
        successResponse({
          serviceStatus: 'FALLBACK_ACTIVE',
          fallbackUsed: true,
          fallbackNotice: '보조 시스템 사용 중',
        })
      )
      .mockResolvedValueOnce(successResponse())

    render(<AiChatPage />)
    await submitMessage('첫 번째 질문')
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())

    vi.clearAllMocks()
    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/)
    fireEvent.change(textarea, { target: { value: '두 번째 질문' } })
    fireEvent.submit(textarea.closest('form')!)
    await waitFor(() => expect(sendChatMessageMock).toHaveBeenCalledTimes(1))

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('does not show notice banner for a clean Bedrock response', async () => {
    sendChatMessageMock.mockResolvedValueOnce(successResponse())

    render(<AiChatPage />)
    await submitMessage('질문')

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })
})
