import { create } from 'zustand'
import {
  applyTheme,
  defaultProfile,
  getInitialTheme,
  STORAGE_KEYS,
  ThemeMode,
} from './storageKeys'
import { createUiSlice, UiSlice } from './slices/createUiSlice'
import { createProfileSlice, ProfileSlice } from './slices/createProfileSlice'
import { createVocabSlice, VocabSlice } from './slices/createVocabSlice'
import { createSpeakingSlice, SpeakingSlice } from './slices/createSpeakingSlice'
import { createProgressSlice, ProgressSlice } from './slices/createProgressSlice'
import { createEcosystemSlice, EcosystemSlice } from './slices/createEcosystemSlice'
import { todayWords } from '../mocks/vocab'
import { recentSessions } from '../mocks/speaking'
import { initialMistakePatterns } from '../mocks/progress'
import { workplaceCollocations } from '../mocks/collocations'

export type { ThemeMode }

export type MimicStore = UiSlice &
  ProfileSlice &
  VocabSlice &
  SpeakingSlice &
  ProgressSlice &
  EcosystemSlice & {
    resetAllDemoData: () => void
  }

// Initialize theme immediately
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

export const useMimicStore = create<MimicStore>()((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createProfileSlice(set, get, api),
  ...createVocabSlice(set, get, api),
  ...createSpeakingSlice(set, get, api),
  ...createProgressSlice(set, get, api),
  ...createEcosystemSlice(set, get, api),

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
      sidebarCollapsed: false,
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
