export type VocabStatus = 'new' | 'reviewing' | 'mastered'

export interface VocabWord {
  id: string
  word: string
  pronunciation: string
  meaning: string
  partOfSpeech: string
  example: string
  translation: string
  status: VocabStatus
  mastery: number
  color: 'coral' | 'teal' | 'cream'
}

export interface AgentFeedback {
  id: string
  category: 'grammar' | 'vocabulary' | 'suggestion' | 'pronunciation'
  label: string
  original: string
  improved: string
  note: string
}

export interface SpeakingTopic {
  id: string
  category: 'work' | 'interview' | 'casual' | 'opinion'
  categoryLabel: string
  title: string
  level: 'A2-B1' | 'B1-B2' | 'B2+'
  prompt: string
  contextDesc: string
  starterSentence: string
  outline: string[]
  keyVocab: { word: string; meaning: string }[]
  modelAnswer: string
  mockResult: {
    score: number
    fluencyScore: number
    wpm: number
    cadenceScore: number
    vocabScore: number
    userTranscript: string
    feedback: AgentFeedback[]
    rephrases: { original: string; native: string; explanation: string }[]
  }
}

export interface SpeakingSession {
  id: string
  title: string
  prompt: string
  duration: string
  date: string
  score: number
  transcript: string
  feedback: AgentFeedback[]
}

export interface ProgressDay {
  day: string
  date: string
  minutes: number
  active: boolean
}

export interface CommonMistake {
  id: string
  title: string
  detail: string
  count: number
  trend: string
  example: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  streakDays: number
  totalMinutes: number
  targetLanguage: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  readTime: string
  excerpt: string
  content: string
  author: {
    name: string
    role: string
    avatar: string
  }
}
