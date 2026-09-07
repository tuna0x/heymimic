import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Headphones,
  Info,
  Mic,
  Mic2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { useMimicStore } from '../store/useMimicStore'
import { usePageMeta } from '../hook/usePageMeta'
import { ProgressBar } from '../components/shared/UI'
import type { ListeningExercise, ListeningSegment } from '../type'

export function Listening() {
  usePageMeta(
    'Phòng Luyện Nghe & Shadowing — HeyMimic',
    'Luyện nghe ngắt câu, bắt nhịp nối âm (connected speech) và thu âm bắt chước (shadowing) theo người bản xứ.'
  )

  const {
    listeningExercises,
    completedListeningIds,
    markListeningComplete,
  } = useMimicStore()

  const [selectedExerciseId, setSelectedExerciseId] = useState(listeningExercises[0]?.id ?? '')
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState<0.8 | 1.0 | 1.2>(1.0)
  const [isLooping, setIsLooping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Shadowing Record State
  const [isRecordingShadow, setIsRecordingShadow] = useState(false)
  const [hasRecordedShadow, setHasRecordedShadow] = useState(false)
  const [shadowSuccessNote, setShadowSuccessNote] = useState(false)

  const currentExercise =
    listeningExercises.find((e) => e.id === selectedExerciseId) ?? listeningExercises[0]

  const segments = currentExercise?.segments ?? []
  const activeSegment: ListeningSegment | undefined = segments[activeSegmentIndex]

  const progressPercent =
    segments.length > 0 ? Math.round(((activeSegmentIndex + 1) / segments.length) * 100) : 0

  const handlePlaySentence = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = playbackSpeed
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        if (isLooping) {
          setTimeout(() => handlePlaySentence(text), 600)
        }
      }
      window.speechSynthesis.speak(utterance)
    } catch {
      setIsSpeaking(false)
    }
  }

  const handleNextSegment = () => {
    if (activeSegmentIndex < segments.length - 1) {
      setActiveSegmentIndex((prev) => prev + 1)
      setHasRecordedShadow(false)
      setShadowSuccessNote(false)
    } else {
      markListeningComplete(currentExercise.id)
    }
  }

  const handlePrevSegment = () => {
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex((prev) => prev - 1)
      setHasRecordedShadow(false)
      setShadowSuccessNote(false)
    }
  }

  const handleSimulateShadowing = () => {
    setIsRecordingShadow(true)
    setTimeout(() => {
      setIsRecordingShadow(false)
      setHasRecordedShadow(true)
      setShadowSuccessNote(true)
      setTimeout(() => setShadowSuccessNote(false), 3500)
    }, 2000)
  }

  const isExerciseDone = completedListeningIds.includes(currentExercise?.id ?? '')

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary mb-1">
            <Headphones size={14} />
            <span>SHADOWING & INPUT LAB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Luyện nghe ngắt câu & Bắt chước
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1 leading-relaxed">
            Nghe từng câu ngắn, nhận diện nối âm (connected speech) và thu âm bắt chước ngữ điệu bản xứ.
          </p>
        </div>

        {/* Exercise Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedExerciseId}
            onChange={(e) => {
              setSelectedExerciseId(e.target.value)
              setActiveSegmentIndex(0)
              setHasRecordedShadow(false)
            }}
            className="px-3.5 py-2 rounded-xl bg-study-surface border border-study-border text-xs font-semibold text-study-text focus:outline-none focus:border-study-primary transition-colors cursor-pointer"
          >
            {listeningExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.categoryLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Focus Studio */}
      <div className="bg-study-surface border border-study-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Progress & Speed Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-study-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-study-primary">
                CÂU {activeSegmentIndex + 1} / {segments.length}
              </span>
              {isExerciseDone && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Đã hoàn thành</span>
                </span>
              )}
            </div>
            <div className="w-36 sm:w-48">
              <ProgressBar value={progressPercent} tone="calm" />
            </div>
          </div>

          {/* Speed & Loop Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-study-text-muted hidden sm:inline">Tốc độ:</span>
            <div className="flex items-center gap-1 bg-study-surface-muted/60 p-1 rounded-xl border border-study-border">
              {([0.8, 1.0, 1.2] as const).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-study-primary text-white'
                      : 'text-study-text-muted hover:text-study-text'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                isLooping
                  ? 'bg-study-accent text-white border-study-accent'
                  : 'bg-study-surface border-study-border text-study-text-muted hover:text-study-text'
              }`}
              title="Lặp lại câu này liên tục"
            >
              <RotateCcw size={14} />
              <span className="text-[11px] hidden sm:inline">Lặp lại</span>
            </button>
          </div>
        </div>

        {/* Active Sentence Visual Display */}
        {activeSegment && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-study-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 size={14} />
                  <span>Câu mẫu đang nghe</span>
                </span>
                <span className="text-[11px] text-study-text-muted font-mono flex items-center gap-1">
                  <span>Ngữ điệu:</span>
                  <strong className="text-study-text font-semibold">
                    {activeSegment.intonationPattern === 'rising' ? 'Lên giọng ↗' : 'Xuống giọng ↘'}
                  </strong>
                </span>
              </div>

              {/* Large Sentence */}
              <p className="text-xl sm:text-2xl font-display font-medium text-study-text leading-relaxed tracking-tight">
                “{activeSegment.sentence}”
              </p>

              {/* Vietnamese Meaning */}
              <p className="text-xs sm:text-sm text-study-text-muted italic leading-relaxed">
                {activeSegment.translation}
              </p>
            </div>

            {/* Connected Speech & Phonics Note */}
            {activeSegment.connectedSpeechNotes && (
              <div className="p-3.5 rounded-2xl bg-study-primary-soft/40 border border-study-primary-border/60 text-xs text-study-text space-y-1">
                <div className="flex items-center gap-1.5 text-study-primary font-semibold">
                  <Sparkles size={13} />
                  <span>Điểm nối âm & nuốt âm người bản xứ dùng:</span>
                </div>
                <p className="font-mono text-[11px] text-study-text-soft">
                  {activeSegment.connectedSpeechNotes}
                </p>
              </div>
            )}

            {/* Player Buttons for This Sentence */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handlePlaySentence(activeSegment.sentence)}
                disabled={isSpeaking}
                className="px-5 py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Volume2 size={15} />
                <span>{isSpeaking ? 'Đang phát âm...' : 'Nghe câu này'}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateShadowing}
                disabled={isRecordingShadow}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-2 ${
                  isRecordingShadow
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-study-accent text-white hover:bg-study-accent-hover'
                }`}
              >
                <Mic size={15} />
                <span>
                  {isRecordingShadow ? 'Đang thu âm bắt chước...' : 'Bắt chước câu này (Shadow)'}
                </span>
              </button>
            </div>

            {/* Shadow Feedback Notice */}
            {shadowSuccessNote && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>
                  Ngữ điệu và tốc độ của bạn rất khớp với bản đọc mẫu! Bạn có thể chuyển sang câu tiếp theo.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-study-border">
          <button
            type="button"
            onClick={handlePrevSegment}
            disabled={activeSegmentIndex === 0}
            className={`px-4 py-2 rounded-xl border border-study-border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSegmentIndex === 0
                ? 'opacity-40 cursor-not-allowed text-study-text-muted'
                : 'text-study-text hover:bg-study-surface-hover'
            }`}
          >
            <ArrowLeft size={14} />
            <span>Câu trước</span>
          </button>

          <button
            type="button"
            onClick={handleNextSegment}
            className="px-5 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>{activeSegmentIndex === segments.length - 1 ? 'Hoàn thành bài nghe' : 'Câu tiếp theo'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Key Collocations Card in this lesson */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-study-text flex items-center gap-2">
            <Sparkles size={15} className="text-study-accent" />
            <span>Cụm từ tự nhiên (Collocations) xuất hiện trong bài nghe này:</span>
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {currentExercise.keyCollocations.map((colloc, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-study-surface-muted border border-study-border text-xs font-mono font-semibold text-study-primary"
            >
              {colloc}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
