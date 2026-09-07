import { StateCreator } from 'zustand'
import type {
  DailyActivity,
  DailyRecommendation,
  LearnerProfile,
  SpeakingAttempt,
  SpeakingSession,
  StudySession,
} from '../../type'
import { recentSessions, speakingTopics } from '../../mocks/speaking'
import { safeJsonParse, STORAGE_KEYS } from '../storageKeys'

export interface SpeakingSlice {
  // Study Session
  studySessions: StudySession[]
  activeStudySession: StudySession | null
  startStudySession: (plannedSteps: ('vocab' | 'speaking')[], carriedVocabIds?: string[]) => StudySession
  advanceStudyStep: (step: 'vocab' | 'speaking' | 'summary') => void
  completeStudySession: (sessionId: string) => void
  abandonStudySession: () => void

  // Speaking
  speakingSessions: SpeakingSession[]
  activeSpeakingSession: SpeakingSession | null
  startSpeakingSession: (topicId: string, carriedVocabIds?: string[]) => SpeakingSession
  addSpeakingAttempt: (attempt: SpeakingAttempt) => void
  completeSpeakingSession: (params: {
    sessionId: string
    score: number
    transcript: string
    feedback: SpeakingSession['feedback']
    durationSeconds: number
  }) => void

  getDailyRecommendation: () => DailyRecommendation
}

export const createSpeakingSlice: StateCreator<
  SpeakingSlice & {
    profile: LearnerProfile
    dailyActivities: DailyActivity[]
  },
  [],
  [],
  SpeakingSlice
