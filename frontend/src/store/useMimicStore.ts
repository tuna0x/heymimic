import { create } from 'zustand'
import type {
  AgentFeedback,
  CollocationPair,
  DailyActivity,
  DailyRecommendation,
  DialogueScenario,
  DialogueTurn,
  LearnerProfile,
  ListeningExercise,
  MistakePattern,
  PeerFeedback,
  PeerPartner,
  PeerSession,
  PeerTopic,
  ReflexTranslationPrompt,
  ReviewEvent,
  ReviewSession,
  SpeakingAttempt,
  SpeakingSession,
  StudySession,
  VideoClip,
  VideoShadowingAttempt,
  VocabWord,
  WritingTemplate,
} from '../type'
import { todayWords } from '../mocks/vocab'
import { recentSessions, speakingTopics } from '../mocks/speaking'
import { initialMistakePatterns } from '../mocks/progress'
import { listeningExercises } from '../mocks/listening'
import { dialogueScenarios } from '../mocks/dialogue'
import { workplaceCollocations } from '../mocks/collocations'
import { reflexPrompts, writingTemplates } from '../mocks/writing'
import { peerPartners, peerTopics } from '../mocks/peerPractice'
import { videoClips } from '../mocks/videos'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEYS = {
  THEME: 'mimic_theme',
  PROFILE: 'mimic_v1_profile',
  VOCAB: 'mimic_v1_vocab',
  SPEAKING_SESSIONS: 'mimic_v1_speaking',
  STUDY_SESSIONS: 'mimic_v1_study_sessions',
  MISTAKES: 'mimic_v1_mistakes',
  ACTIVITIES: 'mimic_v1_activities',
  LISTENING_COMPLETED: 'mimic_v2_listening',
  COLLOCATIONS: 'mimic_v2_collocations',
  DIALOGUES: 'mimic_v2_dialogues',
  PEER_SESSIONS: 'mimic_v2_peer_sessions',
  VIDEO_ATTEMPTS: 'mimic_v2_video_attempts',
  SIDEBAR_COLLAPSED: 'mimic_sidebar_collapsed',
} as const

function safeJsonParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

function getInitialTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  }
  return 'system'
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem(STORAGE_KEYS.THEME, theme)
}

const defaultProfile: LearnerProfile = {
  id: 'usr_demo_01',
  name: 'Alex Trần',
  email: 'alex.tran@demo.heymimic.com',
  streakDays: 4,
  totalMinutes: 68,
  targetLanguage: 'English',
  goal: 'work',
  selfAssessedLevel: 'intermediate',
  dailyMinutesGoal: 10,
  onboardingCompleted: true,
  level: 'Intermediate',
}

interface MimicStore {
  // Theme
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void

  // Sidebar Layout
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Profile
  profile: LearnerProfile
  updateProfile: (updates: Partial<LearnerProfile>) => void
  completeOnboarding: (data: {
    goal: LearnerProfile['goal']
    selfAssessedLevel: LearnerProfile['selfAssessedLevel']
    dailyMinutesGoal: LearnerProfile['dailyMinutesGoal']
  }) => void

  // Study Session Lifecycle
  studySessions: StudySession[]
  activeStudySession: StudySession | null
  startStudySession: (plannedSteps: ('vocab' | 'speaking')[], carriedVocabIds?: string[]) => StudySession
  advanceStudyStep: (step: 'vocab' | 'speaking' | 'summary') => void
  completeStudySession: (sessionId: string) => void
  abandonStudySession: () => void

  // Vocab State & Review Session
  vocabWords: VocabWord[]
  selectedWordId: string
  isFlashcardFlipped: boolean
  activeReviewSession: ReviewSession | null
  selectWord: (id: string) => void
  flipFlashcard: () => void
  startReviewSession: (wordIds?: string[]) => ReviewSession
  rateCurrentWord: (rating: 'remembered' | 'needsReview') => void
  undoLastReview: () => void
  finishReviewSession: () => void
  addCustomWords: (newWords: Array<Omit<VocabWord, 'id' | 'status'>>) => void

