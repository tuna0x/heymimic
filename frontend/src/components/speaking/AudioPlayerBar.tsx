import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface AudioPlayerBarProps {
  audioUrl: string | null
  recordingDurationSeconds: number
  onReRecord?: () => void
}

export function AudioPlayerBar({
  audioUrl,
  recordingDurationSeconds,
  onReRecord,
}: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(recordingDurationSeconds || 1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setDuration(recordingDurationSeconds || 1)
    setCurrentTime(0)
    setIsPlaying(false)
  }, [audioUrl, recordingDurationSeconds])

  const togglePlay = () => {
    if (!audioRef.current && audioUrl) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.ontimeupdate = () => {
        setCurrentTime(Math.round(audio.currentTime))
      }

      audio.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(Math.round(audio.duration))
        }
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(() => {})
        setIsPlaying(true)
      }
    } else {
      // If simulated (no real audio blob)
      setIsPlaying(!isPlaying)
    }
  }

  const rewind5s = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5)
    } else {
      setCurrentTime((prev) => Math.max(0, prev - 5))
    }
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 rounded-2xl bg-study-surface-muted/60 border border-study-border flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-xl bg-study-primary text-white flex items-center justify-center hover:bg-study-primary-hover active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
          aria-label={isPlaying ? 'Tạm dừng' : 'Nghe lại'}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-study-text">
            <Volume2 size={14} className="text-study-primary" />
            <span>Nghe lại bài nói của bạn</span>
          </div>
          <span className="text-[11px] text-study-text-muted font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full sm:flex-1 max-w-xs flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-study-border overflow-hidden relative">
          <div
            className="h-full bg-study-primary rounded-full transition-all duration-150"
            style={{ width: `${Math.min(100, (currentTime / Math.max(1, duration)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={rewind5s}
          className="px-2.5 py-1.5 rounded-lg border border-study-border bg-study-surface hover:bg-study-surface-hover text-[11px] font-medium text-study-text-muted hover:text-study-text flex items-center gap-1 transition-colors cursor-pointer"
          title="Tua lại 5 giây"
        >
          <RotateCcw size={12} />
          <span>-5s</span>
        </button>

        {onReRecord && (
          <button
            type="button"
            onClick={onReRecord}
            className="px-3 py-1.5 rounded-lg border border-study-primary-border/60 bg-study-primary-soft text-study-primary hover:bg-study-primary hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
          >
            Luyện lại lần nữa
          </button>
        )}
      </div>
    </div>
  )
}
