/**
 * AI Chat page.
 * Conversational interface backed by the AI provider layer (Bedrock / Vertex fallback).
 * Shows a provider status banner when the service is degraded or unavailable.
 *
 * @author StockOps Team
 * @since 2.1
 */

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { sendChatMessage } from '@/api/aiChat'
import type { ChatMessage } from '@/types/aiChat'
import { Bot, Send, User } from 'lucide-react'

export function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [providerStatusNotice, setProviderStatusNotice] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const response = await sendChatMessage({ message: text })
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message || '응답을 받지 못했습니다.',
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
      setProviderStatusNotice(response.serviceNotice || response.fallbackNotice || '')
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-neutral-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-neutral-900">AI 운영 어시스턴트</h1>
        <p className="mt-0.5 text-sm text-neutral-500">재고 운영에 관한 질문을 입력하세요.</p>
      </div>

      {providerStatusNotice ? (
        <div
          className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-sm text-amber-800 chat-provider-fallback-notice"
          role="status"
        >
          <span className="shrink-0 text-amber-500">⚠</span>
          {providerStatusNotice}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400 py-20">
            <Bot className="h-10 w-10" />
            <p className="text-sm">재고 현황, 추천 수량, 운영 이슈 등을 물어보세요.</p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                msg.role === 'user' ? 'bg-primary-600' : 'bg-neutral-700'
              }`}
            >
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500">
              <span className="inline-flex gap-1">
                <span className="animate-bounce [animation-delay:0ms]">·</span>
                <span className="animate-bounce [animation-delay:150ms]">·</span>
                <span className="animate-bounce [animation-delay:300ms]">·</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-neutral-200 px-6 py-4 flex gap-3 items-end"
      >
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as unknown as FormEvent)
            }
          }}
          placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
          rows={2}
          disabled={sending}
          className="flex-1 resize-none rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
