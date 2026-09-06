import { ArrowRight, Check, Flame, Mic2, RotateCcw, Sparkles, Volume2, Waves } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const warmups = [
  {
    id: 'lips',
    label: 'Cơ môi (/p/, /b/)',
    text: 'Peter Piper picked a peck of pickled peppers.',
    tip: 'Bật hơi rõ ở các âm /p/ để đánh thức cơ miệng.',
  },
  {
    id: 'sibilant',
    label: 'Âm xì (/s/, /ʃ/)',
    text: 'She sells seashells by the seashore.',
    tip: 'Phân biệt rõ âm /s/ thanh mảnh và /ʃ/ tròn môi.',
  },
  {
    id: 'tongue',
    label: 'Khớp lưỡi (/r/, /l/)',
    text: 'Red lorry, yellow lorry, red lorry, yellow lorry.',
    tip: 'Giữ đầu lưỡi linh hoạt khi đổi nhanh giữa /r/ và /l/.',
  },
]

export function InteractivePreFooterBanner() {
  const [activeWarmup, setActiveWarmup] = useState(0)
  const [isWarmingUp, setIsWarmingUp] = useState(false)
  const [warmupDone, setWarmupDone] = useState(false)
  const [warmupTimer, setWarmupTimer] = useState(3)

  const warmupItem = warmups[activeWarmup]

  const handleStartWarmup = () => {
    setIsWarmingUp(true)
    setWarmupDone(false)
    setWarmupTimer(3)

    let t = 3
    const interval = window.setInterval(() => {
      t -= 1
      if (t > 0) {
        setWarmupTimer(t)
      } else {
        window.clearInterval(interval)
        setIsWarmingUp(false)
        setWarmupDone(true)
      }
    }, 1000)
  }

  const handleResetWarmup = () => {
    setIsWarmingUp(false)
    setWarmupDone(false)
    setWarmupTimer(3)
  }

  return (
    <section className="max-w-5xl mx-auto px-6">
      <div className="relative overflow-hidden rounded-3xl bg-study-surface border border-study-border p-8 sm:p-14 shadow-sm space-y-10">
        {/* Subtle Decorative Ambient Rings */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-study-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-study-accent/5 blur-3xl pointer-events-none" />

        {/* Header Content */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-study-primary-soft text-study-primary border border-study-primary-border/60">
            <Sparkles size={13} />
            <span>PHÒNG LUYỆN NÓI RIÊNG TƯ · SẴN SÀNG 24/7</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-study-text tracking-tight leading-[1.18]">
            Sẵn sàng mở lời và giải phóng giọng nói của bạn?
          </h2>

          <p className="text-sm sm:text-base text-study-text-muted leading-relaxed">
            Chỉ cần 60 giây và một góc yên tĩnh mỗi ngày. Không ai phán xét, không áp lực điểm số, chỉ có sự tiến bộ rõ rệt qua từng tuần.
          </p>
        </div>

        {/* =========================================================================
            Interactive 3-Second Tongue Warm-up Mini Studio
           ========================================================================= */}
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-study-surface-muted/50 border border-study-border space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-study-border pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-study-text uppercase">
              <Mic2 size={14} className="text-study-primary" />
              <span>KHỞI ĐỘNG CƠ MIỆNG NHANH TRƯỚC KHI NÓI (3S WARM-UP)</span>
            </div>

            {/* Warmup tabs */}
            <div className="flex items-center gap-1">
              {warmups.map((w, idx) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    handleResetWarmup()
                    setActiveWarmup(idx)
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    activeWarmup === idx
                      ? 'bg-study-primary text-white font-semibold shadow-xs'
                      : 'text-study-text-muted hover:text-study-text'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tongue Twister Sentence */}
          <div className="text-center space-y-2 py-1">
            <p className="text-base sm:text-lg font-serif italic text-study-text">
              “{warmupItem.text}”
            </p>
            <p className="text-xs text-study-text-muted">
              💡 Mẹo nhỏ: {warmupItem.tip}
            </p>
          </div>

          {/* Warmup Action Button & Meter */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {warmupDone ? (
              <div className="flex items-center gap-3 animate-in fade-in">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-study-success-soft text-study-success text-xs font-semibold border border-study-success/30">
                  <Check size={14} strokeWidth={2.5} />
                  Thanh quản đã sẵn sàng!
                </span>
                <button
                  type="button"
                  onClick={handleResetWarmup}
                  className="inline-flex items-center gap-1 text-xs text-study-text-muted hover:text-study-text p-1 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Khởi động lại</span>
                </button>
              </div>
            ) : isWarmingUp ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-study-accent text-white flex items-center justify-center font-mono font-bold text-sm animate-pulse">
                  {warmupTimer}s
                </div>
                <div className="flex items-center gap-1 h-6">
                  {[40, 70, 90, 60, 100, 50, 80, 40].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1 rounded-full bg-study-accent animate-waveform"
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-study-text">
                  Đang thu âm khởi động... Hãy đọc to câu trên!
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartWarmup}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text hover:border-study-primary transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Mic2 size={14} className="text-study-primary" />
                <span>Bấm vào đây để khởi động 3s</span>
              </button>
            )}
          </div>
        </div>

        {/* Main CTA Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-study-primary text-white font-bold text-sm hover:bg-study-primary-hover shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Vào phòng luyện nói 60 giây</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/speaking-method"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-sm font-semibold text-study-text transition-colors"
          >
            <span>Tìm hiểu phương pháp Shadowing</span>
          </Link>
        </div>

        {/* Social Proof & Trust Metric Ticker */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-study-border text-xs text-study-text-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-study-primary" />
            <span><strong>94.8%</strong> học viên tự tin mở lời hơn sau 14 ngày</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-study-accent" />
            <span><strong>12,400+</strong> phút luyện nói trong tuần qua</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>100% riêng tư & miễn phí trải nghiệm</span>
          </div>
        </div>
      </div>
    </section>
  )
}
