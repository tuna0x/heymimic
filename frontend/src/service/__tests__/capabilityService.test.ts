import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api'
import { capabilityService } from '../capabilityService'

vi.mock('../api', () => ({
  apiClient: vi.fn(),
}))

describe('capabilityService', () => {
  beforeEach(() => {
    vi.mocked(apiClient).mockReset()
  })

  it('maps feature availability and limits from the server contract', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      features: {
        remediation: { enabled: true, reason: 'enabled' },
        dialogue: { enabled: false, reason: 'rollout_disabled' },
      },
      limits: { SPEAKING_EVALUATION: 20 },
    })

    await expect(capabilityService.get()).resolves.toEqual({
      features: {
        remediation: { enabled: true, reason: 'enabled' },
        dialogue: { enabled: false, reason: 'rollout_disabled' },
      },
      limits: { SPEAKING_EVALUATION: 20 },
    })
    expect(apiClient).toHaveBeenCalledWith('/me/capabilities', { signal: undefined })
  })

  it('maps per-operation usage and reset timestamps', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      operations: {
        CONTEXT_ANALYSIS: {
          limit: 20,
          used: 3,
          remaining: 17,
          resetAt: '2026-09-10T00:00:00Z',
        },
      },
    })

    await expect(capabilityService.getUsage()).resolves.toEqual({
      CONTEXT_ANALYSIS: {
        limit: 20,
        used: 3,
        remaining: 17,
        resetAt: '2026-09-10T00:00:00Z',
      },
    })
    expect(apiClient).toHaveBeenCalledWith('/me/usage', { signal: undefined })
  })
})
