import { describe, it, expect, beforeEach } from 'vitest'
import { useMimicStore } from '../useMimicStore'

describe('useMimicStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useMimicStore.getState().resetAllDemoData()
  })

  describe('UI Slice', () => {
    it('initializes with default sidebarCollapsed as false', () => {
      expect(useMimicStore.getState().sidebarCollapsed).toBe(false)
    })

    it('toggles sidebar state and updates localStorage', () => {
      useMimicStore.getState().toggleSidebar()
      expect(useMimicStore.getState().sidebarCollapsed).toBe(true)

      useMimicStore.getState().toggleSidebar()
      expect(useMimicStore.getState().sidebarCollapsed).toBe(false)
    })

    it('sets sidebarCollapsed explicitly', () => {
      useMimicStore.getState().setSidebarCollapsed(true)
      expect(useMimicStore.getState().sidebarCollapsed).toBe(true)
    })

    it('sets and toggles theme mode', () => {
      useMimicStore.getState().setTheme('dark')
      expect(useMimicStore.getState().theme).toBe('dark')

      useMimicStore.getState().toggleTheme()
      expect(useMimicStore.getState().theme).toBe('light')
    })
  })

  describe('Profile Slice', () => {
    it('updates learner profile fields', () => {
      useMimicStore.getState().updateProfile({ name: 'Minh Hoàng', dailyMinutesGoal: 15 })
      const profile = useMimicStore.getState().profile
      expect(profile.name).toBe('Minh Hoàng')
      expect(profile.dailyMinutesGoal).toBe(15)
    })

    it('completes onboarding', () => {
      useMimicStore.getState().completeOnboarding({
        goal: 'interview',
        selfAssessedLevel: 'advanced',
        dailyMinutesGoal: 20,
      })
      const profile = useMimicStore.getState().profile
      expect(profile.goal).toBe('interview')
      expect(profile.selfAssessedLevel).toBe('advanced')
      expect(profile.dailyMinutesGoal).toBe(20)
      expect(profile.onboardingCompleted).toBe(true)
    })
  })

  describe('Vocab Review Lifecycle', () => {
    it('starts review session with initial cards', () => {
      const session = useMimicStore.getState().startReviewSession()
      expect(session).toBeDefined()
      expect(session.status).toBe('inProgress')
      expect(session.currentIndex).toBe(0)
      expect(session.wordIds.length).toBeGreaterThan(0)
      expect(useMimicStore.getState().isFlashcardFlipped).toBe(false)
    })

    it('flips flashcard', () => {
      expect(useMimicStore.getState().isFlashcardFlipped).toBe(false)
      useMimicStore.getState().flipFlashcard()
      expect(useMimicStore.getState().isFlashcardFlipped).toBe(true)
    })

    it('rates card and advances index', () => {
      useMimicStore.getState().startReviewSession(['word-1', 'word-2'])
      useMimicStore.getState().rateCurrentWord('remembered')

      const session = useMimicStore.getState().activeReviewSession
      expect(session?.currentIndex).toBe(1)
      expect(session?.reviews.length).toBe(1)
      expect(session?.reviews[0]?.rating).toBe('remembered')
    })

    it('allows undoing the last review card', () => {
      useMimicStore.getState().startReviewSession(['word-1', 'word-2'])
      useMimicStore.getState().rateCurrentWord('remembered')
      expect(useMimicStore.getState().activeReviewSession?.currentIndex).toBe(1)

      useMimicStore.getState().undoLastReview()
      expect(useMimicStore.getState().activeReviewSession?.currentIndex).toBe(0)
      expect(useMimicStore.getState().activeReviewSession?.reviews.length).toBe(0)
    })
  })

  describe('Speaking Session Lifecycle', () => {
    it('starts speaking session for given topic', () => {
      const session = useMimicStore.getState().startSpeakingSession('topic-daily-standup')
      expect(session).toBeDefined()
      expect(session.status).toBe('inProgress')
      expect(useMimicStore.getState().activeSpeakingSession?.id).toBe(session.id)
    })

    it('records speaking attempts in active session', () => {
      const session = useMimicStore.getState().startSpeakingSession('topic-daily-standup')
      useMimicStore.getState().addSpeakingAttempt({
        id: 'att-1',
        speakingSessionId: session.id,
        attemptNumber: 1,
        durationSeconds: 45,
        audioAvailability: 'inSession',
        createdAt: 'Hôm nay',
      })

      const current = useMimicStore.getState().activeSpeakingSession
      expect(current?.attempts?.length).toBe(1)
      expect(current?.attempts?.[0]?.durationSeconds).toBe(45)
    })
  })

  describe('Reset Demo Data', () => {
    it('resets all state back to default initial values', () => {
      useMimicStore.getState().updateProfile({ name: 'Changed Name' })
      useMimicStore.getState().setSidebarCollapsed(true)
      expect(useMimicStore.getState().profile.name).toBe('Changed Name')
      expect(useMimicStore.getState().sidebarCollapsed).toBe(true)

      useMimicStore.getState().resetAllDemoData()
      expect(useMimicStore.getState().profile.name).toBe('Alex Trần')
      expect(useMimicStore.getState().sidebarCollapsed).toBe(false)
    })
  })
})
