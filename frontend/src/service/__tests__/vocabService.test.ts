import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api'
import { toContextSuggestions, vocabService } from '../vocabService'

vi.mock('../api', () => ({
  ApiError: class ApiError extends Error {
    constructor(
      public status: number,
      message: string,
      public data?: unknown
    ) {
      super(message)
    }
  },
  apiClient: vi.fn(),
}))

describe('vocabService', () => {
  beforeEach(() => vi.mocked(apiClient).mockReset())

  it('reads the vocabulary count from page metadata', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      items: [],
      page: 0,
      size: 1,
      totalItems: 37,
      totalPages: 37,
    })

    await expect(vocabService.getVocabWordCount()).resolves.toBe(37)
    expect(apiClient).toHaveBeenCalledWith('/vocabulary/words', {
      params: { page: 0, size: 1 },
      signal: undefined,
    })
  })

  it('maps existing suggestions as unavailable for selection', () => {
    expect(
      toContextSuggestions({
        id: 'analysis-1',
        status: 'completed',
        source: 'fake',
        suggestions: [
          {
            id: 'suggestion-1',
            word: 'resilient',
            meaning: 'kiên cường',
            sourceSentence: 'The team was resilient.',
            existingWordId: 'word-1',
          },
          {
            id: 'suggestion-2',
            word: 'blocker',
            meaning: 'trở ngại',
            sourceSentence: 'There is one blocker.',
          },
        ],
      })
    ).toEqual([
      expect.objectContaining({ id: 'suggestion-1', selected: false }),
      expect.objectContaining({ id: 'suggestion-2', selected: true }),
    ])
  })

  it('polls the analysis resource and returns a completed result', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      id: 'analysis-1',
      status: 'completed',
      source: 'fake',
      suggestions: [],
    })

    await expect(vocabService.waitForContextAnalysis('analysis-1')).resolves.toMatchObject({
      id: 'analysis-1',
      status: 'completed',
    })
    expect(apiClient).toHaveBeenCalledWith(
      '/vocabulary/context-analyses/analysis-1',
      { signal: undefined }
    )
  })

  it('saves only the supplied suggestion IDs for an analysis', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      items: [
        {
          id: 'word-1',
          word: 'blocker',
          meaning: 'trở ngại',
          status: 'new',
          version: 1,
        },
      ],
    })
    const key = '00000000-0000-4000-8000-000000000001'

    await expect(
      vocabService.saveSuggestions('analysis-1', ['suggestion-2'], key)
    ).resolves.toEqual([
      expect.objectContaining({ id: 'word-1', word: 'blocker', version: 1 }),
    ])
    expect(apiClient).toHaveBeenCalledWith('/vocabulary/words', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'analysis-1',
        suggestionIds: ['suggestion-2'],
      }),
      idempotencyKey: key,
    })
  })
})
