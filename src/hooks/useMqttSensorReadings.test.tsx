import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useMqttSensorReadings } from './useMqttSensorReadings'

const handlers = new Map<string, (...args: unknown[]) => void>()
const subscribe = vi.fn()
const end = vi.fn()

vi.mock('@/lib/mqttClient', () => ({
  createMqttClient: () => ({
    on: (event: string, handler: (...args: unknown[]) => void) => handlers.set(event, handler),
    subscribe,
    end,
  }),
}))

describe('useMqttSensorReadings', () => {
  it('updates latest reading map from MQTT messages', () => {
    const { result } = renderHook(() => useMqttSensorReadings({
      url: 'ws://localhost:9001',
      topicFilter: 'sensimul/sites/+/sensors/+',
    }))

    act(() => {
      handlers.get('connect')?.()
      handlers.get('message')?.(
        'sensimul/sites/site-a/sensors/temp-1',
        Buffer.from(JSON.stringify({
          value: 4.2,
          status: 'NORMAL',
          timestamp: '2026-06-10T00:00:00.000Z',
        })),
      )
    })

    expect(subscribe).toHaveBeenCalledWith('sensimul/sites/+/sensors/+')
    expect(result.current.connectionStatus).toBe('connected')
    expect(result.current.readings.get('site-a/temp-1')?.value).toBe(4.2)
  })
})
