import {
  ArrowRight,
  Bot,
  Check,
  Headphones,
  History,
  Info,
  Mic,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AudioPlayerBar } from '../components/speaking/AudioPlayerBar'
import { AcousticMetrics } from '../components/speaking/AcousticMetrics'
import { FeedbackCard } from '../components/speaking/FeedbackCard'
import { RecordButton } from '../components/speaking/RecordButton'
import { SentenceDiffCard } from '../components/speaking/SentenceDiffCard'
import { TopicSelector } from '../components/speaking/TopicSelector'
import { Waveform } from '../components/speaking/Waveform'
import { SectionLabel, StatusPill } from '../components/shared/UI'
import { LiveTranscriptionDisplay } from '../components/speaking/LiveTranscriptionDisplay'
import { AmbientSoundSelector } from '../components/speaking/AmbientSoundSelector'
import { SecretMissionCard } from '../components/speaking/SecretMissionCard'
import { SentenceTransformerModal } from '../components/speaking/SentenceTransformerModal'
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
  const [secretMissionTarget, setSecretMissionTarget] = useState('At the end of the day')
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
  }, [activeTopic.id])

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

  // Shadowing loop for single sentence
  const handleSpeakSentence = (text: string) => {
    speakNative(text)
  }

  // Sentence re-practice (Task S04)
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

  // End Session CTA (Task S05)
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

  const result = activeTopic.mockResult

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
      <div className="bg-study-surface border border-study-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-study-primary">
                {activeTopic.categoryLabel} · {activeTopic.level}
              </span>
              <span className="text-study-text-muted">·</span>
              <span className="text-xs text-study-text-muted">Gợi ý thời lượng: 60–90 giây</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-study-text mt-1">
              {activeTopic.title}
            </h2>
          </div>

          {/* Model Answer Audio Button */}
          <button
            type="button"
            onClick={handleToggleModelSpeech}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0 ${
              isPlayingModel
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-study-primary-soft text-study-primary hover:bg-study-primary hover:text-white border border-study-primary-border/60'
            }`}
            title="Nghe câu trả lời mẫu phát âm bằng giọng thiết bị"
          >
            {isPlayingModel ? <VolumeX size={15} /> : <Headphones size={15} />}
            <span>{isPlayingModel ? 'Dừng phát âm' : 'Nghe câu trả lời mẫu'}</span>
          </button>
        </div>

        {/* Prompt description */}
        <p className="text-xs sm:text-sm text-study-text-soft leading-relaxed bg-study-surface-muted/50 p-4 rounded-xl border border-study-border/50">
          <strong>Bối cảnh & Đề bài: </strong>
          {activeTopic.prompt}
        </p>

        {/* Carried Vocab Alert if available */}
        {carriedWords.length > 0 && (
          <div className="p-3.5 rounded-xl bg-study-accent-soft/40 border border-study-accent/25 space-y-1.5">
            <span className="text-xs font-semibold text-study-accent flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Từ bạn vừa ôn tập — hãy thử lồng ghép vào bài nói:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {carriedWords.map((w) => (
                <span
                  key={w.id}
                  className="px-2.5 py-1 rounded-md bg-study-surface border border-study-accent/30 text-xs font-mono font-semibold text-study-text"
                >
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible 3-Step Outline & Key Vocab */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-text hover:text-study-primary transition-colors cursor-pointer"
            >
              <Info size={14} className="text-study-primary" />
              <span>Dàn ý gợi ý & Từ vựng tham khảo</span>
              <span className="text-[11px] text-study-text-muted font-normal">
                ({showOutline ? 'Thu gọn' : 'Mở rộng'})
              </span>
            </button>

            <span className="text-[11px] text-study-text-muted italic hidden sm:inline">
              Mẹo mở đầu: “{activeTopic.starterSentence.slice(0, 35)}...”
            </span>
          </div>

          {showOutline && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-fade-in">
              {/* Outline */}
              <div className="p-4 rounded-xl bg-study-surface-muted/30 border border-study-border space-y-2">
                <span className="text-[11px] font-bold text-study-text block">
                  DÀN Ý 3 BƯỚC NÓI TỰ NHIÊN
                </span>
                <ul className="space-y-1.5 text-xs text-study-text-muted">
                  {activeTopic.outline.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-study-primary mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Vocab */}
              <div className="p-4 rounded-xl bg-study-surface-muted/30 border border-study-border space-y-2">
                <span className="text-[11px] font-bold text-study-text block">
                  TỪ VỰNG NÊN LỒNG GHÉP
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeTopic.keyVocab.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-study-surface border border-study-border text-xs flex flex-col"
                    >
                      <strong className="text-study-primary font-semibold font-mono">
                        {item.word}
                      </strong>
                      <span className="text-[10px] text-study-text-muted">
                        {item.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secret Mission Gamification Card */}
      <SecretMissionCard
        onSelectMission={(mission) => setSecretMissionTarget(mission)}
        detectedKeyword={secretMissionDetected}
      />

      {/* 3. The Interactive Recording Stage */}
      <div className="bg-study-surface border border-study-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center space-y-5 text-center relative overflow-hidden">
        {/* Visualizer Waveform */}
        <Waveform active={isRecording} liveVolume={liveVolume} />

        {/* Live Speech Recognition & Pacing Gauge */}
        <LiveTranscriptionDisplay
          transcript={liveTranscript}
          interimTranscript={interimTranscript}
          isRecording={isRecording}
          wpm={liveWpm}
          targetOutline={activeTopic.outline}
        />

        {/* Tactile Record Button */}
        <RecordButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          isComplete={isComplete}
          recordingTime={recordingTime}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          onReset={handleResetRecording}
          usingRealMic={usingRealMic}
        />
      </div>

      {/* 4. Post-Recording Review & AI Evaluation */}
      {isComplete && (
        <div className="space-y-6 animate-fade-in">
          {/* Honest Demo Notice Banner (Task F01 & S03) */}
          <div className="p-4 rounded-2xl bg-study-primary-soft/50 border border-study-primary-border/60 text-xs text-study-text flex items-start gap-3">
            <Info size={18} className="text-study-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold text-study-text">
                Kết quả minh họa mẫu (Demo Mode)
              </strong>
              <p className="text-study-text-muted leading-relaxed text-[11px]">
                Bản ghi âm giọng nói của bạn đã được ghi nhận trên trình duyệt. Transcript, điểm số và gợi ý dưới đây là dữ liệu minh họa để bạn trải nghiệm cách Speaking Agent sẽ phản hồi khi kết nối API thật.
              </p>
            </div>
          </div>

          {/* Audio Playback Bar */}
          <AudioPlayerBar
            audioUrl={audioUrl}
            recordingDurationSeconds={recordingTime || 78}
            onReRecord={resetRecording}
          />

          {/* User's Original Transcript */}
          <div className="p-5 rounded-2xl bg-study-surface border border-study-border space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-study-primary">
                Bản ghi lời của bạn (Transcript)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTransformingSentence(liveTranscript || result.userTranscript)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-study-primary-soft hover:bg-study-primary hover:text-white border border-study-primary-border/60 text-xs font-semibold text-study-primary transition-all cursor-pointer shadow-xs"
                >
                  <Wand2 size={13} />
                  <span>Biến hóa câu 3 sắc thái ✨</span>
                </button>
                <span className="text-[11px] text-study-text-muted">
                  {recordingTime || 78} giây thực tế
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-study-text italic leading-relaxed bg-study-surface-muted/50 p-4 rounded-xl border border-study-border/50">
              “{liveTranscript || result.userTranscript}”
            </p>
          </div>

          {/* Multi-metric Breakdown */}
          <AcousticMetrics
            score={result.score}
            fluencyScore={result.fluencyScore}
            wpm={result.wpm}
            cadenceScore={result.cadenceScore}
            vocabScore={result.vocabScore}
          />

          {/* Sentence Diff & Native Rephrasing with Sentence Practice Option (Task S04) */}
          <SentenceDiffCard
            rephrases={result.rephrases}
            onSpeak={handleSpeakSentence}
            onPracticeSentence={handlePracticeSentence}
          />

          {/* Detailed Grammar & Accent Feedback */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-study-primary block">
              Gợi ý cải thiện chi tiết
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.feedback.map((item) => (
                <FeedbackCard feedback={item} key={item.id} />
              ))}
            </div>
          </div>

          {/* Final CTA: End Study Session */}
          <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-display font-semibold text-study-text">
                Bạn đã hoàn thành bài nói!
              </h3>
              <p className="text-xs text-study-text-muted mt-0.5">
                Chuyển sang trang tổng kết để lưu kết quả và cập nhật chuỗi học hôm nay.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinishSpeaking}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>Xem tổng kết buổi học</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Sentence Re-practice Modal (Task S04) */}
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

