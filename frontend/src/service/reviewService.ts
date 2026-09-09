import type { VocabStatus, VocabWord } from '../type'
import { ApiError, apiClient } from './api'
import type { components } from './generated/api-schema'

type ReviewSessionDto = components['schemas']['ReviewSessionResponse']
type RateReviewWordDto = components['schemas']['RateReviewWordResponse']
export type ReviewCompletion = components['schemas']['ReviewCompletionResponse']

export interface ReviewSessionItem {
  id: string
  position: number
  word: VocabWord
  activeRatingEventId?: string
}

export interface ReviewSessionModel {
  id: string
  status: 'inProgress' | 'completed' | 'abandoned'
  currentIndex: number
  version: number
  items: ReviewSessionItem[]
}

function statusOf(value?: string): VocabStatus {
  if (value === 'reviewing' || value === 'mastered') return value
  return 'new'
}

function toSession(dto: ReviewSessionDto): ReviewSessionModel {
  if (!dto.id) throw new ApiError(0, 'Invalid review session response')
  return {
    id: dto.id,
    status:
      dto.status === 'completed'
        ? 'completed'
        : dto.status === 'abandoned'
          ? 'abandoned'
          : 'inProgress',
    currentIndex: dto.currentIndex ?? 0,
    version: dto.version ?? 0,
    items: (dto.items ?? []).map((item) => ({
      id: item.id ?? '',
      position: item.position ?? 0,
      activeRatingEventId: item.activeRatingEventId,
      word: {
        id: item.word?.id ?? '',
        word: item.word?.word ?? '',
        meaning: item.word?.meaning ?? '',
        pronunciation: item.word?.pronunciation ?? '',
        partOfSpeech: item.word?.partOfSpeech ?? '',
        example: item.word?.example ?? '',
        translation: item.word?.translation ?? '',
        sourceContext: item.word?.sourceContext,
        mastery: item.word?.mastery,
        nextReviewAt: item.word?.nextReviewAt,
        status: statusOf(item.word?.status),
      },
    })),
  }
}

async function getSession(
  sessionId: string,
  signal?: AbortSignal
): Promise<ReviewSessionModel> {
  return toSession(
    await apiClient<ReviewSessionDto>(
      `/vocabulary/review-sessions/${sessionId}`,
      { signal }
    )
  )
}

export const reviewService = {
  async getActive(signal?: AbortSignal): Promise<ReviewSessionModel | null> {
    const response = await apiClient<ReviewSessionDto | null>(
      '/vocabulary/review-sessions/active',
      { signal }
    )
    return response ? toSession(response) : null
  },

  async get(sessionId: string, signal?: AbortSignal): Promise<ReviewSessionModel> {
    return getSession(sessionId, signal)
  },

  async start(
    wordIds: string[] = [],
    idempotencyKey = crypto.randomUUID()
  ): Promise<ReviewSessionModel> {
    return toSession(
      await apiClient<ReviewSessionDto>('/vocabulary/review-sessions', {
        method: 'POST',
        body: JSON.stringify({ wordIds }),
        idempotencyKey,
      })
    )
  },

  async rate(
    session: ReviewSessionModel,
    rating: 'remembered' | 'needsReview',
    idempotencyKey = crypto.randomUUID()
  ): Promise<{ eventId: string; session: ReviewSessionModel }> {
    const item = session.items[session.currentIndex]
    if (!item?.word.id) throw new ApiError(0, 'Review session has no current word')
    const response = await apiClient<RateReviewWordDto>(
      `/vocabulary/review-sessions/${session.id}/ratings`,
      {
        method: 'POST',
        body: JSON.stringify({
          wordId: item.word.id,
          rating,
          expectedVersion: session.version,
        }),
        idempotencyKey,
      }
    )
    if (!response.eventId || !response.session) {
      throw new ApiError(0, 'Invalid review rating response')
    }
    return { eventId: response.eventId, session: toSession(response.session) }
  },

  async undo(
    session: ReviewSessionModel,
    eventId: string,
    idempotencyKey = crypto.randomUUID()
  ): Promise<ReviewSessionModel> {
    await apiClient<void>(
      `/vocabulary/review-sessions/${session.id}/ratings/${eventId}`,
      {
        method: 'DELETE',
        params: { expectedVersion: session.version },
        idempotencyKey,
      }
    )
    return getSession(session.id)
  },

  async complete(
    session: ReviewSessionModel,
    idempotencyKey = crypto.randomUUID()
  ): Promise<ReviewCompletion> {
    return apiClient<ReviewCompletion>(
      `/vocabulary/review-sessions/${session.id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ expectedVersion: session.version }),
        idempotencyKey,
      }
    )
  },

  async abandon(
    session: ReviewSessionModel,
    idempotencyKey = crypto.randomUUID()
  ): Promise<void> {
    await apiClient<void>(
      `/vocabulary/review-sessions/${session.id}/abandon`,
      {
        method: 'POST',
        body: JSON.stringify({ expectedVersion: session.version }),
        idempotencyKey,
      }
    )
  },
}
