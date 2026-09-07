import { StateCreator } from 'zustand'
import type { DailyActivity, MistakePattern } from '../../type'
import { initialMistakePatterns } from '../../mocks/progress'
import { safeJsonParse, STORAGE_KEYS } from '../storageKeys'

export interface ProgressSlice {
  mistakePatterns: MistakePattern[]
  dailyActivities: DailyActivity[]
  updateMistakeStatus: (patternId: string, status: MistakePattern['status']) => void
}

export const createProgressSlice: StateCreator<ProgressSlice, [], [], ProgressSlice> = (set) => ({
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
})
