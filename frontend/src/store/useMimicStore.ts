import { create } from 'zustand'

type RecorderState = 'ready' | 'recording' | 'processing' | 'complete'
export type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mimic_theme') as ThemeMode | null
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }
  return 'light'
}

function applyTheme(theme: ThemeMode) {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('mimic_theme', theme)
  }
}

interface MimicStore {
  theme: ThemeMode
  recorderState: RecorderState
  selectedWordId: string
  isFlashcardFlipped: boolean
  rememberedWords: string[]
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  startRecording: () => void
  finishRecording: () => void
  resetRecording: () => void
  selectWord: (id: string) => void
  flipFlashcard: () => void
  markWord: (id: string, remembered: boolean) => void
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useMimicStore = create<MimicStore>((set) => ({
  theme: initialTheme,
  recorderState: 'ready',
  selectedWordId: 'resilient',
  isFlashcardFlipped: false,
  rememberedWords: ['hesitate'],
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light'
    applyTheme(nextTheme)
    return { theme: nextTheme }
  }),
  startRecording: () => set({ recorderState: 'recording' }),
  finishRecording: () => set({ recorderState: 'processing' }),
  resetRecording: () => set({ recorderState: 'ready' }),
  selectWord: (id) => set({ selectedWordId: id, isFlashcardFlipped: false }),
  flipFlashcard: () => set((state) => ({ isFlashcardFlipped: !state.isFlashcardFlipped })),
  markWord: (id, remembered) => set((state) => ({
    rememberedWords: remembered
      ? Array.from(new Set([...state.rememberedWords, id]))
      : state.rememberedWords.filter((wordId) => wordId !== id),
  })),
}))

