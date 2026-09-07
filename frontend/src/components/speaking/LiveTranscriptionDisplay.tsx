import { useState } from 'react'
import { FileText, Gauge, Sparkles, Wand2 } from 'lucide-react'

interface LiveTranscriptionDisplayProps {
  transcript: string
  interimTranscript?: string
  isRecording: boolean
  wpm: number
  targetOutline?: string[]
}

export function LiveTranscriptionDisplay({
  transcript,
  interimTranscript,
  isRecording,
  wpm,
  targetOutline,
}: LiveTranscriptionDisplayProps) {
  const [showTeleprompter, setShowTeleprompter] = useState(false)

  // Determine pacing status
  let pacingStatus = {
    label: 'Đang lắng nghe...',
    tone: 'text-study-text-muted',
    badge: 'bg-study-surface-muted',
  }

  if (wpm > 0) {
    if (wpm < 110) {
      pacingStatus = {
        label: 'Nhịp hơi chậm • Hãy tự tin tăng tốc',
        tone: 'text-amber-500',
        badge: 'bg-amber-500/10 border-amber-500/30',
      }
    } else if (wpm <= 155) {
      pacingStatus = {
        label: 'Tốc độ đàm thoại lý tưởng ✨',
        tone: 'text-emerald-500',
        badge: 'bg-emerald-500/10 border-emerald-500/30',
      }
    } else {
      pacingStatus = {
        label: 'Nhịp hơi nhanh • Hãy ngắt câu tự nhiên',
        tone: 'text-rose-500',
        badge: 'bg-rose-500/10 border-rose-500/30',
      }
    }
  }

  if (!isRecording && !transcript) {
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 animate-fade-in text-left">
      {/* Top Bar: Pacing Gauge & Teleprompter Toggle */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors bg-study-surface border-study-border">
            <Gauge size={13} className={pacingStatus.tone} />
            <span className="font-mono font-bold text-study-text">{wpm} WPM</span>
            <span className="text-study-text-muted">•</span>
            <span className={pacingStatus.tone}>{pacingStatus.label}</span>
          </div>
        </div>

        {targetOutline && targetOutline.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTeleprompter(!showTeleprompter)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-study-surface border border-study-border text-study-text-muted hover:text-study-text text-[11px] font-medium transition-colors cursor-pointer"
          >
            <FileText size={13} />
            <span>{showTeleprompter ? 'Ẩn máy nhắc chữ' : 'Máy nhắc chữ (Teleprompter)'}</span>
          </button>
        )}
      </div>

      {/* Optional Teleprompter Overlay */}
      {showTeleprompter && targetOutline && (
        <div className="p-3.5 rounded-xl bg-study-primary-soft/40 border border-study-primary-border/60 text-xs space-y-1.5 animate-scale-up">
          <span className="text-[10px] font-bold text-study-primary uppercase tracking-wider block">
            DÀN Ý NHẮC CHỮ TỰ ĐỘNG
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {targetOutline.map((step, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-study-surface border border-study-border text-[11px] text-study-text leading-snug"
              >
                <span className="font-bold text-study-primary mr-1">#{idx + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming Speech-to-Text Container */}
      <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs min-h-[90px] relative overflow-hidden flex flex-col justify-between">
        <div className="text-xs text-study-text leading-relaxed font-sans">
          {transcript ? (
            <span>
              {transcript}
              {interimTranscript && (
                <span className="text-study-text-muted italic ml-1 opacity-80">
                  {interimTranscript}
                </span>
              )}
            </span>
          ) : (
            <span className="text-study-text-muted italic flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-study-primary animate-ping" />
              <span>Hãy bắt đầu nói, lời của bạn sẽ hiển thị trực tiếp tại đây...</span>
            </span>
          )}
        </div>

        <div className="pt-2 mt-2 border-t border-study-border/50 flex items-center justify-between text-[10px] text-study-text-muted">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-study-primary" />
            <span>Nhận diện giọng nói trực tiếp thời gian thực</span>
          </span>
          {isRecording && (
            <span className="text-emerald-500 font-medium animate-pulse">● Live Streaming</span>
          )}
        </div>
      </div>
    </div>
  )
}
