/**
 * API client functions for environment monitoring domain operations.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { api } from '@/lib/api'
import type {
  ControllerCommand,
  ControllerCommandRequest,
  DashboardResponse,
  EnvironmentController,
  EnvironmentControllerRequest,
  PageResponse,
  SensorAlert,
  SensorDevice,
  SensorDeviceRequest,
  SensorHistory,
} from '@/types/environment'

export async function getSensors(page = 0, size = 20): Promise<PageResponse<SensorDevice>> {
  const response = await api.get<PageResponse<SensorDevice>>('/v1/environment/sensors', {
    params: { page, size },
  })
  return response.data
}

export async function getSensorById(id: number): Promise<SensorDevice> {
  const response = await api.get<SensorDevice>(`/v1/environment/sensors/${id}`)
  return response.data
}

export async function getSensorByExternalIds(siteId: string, sensorId: string): Promise<SensorDevice> {
  const response = await api.get<SensorDevice>(`/v1/environment/sensors/external/${siteId}/${sensorId}`)
  return response.data
}

export async function createSensor(data: SensorDeviceRequest): Promise<SensorDevice> {
  const response = await api.post<SensorDevice>('/v1/environment/sensors', data)
  return response.data
}

export async function updateSensor(id: number, data: SensorDeviceRequest): Promise<SensorDevice> {
  const response = await api.put<SensorDevice>(`/v1/environment/sensors/${id}`, data)
  return response.data
}

export async function deleteSensor(id: number): Promise<void> {
  await api.delete(`/v1/environment/sensors/${id}`)
}

export async function reactivateSensor(id: number): Promise<SensorDevice> {
  const response = await api.post<SensorDevice>(`/v1/environment/sensors/${id}/reactivate`)
  return response.data
}

export async function getControllers(page = 0, size = 20): Promise<PageResponse<EnvironmentController>> {
  const response = await api.get<PageResponse<EnvironmentController>>('/v1/environment/controllers', {
    params: { page, size },
  })
  return response.data
}

export async function getControllerById(id: number): Promise<EnvironmentController> {
  const response = await api.get<EnvironmentController>(`/v1/environment/controllers/${id}`)
  return response.data
}

export async function getControllerByExternalIds(
  siteId: string,
  controllerId: string,
): Promise<EnvironmentController> {
  const response = await api.get<EnvironmentController>(
    `/v1/environment/controllers/external/${siteId}/${controllerId}`,
  )
  return response.data
}

export async function createController(data: EnvironmentControllerRequest): Promise<EnvironmentController> {
  const response = await api.post<EnvironmentController>('/v1/environment/controllers', data)
  return response.data
}

export async function updateController(
  id: number,
  data: EnvironmentControllerRequest,
): Promise<EnvironmentController> {
  const response = await api.put<EnvironmentController>(`/v1/environment/controllers/${id}`, data)
  return response.data
}

export async function deleteController(id: number): Promise<void> {
  await api.delete(`/v1/environment/controllers/${id}`)
}

export async function reactivateController(id: number): Promise<EnvironmentController> {
  const response = await api.post<EnvironmentController>(`/v1/environment/controllers/${id}/reactivate`)
  return response.data
}

export async function getControllerCommands(controllerId: number, size = 20): Promise<ControllerCommand[]> {
  const response = await api.get<ControllerCommand[]>(`/v1/environment/controllers/${controllerId}/commands`, {
    params: { size },
  })
  return response.data
}

export async function sendControllerCommand(
  controllerId: number,
  data: ControllerCommandRequest,
): Promise<ControllerCommand> {
  const response = await api.post<ControllerCommand>(`/v1/environment/controllers/${controllerId}/commands`, data)
  return response.data
}

export async function getEnvironmentDashboard(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/v1/environment/dashboard')
  return response.data
}

export async function getEnvironmentAlerts(days = 30): Promise<SensorAlert[]> {
  const response = await api.get<SensorAlert[]>('/v1/environment/alerts', {
    params: { days },
  })
  return response.data
}

export async function getSensorHistory(sensorId: number, days = 30): Promise<SensorHistory[]> {
  const response = await api.get<SensorHistory[]>('/v1/environment/history', {
    params: { sensorId, days },
  })
  return response.data
}
