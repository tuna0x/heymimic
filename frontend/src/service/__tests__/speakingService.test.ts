import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api'
import {
  speakingService,
  toSpeakingResult,
  toSpeakingSession,
  toSpeakingTopic,
} from '../speakingService'

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

describe('speakingService', () => {
  beforeEach(() => vi.mocked(apiClient).mockReset())

  it('maps the topic snapshot without injecting evaluation data', () => {
    const topic = toSpeakingTopic({
      id: 'topic-1',
      title: 'Sprint update',
      category: 'work',
      categoryLabel: 'Công việc',
      level: 'B1-B2',
      prompt: 'Share your progress.',
      content: {
        contextDescription: 'A daily stand-up.',
        starterSentence: 'Yesterday, I...',
        outline: ['Yesterday', 'Today', 'Blockers'],
        keyVocabulary: [{ word: 'blocker', meaning: 'trở ngại' }],
        modelAnswer: 'Yesterday, I completed the API.',
      },
    })

    expect(topic).toMatchObject({
      id: 'topic-1',
      category: 'work',
      level: 'B1-B2',
      outline: ['Yesterday', 'Today', 'Blockers'],
      keyVocab: [{ word: 'blocker', meaning: 'trở ngại' }],
    })
    expect(topic).not.toHaveProperty('mockResult')
  })

  it('maps only metrics returned by the evaluation provider', () => {
    const result = toSpeakingResult({
      id: 'evaluation-1',
      status: 'completed',
      transcript: 'I finished the API yesterday.',
      source: 'fake',
      result: {
        overallScore: 70,
        corrections: [
          {
            category: 'grammar',
            originalText: 'I finish it yesterday',
            improvedText: 'I finished it yesterday',
            note: 'Use the past tense.',
          },
        ],
      },
    })

    expect(result).toMatchObject({
      score: 70,
      userTranscript: 'I finished the API yesterday.',
      source: 'fake',
      feedback: [{ category: 'grammar' }],
      rephrases: [{ native: 'I finished it yesterday' }],
    })
    expect(result.wpm).toBeUndefined()
    expect(result.fluencyScore).toBeUndefined()
    expect(result.cadenceScore).toBeUndefined()
    expect(result.vocabScore).toBeUndefined()
  })

  it('uses the selected evaluated attempt when mapping a session', () => {
    const session = toSpeakingSession({
      id: 'session-1',
      status: 'completed',
      selectedAttemptId: 'attempt-1',
      topic: { id: 'topic-1', title: 'Sprint update', prompt: 'Share progress.' },
      attempts: [
        {
          attempt: {
            id: 'attempt-1',
            sessionId: 'session-1',
            attemptNumber: 1,
            durationMs: 65_000,
            audioState: 'available',
          },
          evaluation: {
            status: 'completed',
            transcript: 'Completed transcript',
            result: { overallScore: 84 },
          },
        },
      ],
    })

    expect(session).toMatchObject({
      id: 'session-1',
      duration: '01:05',
      score: 84,
      transcript: 'Completed transcript',
      attempts: [{ id: 'attempt-1', audioAvailability: 'inSession' }],
    })
  })

  it('completes a session with optimistic version and idempotency key', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      sessionId: 'session-1',
      selectedAttemptId: 'attempt-1',
    })
    const key = '00000000-0000-4000-8000-000000000001'

    await speakingService.completeSession('session-1', 'attempt-1', 6, key)

    expect(apiClient).toHaveBeenCalledWith('/speaking/sessions/session-1/complete', {
      method: 'POST',
      body: JSON.stringify({ selectedAttemptId: 'attempt-1', expectedVersion: 6 }),
      idempotencyKey: key,
    })
  })
})
