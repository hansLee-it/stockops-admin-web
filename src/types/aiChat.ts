/**
 * AI chat TypeScript types.
 * Matches backend AiChatResponse DTO.
 *
 * @author StockOps Team
 * @since 2.1
 */

export type AiServiceStatus =
  | 'AVAILABLE'
  | 'FALLBACK_ACTIVE'
  | 'UNCONFIGURED'
  | 'UNAUTHENTICATED'
  | 'UNAVAILABLE'

export interface AiChatRequest {
  message: string
  scopeType?: string
  scopeId?: number
}

export interface AiChatResponse {
  message: string
  provider: string
  serviceStatus: AiServiceStatus
  fallbackUsed: boolean
  fallbackNotice?: string
  serviceNotice?: string
  fallbackReason?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
