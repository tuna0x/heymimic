import { StateCreator } from 'zustand'
import type {
  CollocationPair,
  DialogueScenario,
  DialogueTurn,
  LearnerProfile,
  ListeningExercise,
  PeerFeedback,
  PeerPartner,
  PeerSession,
  PeerTopic,
  ReflexTranslationPrompt,
  VideoClip,
  VideoShadowingAttempt,
  WritingTemplate,
} from '../../type'
import { listeningExercises } from '../../mocks/listening'
import { dialogueScenarios } from '../../mocks/dialogue'
import { workplaceCollocations } from '../../mocks/collocations'
import { reflexPrompts, writingTemplates } from '../../mocks/writing'
import { peerPartners, peerTopics } from '../../mocks/peerPractice'
import { videoClips } from '../../mocks/videos'
import { safeJsonParse, STORAGE_KEYS } from '../storageKeys'

export interface EcosystemSlice {
  // Language Expansion Pillars
  listeningExercises: ListeningExercise[]
  completedListeningIds: string[]
  markListeningComplete: (id: string) => void

  dialogueScenarios: DialogueScenario[]
  dialogueTurns: Record<string, DialogueTurn[]>
  addDialogueTurn: (scenarioId: string, turn: DialogueTurn) => void

  collocationPairs: CollocationPair[]
  updateCollocationStatus: (id: string, status: CollocationPair['status']) => void

  writingTemplates: WritingTemplate[]
  reflexPrompts: ReflexTranslationPrompt[]

  // 1-on-1 Peer Practice
  peerTopics: PeerTopic[]
  peerPartners: PeerPartner[]
  peerSessions: PeerSession[]
  activePeerSession: PeerSession | null
  startPeerSession: (topicId: string, partnerId?: string) => PeerSession
  completePeerSession: (sessionId: string, feedback?: PeerFeedback) => void

  // Video-based Learning & Shadowing
  videoClips: VideoClip[]
  videoAttempts: VideoShadowingAttempt[]
  addVideoAttempt: (attempt: VideoShadowingAttempt) => void
}

export const createEcosystemSlice: StateCreator<
  EcosystemSlice & { profile: LearnerProfile },
  [],
  [],
  EcosystemSlice
> = (set, get) => ({
  // Language Expansion Pillars
  listeningExercises,
  completedListeningIds: safeJsonParse<string[]>(STORAGE_KEYS.LISTENING_COMPLETED, []),
  markListeningComplete: (id) => {
    set((state) => {
      if (state.completedListeningIds.includes(id)) return {}
      const updated = [...state.completedListeningIds, id]
      localStorage.setItem(STORAGE_KEYS.LISTENING_COMPLETED, JSON.stringify(updated))
      return { completedListeningIds: updated }
    })
  },

  dialogueScenarios,
  dialogueTurns: safeJsonParse<Record<string, DialogueTurn[]>>(STORAGE_KEYS.DIALOGUES, {}),
  addDialogueTurn: (scenarioId, turn) => {
    set((state) => {
      const existing = state.dialogueTurns[scenarioId] ?? []
      const updatedTurns = {
        ...state.dialogueTurns,
        [scenarioId]: [...existing, turn],
      }
      localStorage.setItem(STORAGE_KEYS.DIALOGUES, JSON.stringify(updatedTurns))
      return { dialogueTurns: updatedTurns }
    })
  },

  collocationPairs: safeJsonParse<CollocationPair[]>(
    STORAGE_KEYS.COLLOCATIONS,
    workplaceCollocations
  ),
  updateCollocationStatus: (id, status) => {
    set((state) => {
      const updated = state.collocationPairs.map((p) => (p.id === id ? { ...p, status } : p))
      localStorage.setItem(STORAGE_KEYS.COLLOCATIONS, JSON.stringify(updated))
      return { collocationPairs: updated }
    })
  },

  writingTemplates,
  reflexPrompts,

  // 1-on-1 Peer Practice
  peerTopics,
  peerPartners,
  peerSessions: safeJsonParse<PeerSession[]>(STORAGE_KEYS.PEER_SESSIONS, []),
  activePeerSession: null,
  startPeerSession: (topicId, partnerId) => {
    const topic = peerTopics.find((t) => t.id === topicId) ?? peerTopics[0]
    const partner =
      peerPartners.find((p) => p.id === partnerId) ??
      peerPartners[Math.floor(Math.random() * peerPartners.length)]

    const session: PeerSession = {
      id: `peer-${Date.now()}`,
      topicId: topic.id,
      topicTitle: topic.title,
      partner,
      durationMinutes: topic.defaultDurationMinutes,
      startedAt: new Date().toISOString(),
      status: 'inSession',
    }

    const updatedSessions = [session, ...get().peerSessions]
    localStorage.setItem(STORAGE_KEYS.PEER_SESSIONS, JSON.stringify(updatedSessions))
    set({ activePeerSession: session, peerSessions: updatedSessions })
    return session
  },

  completePeerSession: (sessionId, feedback) => {
    set((state) => {
      const updatedSessions = state.peerSessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: 'completed' as const,
            feedbackGiven: feedback,
          }
        }
        return s
      })
      localStorage.setItem(STORAGE_KEYS.PEER_SESSIONS, JSON.stringify(updatedSessions))

      const updatedProfile: LearnerProfile = {
        ...state.profile,
        totalMinutes: state.profile.totalMinutes + 10,
        streakDays: Math.max(state.profile.streakDays, 1),
      }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile))

      return {
        activePeerSession: null,
        peerSessions: updatedSessions,
        profile: updatedProfile,
      }
    })
  },

  // Video-based Learning & Shadowing
  videoClips,
  videoAttempts: safeJsonParse<VideoShadowingAttempt[]>(STORAGE_KEYS.VIDEO_ATTEMPTS, []),
  addVideoAttempt: (attempt) => {
    set((state) => {
      const updatedAttempts = [attempt, ...state.videoAttempts]
      localStorage.setItem(STORAGE_KEYS.VIDEO_ATTEMPTS, JSON.stringify(updatedAttempts))
      return { videoAttempts: updatedAttempts }
    })
  },
})
