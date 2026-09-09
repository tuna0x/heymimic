import { StateCreator } from 'zustand'
import type { DailyActivity, MistakePattern } from '../../type'
import { safeJsonParse, STORAGE_KEYS } from '../storageKeys'

export interface ProgressSlice {
  mistakePatterns: MistakePattern[]
  dailyActivities: DailyActivity[]
}

export const createProgressSlice: StateCreator<ProgressSlice, [], [], ProgressSlice> = () => ({
  mistakePatterns: [],
  dailyActivities: safeJsonParse<DailyActivity[]>(STORAGE_KEYS.ACTIVITIES, []),
})
