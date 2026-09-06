import { VocabWord } from '../type'
import { todayWords as mockVocabWords } from '../mocks/vocab'
import { apiClient } from './api'

export const vocabService = {
  /**
   * Fetch all saved vocabulary words with mastery status
   */
  async getVocabWords(): Promise<VocabWord[]> {
    try {
      return await apiClient<VocabWord[]>('/vocab')
    } catch {
      return mockVocabWords
    }
  },

  /**
   * Extract high-value vocabulary from user context or passage
   */
  async analyzeContext(text: string): Promise<VocabWord[]> {
    try {
      return await apiClient<VocabWord[]>('/vocab/analyze', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
    } catch {
      return mockVocabWords.slice(0, 3)
    }
  },

  /**
   * Update mastery status of a word (remembered / review)
   */
  async updateWordStatus(wordId: string, remembered: boolean): Promise<boolean> {
    try {
      await apiClient(`/vocab/${wordId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ remembered }),
      })
      return true
    } catch {
      return true
    }
  },
}
