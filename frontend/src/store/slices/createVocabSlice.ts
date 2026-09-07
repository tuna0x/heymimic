import { StateCreator } from 'zustand'
import type { ReviewEvent, ReviewSession, VocabWord } from '../../type'
import { todayWords } from '../../mocks/vocab'
import { safeJsonParse, STORAGE_KEYS } from '../storageKeys'

export interface VocabSlice {
  vocabWords: VocabWord[]
  selectedWordId: string
  isFlashcardFlipped: boolean
  activeReviewSession: ReviewSession | null
  selectWord: (id: string) => void
  flipFlashcard: () => void
  startReviewSession: (wordIds?: string[]) => ReviewSession
  rateCurrentWord: (rating: 'remembered' | 'needsReview') => void
  undoLastReview: () => void
  finishReviewSession: () => void
  addCustomWords: (newWords: Array<Omit<VocabWord, 'id' | 'status'>>) => void
}

export const createVocabSlice: StateCreator<
  VocabSlice & { activeStudySession?: { id?: string } | null },
  [],
  [],
  VocabSlice
> = (set, get) => ({
  vocabWords: safeJsonParse<VocabWord[]>(STORAGE_KEYS.VOCAB, todayWords),
  selectedWordId: todayWords[0]?.id ?? '',
  isFlashcardFlipped: false,
  activeReviewSession: null,

  selectWord: (id) => set({ selectedWordId: id, isFlashcardFlipped: false }),
  flipFlashcard: () => set((state) => ({ isFlashcardFlipped: !state.isFlashcardFlipped })),

  startReviewSession: (wordIds) => {
    const words = wordIds && wordIds.length > 0 ? wordIds : get().vocabWords.map((w) => w.id)
    const reviewSession: ReviewSession = {
      id: `rev-${Date.now()}`,
      studySessionId: get().activeStudySession?.id,
      wordIds: words,
      currentIndex: 0,
      reviews: [],
      status: 'inProgress',
    }
    set({
      activeReviewSession: reviewSession,
      isFlashcardFlipped: false,
      selectedWordId: words[0] ?? '',
    })
    return reviewSession
  },

  rateCurrentWord: (rating) => {
    const session = get().activeReviewSession
    if (!session || session.status !== 'inProgress') return

    const currentWordId = session.wordIds[session.currentIndex]
    if (!currentWordId) return

    const newEvent: ReviewEvent = {
      id: `rev-ev-${Date.now()}`,
      reviewSessionId: session.id,
      wordId: currentWordId,
      rating,
      reviewedAt: new Date().toISOString(),
    }

    const nextIndex = session.currentIndex + 1
    const isFinished = nextIndex >= session.wordIds.length

    // Update word status in vocabulary list
    const updatedVocab = get().vocabWords.map((w) => {
      if (w.id === currentWordId) {
        return {
          ...w,
          status: (rating === 'remembered' ? 'reviewing' : 'new') as VocabWord['status'],
          mastery: Math.min(
            100,
            Math.max(0, (w.mastery ?? 50) + (rating === 'remembered' ? 12 : -8))
          ),
        }
      }
      return w
    })

    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(updatedVocab))

    set({
      vocabWords: updatedVocab,
      isFlashcardFlipped: false,
      activeReviewSession: {
        ...session,
        currentIndex: nextIndex,
        reviews: [...session.reviews, newEvent],
        status: isFinished ? 'completed' : 'inProgress',
      },
      selectedWordId: isFinished ? '' : session.wordIds[nextIndex] ?? '',
    })
  },

  undoLastReview: () => {
    const session = get().activeReviewSession
    if (!session || session.reviews.length === 0) return

    const updatedReviews = session.reviews.slice(0, -1)
    const prevIndex = Math.max(0, session.currentIndex - 1)
    const prevWordId = session.wordIds[prevIndex] ?? ''

    set({
      activeReviewSession: {
        ...session,
        currentIndex: prevIndex,
        reviews: updatedReviews,
        status: 'inProgress',
      },
      selectedWordId: prevWordId,
      isFlashcardFlipped: true,
    })
  },

  finishReviewSession: () => {
    const session = get().activeReviewSession
    if (!session) return
    set({
      activeReviewSession: {
        ...session,
        status: 'completed',
      },
    })
  },

  addCustomWords: (newWords) => {
    const state = get()
    const additions: VocabWord[] = newWords.map((w, idx) => ({
      ...w,
      id: `custom-${Date.now()}-${idx}`,
      status: 'new',
      mastery: 10,
      color: 'coral',
    }))
    const updated = [...state.vocabWords, ...additions]
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(updated))
    set({ vocabWords: updated })
  },
})
