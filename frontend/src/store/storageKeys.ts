import type { LearnerProfile } from '../type'

export type ThemeMode = 'light' | 'dark' | 'system'

export const STORAGE_KEYS = {
  THEME: 'mimic_theme',
  PROFILE: 'mimic_v1_profile',
  VOCAB: 'mimic_v1_vocab',
  SPEAKING_SESSIONS: 'mimic_v1_speaking',
  STUDY_SESSIONS: 'mimic_v1_study_sessions',
  MISTAKES: 'mimic_v1_mistakes',
  ACTIVITIES: 'mimic_v1_activities',
  LISTENING_COMPLETED: 'mimic_v2_listening',
  COLLOCATIONS: 'mimic_v2_collocations',
  DIALOGUES: 'mimic_v2_dialogues',
  PEER_SESSIONS: 'mimic_v2_peer_sessions',
  VIDEO_ATTEMPTS: 'mimic_v2_video_attempts',
  SIDEBAR_COLLAPSED: 'mimic_sidebar_collapsed',
} as const

export function safeJsonParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

export function getInitialTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  }
  return 'system'
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem(STORAGE_KEYS.THEME, theme)
}

export const defaultProfile: LearnerProfile = {
  id: 'usr_demo_01',
  name: 'Alex Trần',
  email: 'alex.tran@demo.heymimic.com',
  streakDays: 4,
  totalMinutes: 68,
  targetLanguage: 'English',
  goal: 'work',
  selfAssessedLevel: 'intermediate',
  dailyMinutesGoal: 10,
  onboardingCompleted: true,
  level: 'Intermediate',
}
