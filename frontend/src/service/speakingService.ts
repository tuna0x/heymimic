import { SpeakingSession } from '../type'
import { latestSession as mockSpeakingSession } from '../mocks/speaking'
import { apiClient } from './api'

export const speakingService = {
  /**
   * Fetch current or latest speaking practice session
   */
  async getLatestSession(): Promise<SpeakingSession> {
    try {
      return await apiClient<SpeakingSession>('/speaking/latest')
    } catch {
      // Fallback to local mock data when backend is not connected
      return mockSpeakingSession
    }
  },

  /**
   * Submit voice recording audio blob for AI transcription and feedback
   */
  async submitAudioTake(audioBlob: Blob, promptId: string): Promise<{ score: number; transcript: string }> {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('promptId', promptId)

      return await apiClient<{ score: number; transcript: string }>('/speaking/evaluate', {
        method: 'POST',
        headers: {}, // Let browser set Content-Type with multipart boundary
        body: formData,
      })
    } catch {
      return {
        score: 82,
        transcript: 'I started writing down three priorities every morning. It changed my entire focus.',
      }
    }
  },
}
