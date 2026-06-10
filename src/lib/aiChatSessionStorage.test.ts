import { beforeEach, describe, expect, it } from 'vitest'
import { appendAIChatMessage, clearAIChatMessages, loadAIChatMessages } from './aiChatSessionStorage'
import type { ChatMessage } from '@/types/aiChat'

function message(id: string, content: string): ChatMessage {
  return { id, role: 'user', content, createdAt: '2026-06-10T00:00:00.000Z' }
}

describe('aiChatSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('stores admin AI chat messages in sessionStorage only', () => {
    appendAIChatMessage(message('m1', 'hello admin'))

    expect(loadAIChatMessages()).toEqual([message('m1', 'hello admin')])
    expect(localStorage.length).toBe(0)
  })

  it('keeps only the newest messages within the configured limit', () => {
    for (let index = 0; index < 14; index += 1) {
      appendAIChatMessage(message(`m${index}`, `message ${index}`), 10)
    }

    const loaded = loadAIChatMessages()

    expect(loaded).toHaveLength(10)
    expect(loaded[0].id).toBe('m4')
    expect(loaded[9].id).toBe('m13')
  })

  it('clears admin AI chat messages', () => {
    appendAIChatMessage(message('m1', 'hello admin'))

    clearAIChatMessages()

    expect(loadAIChatMessages()).toEqual([])
  })
})
