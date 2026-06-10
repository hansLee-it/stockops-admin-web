import { useMutation, useQuery } from '@tanstack/react-query'
import { downloadBackupExport, getGeneralSettings, getIntegrations } from '@/api/settings'

const GENERAL_SETTINGS_KEY = ['settings', 'general'] as const
const INTEGRATIONS_KEY = ['settings', 'integrations'] as const

export function useGeneralSettings() {
  return useQuery({
    queryKey: GENERAL_SETTINGS_KEY,
    queryFn: getGeneralSettings,
    staleTime: 30_000,
  })
}

export function useIntegrations() {
  return useQuery({
    queryKey: INTEGRATIONS_KEY,
    queryFn: getIntegrations,
    staleTime: 30_000,
  })
}

export function useDownloadBackupExport() {
  return useMutation({
    mutationFn: downloadBackupExport,
  })
}
