import type { StateCreator } from 'zustand'
import type { DailyRecommendation, LearnerProfile, StudySession } from '../../type'

export interface SpeakingSlice {
  activeStudySession: StudySession | null
  setActiveStudySession: (session: StudySession | null) => void
  getDailyRecommendation: () => DailyRecommendation
}

export const createSpeakingSlice: StateCreator<
  SpeakingSlice & { profile: LearnerProfile },
  [],
  [],
  SpeakingSlice
> = (set, get) => ({
  activeStudySession: null,
  setActiveStudySession: (session) => set({ activeStudySession: session }),

  getDailyRecommendation: () => {
    const profile = get().profile
    if (profile.goal === 'interview') {
      return {
        activityType: 'speaking',
        targetId: '',
        title: 'Luyện trả lời phỏng vấn cốt lõi',
        reason: 'Mục tiêu phỏng vấn của bạn: rèn cấu trúc Quá khứ → Hiện tại → Tương lai.',
        estimatedMinutes: 8,
      }
    }

    return {
      activityType: 'combined',
      targetId: '',
      title: 'Ôn từ và luyện nói theo đề xuất hôm nay',
      reason: 'Hoàn thành một lượt ôn ngắn rồi dùng lại từ vừa học trong bài Speaking.',
      estimatedMinutes: profile.dailyMinutesGoal ?? 10,
    }
  },
})
