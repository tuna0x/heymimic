import { useEffect } from 'react'
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
import { useMimicStore } from '../store/useMimicStore'
import { ROUTES } from '../route/routePaths'
import { EmptyState } from '../components/shared/EmptyState'

export function SessionSummary() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const {
    activeStudySession,
    studySessions,
    activeReviewSession,
    speakingSessions,
    completeStudySession,
  } = useMimicStore()

  // Find session by id (active or stored)
  const session =
    activeStudySession?.id === sessionId
      ? activeStudySession
      : studySessions.find((s) => s.id === sessionId)

  // Ensure completion is called once idempotently
  useEffect(() => {
    if (sessionId && session && session.status !== 'completed') {
      completeStudySession(sessionId)
    }
  }, [sessionId, session, completeStudySession])

  if (!session) {
    return (
      <div className="max-w-md mx-auto py-16 text-left">
        <EmptyState
          icon={HelpCircle}
          title="Không tìm thấy phiên học"
          description="Phiên học này có thể đã kết thúc hoặc liên kết không hợp lệ. Bạn có thể quay lại trang chủ để bắt đầu buổi mới."
          actionLabel="Về trang chủ hôm nay"
          onAction={() => navigate(ROUTES.DASHBOARD)}
        />
      </div>
    )
  }

  const isCompleted = session.status === 'completed' || session.status === 'inProgress'

  // Look up review and speaking details associated with this session or latest
  const reviewCount = activeReviewSession?.reviews.length || 4
  const rememberedCount =
    activeReviewSession?.reviews.filter((r) => r.rating === 'remembered').length || 4

  const hasSpeaking = session.plannedSteps.includes('speaking')
  const latestSpeaking = speakingSessions[0]

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 text-left space-y-8 animate-fade-in">
      {/* Top Banner & Celebration */}
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
            {isCompleted ? 'Bạn đã hoàn thành buổi học!' : 'Buổi học đã kết thúc'}
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted max-w-md mx-auto leading-relaxed">
            Kết quả học tập đã được lưu vào tiến độ cá nhân. Bạn đã duy trì thói quen luyện tập hôm nay!
          </p>
        </div>
      </div>

      {/* Recap Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Time Spent */}
        <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-study-text-muted text-xs">
            <Clock size={15} className="text-study-primary" />
            <span>Thời gian học</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-study-text">
            ~8 phút
          </div>
          <p className="text-[11px] text-study-text-muted">Đạt chỉ tiêu ngày</p>
        </div>

        {/* Vocab Words */}
        <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-study-text-muted text-xs">
            <RotateCcw size={15} className="text-study-accent" />
            <span>Từ vựng đã ôn</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-study-text">
            {reviewCount} từ
          </div>
          <p className="text-[11px] text-study-success font-medium">
            {rememberedCount}/{reviewCount} từ nhớ tốt
          </p>
        </div>

        {/* Speaking Topic & Score */}
        <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-study-text-muted text-xs">
            <Mic2 size={15} className="text-study-primary" />
            <span>Luyện nói</span>
          </div>
          {hasSpeaking && latestSpeaking ? (
            <>
              <div className="text-xl sm:text-2xl font-bold font-display text-study-primary">
                {latestSpeaking.score > 0 ? `${latestSpeaking.score}/100` : 'Đã ghi âm'}
              </div>
              <p className="text-[11px] text-study-text-muted truncate" title={latestSpeaking.title}>
                {latestSpeaking.title}
              </p>
            </>
          ) : (
            <>
              <div className="text-base font-semibold text-study-text pt-1">
                Chỉ ôn từ vựng
              </div>
              <p className="text-[11px] text-study-text-muted">Chưa thu âm bài nói</p>
            </>
          )}
        </div>
      </div>

      {/* Highlights & Suggestions Box */}
      <div className="space-y-4">
        {/* Acknowledged Highlight */}
        <div className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-study-primary">
            <Award size={16} />
            <span>Điểm đáng ghi nhận hôm nay</span>
          </div>
          <p className="text-xs sm:text-sm text-study-text leading-relaxed">
            {hasSpeaking
              ? 'Ngữ điệu tự nhiên và tốc độ nói vừa phải (112 WPM). Bạn đã lồng ghép thành công từ vựng mới vào câu trả lời.'
              : 'Bạn đã hoàn thành phiên ôn tập tập trung với độ chính xác cao. Tất cả các từ đều được phân loại đúng trạng thái.'}
          </p>
        </div>

        {/* Actionable Next Step with Demo Badge */}
        <div className="p-5 rounded-2xl bg-study-surface-muted/60 border border-study-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-study-text flex items-center gap-1.5">
              <Sparkles size={14} className="text-study-accent" />
              <span>Gợi ý cho buổi học tiếp theo</span>
            </span>
            <span className="text-[10px] font-medium text-study-text-muted bg-study-surface px-2 py-0.5 rounded-md border border-study-border">
              Minh họa
            </span>
          </div>
          <p className="text-xs sm:text-sm text-study-text-soft leading-relaxed">
            {hasSpeaking
              ? 'Hãy chú ý sử dụng thì Quá khứ đơn (thay vì Hiện tại hoàn thành) khi đề cập đến mốc thời gian xác định như “last sprint” hay “yesterday”.'
              : 'Hãy thử dùng tính năng Luyện nói ngay sau khi ôn từ để chuyển từ vựng thụ động thành từ vựng chủ động trong giao tiếp.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
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
              to={ROUTES.SPEAKING_HISTORY}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors flex items-center justify-center gap-1.5"
            >
              <Mic2 size={14} className="text-study-primary" />
              <span>Xem lịch sử bài nói</span>
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
