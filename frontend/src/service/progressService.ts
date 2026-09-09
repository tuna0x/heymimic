import type { MistakeOccurrence, MistakePattern, ProgressDay } from '../type'
import { apiClient } from './api'
import type { components } from './generated/api-schema'

type DailyProgressDto = components['schemas']['DailyProgressView']
type ProgressOverviewDto = components['schemas']['ProgressOverviewView']
type MistakePatternDto = components['schemas']['MistakePatternView']
type MistakePatternPageDto = components['schemas']['MistakePatternPageView']
type MistakeDetailDto = components['schemas']['MistakeDetailView']

export interface ProgressOverview {
  totalMinutes: number
  streakDays: number
  todaySeconds: number
  dailyGoalMinutes: number
  pendingProjection: boolean
  projectedThrough?: string
  recommendation?: {
    kind: string
    title: string
    targetId?: string
    availableCount: number
  }
}

function dateRange(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - Math.max(0, days - 1))
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

function categoryOf(value?: string): MistakePattern['category'] {
  if (
    value === 'vocabulary' ||
    value === 'expression' ||
    value === 'pronunciation'
  ) {
    return value
  }
  return 'grammar'
}

function statusOf(value?: string): MistakePattern['status'] {
  if (value === 'improving' || value === 'mastered') return value
  return 'needsPractice'
}

function toMistakePattern(dto: MistakePatternDto): MistakePattern {
  return {
    id: dto.id ?? '',
    category: categoryOf(dto.category),
    title: dto.title ?? '',
    explanation: dto.explanation ?? '',
    status: statusOf(dto.status),
    count: dto.occurrenceCount ?? 0,
    occurrences: [],
    version: dto.version ?? 0,
  }
}

function toOccurrence(
  patternId: string,
  dto: components['schemas']['MistakeOccurrenceView']
): MistakeOccurrence {
  return {
    id: dto.id ?? '',
    patternId,
    speakingSessionId: '',
    sessionTitle: 'Bài đánh giá nói',
    original: dto.originalText ?? '',
    suggested: dto.suggestedText ?? '',
    occurredAt: dto.occurredAt ?? '',
    source: 'Phản hồi AI',
  }
}

export const progressService = {
  async getOverview(signal?: AbortSignal): Promise<ProgressOverview> {
    const dto = await apiClient<ProgressOverviewDto>('/progress/overview', { signal })
    return {
      totalMinutes: dto.totalMinutes ?? 0,
      streakDays: dto.streakDays ?? 0,
      todaySeconds: dto.todaySeconds ?? 0,
      dailyGoalMinutes: dto.dailyGoalMinutes ?? 10,
      pendingProjection: dto.pendingProjection ?? false,
      projectedThrough: dto.projectedThrough,
      recommendation: dto.recommendation
        ? {
            kind: dto.recommendation.kind ?? '',
            title: dto.recommendation.title ?? '',
            targetId: dto.recommendation.targetId,
            availableCount: dto.recommendation.availableCount ?? 0,
          }
        : undefined,
    }
  },

  async getDailyProgress(days = 7, signal?: AbortSignal): Promise<ProgressDay[]> {
    const range = dateRange(days)
    const response = await apiClient<DailyProgressDto>('/progress/daily', {
      params: range,
      signal,
    })
    return (response.days ?? []).map((day) => ({
      day: new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'UTC' }).format(
        new Date(`${day.date ?? range.to}T00:00:00Z`)
      ),
      date: day.date ?? range.to,
      minutes: Math.round((day.totalSeconds ?? 0) / 60),
      active: day.qualifiesForStreak ?? false,
    }))
  },

  async getMistakes(
    params: {
      status?: MistakePattern['status']
      category?: MistakePattern['category']
      page?: number
      size?: number
    } = {},
    signal?: AbortSignal
  ): Promise<MistakePattern[]> {
    const response = await apiClient<MistakePatternPageDto>('/progress/mistakes', {
      params: { page: 0, size: 100, ...params },
      signal,
    })
    return (response.items ?? []).map(toMistakePattern)
  },

  async getMistake(
    patternId: string,
    signal?: AbortSignal
  ): Promise<MistakePattern> {
    const response = await apiClient<MistakeDetailDto>(
      `/progress/mistakes/${patternId}`,
      { params: { page: 0, size: 100 }, signal }
    )
    const pattern = toMistakePattern(response.pattern ?? {})
    pattern.occurrences = (response.occurrences?.items ?? []).map((item) =>
      toOccurrence(pattern.id, item)
    )
    return pattern
  },

  async updateMistakeStatus(
    pattern: MistakePattern,
    status: MistakePattern['status']
  ): Promise<MistakePattern> {
    const response = await apiClient<MistakePatternDto>(
      `/progress/mistakes/${pattern.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, expectedVersion: pattern.version ?? 0 }),
      }
    )
    return {
      ...toMistakePattern(response),
      occurrences: pattern.occurrences,
    }
  },
}
