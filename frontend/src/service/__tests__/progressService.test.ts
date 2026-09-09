import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api'
import { progressService } from '../progressService'

vi.mock('../api', () => ({
  apiClient: vi.fn(),
}))

describe('progressService', () => {
  beforeEach(() => {
    vi.mocked(apiClient).mockReset()
  })

  it('maps mistake detail and occurrences into the frontend view model', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      pattern: {
        id: 'pattern-1',
        category: 'grammar',
        title: 'Articles',
        explanation: 'Use an article before singular nouns.',
        status: 'active',
        occurrenceCount: 2,
        version: 3,
      },
      occurrences: {
        items: [
          {
            id: 'occurrence-1',
            originalText: 'I am developer.',
            suggestedText: 'I am a developer.',
            occurredAt: '2026-09-08T08:00:00Z',
          },
        ],
      },
    })

    await expect(progressService.getMistake('pattern-1')).resolves.toMatchObject({
      id: 'pattern-1',
      status: 'active',
      count: 2,
      version: 3,
      occurrences: [
        {
          id: 'occurrence-1',
          original: 'I am developer.',
          suggested: 'I am a developer.',
        },
      ],
    })
  })

  it('sends the current version when updating mistake status', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      id: 'pattern-1',
      category: 'grammar',
      title: 'Articles',
      explanation: 'Explanation',
      status: 'resolved',
      occurrenceCount: 1,
      version: 5,
    })

    await progressService.updateMistakeStatus(
      {
        id: 'pattern-1',
        category: 'grammar',
        title: 'Articles',
        explanation: 'Explanation',
        status: 'active',
        count: 1,
        occurrences: [],
        version: 4,
      },
      'active'
    )

    expect(apiClient).toHaveBeenCalledWith('/progress/mistakes/pattern-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active', expectedVersion: 4 }),
    })
  })
})
