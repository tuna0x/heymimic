import type {
  AgentFeedback,
  SpeakingAttempt,
  SpeakingResult,
  SpeakingSession,
  SpeakingTopic,
} from '../type'
import { apiClient, ApiError } from './api'
import type { components } from './generated/api-schema'

export type SpeakingAttemptDto = components['schemas']['SpeakingAttemptView']
type AttemptUploadDto = components['schemas']['AttemptUploadView']
type AttemptPlaybackDto = components['schemas']['AttemptPlaybackView']
export type SpeakingEvaluationDto = components['schemas']['SpeakingEvaluationView']
export type SpeakingTopicDto = components['schemas']['SpeakingTopicView']
export type SpeakingSessionDto = components['schemas']['SpeakingSessionView']
type SpeakingHistoryDto = components['schemas']['SpeakingSessionHistoryPage']
type CompletedSpeakingDto = components['schemas']['CompletedSpeakingSession']

interface EvaluationResult {
  overallScore?: number
  wordsPerMinute?: number
  strengths?: string[]
  corrections?: Array<{
    category?: string
    originalText?: string
    improvedText?: string
    note?: string
  }>
}

export function toSpeakingTopic(dto: SpeakingTopicDto): SpeakingTopic {
  const categories: SpeakingTopic['category'][] = ['work', 'interview', 'casual', 'opinion']
  const levels: SpeakingTopic['level'][] = ['A2-B1', 'B1-B2', 'B2+']
  const category = categories.includes(dto.category as SpeakingTopic['category'])
    ? (dto.category as SpeakingTopic['category'])
    : 'work'
  const level = levels.includes(dto.level as SpeakingTopic['level'])
    ? (dto.level as SpeakingTopic['level'])
    : 'B1-B2'
  return {
    id: dto.id ?? '',
    category,
    categoryLabel: dto.categoryLabel ?? dto.category ?? 'Speaking',
    title: dto.title ?? '',
    level,
    prompt: dto.prompt ?? '',
    contextDesc: dto.content?.contextDescription ?? '',
    starterSentence: dto.content?.starterSentence ?? '',
    outline: dto.content?.outline ?? [],
    keyVocab: (dto.content?.keyVocabulary ?? []).map((item) => ({
      word: item.word ?? '',
      meaning: item.meaning ?? '',
    })),
    modelAnswer: dto.content?.modelAnswer ?? '',
  }
}

function resultOf(value: unknown): EvaluationResult {
  return typeof value === 'object' && value !== null ? (value as EvaluationResult) : {}
}

function feedbackOf(evaluation?: SpeakingEvaluationDto): AgentFeedback[] {
  return (resultOf(evaluation?.result).corrections ?? []).map((item, index) => {
    const category =
      item.category?.toLowerCase() === 'grammar'
        ? 'grammar'
        : item.category?.toLowerCase() === 'vocabulary'
          ? 'vocabulary'
          : 'suggestion'
    return {
      id: `f${index + 1}`,
      category,
      label:
        category === 'grammar'
          ? 'Ngữ pháp'
          : category === 'vocabulary'
            ? 'Từ vựng'
            : 'Diễn đạt',
      original: item.originalText ?? '',
      improved: item.improvedText ?? '',
      note: item.note ?? '',
    }
  })
}

export function toSpeakingResult(evaluation: SpeakingEvaluationDto): SpeakingResult {
  const result = resultOf(evaluation.result)
  const feedback = feedbackOf(evaluation)
  return {
    score: result.overallScore ?? 0,
    wpm: result.wordsPerMinute,
    userTranscript: evaluation.transcript ?? '',
    feedback,
    rephrases: feedback
      .filter((item) => item.original && item.improved)
      .map((item) => ({
        original: item.original,
        native: item.improved,
        explanation: item.note,
      })),
    source: evaluation.source,
  }
}

