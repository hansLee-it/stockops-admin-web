import api from '@/lib/api'
import type { SystemGeneralSettings, SystemIntegrations } from '@/types/settings'

export async function getGeneralSettings(): Promise<SystemGeneralSettings> {
  const response = await api.get<SystemGeneralSettings>('/v1/settings/general')
  return response.data
}

export async function getIntegrations(): Promise<SystemIntegrations> {
  const response = await api.get<SystemIntegrations>('/v1/settings/integrations')
  return response.data
}

export async function downloadBackupExport(): Promise<void> {
  const response = await api.get('/v1/backup/export', { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data as BlobPart], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'stockops-backup.json'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
