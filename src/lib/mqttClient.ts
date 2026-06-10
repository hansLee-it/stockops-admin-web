import mqtt from 'mqtt'
import type { MqttClient } from 'mqtt'

export interface MqttConnectionConfig {
  url: string
  username?: string
  password?: string
  clientIdPrefix?: string
}

export function createMqttClient(config: MqttConnectionConfig): MqttClient {
  return mqtt.connect(config.url, {
    username: config.username || undefined,
    password: config.password || undefined,
    clientId: `${config.clientIdPrefix || 'stockops-admin'}-${crypto.randomUUID()}`,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 10000,
  })
}
