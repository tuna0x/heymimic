import { StateCreator } from 'zustand'
import type { LearnerProfile } from '../../type'
import { defaultProfile, safeJsonParse, STORAGE_KEYS } from '../storageKeys'

export interface ProfileSlice {
  profile: LearnerProfile
  updateProfile: (updates: Partial<LearnerProfile>) => void
  completeOnboarding: (data: {
    goal: LearnerProfile['goal']
    selfAssessedLevel: LearnerProfile['selfAssessedLevel']
    dailyMinutesGoal: LearnerProfile['dailyMinutesGoal']
  }) => void
}

export const createProfileSlice: StateCreator<ProfileSlice, [], [], ProfileSlice> = (set) => ({
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
})
