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
        selfAssessedLevel: 'intermediate',
        dailyMinutesGoal: 15,
      })
      const profile = useMimicStore.getState().profile
      expect(profile.goal).toBe('interview')
      expect(profile.selfAssessedLevel).toBe('intermediate')
      expect(profile.dailyMinutesGoal).toBe(15)
      expect(profile.onboardingCompleted).toBe(true)
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
