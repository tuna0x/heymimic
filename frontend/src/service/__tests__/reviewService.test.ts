import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api'
import { reviewService } from '../reviewService'

vi.mock('../api', () => ({
  ApiError: class ApiError extends Error {},
  apiClient: vi.fn(),
}))

const sessionDto = {
  id: 'review-1',
  status: 'inProgress',
  currentIndex: 0,
  version: 2,
  items: [
    {
      id: 'item-1',
      position: 0,
      word: {
        id: 'word-1',
        word: 'clarify',
        meaning: 'làm rõ',
        status: 'reviewing',
      },
    },
  ],
}

describe('reviewService', () => {
  beforeEach(() => vi.mocked(apiClient).mockReset())

  it('maps the server word snapshot when resuming a review', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(sessionDto)

    await expect(reviewService.getActive()).resolves.toMatchObject({
      id: 'review-1',
      version: 2,
      items: [{ word: { id: 'word-1', word: 'clarify', status: 'reviewing' } }],
    })
  })

  it('rates the current snapshot word with the current session version', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      eventId: 'event-1',
      session: { ...sessionDto, currentIndex: 1, version: 3 },
    })

    const model = {
      id: 'review-1',
      status: 'inProgress' as const,
      currentIndex: 0,
      version: 2,
      items: [
        {
          id: 'item-1',
          position: 0,
          word: {
            id: 'word-1',
            word: 'clarify',
            meaning: 'làm rõ',
            pronunciation: '',
            partOfSpeech: '',
            example: '',
            translation: '',
            status: 'reviewing' as const,
          },
        },
      ],
    }

    const idempotencyKey = '00000000-0000-4000-8000-000000000001'
    await expect(reviewService.rate(model, 'remembered', idempotencyKey)).resolves.toMatchObject({
      eventId: 'event-1',
      session: { currentIndex: 1, version: 3 },
    })
    expect(apiClient).toHaveBeenCalledWith(
      '/vocabulary/review-sessions/review-1/ratings',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          wordId: 'word-1',
          rating: 'remembered',
          expectedVersion: 2,
        }),
        idempotencyKey,
      })
    )
  })
})
