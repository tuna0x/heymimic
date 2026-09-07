import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Gauge,
  Headphones,
  Info,
  Mic,
  MicOff,
  Play,
  Pause,
  Repeat,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useAudioRecorder } from '../hook/useAudioRecorder'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'
import { videoClips } from '../mocks/videos'
import { ROUTES } from '../route/routePaths'
import type { VideoClip, VideoSubtitleSegment } from '../type'

export function VideoShadowingLab() {
  const { videoId } = useParams<{ videoId: string }>()
  const clip: VideoClip = videoClips.find((v) => v.id === videoId) ?? videoClips[0]

  usePageMeta(
    `${clip.title} — Video Shadowing Lab`,
    'Xem video, đồng bộ phụ đề song ngữ và nhại âm theo từng câu với phòng thu âm đối chiếu.'
  )

  const { addVideoAttempt } = useMimicStore()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(clip.subtitles[0]?.id ?? '')
  const [isLoopingSegment, setIsLoopingSegment] = useState<boolean>(false)

  // Voice recording hook
  const {
    isRecording,
    isProcessing,
    isComplete,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder()

  const selectedSegment =
    clip.subtitles.find((s) => s.id === selectedSegmentId) ?? clip.subtitles[0]

  // Track video time and handle A-B segment loop
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const time = videoRef.current.currentTime
    setCurrentTime(time)

    // Find active segment
    const active = clip.subtitles.find(
      (s) => time >= s.startTime && time <= s.endTime
    )
    if (active && active.id !== selectedSegmentId && !isLoopingSegment) {
      setSelectedSegmentId(active.id)
    }

    // Handle segment looping
    if (isLoopingSegment && selectedSegment) {
      if (time >= selectedSegment.endTime) {
        videoRef.current.currentTime = selectedSegment.startTime
        videoRef.current.play()
      }
    }
  }

  const handleTogglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const handleSeekSegment = (segment: VideoSubtitleSegment) => {
    setSelectedSegmentId(segment.id)
    resetRecording()
    if (videoRef.current) {
      videoRef.current.currentTime = segment.startTime
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleToggleLoop = () => {
    const nextLoop = !isLoopingSegment
    setIsLoopingSegment(nextLoop)
    if (nextLoop && videoRef.current && selectedSegment) {
      videoRef.current.currentTime = selectedSegment.startTime
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePlayOriginalSentence = () => {
    if (videoRef.current && selectedSegment) {
      videoRef.current.currentTime = selectedSegment.startTime
      videoRef.current.play()
      setIsPlaying(true)
      setTimeout(() => {
        if (videoRef.current && !isLoopingSegment) {
          videoRef.current.pause()
          setIsPlaying(false)
        }
      }, (selectedSegment.endTime - selectedSegment.startTime) * 1000)
    }
  }

  const handleFinishShadowing = () => {
    addVideoAttempt({
      id: `attempt-${Date.now()}`,
      videoId: clip.id,
      segmentId: selectedSegment.id,
      audioUrl: audioUrl || undefined,
      score: 93,
      feedback: 'Khớp 93% ngữ điệu và nối âm tự nhiên',
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 text-left animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <Link
            to={ROUTES.VIDEO_LEARNING}
            className="inline-flex items-center gap-1.5 text-xs text-study-text-muted hover:text-study-text transition-colors mb-1"
          >
            <ArrowLeft size={13} />
            <span>Quay lại danh sách video</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            {clip.title}
          </h1>
          <p className="text-xs text-study-text-muted mt-1">
            Diễn giả: <strong>{clip.speaker}</strong> ({clip.speakerRole}) • Tốc độ: <strong>{clip.wpm} WPM</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-study-primary-soft text-study-primary border border-study-primary-border/60 text-xs font-semibold">
            {clip.categoryLabel} • {clip.level}
          </span>
        </div>
      </div>

      {/* Main Grid: Video Player (Left) & Synced Subtitles (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Player & Native Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-2xl bg-black overflow-hidden shadow-lg border border-study-border">
            <video
              ref={videoRef}
              src={clip.videoUrl}
              poster={clip.posterUrl}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
              playsInline
            />

            {/* In-Video Active Subtitle Overlay */}
            <div className="absolute bottom-3 left-4 right-4 text-center pointer-events-none">
              <div className="inline-block bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 max-w-xl text-left sm:text-center">
                <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  {selectedSegment?.textEn}
                </p>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  {selectedSegment?.textVi}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Media Control Bar */}
          <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-xl bg-study-primary text-white flex items-center justify-center hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer"
                title={isPlaying ? 'Tạm dừng' : 'Phát video'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleToggleLoop}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isLoopingSegment
                    ? 'bg-study-accent text-white shadow-xs'
                    : 'bg-study-surface-muted text-study-text-muted hover:text-study-text'
                }`}
                title="Lặp lại liên tục câu đang chọn (A-B Loop)"
              >
                <Repeat size={14} />
                <span>{isLoopingSegment ? 'Đang lặp câu' : 'Lặp đoạn'}</span>
              </button>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex items-center gap-1 bg-study-surface-muted p-1 rounded-xl border border-study-border">
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-study-surface text-study-primary shadow-xs font-bold'
                      : 'text-study-text-muted hover:text-study-text'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-study-text-muted">
              {currentTime.toFixed(1)}s / {clip.durationSeconds}s
            </div>
          </div>
        </div>

        {/* Right Column: Synced Subtitle Segments (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-study-primary uppercase tracking-wider block">
              Phụ đề đồng bộ (Bấm để nhảy câu)
            </span>
            <span className="text-[11px] text-study-text-muted">
              {clip.subtitles.length} phân đoạn
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {clip.subtitles.map((seg, idx) => {
              const isSelected = seg.id === selectedSegmentId
              return (
                <div
                  key={seg.id}
                  onClick={() => handleSeekSegment(seg)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-study-primary-soft/50 border-study-primary ring-1 ring-study-primary/30 shadow-xs'
                      : 'bg-study-surface border-study-border hover:bg-study-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="font-mono text-study-text-muted">
                      {seg.startTime.toFixed(1)}s – {seg.endTime.toFixed(1)}s
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-md bg-study-primary text-white font-semibold text-[10px]">
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-study-text leading-snug">
                    {seg.textEn}
                  </p>
                  <p className="text-xs text-study-text-muted mt-1 leading-relaxed">
                    {seg.textVi}
                  </p>

                  {seg.phoneticNotes && (
                    <div className="mt-2 pt-2 border-t border-study-border/50 text-[11px] font-mono text-study-primary/90 flex items-center gap-1.5">
                      <Volume2 size={12} />
                      <span>{seg.phoneticNotes}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* The Shadowing Studio Stage: "Xem - Nghe - Nói Theo" */}
      <div className="p-6 sm:p-7 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-study-border">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-study-accent">
              <Sparkles size={14} />
              <span>PHÒNG THU SHADOWING CHO CÂU ĐANG CHỌN</span>
            </div>
            <h3 className="text-base sm:text-lg font-display font-semibold text-study-text mt-0.5">
              “{selectedSegment?.textEn}”
            </h3>
            <p className="text-xs text-study-text-muted italic mt-0.5">
              ({selectedSegment?.textVi})
            </p>
          </div>

          <button
            type="button"
            onClick={handlePlayOriginalSentence}
            className="px-4 py-2 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Volume2 size={15} className="text-study-primary" />
            <span>Nghe lại câu trong video</span>
          </button>
        </div>

        {/* Recording Controls Area */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-study-surface-muted/30 border border-study-border space-y-4 text-center">
          {!isRecording && !isComplete && (
            <div className="space-y-3">
              <p className="text-xs text-study-text-muted max-w-md">
                Bấm nút bên dưới, lắng nghe và nhại theo đúng nhịp điệu, ngắt nghỉ của câu gốc.
              </p>
              <button
                type="button"
                onClick={startRecording}
                className="px-6 py-3 rounded-2xl bg-study-accent text-white text-xs font-bold hover:bg-study-accent-hover transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <Mic size={16} />
                <span>Bắt đầu thu âm nói theo</span>
              </button>
            </div>
          )}

          {isRecording && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-rose-500 text-xs font-bold animate-pulse">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>ĐANG THU ÂM NÓI THEO... ({recordingTime}s)</span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="px-6 py-3 rounded-2xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <MicOff size={16} />
                <span>Dừng thu âm & So sánh</span>
              </button>
            </div>
          )}

          {isComplete && (
            <div className="w-full space-y-4 animate-scale-up">
              <div className="p-4 rounded-xl bg-study-success-soft/30 border border-study-success/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-study-success text-white flex items-center justify-center font-bold">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-study-text">
                        Độ khớp ngữ điệu: 94%
                      </strong>
                      <span className="px-2 py-0.5 rounded bg-study-success text-white text-[10px] font-bold">
                        RẤT TỰ NHIÊN
                      </span>
                    </div>
                    <p className="text-xs text-study-text-muted mt-0.5">
                      Cao độ và thời gian ngắt nghỉ của bạn rất sát với diễn giả {clip.speaker}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePlayOriginalSentence}
                    className="px-3.5 py-2 rounded-xl bg-study-surface border border-study-border text-xs font-semibold text-study-text hover:bg-study-surface-hover flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 size={14} className="text-study-primary" />
                    <span>Nghe giọng gốc</span>
                  </button>

                  {audioUrl && (
                    <audio src={audioUrl} controls className="h-8 max-w-[160px]" />
                  )}

                  <button
                    type="button"
                    onClick={resetRecording}
                    className="p-2 rounded-xl border border-study-border bg-study-surface text-study-text-muted hover:text-study-text cursor-pointer"
                    title="Thu âm lại câu này"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFinishShadowing}
                  className="px-5 py-2 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 size={14} />
                  <span>Lưu kết quả câu này</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
