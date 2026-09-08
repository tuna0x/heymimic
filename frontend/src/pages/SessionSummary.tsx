import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Home,
  Mic2,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { ApiErrorNotice } from '../components/shared/ApiErrorNotice'
import { EmptyState } from '../components/shared/EmptyState'
import { usePageMeta } from '../hook/usePageMeta'
import { ROUTES } from '../route/routePaths'
import { describeApiError, type ApiFailure } from '../service/api'
import { progressService, type ProgressOverview } from '../service/progressService'
import { reviewService, type ReviewSessionModel } from '../service/reviewService'
import { speakingService } from '../service/speakingService'
import { studyService } from '../service/studyService'
import type { SpeakingSession, StudySession } from '../type'

interface SummaryData {
  study: StudySession
  review: ReviewSessionModel | null
  speaking: SpeakingSession | null
  overview: ProgressOverview
}

export function SessionSummary() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  usePageMeta(
    'Tổng Kết Buổi Học — HeyMimic',
    'Xem lại kết quả từ vựng và Speaking đã được lưu cho buổi học.'
  )

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setFailure(null)

    studyService
      .get(sessionId, controller.signal)
      .then(async (study) => {
        const [review, speaking, overview] = await Promise.all([
          study.reviewSessionId
            ? reviewService.get(study.reviewSessionId, controller.signal)
            : Promise.resolve(null),
          study.speakingSessionId
            ? speakingService.getSession(study.speakingSessionId, controller.signal)
            : Promise.resolve(null),
          progressService.getOverview(controller.signal),
        ])
        setSummary({ study, review, speaking, overview })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [reloadKey, sessionId])

  if (loading) {
    return (
      <div role="status" className="mx-auto max-w-2xl py-16 text-center text-sm text-study-text-muted">
        Đang tải kết quả buổi học…
      </div>
    )
  }

  if (failure) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <ApiErrorNotice failure={failure} onRetry={() => setReloadKey((value) => value + 1)} />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="max-w-md mx-auto py-16 text-left">
        <EmptyState
          icon={HelpCircle}
          title="Không tìm thấy phiên học"
          description="Phiên học này không tồn tại hoặc bạn không có quyền truy cập."
          actionLabel="Về trang chủ hôm nay"
          onAction={() => navigate(ROUTES.DASHBOARD)}
        />
      </div>
    )
  }

  const { study, review, speaking, overview } = summary
  if (study.status !== 'completed') {
    const actionRoute = study.currentStep === 'speaking' ? ROUTES.SPEAKING : ROUTES.VOCAB_REVIEW
    return (
      <div className="max-w-md mx-auto py-16 text-left">
        <EmptyState
          icon={Clock}
          title="Phiên học chưa hoàn tất"
          description="Hãy hoàn thành bước hiện tại trước khi xem trang tổng kết. Trang này không tự động kết thúc phiên học."
          actionLabel="Tiếp tục phiên học"
          onAction={() => navigate(actionRoute)}
        />
      </div>
    )
  }

  const reviewCount = review?.items.length ?? 0
  const hasReview = study.plannedSteps.includes('vocab')
  const hasSpeaking = study.plannedSteps.includes('speaking')
  const speakingFeedback = speaking?.feedback[0]?.note
  const recommendation = overview.recommendation?.title

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 text-left space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-study-success-soft text-study-success flex items-center justify-center mx-auto shadow-xs border border-study-success/20">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-study-primary-soft/60 border border-study-primary-border/60 text-xs font-semibold text-study-primary">
            <Sparkles size={13} />
            <span>Phiên học hoàn thành</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Bạn đã hoàn thành buổi học!
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted max-w-md mx-auto leading-relaxed">
            Kết quả đã được lưu. Tiến độ có thể cần một khoảng ngắn để projection cập nhật đầy đủ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-study-text-muted text-xs">
            <CheckCircle2 size={15} className="text-study-success" />
            <span>Trạng thái</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-study-text">
            Đã lưu
          </div>
          <p className="text-[11px] text-study-text-muted">
            {study.completedAt
              ? new Intl.DateTimeFormat('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                }).format(new Date(study.completedAt))
              : 'Hoàn thành'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-study-text-muted text-xs">
            <RotateCcw size={15} className="text-study-accent" />
            <span>Từ vựng đã ôn</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-study-text">
            {hasReview ? reviewCount + ' từ' : 'Không có'}
          </div>
          <p className="text-[11px] text-study-text-muted">
            {review?.status === 'completed' ? 'Phiên ôn đã hoàn thành' : 'Không có bước ôn từ'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-study-text-muted text-xs">
            <Mic2 size={15} className="text-study-primary" />
            <span>Luyện nói</span>
          </div>
          {hasSpeaking && speaking ? (
            <>
              <div className="text-xl sm:text-2xl font-bold font-display text-study-primary">
                {speaking.score > 0 ? speaking.score + '/100' : 'Đã đánh giá'}
              </div>
              <p className="text-[11px] text-study-text-muted truncate" title={speaking.title}>
                {speaking.title} · {speaking.duration}
              </p>
            </>
          ) : (
            <>
              <div className="text-base font-semibold text-study-text pt-1">Không có</div>
              <p className="text-[11px] text-study-text-muted">Phiên không có bước Speaking</p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-study-primary">
            <Award size={16} />
            <span>Kết quả đã ghi nhận</span>
          </div>
          <p className="text-xs sm:text-sm text-study-text leading-relaxed">
            {speakingFeedback
              ? speakingFeedback
              : hasSpeaking
                ? 'Transcript và kết quả đánh giá Speaking đã được lưu trong lịch sử bài nói.'
                : 'Phiên ôn từ vựng đã hoàn thành và được gửi sang hệ thống tiến độ.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-study-surface-muted/60 border border-study-border space-y-2">
          <span className="text-xs font-semibold text-study-text flex items-center gap-1.5">
            <Sparkles size={14} className="text-study-accent" />
            <span>Gợi ý cho buổi học tiếp theo</span>
          </span>
          <p className="text-xs sm:text-sm text-study-text-soft leading-relaxed">
            {recommendation ?? 'Quay lại trang chủ để nhận đề xuất mới từ tiến độ học của bạn.'}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          to={ROUTES.DASHBOARD}
          className="w-full py-3.5 px-6 rounded-xl bg-study-accent text-white text-xs sm:text-sm font-semibold hover:bg-study-accent-hover transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home size={16} />
          <span>Về trang chủ hôm nay</span>
          <ArrowRight size={16} />
        </Link>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {hasSpeaking && (
            <Link
              to={speaking ? '/speaking/history/' + speaking.id : ROUTES.SPEAKING_HISTORY}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors flex items-center justify-center gap-1.5"
            >
              <Mic2 size={14} className="text-study-primary" />
              <span>Xem lại bài nói</span>
            </Link>
          )}
          <Link
            to={ROUTES.VOCAB}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} className="text-study-accent" />
            <span>Xem kho từ vựng</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