  // Speaking State & Sessions
  speakingSessions: SpeakingSession[]
  activeSpeakingSession: SpeakingSession | null
  startSpeakingSession: (topicId: string, carriedVocabIds?: string[]) => SpeakingSession
  addSpeakingAttempt: (attempt: SpeakingAttempt) => void
  completeSpeakingSession: (params: {
    sessionId: string
    score: number
    transcript: string
    feedback: AgentFeedback[]
    durationSeconds: number
  }) => void

  // Mistakes & Progress
  mistakePatterns: MistakePattern[]
  dailyActivities: DailyActivity[]
  updateMistakeStatus: (patternId: string, status: MistakePattern['status']) => void

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

  // Recommendations & Reset
  getDailyRecommendation: () => DailyRecommendation
  resetAllDemoData: () => void
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

// Watch system theme change if in 'system' mode
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null
    if (currentTheme === 'system') {
      applyTheme('system')
    }
  })
}

export const useMimicStore = create<MimicStore>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const current = get().theme
    const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    set({ theme: nextTheme })
  },

  // Sidebar Layout
  sidebarCollapsed: safeJsonParse<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
  toggleSidebar: () => {
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(next))
      return { sidebarCollapsed: next }
    })
  },
  setSidebarCollapsed: (collapsed: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(collapsed))
    set({ sidebarCollapsed: collapsed })
  },

  // Profile
  profile: safeJsonParse<LearnerProfile>(STORAGE_KEYS.PROFILE, defaultProfile),
  updateProfile: (updates) => {
    set((state) => {
      const updated = { ...state.profile, ...updates }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated))
      return { profile: updated }
    })
  },
  completeOnboarding: (data) => {
    set((state) => {
      const updated: LearnerProfile = {
        ...state.profile,
        ...data,
        onboardingCompleted: true,
      }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated))
      return { profile: updated }
    })
  },

  // Study Session
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
    if (targetSession.status === 'completed') return // Idempotent check

    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)

    // Update Daily Activities
    const existingActivities = state.dailyActivities
    const todayActivityIndex = existingActivities.findIndex((a) => a.dateKey === todayKey)
    let updatedActivities = [...existingActivities]

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

    // Update profile streak & minutes
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

  // Vocab
  vocabWords: safeJsonParse<VocabWord[]>(STORAGE_KEYS.VOCAB, todayWords),
  selectedWordId: todayWords[0]?.id ?? '',
  isFlashcardFlipped: false,
  activeReviewSession: null,

  selectWord: (id) => set({ selectedWordId: id, isFlashcardFlipped: false }),
  flipFlashcard: () => set((state) => ({ isFlashcardFlipped: !state.isFlashcardFlipped })),

  startReviewSession: (wordIds) => {
    const words = wordIds && wordIds.length > 0 ? wordIds : get().vocabWords.map((w) => w.id)
    const reviewSession: ReviewSession = {
      id: `rev-${Date.now()}`,
      studySessionId: get().activeStudySession?.id,
      wordIds: words,
      currentIndex: 0,
      reviews: [],
      status: 'inProgress',
    }
    set({
      activeReviewSession: reviewSession,
      isFlashcardFlipped: false,
      selectedWordId: words[0] ?? '',
    })
    return reviewSession
  },

  rateCurrentWord: (rating) => {
    const session = get().activeReviewSession
    if (!session || session.status !== 'inProgress') return

    const currentWordId = session.wordIds[session.currentIndex]
    if (!currentWordId) return

    const newEvent: ReviewEvent = {
      id: `rev-ev-${Date.now()}`,
      reviewSessionId: session.id,
      wordId: currentWordId,
      rating,
      reviewedAt: new Date().toISOString(),
    }

    const nextIndex = session.currentIndex + 1
    const isFinished = nextIndex >= session.wordIds.length

    // Update word status in vocabulary list
    const updatedVocab = get().vocabWords.map((w) => {
      if (w.id === currentWordId) {
        return {
          ...w,
          status: (rating === 'remembered' ? 'reviewing' : 'new') as VocabWord['status'],
          mastery: Math.min(
            100,
            Math.max(0, (w.mastery ?? 50) + (rating === 'remembered' ? 12 : -8))
          ),
        }
      }
      return w
    })

    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(updatedVocab))

    set({
      vocabWords: updatedVocab,
      isFlashcardFlipped: false,
      activeReviewSession: {
        ...session,
        currentIndex: nextIndex,
        reviews: [...session.reviews, newEvent],
        status: isFinished ? 'completed' : 'inProgress',
      },
      selectedWordId: isFinished ? '' : session.wordIds[nextIndex] ?? '',
    })
  },

  undoLastReview: () => {
    const session = get().activeReviewSession
    if (!session || session.reviews.length === 0) return

    const lastEvent = session.reviews[session.reviews.length - 1]
    const updatedReviews = session.reviews.slice(0, -1)
    const prevIndex = Math.max(0, session.currentIndex - 1)
    const prevWordId = session.wordIds[prevIndex] ?? ''

    set({
      activeReviewSession: {
        ...session,
        currentIndex: prevIndex,
        reviews: updatedReviews,
        status: 'inProgress',
      },
      selectedWordId: prevWordId,
      isFlashcardFlipped: true, // Return to flipped state to view answer
    })
  },

  finishReviewSession: () => {
    const session = get().activeReviewSession
    if (!session) return
    set({
      activeReviewSession: {
        ...session,
        status: 'completed',
      },
    })
  },

  addCustomWords: (newWords) => {
    const state = get()
    const additions: VocabWord[] = newWords.map((w, idx) => ({
      ...w,
      id: `custom-${Date.now()}-${idx}`,
      status: 'new',
      mastery: 10,
      color: 'coral',
    }))
    const updated = [...state.vocabWords, ...additions]
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(updated))
    set({ vocabWords: updated })
  },

  // Speaking
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

  // Mistakes
  mistakePatterns: safeJsonParse<MistakePattern[]>(
    STORAGE_KEYS.MISTAKES,
    initialMistakePatterns
  ),
  dailyActivities: safeJsonParse<DailyActivity[]>(STORAGE_KEYS.ACTIVITIES, []),

  updateMistakeStatus: (patternId, status) => {
    set((state) => {
      const updated = state.mistakePatterns.map((p) =>
        p.id === patternId ? { ...p, status } : p
      )
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(updated))
      return { mistakePatterns: updated }
    })
  },

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

  collocationPairs: safeJsonParse<CollocationPair[]>(STORAGE_KEYS.COLLOCATIONS, workplaceCollocations),
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

      const updatedProfile = {
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

  // Daily Recommendation Engine (Heuristic based on Profile Goal & Mistakes)
  getDailyRecommendation: () => {
    const state = get()
    const goal = state.profile.goal

    if (goal === 'interview') {
      return {
        activityType: 'speaking',
        targetId: 'job-interview',
        title: 'Luyện trả lời phỏng vấn cốt lõi',
        reason: 'Mục tiêu phỏng vấn của bạn: rèn luyện cấu trúc Quá khứ → Hiện tại → Tương lai.',
        estimatedMinutes: 8,
      }
    }

    // Default work / daily
    return {
      activityType: 'combined',
      targetId: 'work-standup',
      title: 'Ôn 4 từ và luyện Sprint Standup',
      reason: 'Bạn muốn tự tin và lưu loát hơn khi cập nhật công việc hằng ngày.',
      estimatedMinutes: state.profile.dailyMinutesGoal ?? 10,
    }
  },

  // Reset demo
  resetAllDemoData: () => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
      localStorage.removeItem('mimic_auth_token')
    }
    applyTheme('system')
    set({
      theme: 'system',
      profile: defaultProfile,
      studySessions: [],
      activeStudySession: null,
      activeReviewSession: null,
      activeSpeakingSession: null,
      activePeerSession: null,
      peerSessions: [],
      videoAttempts: [],
      vocabWords: todayWords,
      speakingSessions: recentSessions,
      mistakePatterns: initialMistakePatterns,
      dailyActivities: [],
      completedListeningIds: [],
      dialogueTurns: {},
      collocationPairs: workplaceCollocations,
    })
  },
}))