function durationLabel(milliseconds?: number): string {
  const seconds = Math.max(0, Math.round((milliseconds ?? 0) / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60)
    .toString()
    .padStart(2, '0')}`
}

function attemptOf(dto: SpeakingAttemptDto): SpeakingAttempt {
  return {
    id: dto.id ?? '',
    speakingSessionId: dto.sessionId ?? '',
    attemptNumber: dto.attemptNumber ?? 0,
    durationSeconds: Math.round((dto.durationMs ?? 0) / 1000),
    audioAvailability: dto.audioState === 'available' ? 'inSession' : 'unavailable',
    createdAt: dto.createdAt ?? '',
  }
}

export function toSpeakingSession(dto: SpeakingSessionDto): SpeakingSession {
  const attempts = dto.attempts ?? []
  const selected =
    attempts.find((item) => item.attempt?.id === dto.selectedAttemptId) ??
    [...attempts].reverse().find((item) => item.evaluation?.status === 'completed') ??
    attempts[attempts.length - 1]
  const result = resultOf(selected?.evaluation?.result)
  return {
    id: dto.id ?? '',
    topicId: dto.topic?.id ?? '',
    title: dto.topic?.title ?? '',
    prompt: dto.topic?.prompt ?? '',
    duration: durationLabel(selected?.attempt?.durationMs),
    date: dto.completedAt ?? dto.startedAt ?? '',
    startedAt: dto.startedAt,
    completedAt: dto.completedAt,
    score: result.overallScore ?? 0,
    transcript: selected?.evaluation?.transcript ?? '',
    feedback: feedbackOf(selected?.evaluation),
    attempts: attempts
      .map((item) => item.attempt)
      .filter((item): item is SpeakingAttemptDto => Boolean(item))
      .map(attemptOf),
    status: dto.status === 'completed' ? 'completed' : 'inProgress',
  }
}

async function sha256Hex(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, milliseconds)
    if (signal?.aborted) onAbort()
    else signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function evaluationFor(
  attemptId: string,
  signal?: AbortSignal
): Promise<SpeakingEvaluationDto> {
  return apiClient<SpeakingEvaluationDto>(
    `/speaking/attempts/${attemptId}/evaluation`,
    { signal }
  )
}

export const speakingService = {
  async getTopics(signal?: AbortSignal): Promise<SpeakingTopicDto[]> {
    return apiClient<SpeakingTopicDto[]>('/speaking/topics', { signal })
  },

  async getActiveSession(signal?: AbortSignal): Promise<SpeakingSessionDto | null> {
    return apiClient<SpeakingSessionDto | null>('/speaking/sessions/active', { signal })
  },

  async getSession(sessionId: string, signal?: AbortSignal): Promise<SpeakingSession> {
    return toSpeakingSession(
      await apiClient<SpeakingSessionDto>(`/speaking/sessions/${sessionId}`, { signal })
    )
  },

  async getSessionHistory(page = 0, size = 20, signal?: AbortSignal): Promise<{
    items: SpeakingSession[]
    totalItems: number
    totalPages: number
  }> {
    const response = await apiClient<SpeakingHistoryDto>('/speaking/sessions', {
      params: { page, size },
      signal,
    })
    return {
      items: (response.items ?? []).map(toSpeakingSession),
      totalItems: response.totalItems ?? 0,
      totalPages: response.totalPages ?? 0,
    }
  },

  async startSession(
    topicId: string,
    idempotencyKey = crypto.randomUUID()
  ): Promise<SpeakingSessionDto> {
    return apiClient<SpeakingSessionDto>('/speaking/sessions', {
      method: 'POST',
      body: JSON.stringify({ topicId }),
      idempotencyKey,
    })
  },

  async uploadAudioTake(
    audio: Blob,
    sessionId: string,
    idempotencyKey = crypto.randomUUID()
  ): Promise<SpeakingAttemptDto> {
    const upload = await apiClient<AttemptUploadDto>(
      `/speaking/sessions/${sessionId}/attempts`,
      {
        method: 'POST',
        body: JSON.stringify({
          mimeType: audio.type || 'application/octet-stream',
          sizeBytes: audio.size,
        }),
        idempotencyKey,
      }
    )

    if (!upload.uploadUrl || !upload.attempt?.id) {
      throw new ApiError(0, 'Invalid audio upload instruction')
    }

    const uploadResponse = await fetch(upload.uploadUrl, {
      method: 'PUT',
      headers: upload.requiredHeaders ?? {},
      body: audio,
    })
    if (!uploadResponse.ok) {
      throw new ApiError(uploadResponse.status, 'Audio upload failed')
    }

    return apiClient<SpeakingAttemptDto>(
      `/speaking/attempts/${upload.attempt.id}/upload-complete`,
      {
        method: 'POST',
        body: JSON.stringify({ checksumSha256: await sha256Hex(audio) }),
      }
    )
  },

  async startEvaluation(
    attemptId: string,
    idempotencyKey = crypto.randomUUID()
  ): Promise<SpeakingEvaluationDto> {
    return apiClient<SpeakingEvaluationDto>(`/speaking/attempts/${attemptId}/evaluate`, {
      method: 'POST',
      idempotencyKey,
    })
  },

  async getEvaluation(
    attemptId: string,
    signal?: AbortSignal
  ): Promise<SpeakingEvaluationDto> {
    return evaluationFor(attemptId, signal)
  },

  async getPlayback(attemptId: string, signal?: AbortSignal): Promise<AttemptPlaybackDto> {
    return apiClient<AttemptPlaybackDto>(`/speaking/attempts/${attemptId}/audio`, { signal })
  },

  async waitForEvaluation(
    attemptId: string,
    signal?: AbortSignal,
    timeoutMs = 90_000
  ): Promise<SpeakingEvaluationDto> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const evaluation = await evaluationFor(attemptId, signal)
      if (evaluation.status === 'completed') return evaluation
      if (evaluation.status === 'failed') {
        throw new ApiError(
          422,
          evaluation.errorCode ?? 'Speaking evaluation failed',
          { code: evaluation.errorCode }
        )
      }
      await wait(1_500, signal)
    }
    throw new ApiError(408, 'Speaking evaluation timed out', { code: 'REQUEST_TIMEOUT' })
  },

  async completeSession(
    sessionId: string,
    selectedAttemptId: string,
    expectedVersion: number,
    idempotencyKey = crypto.randomUUID()
  ): Promise<CompletedSpeakingDto> {
    return apiClient<CompletedSpeakingDto>(`/speaking/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ selectedAttemptId, expectedVersion }),
      idempotencyKey,
    })
  },
}
