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
  mastery?: number
  color?: 'coral' | 'teal' | 'cream'
  sourceContext?: string
  nextReviewAt?: string
  version?: number
}

export interface ContextSuggestion {
  id: string
  word: string
  meaning: string
  sourceSentence: string
  existingWordId?: string
  selected: boolean
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
}

export interface SpeakingResult {
  score: number
  fluencyScore?: number
  wpm?: number
  cadenceScore?: number
  vocabScore?: number
  userTranscript: string
  feedback: AgentFeedback[]
  rephrases: { original: string; native: string; explanation: string }[]
  source?: string
}

export interface SpeakingAttempt {
  id: string
  speakingSessionId: string
  attemptNumber: number
  durationSeconds: number
  audioAvailability: 'inSession' | 'unavailable'
  audioUrl?: string
  createdAt: string
  targetSentence?: string
}

export interface FeedbackResult {
  id: string
  speakingSessionId: string
  source: 'demo'
  transcript: string
  strengths: string[]
  corrections: AgentFeedback[]
  metrics?: {
    score: number
    fluencyScore: number
    wpm: number
    cadenceScore: number
    vocabScore: number
  }
}

export interface SpeakingSession {
  id: string
  studySessionId?: string
  topicId: string
  title: string
  prompt: string
  duration: string
  date: string
  startedAt?: string
  completedAt?: string
  score: number
  transcript: string
  feedback: AgentFeedback[]
  attempts?: SpeakingAttempt[]
  feedbackResult?: FeedbackResult
  status?: 'inProgress' | 'completed'
}

export interface ReviewEvent {
  id: string
  reviewSessionId: string
  wordId: string
  rating: 'remembered' | 'needsReview'
  reviewedAt: string
  undoneAt?: string
}

export interface ReviewSession {
  id: string
  studySessionId?: string
  wordIds: string[]
  currentIndex: number
  reviews: ReviewEvent[]
  status: 'inProgress' | 'completed' | 'abandoned'
}

export interface StudySession {
  id: string
  startedAt: string
  completedAt?: string
  status: 'notStarted' | 'inProgress' | 'completed' | 'abandoned'
  currentStep: 'vocab' | 'speaking' | 'summary'
  plannedSteps: ('vocab' | 'speaking')[]
  reviewSessionId?: string
  speakingSessionId?: string
  suggestedVocabIds?: string[]
  version?: number
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

export interface MistakeOccurrence {
  id: string
  patternId: string
  speakingSessionId: string
  sessionTitle: string
  original: string
  suggested: string
  occurredAt: string
  source: string
}

export interface MistakePattern {
  id: string
  category: 'grammar' | 'vocabulary' | 'expression' | 'pronunciation'
  title: string
  explanation: string
  status: 'needsPractice' | 'improving' | 'mastered'
  count: number
  occurrences: MistakeOccurrence[]
  recommendedTopicId?: string
  exampleSentence?: string
  version?: number
}

export interface DailyActivity {
  dateKey: string
  vocabSeconds: number
  speakingSeconds: number
  completedStudySessionIds: string[]
}

export interface DailyRecommendation {
  activityType: 'vocab' | 'speaking' | 'combined' | 'mistake' | 'listening' | 'dialogue' | 'writing'
  targetId: string
  title: string
  reason: string
  estimatedMinutes: number
}

export interface LearnerProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  streakDays: number
  totalMinutes: number
  targetLanguage: string
  goal: 'work' | 'interview' | 'casual' | 'daily' | 'other'
  selfAssessedLevel: 'beginner' | 'elementary' | 'intermediate' | 'unspecified'
  dailyMinutesGoal: 5 | 10 | 15
  onboardingCompleted: boolean
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
}

// UserProfile alias for backward compatibility
export type UserProfile = LearnerProfile

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

