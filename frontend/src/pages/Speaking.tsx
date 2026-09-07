import {
  Check,
  Headphones,
  Info,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useState } from 'react'
import { AudioPlayerBar } from '../components/speaking/AudioPlayerBar'
import { AcousticMetrics } from '../components/speaking/AcousticMetrics'
import { FeedbackCard } from '../components/speaking/FeedbackCard'
import { RecordButton } from '../components/speaking/RecordButton'
import { SentenceDiffCard } from '../components/speaking/SentenceDiffCard'
import { TopicSelector } from '../components/speaking/TopicSelector'
import { Waveform } from '../components/speaking/Waveform'
import { SectionLabel, StatusPill } from '../components/shared/UI'
import { useAudioRecorder } from '../hook/useAudioRecorder'
import { usePageMeta } from '../hook/usePageMeta'
import { speakingTopics } from '../mocks/speaking'
import type { SpeakingTopic } from '../type'

export function Speaking() {
  usePageMeta(
    'Phòng Luyện Nói 60–90 Giây — HeyMimic',
    'Phòng thu phản xạ nói tiếng Anh cá nhân hóa với AI phản hồi tức thì và phương pháp Shadowing.'
  )

  const [activeTopic, setActiveTopic] = useState<SpeakingTopic>(speakingTopics[0])
  const [isPlayingModel, setIsPlayingModel] = useState(false)
  const [showOutline, setShowOutline] = useState(true)

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

  const result = activeTopic.mockResult

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <SectionLabel>SPEAKING AGENT · PHÒNG THU PHẢN XẠ AI</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-study-text tracking-tight mt-1">
            Luyện nói không áp lực<span className="text-study-primary">.</span>
          </h1>
          <p className="text-sm text-study-text-muted mt-1.5 max-w-lg leading-relaxed">
            Mỗi ngày một đoạn 60–90 giây. Nói theo cách của bạn, AI sẽ bóc tách và gợi ý phiên bản tự nhiên nhất.
          </p>
        </div>

        <StatusPill tone={isRecording ? 'signal' : usingRealMic ? 'calm' : 'muted'}>
          {isRecording
            ? 'ĐANG THU ÂM...'
            : isProcessing
            ? 'AI ĐANG PHÂN TÍCH...'
            : isComplete
            ? 'ĐÃ HOÀN TẤT BÀI NÓI'
            : usingRealMic
            ? 'MICRO ĐÃ SẴN SÀNG'
            : 'MIC SẴN SÀNG'}
        </StatusPill>
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
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-study-primary">
                {activeTopic.categoryLabel} · {activeTopic.level}
              </span>
              <span className="text-study-text-muted">·</span>
              <span className="text-xs text-study-text-muted">Mục tiêu: 60–90 giây</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-study-text mt-1">
              {activeTopic.title}
            </h2>
          </div>

          {/* Model Answer Audio Button */}
          <button
            type="button"
            onClick={handleToggleModelSpeech}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0 ${
              isPlayingModel
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-study-primary-soft text-study-primary hover:bg-study-primary hover:text-white border border-study-primary-border/60'
            }`}
            title="Bấm để nghe cách người bản xứ phát âm câu trả lời mẫu"
          >
            {isPlayingModel ? <VolumeX size={15} /> : <Headphones size={15} />}
            <span>{isPlayingModel ? 'Dừng phát âm' : 'Nghe người bản xứ nói mẫu'}</span>
          </button>
        </div>

        {/* Prompt description */}
        <p className="text-xs sm:text-sm text-study-text-soft leading-relaxed bg-study-surface-muted/50 p-4 rounded-xl border border-study-border/50">
          <strong>Bối cảnh & Đề bài: </strong>
          {activeTopic.prompt}
        </p>

        {/* Collapsible 3-Step Outline & Key Vocab */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-text hover:text-study-primary transition-colors cursor-pointer"
            >
              <Info size={14} className="text-study-primary" />
              <span>Dàn ý gợi ý & Từ vựng nên dùng</span>
              <span className="text-[11px] text-study-text-muted font-normal">
                ({showOutline ? 'Bấm để thu gọn' : 'Bấm để mở'})
              </span>
            </button>

            <span className="text-[11px] text-study-text-muted italic hidden sm:inline">
              Mẹo: Mở đầu bằng “{activeTopic.starterSentence.slice(0, 35)}...”
            </span>
          </div>

          {showOutline && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-in fade-in duration-200">
              {/* Outline */}
              <div className="p-4 rounded-xl bg-study-surface-muted/30 border border-study-border space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-study-text">
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
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-study-text">
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

      {/* 3. The Interactive Recording Stage */}
      <div className="bg-study-surface border border-study-border rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center space-y-4 text-center relative overflow-hidden">
        {/* Visualizer Waveform */}
        <Waveform active={isRecording} liveVolume={liveVolume} />

        {/* Tactile Record Button with 60-90s timer */}
        <RecordButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          isComplete={isComplete}
          recordingTime={recordingTime}
          onStart={startRecording}
          onStop={stopRecording}
          onReset={resetRecording}
          usingRealMic={usingRealMic}
        />
      </div>

      {/* 4. Post-Recording Review & AI Evaluation */}
      {isComplete && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Audio Playback Bar */}
          <AudioPlayerBar
            audioUrl={audioUrl}
            recordingDurationSeconds={recordingTime || 78}
            onReRecord={resetRecording}
          />

          {/* User's Original Transcript */}
          <div className="p-5 rounded-2xl bg-study-surface border border-study-border space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-study-primary font-mono">
                BẢN GHI LỜI CỦA BẠN (TRANSCRIPT)
              </span>
              <span className="text-[11px] text-study-text-muted">
                {recordingTime || 78} giây · Nhận diện giọng nói tức thì
              </span>
            </div>
            <p className="text-sm text-study-text italic leading-relaxed bg-study-surface-muted/50 p-4 rounded-xl border border-study-border/50">
              “{result.userTranscript}”
            </p>
          </div>

          {/* 4 Multi-metric Breakdown */}
          <AcousticMetrics
            score={result.score}
            fluencyScore={result.fluencyScore}
            wpm={result.wpm}
            cadenceScore={result.cadenceScore}
            vocabScore={result.vocabScore}
          />

          {/* Sentence Diff & Native Rephrasing with TTS Listen Button */}
          <SentenceDiffCard
            rephrases={result.rephrases}
            onSpeak={handleSpeakSentence}
          />

          {/* Detailed Grammar & Accent Nuance Feedback */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-study-primary font-mono block">
              GỢI Ý CẢI THIỆN CHI TIẾT
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.feedback.map((item) => (
                <FeedbackCard feedback={item} key={item.id} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
