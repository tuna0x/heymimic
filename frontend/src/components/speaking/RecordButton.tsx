import { Check, LoaderCircle, Mic, Square } from 'lucide-react'

interface RecordButtonProps {
  isRecording: boolean
  isProcessing: boolean
  isComplete: boolean
  recordingTime: number
  onStart: () => void
  onStop: () => void
  onReset: () => void
  usingRealMic?: boolean
}

export function RecordButton({
  isRecording,
  isProcessing,
  isComplete,
  recordingTime,
  onStart,
  onStop,
  onReset,
  usingRealMic = false,
}: RecordButtonProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Color-coded pacing zone
  // < 60s: early stage
  // 60-90s: optimal green zone
  // > 90s: warning amber zone
  const isOptimal = recordingTime >= 60 && recordingTime <= 90
  const isOvertime = recordingTime > 90

  const handleClick = () => {
    if (isRecording) {
      onStop()
    } else if (isComplete) {
      onReset()
    } else if (!isProcessing) {
      onStart()
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 my-4 select-none">
      {/* Timer Display */}
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-lg sm:text-xl font-bold px-3 py-1 rounded-xl border transition-all ${
            isRecording
              ? isOptimal
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ring-2 ring-emerald-500/20 animate-pulse'
                : isOvertime
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-study-primary-soft text-study-primary border-study-primary-border/60'
              : 'bg-study-surface-muted text-study-text-muted border-study-border'
          }`}
        >
          {formatTime(recordingTime)}
        </span>

        {isRecording && (
          <span className="text-[11px] font-semibold text-study-text-muted">
            {isOptimal ? '🎯 Vùng thời gian tối ưu' : isOvertime ? 'Đã đủ ý, bấm dừng' : 'Mục tiêu: 60–90s'}
          </span>
        )}
      </div>

      {/* Main Record Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={
          isRecording
            ? 'Dừng ghi âm'
            : isComplete
            ? 'Luyện lại lần nữa'
            : isProcessing
            ? 'AI đang phân tích'
            : 'Bắt đầu nói'
        }
        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
          isProcessing
            ? 'bg-study-surface-muted text-study-text-muted cursor-wait border border-study-border shadow-none'
            : isRecording
            ? 'bg-rose-500 hover:bg-rose-600 text-white scale-105 shadow-rose-500/30 animate-record-ring'
            : isComplete
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25'
            : 'bg-study-primary hover:bg-study-primary-hover text-white hover:scale-105 shadow-study-primary/30'
        }`}
      >
        <div className="flex items-center justify-center">
          {isProcessing ? (
            <LoaderCircle className="animate-spin text-study-primary" size={28} />
          ) : isRecording ? (
            <Square size={22} fill="currentColor" />
          ) : isComplete ? (
            <Check size={28} strokeWidth={3} />
          ) : (
            <Mic size={30} />
          )}
        </div>

        <span className="font-display font-semibold text-xs tracking-tight text-center px-2">
          {isProcessing
            ? 'AI đang nghe...'
            : isRecording
            ? 'Bấm để dừng'
            : isComplete
            ? 'Nói lại lần nữa'
            : 'Bắt đầu nói'}
        </span>
      </button>

      {/* Status note */}
      <div className="flex items-center gap-2 text-[11px] text-study-text-muted">
        <span
          className={`w-2 h-2 rounded-full ${
            isRecording
              ? 'bg-rose-500 animate-ping'
              : usingRealMic
              ? 'bg-emerald-500'
              : 'bg-study-primary'
          }`}
        />
        <span>
          {isRecording
            ? usingRealMic
              ? 'Đang thu âm qua micro của bạn'
              : 'Đang thu âm mô phỏng'
            : isComplete
            ? 'Đã hoàn thành! Xem phân tích bên dưới'
            : 'Không gian riêng tư 100% · Không chấm điểm áp lực'}
        </span>
      </div>
    </div>
  )
}
