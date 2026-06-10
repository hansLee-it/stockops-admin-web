import { useState } from 'react'
import { sendChatMessage } from '@/api/aiChat'
import { appendAIChatMessage, clearAIChatMessages, loadAIChatMessages } from '@/lib/aiChatSessionStorage'
import type { ChatMessage } from '@/types/aiChat'

/**
 * Session-only admin AI chat state. Conversation is kept in browser sessionStorage
 * (no DB, no cookie, no localStorage) and recent context survives a tab refresh.
 * Reuses the existing `/v1/ai/chat/messages` backend contract via {@link sendChatMessage}.
 */
export function useAIChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadAIChatMessages())
  const [isSending, setIsSending] = useState(false)
  const [providerNotice, setProviderNotice] = useState('')

  async function send(content: string): Promise<void> {
    const text = content.trim()
    if (!text || isSending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages(appendAIChatMessage(userMessage))
    setIsSending(true)

    try {
      const response = await sendChatMessage({ message: text })
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message || '응답을 받지 못했습니다.',
        createdAt: new Date().toISOString(),
      }
      setMessages(appendAIChatMessage(assistantMessage))
      setProviderNotice(response.serviceNotice || response.fallbackNotice || '')
    } catch {
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'AI 채팅 API가 아직 준비되지 않았거나 접근 권한이 없습니다.',
        createdAt: new Date().toISOString(),
      }
      setMessages(appendAIChatMessage(fallbackMessage))
    } finally {
      setIsSending(false)
    }
  }

  function clear(): void {
    clearAIChatMessages()
    setMessages([])
    setProviderNotice('')
  }

  return { messages, send, clear, isSending, providerNotice }
}
