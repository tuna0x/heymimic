import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  Mic2,
  Play,
  RotateCcw,
} from 'lucide-react'
import { ROUTES } from '../route/routePaths'
import { EmptyState } from '../components/shared/EmptyState'
import { ApiErrorNotice } from '../components/shared/ApiErrorNotice'
import { FeedbackCard } from '../components/speaking/FeedbackCard'
import { usePageMeta } from '../hook/usePageMeta'
import { describeApiError, type ApiFailure } from '../service/api'
import { speakingService } from '../service/speakingService'
import type { SpeakingSession } from '../type'

export function SpeakingSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<SpeakingSession | null>(null)
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [playbackFailure, setPlaybackFailure] = useState<ApiFailure | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setFailure(null)
    speakingService
      .getSession(sessionId, controller.signal)
      .then(setSession)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [reloadKey, sessionId])

  usePageMeta(
    session ? `Bài nói: ${session.title} — HeyMimic` : 'Chi Tiết Bài Nói — HeyMimic',
    'Xem lại bản ghi âm và phản hồi chi tiết của buổi luyện nói.'
  )

  if (loading) {
    return (
      <div role="status" className="mx-auto max-w-4xl py-16 text-center text-sm text-study-text-muted">
        Đang tải bài nói…
      </div>
    )
  }

  if (failure) {
    return (
      <div className="mx-auto max-w-4xl py-10">
        <ApiErrorNotice failure={failure} onRetry={() => setReloadKey((value) => value + 1)} />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto py-16 text-left">
        <EmptyState
          icon={HelpCircle}
          title="Không tìm thấy bài nói"
          description="Không tìm thấy thông tin của buổi luyện nói này. Phiên có thể đã bị xóa hoặc đường dẫn chưa chính xác."
          actionLabel="Về danh sách lịch sử"
          onAction={() => navigate(ROUTES.SPEAKING_HISTORY)}
        />
      </div>
    )
  }

  const attempts = session.attempts && session.attempts.length > 0 ? session.attempts : []
  const hasMultipleAttempts = attempts.length > 1
  const activeAttempt = attempts[selectedAttemptIndex]

  const handleLoadAudio = async () => {
    if (!activeAttempt) return
    setPlaybackFailure(null)
    try {
      const playback = await speakingService.getPlayback(activeAttempt.id)
      if (!playback.playbackUrl) throw new Error('Audio playback URL is unavailable')
      setAudioUrl(playback.playbackUrl)
    } catch (error) {
      setPlaybackFailure(describeApiError(error))
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-left animate-fade-in">
      {/* Back Button */}
      <div>
        <Link
          to={ROUTES.SPEAKING_HISTORY}
          className="inline-flex items-center gap-1.5 text-xs text-study-text-muted hover:text-study-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại lịch sử bài nói</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-study-surface-muted text-xs font-mono text-study-text-muted border border-study-border">
              {session.date}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-study-primary-soft/60 text-xs font-semibold text-study-primary border border-study-primary-border/60">
              Đã hoàn thành
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.SPEAKING)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Luyện lại chủ đề này</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            {session.title}
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-2 leading-relaxed bg-study-surface-muted/50 p-4 rounded-xl border border-study-border/50">
            <strong className="text-study-text">Đề bài: </strong>
            {session.prompt}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-study-surface-muted/40 border border-study-border">
            <span className="text-[11px] text-study-text-muted block">Thời lượng</span>
            <span className="text-sm font-bold font-mono text-study-text">{session.duration}</span>
          </div>
          <div className="p-3 rounded-xl bg-study-surface-muted/40 border border-study-border">
            <span className="text-[11px] text-study-text-muted block">Điểm đánh giá</span>
            <span className="text-sm font-bold font-display text-study-primary">
              {session.score > 0 ? `${session.score}/100` : 'Đã nộp'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-study-surface-muted/40 border border-study-border">
            <span className="text-[11px] text-study-text-muted block">Số lần thu âm</span>
            <span className="text-sm font-bold text-study-text">
              {attempts.length} lượt
            </span>
          </div>
          <div className="p-3 rounded-xl bg-study-surface-muted/40 border border-study-border">
            <span className="text-[11px] text-study-text-muted block">Trạng thái âm thanh</span>
            <span className="text-xs font-semibold text-study-accent">Trong phiên</span>
          </div>
        </div>
      </div>

      {playbackFailure && <ApiErrorNotice failure={playbackFailure} onRetry={() => void handleLoadAudio()} />}

      {/* Audio Status Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block">Quyền riêng tư & lưu trữ âm thanh</span>
          <p className="leading-relaxed opacity-90">
            Đường phát bản ghi chỉ có hiệu lực ngắn và không được cache. Transcript cùng phản hồi vẫn
            được giữ sau khi audio hết hạn.
          </p>
          {activeAttempt && !audioUrl && (
            <button
              type="button"
              onClick={() => void handleLoadAudio()}
              className="mt-2 inline-flex items-center gap-1.5 font-semibold underline"
            >
              <Play size={13} />
              Tải bản ghi để phát
            </button>
          )}
          {audioUrl && <audio className="mt-3 w-full" controls src={audioUrl} />}
        </div>
      </div>

      {/* Multiple Attempts Switcher if available */}
      {hasMultipleAttempts && (
        <div className="p-4 rounded-2xl bg-study-surface border border-study-border space-y-2">
          <span className="text-xs font-semibold text-study-text block">
            Các lần thu âm trong buổi này ({attempts.length} lần)
          </span>
          <div className="flex flex-wrap gap-2">
            {attempts.map((att, idx) => (
              <button
                key={att.id}
                type="button"
                onClick={() => {
                  setSelectedAttemptIndex(idx)
                  setAudioUrl(null)
                  setPlaybackFailure(null)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedAttemptIndex === idx
                    ? 'bg-study-primary text-white'
                    : 'bg-study-surface-muted text-study-text hover:bg-study-surface-hover'
                }`}
              >
                Lần {att.attemptNumber}
                {att.durationSeconds ? ` (${att.durationSeconds}s)` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Card */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-study-primary uppercase tracking-wider flex items-center gap-1.5">
            <Mic2 size={14} />
            <span>Transcript bài nói</span>
          </span>
          <span className="text-[10px] font-medium text-study-text-muted bg-study-surface-muted px-2 py-0.5 rounded border border-study-border">
            {session.feedback.length > 0 ? 'Đã phân tích' : 'Chưa có phản hồi'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-study-text leading-relaxed font-mono bg-study-surface-muted/30 p-4 rounded-xl border border-study-border/50">
          “{session.transcript || 'Không có transcript được lưu trữ cho phiên này.'}”
        </p>
      </div>

      {/* Detailed Feedback & Improvements */}
      {session.feedback && session.feedback.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-study-text">
                Nhận xét & Điểm cần cải thiện
              </h2>
              <p className="text-xs text-study-text-muted mt-0.5">
                Các điểm ngữ pháp và dùng từ được ghi nhận từ buổi học này.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.feedback.map((item) => (
              <FeedbackCard feedback={item} key={item.id} />
            ))}
          </div>
        </div>
      )}

      {/* Re-practice CTA Footer */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-display font-semibold text-study-text">
            Muốn nâng cao điểm số cho chủ đề này?
          </h3>
          <p className="text-xs text-study-text-muted mt-0.5">
            Thử luyện lại bài nói, chú ý vào các cụm từ nối và ngữ điệu tự nhiên.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.SPEAKING)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <RotateCcw size={15} />
          <span>Bắt đầu luyện lại ngay</span>
        </button>
      </div>
    </div>
  )
}
