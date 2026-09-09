import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api'
import { studyService } from '../studyService'

vi.mock('../api', () => ({
  apiClient: vi.fn(),
}))

describe('studyService', () => {
  beforeEach(() => vi.mocked(apiClient).mockReset())

  it('maps child links and sends an idempotent combined plan', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      id: 'study-1',
      status: 'inProgress',
      currentStep: 0,
      version: 4,
      startedAt: '2026-09-08T08:00:00Z',
      steps: [
        { position: 0, kind: 'vocabulary', reviewSessionId: 'review-1' },
        { position: 1, kind: 'speaking', speakingSessionId: 'speaking-1' },
      ],
    })

    const idempotencyKey = '00000000-0000-4000-8000-000000000001'
    await expect(
      studyService.start(
        [
          { kind: 'vocabulary' },
          { kind: 'speaking', topicId: 'topic-1' },
        ],
        idempotencyKey
      )
    ).resolves.toMatchObject({
      id: 'study-1',
      currentStep: 'vocab',
      plannedSteps: ['vocab', 'speaking'],
      reviewSessionId: 'review-1',
      speakingSessionId: 'speaking-1',
      version: 4,
    })

    expect(apiClient).toHaveBeenCalledWith('/study-sessions', {
      method: 'POST',
      body: JSON.stringify({
        plannedSteps: [
          { kind: 'vocabulary' },
          { kind: 'speaking', topicId: 'topic-1' },
        ],
      }),
      idempotencyKey,
    })
  })
})
