/**
 * API client for AI chat messages.
 *
 * @author StockOps Team
 * @since 2.1
 */

import api from '@/lib/api'
import type { AiChatRequest, AiChatResponse } from '@/types/aiChat'

export async function sendChatMessage(request: AiChatRequest): Promise<AiChatResponse> {
  const response = await api.post<AiChatResponse>('/v1/ai/chat/messages', request)
  return response.data
}
