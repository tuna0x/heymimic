import { ProgressDay, CommonMistake } from '../type'
import { weeklyProgress as mockProgressDays, commonMistakes as mockCommonMistakes } from '../mocks/progress'
import { apiClient } from './api'

export const progressService = {
  /**
   * Fetch daily activity breakdown for the current period
   */
  async getDailyProgress(): Promise<ProgressDay[]> {
    try {
      return await apiClient<ProgressDay[]>('/progress/daily')
    } catch {
      return mockProgressDays
    }
  },

  /**
   * Fetch recurring speaking patterns and grammar mistakes
   */
  async getCommonMistakes(): Promise<CommonMistake[]> {
    try {
      return await apiClient<CommonMistake[]>('/progress/patterns')
    } catch {
      return mockCommonMistakes
    }
  },
}
