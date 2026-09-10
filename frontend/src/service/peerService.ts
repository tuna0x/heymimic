import type { PeerConversationRound, PeerPartner, PeerTopic } from '../type'
import { apiClient } from './api'

/**
 * Peer REST responses are kept separate from the local demo models.
 * The API owns room state, participant membership and scenario snapshots;
 * the Zustand slice can provide a deterministic fallback during rollout.
 */
export type PeerSessionStatus = 'WAITING' | 'READY' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'EXPIRED'
export type PeerParticipantStatus = 'JOINING' | 'CONNECTED' | 'RECONNECTING' | 'LEFT'
export type PeerRole = 'HOST' | 'GUEST'

export interface PeerPhaseDto {
  phase: string
  title: string
  durationSeconds: number
  promptEn: string
  promptVi: string
  hints?: string[]
}

export interface PeerScenarioDto {
  id: string
  version: number
  title: string
  category: string
  categoryLabel?: string
  level: string
  commonObjective: string
  description: string
  durationMinutes: number
  phases: PeerPhaseDto[]
  recommendedVocab?: string[]
}

export interface PeerParticipantDto {
  id: string
  userId?: string
  slot: 1 | 2
  role: PeerRole
  displayName: string
  avatar?: string
  targetLevel?: string
  city?: string
  goal?: string
  status: PeerParticipantStatus
  ready: boolean
  mediaConnected: boolean
}

export interface PeerSessionDto {
  id: string
  status: PeerSessionStatus
  scenario: PeerScenarioDto
  participants: PeerParticipantDto[]
  currentPhase?: string
  serverNow: string
  phaseDeadline?: string
  version: number
  expiresAt?: string
  viewerParticipantId?: string
  viewerRole?: PeerRole
  endReason?: string
}

export interface PeerInviteDto {
  sessionId: string
  token: string
  expiresAt: string
}

export interface PeerMediaTokenDto {
  token: string
  roomName: string
  identity: string
  expiresAt: string
}

export interface PeerSessionEventDto {
  type: string
  session: PeerSessionDto
}

export interface PeerScenarioFilters {
  [key: string]: string | undefined
  category?: string
  level?: string
}

function requestKey(): string {
  return crypto.randomUUID()
}

export function toPeerTopic(dto: PeerScenarioDto): PeerTopic {
  const categories: PeerTopic['category'][] = ['work', 'interview', 'tech', 'daily', 'debate']
  const levels: PeerTopic['level'][] = ['A2-B1', 'B1-B2', 'B2+']
  const category = categories.includes(dto.category as PeerTopic['category'])
    ? (dto.category as PeerTopic['category'])
    : 'daily'
  const level = levels.includes(dto.level as PeerTopic['level'])
    ? (dto.level as PeerTopic['level'])
    : 'B1-B2'

  return {
    id: dto.id,
    title: dto.title,
    category,
    categoryLabel: dto.categoryLabel ?? dto.category,
    level,
    description: dto.description,
    defaultDurationMinutes: dto.durationMinutes,
    rounds: dto.phases.map(
      (phase, index): PeerConversationRound => ({
        roundNumber: index + 1,
        title: phase.title,
        durationSeconds: phase.durationSeconds,
        promptEn: phase.promptEn,
        promptVi: phase.promptVi,
        hints: phase.hints ?? [],
      })
    ),
    recommendedVocab: dto.recommendedVocab ?? [],
  }
}

export function toPeerPartner(dto: PeerParticipantDto): PeerPartner {
  return {
    id: dto.userId ?? dto.id,
    name: dto.displayName,
    avatar: dto.avatar ?? '',
    targetLevel: dto.targetLevel ?? 'Peer practice',
    city: dto.city ?? '',
    goal: dto.goal ?? '',
    rating: 0,
    totalSessions: 0,
    bio: '',
  }
}
export const peerService = {
  async getScenarios(filters: PeerScenarioFilters = {}, signal?: AbortSignal): Promise<PeerScenarioDto[]> {
    return apiClient<PeerScenarioDto[]>('/peer/scenarios', {
      params: filters,
      signal,
    })
  },

  async getActiveSession(signal?: AbortSignal): Promise<PeerSessionDto | null> {
    return apiClient<PeerSessionDto | null>('/peer/sessions/active', { signal })
  },

  async getSession(sessionId: string, signal?: AbortSignal): Promise<PeerSessionDto> {
    return apiClient<PeerSessionDto>(`/peer/sessions/${sessionId}`, { signal })
  },

  async createSession(
    scenarioVersionId: string,
    idempotencyKey = requestKey()
  ): Promise<PeerSessionDto> {
    return apiClient<PeerSessionDto>('/peer/sessions', {
      method: 'POST',
      body: JSON.stringify({ scenarioVersionId }),
      idempotencyKey,
    })
  },

  async createInvite(sessionId: string, idempotencyKey = requestKey()): Promise<PeerInviteDto> {
    return apiClient<PeerInviteDto>(`/peer/sessions/${sessionId}/invites`, {
      method: 'POST',
      idempotencyKey,
    })
  },

  async acceptInvite(token: string, idempotencyKey = requestKey()): Promise<PeerSessionDto> {
    return apiClient<PeerSessionDto>('/peer/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
      idempotencyKey,
    })
  },

  async setReady(
    sessionId: string,
    ready: boolean,
    expectedVersion: number,
    idempotencyKey = requestKey()
  ): Promise<PeerSessionDto> {
    return apiClient<PeerSessionDto>(`/peer/sessions/${sessionId}/ready`, {
      method: 'PATCH',
      body: JSON.stringify({ ready, expectedVersion }),
      idempotencyKey,
    })
  },

  async swapRoles(
    sessionId: string,
    expectedVersion: number,
    idempotencyKey = requestKey()
  ): Promise<PeerSessionDto> {
    return apiClient<PeerSessionDto>(`/peer/sessions/${sessionId}/swap-roles`, {
      method: 'POST',
      body: JSON.stringify({ expectedVersion }),
      idempotencyKey,
    })
  },

  async getMediaToken(
    sessionId: string,
    idempotencyKey = requestKey()
  ): Promise<PeerMediaTokenDto> {
    return apiClient<PeerMediaTokenDto>(`/peer/sessions/${sessionId}/media-token`, {
      method: 'POST',
      idempotencyKey,
    })
  },

  async startSession(
    sessionId: string,
    expectedVersion: number,
    idempotencyKey = requestKey()
  ): Promise<PeerSessionDto> {
    return apiClient<PeerSessionDto>(`/peer/sessions/${sessionId}/start`, {
      method: 'POST',
      body: JSON.stringify({ expectedVersion }),
      idempotencyKey,
    })
  },

  async endSession(
    sessionId: string,
    expectedVersion: number,
    endReason: string,
    idempotencyKey = requestKey()
  ): Promise<PeerSessionDto> {
    return apiClient<PeerSessionDto>(`/peer/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ expectedVersion, endReason }),
      idempotencyKey,
    })
  },
}