// 1. Listening & Shadowing Models
export interface ListeningSegment {
  id: string
  sentence: string
  translation: string
  startTime: number
  endTime: number
  connectedSpeechNotes?: string
  intonationPattern: 'rising' | 'falling' | 'flat'
}

export interface ListeningExercise {
  id: string
  title: string
  category: 'meeting' | 'interview' | 'casual' | 'tech'
  categoryLabel: string
  duration: string
  audioUrl?: string
  transcript: string
  segments: ListeningSegment[]
  keyCollocations: string[]
}

// 2. AI Roleplay Dialogue Models
export interface DialogueTurn {
  id: string
  speaker: 'ai' | 'user'
  avatar?: string
  speakerName: string
  text: string
  audioUrl?: string
  suggestedRephrase?: string
  feedbackNote?: string
}

export interface DialogueScenario {
  id: string
  title: string
  role: string
  aiRole: string
  objective: string
  contextDesc: string
  category: 'work' | 'interview' | 'negotiation'
  turns: DialogueTurn[]
  metricsSummary?: {
    politenessScore: number
    clarityScore: number
    naturalnessScore: number
  }
}

// 3. Collocations & Lexical Chunks Models
export interface CollocationPair {
  id: string
  verbOrAdj: string
  noun: string
  fullChunk: string
  commonMistake: string
  contextExample: string
  translation: string
  category: 'work' | 'tech' | 'communication'
  categoryLabel: string
  status?: 'new' | 'learning' | 'mastered'
}

// 4. Workplace Writing Models
export interface WritingTemplate {
  id: string
  title: string
  category: 'email' | 'slack'
  categoryLabel: string
  context: string
  sampleDraft: string
  professionalVersion: string
  casualVersion: string
  keyImprovements: string[]
}

export interface ReflexTranslationPrompt {
  id: string
  vietnameseThought: string
  context: string
  literalTrap: string
  naturalEnglish: string
  explanation: string
  targetChunks: string[]
}

// 5. One-to-One Peer Practice Models
export interface PeerConversationRound {
  roundNumber: number
  title: string
  durationSeconds: number
  promptEn: string
  promptVi: string
  hints: string[]
}

export interface PeerTopic {
  id: string
  title: string
  category: 'work' | 'interview' | 'tech' | 'daily' | 'debate'
  categoryLabel: string
  level: 'A2-B1' | 'B1-B2' | 'B2+'
  description: string
  defaultDurationMinutes: number
  rounds: PeerConversationRound[]
  recommendedVocab: string[]
}

export interface PeerPartner {
  id: string
  name: string
  avatar: string
  targetLevel: string
  city: string
  goal: string
  rating: number
  totalSessions: number
  bio: string
}

export interface PeerFeedback {
  sessionId: string
  partnerId: string
  compliments: string[]
  privateNote: string
  clarityRating: number
  confidenceRating: number
}

export interface PeerSession {
  id: string
  topicId: string
  topicTitle: string
  partner: PeerPartner
  durationMinutes: number
  startedAt: string
  status: 'matching' | 'inSession' | 'completed'
  feedbackGiven?: PeerFeedback
}

// 6. Video-based Learning & Shadowing Models
export interface VideoSubtitleSegment {
  id: string
  startTime: number // in seconds
  endTime: number // in seconds
  textEn: string
  textVi: string
  phoneticNotes?: string
  targetWord?: string
}

export interface VideoClip {
  id: string
  title: string
  speaker: string
  speakerRole: string
  category: 'ted' | 'work' | 'interview' | 'movies'
  categoryLabel: string
  level: 'A2-B1' | 'B1-B2' | 'B2+'
  durationSeconds: number
  wpm: number
  videoUrl: string
  posterUrl: string
  description: string
  keyTakeaways: string[]
  subtitles: VideoSubtitleSegment[]
}

export interface VideoShadowingAttempt {
  id: string
  videoId: string
  segmentId: string
  audioUrl?: string
  score: number
  feedback: string
  createdAt: string
}