> = (set, get) => ({
  studySessions: safeJsonParse<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []),
  activeStudySession: null,

  startStudySession: (plannedSteps, carriedVocabIds) => {
    const session: StudySession = {
      id: `study-${Date.now()}`,
      startedAt: new Date().toISOString(),
      status: 'inProgress',
      currentStep: plannedSteps[0] ?? 'vocab',
      plannedSteps,
      suggestedVocabIds: carriedVocabIds,
    }
    const updatedSessions = [session, ...get().studySessions.filter((s) => s.id !== session.id)]
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(updatedSessions))
    set({ activeStudySession: session, studySessions: updatedSessions })
    return session
  },

  advanceStudyStep: (step) => {
    set((state) => {
      if (!state.activeStudySession) return {}
      const updated = {
        ...state.activeStudySession,
        currentStep: step,
      }
      const updatedSessions = state.studySessions.map((s) => (s.id === updated.id ? updated : s))
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(updatedSessions))
      return {
        activeStudySession: updated,
        studySessions: updatedSessions,
      }
    })
  },

  completeStudySession: (sessionId) => {
    const state = get()
    const targetSession = state.activeStudySession?.id === sessionId
      ? state.activeStudySession
      : state.studySessions.find((s) => s.id === sessionId)
    if (!targetSession) return
    if (targetSession.status === 'completed') return

    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)

    // Update Daily Activities
    const existingActivities = state.dailyActivities
    const todayActivityIndex = existingActivities.findIndex((a) => a.dateKey === todayKey)
    const updatedActivities = [...existingActivities]

    if (todayActivityIndex >= 0) {
      const current = updatedActivities[todayActivityIndex]
      if (!current.completedStudySessionIds.includes(sessionId)) {
        updatedActivities[todayActivityIndex] = {
          ...current,
          completedStudySessionIds: [...current.completedStudySessionIds, sessionId],
        }
      }
    } else {
      updatedActivities.push({
        dateKey: todayKey,
        vocabSeconds: 300,
        speakingSeconds: 120,
        completedStudySessionIds: [sessionId],
      })
    }

    const updatedProfile: LearnerProfile = {
      ...state.profile,
      streakDays: state.profile.streakDays + 1,
      totalMinutes: state.profile.totalMinutes + 8,
    }

    const completedSession: StudySession = {
      ...targetSession,
      status: 'completed',
      completedAt: now.toISOString(),
    }

    const updatedSessions = state.studySessions.map((s) => (s.id === sessionId ? completedSession : s))
    if (!updatedSessions.some((s) => s.id === sessionId)) {
      updatedSessions.unshift(completedSession)
    }

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile))
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities))
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(updatedSessions))

    set({
      activeStudySession: state.activeStudySession?.id === sessionId ? completedSession : state.activeStudySession,
      studySessions: updatedSessions,
      profile: updatedProfile,
      dailyActivities: updatedActivities,
    })
  },

  abandonStudySession: () => {
    set((state) => {
      if (!state.activeStudySession) return {}
      const abandoned: StudySession = { ...state.activeStudySession, status: 'abandoned' }
      const updatedSessions = state.studySessions.map((s) => (s.id === abandoned.id ? abandoned : s))
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(updatedSessions))
      return {
        activeStudySession: abandoned,
        studySessions: updatedSessions,
      }
    })
  },

  speakingSessions: safeJsonParse<SpeakingSession[]>(
    STORAGE_KEYS.SPEAKING_SESSIONS,
    recentSessions
  ),
  activeSpeakingSession: null,

  startSpeakingSession: (topicId, carriedVocabIds) => {
    const topic = speakingTopics.find((t) => t.id === topicId) ?? speakingTopics[0]
    const session: SpeakingSession = {
      id: `spk-${Date.now()}`,
      studySessionId: get().activeStudySession?.id,
      topicId: topic.id,
      title: topic.title,
      prompt: topic.prompt,
      duration: '00:00',
      date: 'Hôm nay',
      startedAt: new Date().toISOString(),
      score: 0,
      transcript: '',
      feedback: [],
      attempts: [],
      status: 'inProgress',
    }
    if (carriedVocabIds && carriedVocabIds.length > 0 && session.attempts) {
      session.attempts.push({
        id: `att-vocab-hint-${Date.now()}`,
        speakingSessionId: session.id,
        attemptNumber: 1,
        durationSeconds: 0,
        audioAvailability: 'inSession',
        createdAt: 'Bắt đầu',
      })
    }
    set({ activeSpeakingSession: session })
    return session
  },

  addSpeakingAttempt: (attempt) => {
    const session = get().activeSpeakingSession
    if (!session) return
    const updatedAttempts = [...(session.attempts ?? []), attempt]
    set({
      activeSpeakingSession: {
        ...session,
        attempts: updatedAttempts,
      },
    })
  },

  completeSpeakingSession: ({ sessionId, score, transcript, feedback, durationSeconds }) => {
    const state = get()
    const topic =
      speakingTopics.find((t) => t.id === state.activeSpeakingSession?.topicId) ?? speakingTopics[0]

    const mins = Math.floor(durationSeconds / 60)
    const secs = durationSeconds % 60
    const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

    const completedSession: SpeakingSession = {
      ...(state.activeSpeakingSession ?? {
        id: sessionId,
        topicId: topic.id,
        title: topic.title,
        prompt: topic.prompt,
        date: 'Hôm nay',
        score,
        transcript,
        feedback,
      }),
      id: sessionId,
      duration: durationFormatted,
      score,
      transcript,
      feedback,
      completedAt: new Date().toISOString(),
      status: 'completed',
    }

    const updatedSessions = [
      completedSession,
      ...state.speakingSessions.filter((s) => s.id !== sessionId),
    ]

    localStorage.setItem(STORAGE_KEYS.SPEAKING_SESSIONS, JSON.stringify(updatedSessions))
    set({
      speakingSessions: updatedSessions,
      activeSpeakingSession: completedSession,
    })
  },

  getDailyRecommendation: () => {
    const state = get()
    const goal = state.profile?.goal

    if (goal === 'interview') {
      return {
        activityType: 'speaking',
        targetId: 'job-interview',
        title: 'Luyện trả lời phỏng vấn cốt lõi',
        reason: 'Mục tiêu phỏng vấn của bạn: rèn luyện cấu trúc Quá khứ → Hiện tại → Tương lai.',
        estimatedMinutes: 8,
      }
    }

    return {
      activityType: 'combined',
      targetId: 'work-standup',
      title: 'Ôn 4 từ và luyện Sprint Standup',
      reason: 'Bạn muốn tự tin và lưu loát hơn khi cập nhật công việc hằng ngày.',
      estimatedMinutes: state.profile?.dailyMinutesGoal ?? 10,
    }
  },
})
