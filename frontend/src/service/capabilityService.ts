import { apiClient } from './api'
import type { components } from './generated/api-schema'

type CapabilitiesDto = components['schemas']['CapabilitiesResponse']
type UsageDto = components['schemas']['UsageResponse']

export type CapabilityKey =
  | 'remediation'
  | 'contentPractice'
  | 'dailyPlan'
  | 'dialogue'
  | 'learningEvidence'

export interface FeatureCapability {
  enabled: boolean
  reason: string
}

export interface Capabilities {
  features: Partial<Record<CapabilityKey, FeatureCapability>>
  limits: Record<string, number>
}

export interface QuotaUsage {
  limit: number
  used: number
  remaining: number
  resetAt?: string
}

export const capabilityService = {
  async get(signal?: AbortSignal): Promise<Capabilities> {
    const dto = await apiClient<CapabilitiesDto>('/me/capabilities', { signal })
    const features = Object.fromEntries(
      Object.entries(dto.features ?? {}).map(([key, value]) => [
        key,
        {
          enabled: value.enabled ?? false,
          reason: value.reason ?? 'unknown',
        },
      ])
    ) as Partial<Record<CapabilityKey, FeatureCapability>>

    return {
      features,
      limits: dto.limits ?? {},
    }
  },

  async getUsage(signal?: AbortSignal): Promise<Record<string, QuotaUsage>> {
    const dto = await apiClient<UsageDto>('/me/usage', { signal })
    return Object.fromEntries(
      Object.entries(dto.operations ?? {}).map(([key, value]) => [
        key,
        {
          limit: value.limit ?? 0,
          used: value.used ?? 0,
          remaining: value.remaining ?? 0,
          resetAt: value.resetAt,
        },
      ])
    )
  },
}
