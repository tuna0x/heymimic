import {
  Bot,
  History,
  Mic,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopicSelector } from '../components/speaking/TopicSelector'
import { SectionLabel, StatusPill } from '../components/shared/UI'
import { AmbientSoundSelector } from '../components/speaking/AmbientSoundSelector'
import { SentenceTransformerModal } from '../components/speaking/SentenceTransformerModal'
import { SpeakingContextCard } from '../components/speaking/SpeakingContextCard'
import { SpeakingStudioRecorder } from '../components/speaking/SpeakingStudioRecorder'
import { SpeakingAnalysisSection } from '../components/speaking/SpeakingAnalysisSection'
import { useAudioRecorder } from '../hook/useAudioRecorder'
import { useLiveSpeechRecognition } from '../hook/useLiveSpeechRecognition'
import { useAmbientSound } from '../hook/useAmbientSound'
import { usePageMeta } from '../hook/usePageMeta'
import { speakingTopics } from '../mocks/speaking'
import { useMimicStore } from '../store/useMimicStore'
import type { SpeakingAttempt, SpeakingTopic } from '../type'

export function Speaking() {
  usePageMeta(
    'Phòng Luyện Nói 60–90 Giây — HeyMimic',
    'Phòng thu phản xạ nói tiếng Anh cá nhân hóa với phản hồi mẫu và so sánh câu tự nhiên.'
  )

  const navigate = useNavigate()
  const activeStudySession = useMimicStore((state) => state.activeStudySession)
  const vocabWords = useMimicStore((state) => state.vocabWords)
  const startSpeakingSession = useMimicStore((state) => state.startSpeakingSession)
  const addSpeakingAttempt = useMimicStore((state) => state.addSpeakingAttempt)
  const completeSpeakingSession = useMimicStore((state) => state.completeSpeakingSession)

  const [activeTopic, setActiveTopic] = useState<SpeakingTopic>(speakingTopics[0])
  const [isPlayingModel, setIsPlayingModel] = useState(false)
  const [showOutline, setShowOutline] = useState(true)
  const [practicingSentence, setPracticingSentence] = useState<string | null>(null)
  const [sentenceAttemptDone, setSentenceAttemptDone] = useState(false)
  const [secretMissionTarget] = useState('At the end of the day')
  const [secretMissionDetected, setSecretMissionDetected] = useState(false)
  const [transformingSentence, setTransformingSentence] = useState<string | null>(null)

  // Audio recording hook with real mic support & native TTS
  const {
    isRecording,
    isProcessing,
    isComplete,
    recordingTime,
    liveVolume,
    audioUrl,
    usingRealMic,
    startRecording,
    stopRecording,
    resetRecording,
    speakNative,
    stopSpeaking,
  } = useAudioRecorder()

  // Ambient sound atmosphere generator
  const {
    mode: ambientMode,
    volume: ambientVolume,
    toggleMode: toggleAmbientMode,
    changeVolume: changeAmbientVolume,
  } = useAmbientSound()

  // Real-time speech recognition
  const {
    transcript: liveTranscript,
    interimTranscript,
    wpm: liveWpm,
    startListening,
    stopListening,
    resetTranscript,
  } = useLiveSpeechRecognition({
    samplePhrasesFallback: activeTopic.outline,
  })

  const handleStartRecording = () => {
    startRecording()
    startListening()
    setSecretMissionDetected(false)
  }

  const handleStopRecording = () => {
    stopRecording()
    stopListening()
    const combined = (liveTranscript + ' ' + activeTopic.mockResult.userTranscript).toLowerCase()
    if (combined.includes(secretMissionTarget.toLowerCase())) {
      setSecretMissionDetected(true)
    }
  }

  const handleResetRecording = () => {
    resetRecording()
    resetTranscript()
    setSecretMissionDetected(false)
  }

  // Initialize speaking session in store if not started
  const currentSpeakingSessionId = useMemo(() => `spk-${Date.now()}`, [])

  useEffect(() => {
    startSpeakingSession(activeTopic.id)
  }, [activeTopic.id, startSpeakingSession])

  // Track carried vocab from vocab review
  const carriedWords = useMemo(() => {
    if (!activeStudySession?.suggestedVocabIds) return []
    return vocabWords.filter((w) => activeStudySession.suggestedVocabIds?.includes(w.id))
  }, [activeStudySession, vocabWords])

  // Change topic handler
  const handleSelectTopic = (topic: SpeakingTopic) => {
    if (isRecording) return
    setActiveTopic(topic)
    resetRecording()
    stopSpeaking()
    setIsPlayingModel(false)
  }

  // Play native speaker model answer
  const handleToggleModelSpeech = () => {
    if (isPlayingModel) {
      stopSpeaking()
      setIsPlayingModel(false)
    } else {
      setIsPlayingModel(true)
      speakNative(activeTopic.modelAnswer, () => {
        setIsPlayingModel(false)
      })
    }
  }

  // Re-practice single sentence
  const handlePracticeSentence = (sentence: string) => {
    setPracticingSentence(sentence)
    setSentenceAttemptDone(false)
  }

  const handleFinishSentencePractice = () => {
    if (practicingSentence) {
      const attempt: SpeakingAttempt = {
        id: `att-sent-${Date.now()}`,
        speakingSessionId: currentSpeakingSessionId,
        attemptNumber: 2,
        durationSeconds: 10,
        audioAvailability: 'inSession',
        createdAt: 'Bây giờ',
        targetSentence: practicingSentence,
      }
      addSpeakingAttempt(attempt)
    }
    setPracticingSentence(null)
  }

  // End Session CTA
  const handleFinishSpeaking = () => {
    completeSpeakingSession({
      sessionId: currentSpeakingSessionId,
      score: activeTopic.mockResult.score,
      transcript: activeTopic.mockResult.userTranscript,
      feedback: activeTopic.mockResult.feedback,
      durationSeconds: recordingTime || 78,
    })

    const targetSessionId = activeStudySession?.id ?? currentSpeakingSessionId
    navigate(`/session/${targetSessionId}/summary`)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 text-left">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <SectionLabel>Phòng thu phản xạ nói</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-study-text tracking-tight mt-1">
            Luyện nói không áp lực<span className="text-study-primary">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1.5 max-w-lg leading-relaxed">
            Mỗi ngày một bài 60–90 giây. Nói theo cách của bạn, hệ thống đối chiếu và gợi ý phiên bản diễn đạt tự nhiên nhất.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <AmbientSoundSelector
            mode={ambientMode}
            volume={ambientVolume}
            onToggleMode={toggleAmbientMode}
            onChangeVolume={changeAmbientVolume}
          />

          <Link
            to="/speaking/dialogue"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-study-primary-border/60 bg-study-primary-soft text-study-primary hover:bg-study-primary hover:text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Bot size={14} />
            <span>Hội thoại AI 2 chiều</span>
          </Link>

          <Link
            to="/speaking/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text-muted hover:text-study-text transition-colors"
          >
            <History size={14} />
            <span>Lịch sử bài nói</span>
          </Link>

          <StatusPill tone={isRecording ? 'signal' : usingRealMic ? 'calm' : 'muted'}>
            {isRecording
              ? 'ĐANG THU ÂM...'
              : isProcessing
              ? 'ĐANG TỔNG HỢP...'
              : isComplete
              ? 'ĐÃ HOÀN TẤT'
              : usingRealMic
              ? 'MICRO SẴN SÀNG'
              : 'MIC THIẾT BỊ'}
          </StatusPill>
        </div>
      </div>

      {/* 1. Topic & Scenario Selector */}
      <TopicSelector
        topics={speakingTopics}
        activeTopicId={activeTopic.id}
        onSelectTopic={handleSelectTopic}
        disabled={isRecording}
      />

      {/* 2. Active Prompt Context & Pre-Speaking Preparation */}
      <SpeakingContextCard
        activeTopic={activeTopic}
        carriedWords={carriedWords}
        isPlayingModel={isPlayingModel}
        showOutline={showOutline}
        secretMissionTarget={secretMissionTarget}
        secretMissionDetected={secretMissionDetected}
        onToggleModelSpeech={handleToggleModelSpeech}
        onToggleOutline={() => setShowOutline(!showOutline)}
      />

      {/* 3. The Interactive Recording Stage */}
      <SpeakingStudioRecorder
        isRecording={isRecording}
        isProcessing={isProcessing}
        isComplete={isComplete}
        recordingTime={recordingTime}
        liveVolume={liveVolume}
        liveTranscript={liveTranscript}
        interimTranscript={interimTranscript}
        liveWpm={liveWpm}
        usingRealMic={usingRealMic}
        targetOutline={activeTopic.outline}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onResetRecording={handleResetRecording}
      />

      {/* 4. Post-Recording Review & AI Evaluation */}
      {isComplete && (
        <SpeakingAnalysisSection
          result={activeTopic.mockResult}
          audioUrl={audioUrl}
          recordingTime={recordingTime}
          liveTranscript={liveTranscript}
          onReRecord={resetRecording}
          onTransformSentence={(s) => setTransformingSentence(s)}
          onSpeakSentence={(t) => speakNative(t)}
          onPracticeSentence={handlePracticeSentence}
          onFinishSpeaking={handleFinishSpeaking}
        />
      )}

      {/* Sentence Re-practice Modal */}
      {practicingSentence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={() => setPracticingSentence(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-study-surface border border-study-border rounded-2xl p-6 shadow-xl space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-study-primary flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Luyện lại câu cụ thể</span>
              </span>
              <button
                type="button"
                onClick={() => setPracticingSentence(null)}
                className="p-1 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-hover cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-study-primary-soft/40 border border-study-primary-border/60 space-y-2">
              <span className="text-[11px] font-semibold text-study-primary uppercase tracking-wider block">
                Câu gợi ý bản xứ
              </span>
              <p className="text-sm font-medium text-study-text leading-relaxed">
                “{practicingSentence}”
              </p>
              <button
                type="button"
                onClick={() => speakNative(practicingSentence)}
                className="inline-flex items-center gap-1.5 text-xs text-study-primary hover:underline font-semibold cursor-pointer pt-1"
              >
                <Volume2 size={14} />
                <span>Nghe lại giọng đọc mẫu</span>
              </button>
            </div>

            <p className="text-xs text-study-text-muted">
              Hãy bấm nút dưới để thu âm lại riêng câu này, tập trung vào ngữ điệu và các cụm từ nối.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-study-border">
              <button
                type="button"
                onClick={() => setSentenceAttemptDone(true)}
                className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Mic size={14} />
                <span>{sentenceAttemptDone ? 'Đã thu âm câu này' : 'Thu âm thử câu này'}</span>
              </button>

              <button
                type="button"
                onClick={handleFinishSentencePractice}
                className="px-4 py-2 rounded-xl border border-study-border bg-study-surface text-study-text text-xs font-semibold hover:bg-study-surface-hover transition-colors cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sentence Transformer Modal */}
      <SentenceTransformerModal
        sentence={transformingSentence || ''}
        isOpen={Boolean(transformingSentence)}
        onClose={() => setTransformingSentence(null)}
      />
    </div>
  )
}
