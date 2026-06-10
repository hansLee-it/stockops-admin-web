import { useEffect, useMemo, useState } from 'react'
import { createMqttClient } from '@/lib/mqttClient'
import type { MqttSensorPayload } from '@/types/environment'

export type MqttConnectionStatus = 'disabled' | 'connecting' | 'connected' | 'error'

export interface UseMqttSensorReadingsConfig {
  url?: string
  username?: string
  password?: string
  topicFilter?: string
}

export interface LiveSensorReading extends MqttSensorPayload {
  topic: string
  topicSiteId: string
  topicSensorId: string
}

export function useMqttSensorReadings(config: UseMqttSensorReadingsConfig) {
  const [connectionStatus, setConnectionStatus] = useState<MqttConnectionStatus>(config.url ? 'connecting' : 'disabled')
  const [readings, setReadings] = useState<Map<string, LiveSensorReading>>(new Map())
  const topicFilter = config.topicFilter || 'sensimul/sites/+/sensors/+'

  useEffect(() => {
    if (!config.url) {
      setConnectionStatus('disabled')
      return
    }

    const client = createMqttClient({
      url: config.url,
      username: config.username,
      password: config.password,
      clientIdPrefix: 'stockops-admin-sensors',
    })

    client.on('connect', () => {
      setConnectionStatus('connected')
      client.subscribe(topicFilter)
    })

    client.on('error', () => setConnectionStatus('error'))

    client.on('message', (topic, payload) => {
      const parsedTopic = parseSensorTopic(topic)
      if (!parsedTopic) return

      try {
        const body = JSON.parse(payload.toString()) as Partial<MqttSensorPayload>
        if (typeof body.value !== 'number' || typeof body.status !== 'string' || typeof body.timestamp !== 'string') {
          return
        }

        const reading: LiveSensorReading = {
          siteId: body.siteId || parsedTopic.siteId,
          sensorId: body.sensorId || parsedTopic.sensorId,
          sensorType: body.sensorType,
          valueKind: body.valueKind,
          value: body.value,
          unit: body.unit,
          status: body.status,
          timestamp: body.timestamp,
          sequenceId: body.sequenceId,
          schemaVersion: body.schemaVersion,
          topic,
          topicSiteId: parsedTopic.siteId,
          topicSensorId: parsedTopic.sensorId,
        }

        setReadings((current) => {
          const next = new Map(current)
          next.set(`${parsedTopic.siteId}/${parsedTopic.sensorId}`, reading)
          return next
        })
      } catch {
        return
      }
    })

    return () => {
      client.end(true)
    }
  }, [config.url, config.username, config.password, topicFilter])

  return useMemo(() => ({ connectionStatus, readings }), [connectionStatus, readings])
}

function parseSensorTopic(topic: string): { siteId: string; sensorId: string } | null {
  const parts = topic.split('/')
  if (parts.length !== 5) return null
  if (parts[0] !== 'sensimul' || parts[1] !== 'sites' || parts[3] !== 'sensors') return null
  return { siteId: parts[2], sensorId: parts[4] }
}
