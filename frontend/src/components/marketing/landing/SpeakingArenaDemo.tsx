import { Check, LoaderCircle, Mic2, Pause, Play, Sparkles, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { scenarios } from './landingData'

interface SpeakingArenaDemoProps {
  arenaRef: (node?: HTMLElement | null) => void
  arenaVisible: boolean
}

export function SpeakingArenaDemo({ arenaRef, arenaVisible }: SpeakingArenaDemoProps) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highlightWordIdx, setHighlightWordIdx] = useState<number>(-1)

  // Interactive Live Recording Sandbox State
  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'evaluating' | 'done'>('idle')
  const [recordCountdown, setRecordCountdown] = useState(5)
  const timerRef = useRef<number | null>(null)

  const activeScenario = scenarios[activeScenarioIdx]

  // Karaoke rhythm word-by-word animation
  useEffect(() => {
    if (!isPlaying) {
      setHighlightWordIdx(-1)
      return
    }

    let current = 0
    setHighlightWordIdx(0)
    const interval = setInterval(() => {
      current++
      if (current >= activeScenario.nativeWords.length) {
        setIsPlaying(false)
        setHighlightWordIdx(-1)
        clearInterval(interval)
      } else {
        setHighlightWordIdx(current)
      }
    }, 450)

    return () => clearInterval(interval)
  }, [isPlaying, activeScenarioIdx, activeScenario.nativeWords.length])

  // Sandbox Live Recording simulation
  const handleStartRecord = () => {
    setRecordState('recording')
    setRecordCountdown(5)

    let count = 5
    timerRef.current = window.setInterval(() => {
      count--
      setRecordCountdown(count)
      if (count <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        setRecordState('evaluating')
        setTimeout(() => {
          setRecordState('done')
        }, 1200)
      }
    }, 1000)
  }

  const handleResetRecord = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRecordState('idle')
    setRecordCountdown(5)
  }

  return (
    <section
      id="demo"
      ref={arenaRef}
      className={`max-w-5xl mx-auto px-6 scroll-reveal ${arenaVisible ? 'visible' : ''}`}
    >
      <div className="clean-card rounded-2xl p-6 sm:p-10 space-y-8">
        {/* Header & Scenario Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-study-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
              SPEAKING ARENA · TRẢI NGHIỆM TRỰC TIẾP
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-study-text mt-1">
              Lắng nghe nhịp điệu & bắt nhịp tự nhiên
            </h2>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-study-surface-muted p-1 rounded-xl">
            {scenarios.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveScenarioIdx(idx)
                  setIsPlaying(false)
                  setHighlightWordIdx(-1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeScenarioIdx === idx
                    ? 'bg-study-surface text-study-text font-semibold shadow-xs'
                    : 'text-study-text-muted hover:text-study-text'
                }`}
              >
                {item.titleVi}
              </button>
            ))}
          </div>
        </div>

        {/* Context Prompt */}
        <div className="bg-study-surface-muted/50 p-4 rounded-xl text-xs text-study-text-soft flex items-start gap-2.5">
          <span className="font-semibold text-study-text shrink-0">Đề bài gợi ý:</span>
          <span>{activeScenario.prompt}</span>
        </div>

        {/* Side-by-Side Comparison with Word-by-Word Karaoke Rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Before: Hesitant */}
          <div className="p-6 rounded-xl bg-study-surface-muted/30 border border-study-border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Cách nói thường gặp khi ấp úng
                </span>
                <span className="text-xs font-mono font-medium text-study-text-muted">
                  {activeScenario.scoreBefore}/100
                </span>
              </div>
              <p className="text-sm sm:text-base text-study-text-soft leading-relaxed">
                “{activeScenario.hesitantText}”
              </p>
            </div>

            <div className="text-xs text-study-text-muted pt-3 border-t border-study-border">
              Câu nói đúng ngữ pháp cơ bản nhưng nghe gượng và thiếu tự nhiên.
            </div>
          </div>

          {/* After: HeyMimic Native with Karaoke Rhythm Cadence */}
          <div className="p-6 rounded-xl bg-study-primary-soft/40 border border-study-primary-border/60 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-study-primary flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>HeyMimic gợi ý cách nói tự nhiên</span>
                </span>
                <span className="text-xs font-mono font-bold text-study-primary">
                  {activeScenario.scoreAfter}/100
                </span>
              </div>

              {/* Word-by-word Cadence Highlight Box */}
              <div className="text-sm sm:text-base text-study-text font-medium leading-loose flex flex-wrap items-center gap-1.5 pt-1">
                “
                {activeScenario.nativeWords.map((w, idx) => {
                  const isCurrent = highlightWordIdx === idx
                  return (
                    <span
                      key={idx}
                      className={`transition-all duration-200 px-1 py-0.5 rounded-md ${
                        isCurrent
                          ? 'bg-study-primary text-white scale-105 shadow-xs font-bold'
                          : w.stress
                          ? 'text-study-primary font-bold'
                          : 'text-study-text'
                      }`}
                    >
                      {w.word}
                      {w.pauseAfter && (
                        <span className="ml-1 text-[10px] text-study-text-muted opacity-60 font-mono">
                          |
                        </span>
                      )}
                    </span>
                  )
                })}
                ”
              </div>
            </div>

            <div className="text-xs text-study-text-soft pt-3 border-t border-study-primary-border/40">
              <strong>Điểm cải thiện:</strong> {activeScenario.diffExplanation}
            </div>
          </div>
        </div>

        {/* Audio Waveform & Player */}
        <div className="p-4 sm:p-5 rounded-xl bg-study-surface-muted/50 border border-study-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-study-primary text-white flex items-center justify-center hover:bg-study-primary-hover active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
              aria-label={isPlaying ? 'Tạm dừng' : 'Nghe câu mẫu'}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>

            <div>
              <strong className="block text-xs font-semibold text-study-text">
                {isPlaying ? 'Đang phát & bắt nhịp ngữ điệu...' : 'Nghe thử ngữ điệu câu nói này'}
              </strong>
              <span className="block text-[11px] text-study-text-muted">
                Bấm để xem từng từ bắt nhịp theo thời gian thực
              </span>
            </div>
          </div>

          {/* Dynamic Waveform Bars */}
          <div className="flex items-center gap-1 h-7">
            {[20, 55, 75, 40, 90, 60, 75, 45, 95, 65, 48, 80, 52, 70, 40, 85, 50].map((h, i) => (
              <span
                key={i}
                style={{
                  height: `${isPlaying ? h : 25}%`,
                  animationDuration: isPlaying ? `${0.45 + (i % 6) * 0.08}s` : undefined,
                  animationDelay: isPlaying ? `${i * 0.04}s` : undefined,
                }}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlaying ? 'bg-study-primary animate-waveform shadow-[0_0_8px_rgba(15,168,184,0.35)]' : 'bg-study-text-faint/40'
                }`}
              />
            ))}
          </div>

          <span className="text-xs text-study-text-muted hidden sm:inline-block">
            {activeScenario.aiFeedback}
          </span>
        </div>

        {/* Interactive Live Recording Sandbox */}
        <div className="p-6 rounded-xl bg-study-surface border border-study-border space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-study-text">
              THỬ MỞ MIC LUYỆN NÓI NGAY TẠI ĐÂY (5 GIÂY)
            </span>
            <span className="text-[11px] text-study-text-muted">
              100% riêng tư · Không cần tài khoản
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-study-surface-muted/40 border border-study-border">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={
                  recordState === 'idle'
                    ? handleStartRecord
                    : recordState === 'done'
                    ? handleResetRecord
                    : undefined
                }
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                  recordState === 'recording'
                    ? 'bg-study-accent text-white animate-record-ring scale-105'
                    : recordState === 'evaluating'
                    ? 'bg-study-surface-muted text-study-text-muted cursor-wait'
                    : recordState === 'done'
                    ? 'bg-study-success text-white'
                    : 'bg-study-primary text-white hover:scale-105'
                }`}
                aria-label="Thu âm thử"
              >
                {recordState === 'recording' ? (
                  <Square size={16} fill="currentColor" />
                ) : recordState === 'evaluating' ? (
                  <LoaderCircle size={18} className="animate-spin text-study-primary" />
                ) : recordState === 'done' ? (
                  <Check size={20} strokeWidth={2.5} />
                ) : (
                  <Mic2 size={20} />
                )}
              </button>

              <div>
                <strong className="block text-xs font-semibold text-study-text">
                  {recordState === 'recording'
                    ? `Đang lắng nghe... còn ${recordCountdown}s`
                    : recordState === 'evaluating'
                    ? 'AI đang phân tích độ trôi chảy...'
                    : recordState === 'done'
                    ? 'Tuyệt vời! AI đã nhận diện bài nói.'
                    : 'Bấm micro và nói thử một câu tiếng Anh'}
                </strong>
                <span className="block text-[11px] text-study-text-muted">
                  {recordState === 'done'
                    ? 'Điểm phản xạ: 92/100 · Nhịp điệu dứt khoát'
                    : 'Ví dụ: "I am ready to improve my speaking today"'}
                </span>
              </div>
            </div>

            {recordState === 'done' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetRecord}
                  className="px-3 py-1.5 rounded-lg border border-study-border bg-study-surface text-xs font-medium text-study-text hover:bg-study-surface-hover"
                >
                  Thử lại
                </button>
                <Link
                  to="/speaking"
                  className="px-4 py-1.5 rounded-lg bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover shadow-xs"
                >
                  Vào phòng nói đầy đủ
                </Link>
              </div>
            ) : (
              <div className="text-xs font-mono text-study-primary font-medium">
                {recordState === 'recording' ? '● REC' : 'SẴN SÀNG'}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
