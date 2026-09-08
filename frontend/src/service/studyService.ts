import type { StudySession } from '../type'
import { apiClient } from './api'
import type { components } from './generated/api-schema'

type StudySessionDto = components['schemas']['StudySessionView']
type PlannedStudyStepDto = components['schemas']['PlannedStudyStepRequest']

function toStudySession(dto: StudySessionDto): StudySession {
  const steps = dto.steps ?? []
  const plannedSteps = steps.map((step) =>
    step.kind === 'speaking' ? 'speaking' : 'vocab'
  )
  const activeKind = steps[dto.currentStep ?? 0]?.kind
  return {
    id: dto.id ?? '',
    startedAt: dto.startedAt ?? '',
    completedAt: dto.completedAt,
    status:
      dto.status === 'completed'
        ? 'completed'
        : dto.status === 'abandoned'
          ? 'abandoned'
          : 'inProgress',
    currentStep:
      dto.status === 'completed'
        ? 'summary'
        : activeKind === 'speaking'
          ? 'speaking'
          : 'vocab',
    plannedSteps,
    reviewSessionId: steps.find((step) => step.kind === 'vocabulary')?.reviewSessionId,
    speakingSessionId: steps.find((step) => step.kind === 'speaking')?.speakingSessionId,
    version: dto.version ?? 0,
  }
}

export const studyService = {
  async getActive(signal?: AbortSignal): Promise<StudySession | null> {
    const response = await apiClient<StudySessionDto | null>('/study-sessions/active', { signal })
    return response ? toStudySession(response) : null
  },

  async get(sessionId: string, signal?: AbortSignal): Promise<StudySession> {
    return toStudySession(
      await apiClient<StudySessionDto>(`/study-sessions/${sessionId}`, { signal })
    )
  },

  async start(
    plannedSteps: PlannedStudyStepDto[],
    idempotencyKey = crypto.randomUUID()
  ): Promise<StudySession> {
    return toStudySession(
      await apiClient<StudySessionDto>('/study-sessions', {
        method: 'POST',
        body: JSON.stringify({ plannedSteps }),
        idempotencyKey,
      })
    )
  },

  async advance(session: StudySession, targetStep: number): Promise<StudySession> {
    return toStudySession(
      await apiClient<StudySessionDto>(`/study-sessions/${session.id}/step`, {
        method: 'PATCH',
        body: JSON.stringify({ targetStep, expectedVersion: session.version ?? 0 }),
      })
    )
  },

  async complete(
    session: StudySession,
    idempotencyKey = crypto.randomUUID()
  ): Promise<StudySession> {
    return toStudySession(
      await apiClient<StudySessionDto>(`/study-sessions/${session.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ expectedVersion: session.version ?? 0 }),
        idempotencyKey,
      })
    )
  },

  async abandon(
    session: StudySession,
    idempotencyKey = crypto.randomUUID()
  ): Promise<void> {
    await apiClient<void>(`/study-sessions/${session.id}/abandon`, {
      method: 'POST',
      body: JSON.stringify({ expectedVersion: session.version ?? 0 }),
      idempotencyKey,
    })
  },
}
