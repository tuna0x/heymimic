import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api'
import { peerService, toPeerTopic } from '../peerService'

vi.mock('../api', () => ({
  apiClient: vi.fn(),
}))

describe('peerService', () => {
  beforeEach(() => vi.mocked(apiClient).mockReset())

  it('maps a published scenario into the local topic shape', () => {
    const topic = toPeerTopic({
      id: 'scenario-1',
      version: 3,
      title: 'A difficult handoff',
      category: 'work',
      categoryLabel: 'Công việc',
      level: 'B1-B2',
      commonObjective: 'Agree on a handoff plan.',
      description: 'Coordinate a delayed project handoff.',
      durationMinutes: 12,
      phases: [
        {
          phase: 'OPENING',
          title: 'Open',
          durationSeconds: 90,
          promptEn: 'Set the context.',
          promptVi: 'Nêu bối cảnh.',
          hints: ['Use a concrete example.'],
        },
      ],
    })

    expect(topic).toMatchObject({
      id: 'scenario-1',
      title: 'A difficult handoff',
      category: 'work',
      defaultDurationMinutes: 12,
      rounds: [{ roundNumber: 1, durationSeconds: 90, hints: ['Use a concrete example.'] }],
    })
  })

  it('creates a session with a stable idempotency key', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({ id: 'session-1' })
    const key = '00000000-0000-4000-8000-000000000001'

    await peerService.createSession('scenario-1-v3', key)

    expect(apiClient).toHaveBeenCalledWith('/peer/sessions', {
      method: 'POST',
      body: JSON.stringify({ scenarioVersionId: 'scenario-1-v3' }),
      idempotencyKey: key,
    })
  })

  it('sends expectedVersion for state-changing room commands', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({ id: 'session-1' })
    const key = '00000000-0000-4000-8000-000000000002'

    await peerService.setReady('session-1', true, 7, key)

    expect(apiClient).toHaveBeenCalledWith('/peer/sessions/session-1/ready', {
      method: 'PATCH',
      body: JSON.stringify({ ready: true, expectedVersion: 7 }),
      idempotencyKey: key,
    })
  })

  it('passes catalog filters as query parameters', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce([])

    await peerService.getScenarios({ category: 'interview', level: 'B2+' })

    expect(apiClient).toHaveBeenCalledWith('/peer/scenarios', {
      params: { category: 'interview', level: 'B2+' },
      signal: undefined,
    })
  })
})
