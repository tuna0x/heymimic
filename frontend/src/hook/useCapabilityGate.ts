import { useCallback, useEffect, useMemo, useState } from 'react'
import { capabilityService, type CapabilityKey, type Capabilities, type QuotaUsage } from '../service/capabilityService'
import { describeApiError, type ApiFailure } from '../service/api'

interface UseCapabilityGateOptions {
  operation?: string
  feature?: CapabilityKey
}

export interface CapabilityGateState {
  loading: boolean
  capabilities: Capabilities | null
  usage: QuotaUsage | undefined
  failure: ApiFailure | null
  blocked: boolean
  reason: string | null
  refresh: () => void
}

export function useCapabilityGate({
  operation,
  feature,
}: UseCapabilityGateOptions): CapabilityGateState {
  const [loading, setLoading] = useState(true)
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null)
  const [usageByOperation, setUsageByOperation] = useState<Record<string, QuotaUsage>>({})
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setFailure(null)

    Promise.all([
      capabilityService.get(controller.signal),
      capabilityService.getUsage(controller.signal),
    ])
      .then(([nextCapabilities, nextUsage]) => {
        setCapabilities(nextCapabilities)
        setUsageByOperation(nextUsage)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), [])

  const usage = operation ? usageByOperation[operation] : undefined
  const featureCapability = feature ? capabilities?.features[feature] : undefined
  const blockedByFeature = featureCapability?.enabled === false
  const blockedByQuota = usage !== undefined && usage.remaining <= 0
  const blocked = Boolean(blockedByFeature || blockedByQuota)

  const reason = useMemo(() => {
    if (blockedByFeature) {
      return featureCapability?.reason === 'rollout_disabled'
        ? 'Tính năng này chưa được mở cho tài khoản của bạn.'
        : 'Tính năng này hiện chưa khả dụng.'
    }
    if (blockedByQuota) return 'Bạn đã dùng hết lượt hôm nay.'
    return null
  }, [blockedByFeature, blockedByQuota, featureCapability?.reason])

  return { loading, capabilities, usage, failure, blocked, reason, refresh }
}
