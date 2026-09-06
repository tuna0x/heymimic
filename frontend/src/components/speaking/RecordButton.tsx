import { Check, LoaderCircle, Mic2, Square } from 'lucide-react'
import { useEffect } from 'react'
import { useMimicStore } from '../../store/useMimicStore'

export function RecordButton() {
  const state = useMimicStore((store) => store.recorderState)
  const start = useMimicStore((store) => store.startRecording)
  const finish = useMimicStore((store) => store.finishRecording)
  const reset = useMimicStore((store) => store.resetRecording)

  useEffect(() => {
    if (state !== 'recording') return
    const timer = window.setTimeout(finish, 4500)
    return () => window.clearTimeout(timer)
  }, [state, finish])

  useEffect(() => {
    if (state !== 'processing') return
    const timer = window.setTimeout(() => {
      useMimicStore.setState({ recorderState: 'complete' })
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [state])

  const label =
    state === 'ready'
      ? 'Bắt đầu nói'
      : state === 'recording'
      ? 'Đang ghi âm'
      : state === 'processing'
      ? 'AI đang lắng nghe'
      : 'Luyện lại lần nữa'

  const sublabel =
    state === 'ready'
      ? '60–90 giây · không cần chuẩn bị'
      : state === 'recording'
      ? 'Bấm để hoàn tất'
      : state === 'processing'
      ? 'Đang phân tích độ trôi chảy'
      : 'Xem kết quả phân tích bên dưới'

  return (
    <button
      type="button"
      onClick={
        state === 'recording' ? finish : state === 'complete' ? reset : state === 'ready' ? start : undefined
      }
      disabled={state === 'processing'}
      className={`relative my-6 w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-md select-none ${
        state === 'ready'
          ? 'bg-study-primary text-white hover:bg-study-primary-hover hover:scale-105 active:scale-95 shadow-study-primary/20'
          : state === 'recording'
          ? 'bg-study-accent text-white animate-record-ring scale-105 shadow-study-accent/25'
          : state === 'processing'
          ? 'bg-study-surface-muted text-study-text-muted cursor-wait border border-study-border'
          : 'bg-study-success text-white hover:bg-study-success/90 hover:scale-105 shadow-study-success/20'
      }`}
    >
      <div className="flex items-center justify-center">
        {state === 'processing' ? (
          <LoaderCircle className="animate-spin text-study-primary" size={24} />
        ) : state === 'recording' ? (
          <Square size={20} fill="currentColor" />
        ) : state === 'complete' ? (
          <Check size={26} strokeWidth={3} />
        ) : (
          <Mic2 size={26} />
        )}
      </div>

      <span className="font-display font-semibold text-xs text-center tracking-tight px-2">
        {label}
      </span>

      <small className="text-[9px] opacity-80 max-w-[100px] text-center leading-tight">
        {sublabel}
      </small>
    </button>
  )
}
