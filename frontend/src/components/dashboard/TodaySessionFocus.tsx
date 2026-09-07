import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DailyRecommendation, LearnerProfile, SpeakingTopic, StudySession } from '../../type'

interface TodaySessionFocusProps {
  activeStudySession: StudySession | null
  targetTopic: SpeakingTopic
  recommendation: DailyRecommendation
  profile: LearnerProfile
  onStartTodaySession: () => void
  onResumeSession: () => void
}

export function TodaySessionFocus({
  activeStudySession,
  targetTopic,
  recommendation,
  profile,
  onStartTodaySession,
  onResumeSession,
}: TodaySessionFocusProps) {
  return (
    <section className="bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs">
      {activeStudySession?.status === 'completed' ? (
        /* State 4: Completed today */
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-study-success">
            <CheckCircle2 size={24} />
            <h2 className="text-lg font-display font-semibold text-study-text">
              Bạn đã hoàn thành phiên học hôm nay!
            </h2>
          </div>
          <p className="text-xs text-study-text-muted leading-relaxed max-w-xl">
            Tuyệt vời! Bạn đã hoàn thành các bước học theo kế hoạch hôm nay. Bạn có thể xem lại tổng kết, hoặc tiếp tục luyện nói thêm một chủ đề tự do nếu muốn.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to={`/session/${activeStudySession.id}/summary`}
              className="px-4 py-2 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text transition-colors"
            >
              Xem lại tổng kết buổi học
            </Link>
            <Link
              to="/speaking"
              className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs"
            >
              Luyện thêm chủ đề khác
            </Link>
          </div>
        </div>
      ) : activeStudySession?.status === 'inProgress' ? (
        /* State 3: In progress */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-study-accent animate-pulse" />
              <span className="text-xs font-semibold text-study-accent">Đang có buổi học dở dang</span>
            </div>
            <span className="text-xs text-study-text-muted">
              Bước hiện tại: {activeStudySession.currentStep === 'speaking' ? 'Luyện nói' : 'Ôn từ vựng'}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-study-text">
              {targetTopic.title}
            </h2>
            <p className="text-xs text-study-text-muted mt-1">
              Tiếp tục hoàn thành buổi học để lưu nhận xét và duy trì chuỗi streak hôm nay.
            </p>
          </div>

          <button
            type="button"
            onClick={onResumeSession}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer"
          >
            <span>Tiếp tục bài học dở</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        /* State 1 & 2: New learner or Not started today */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-study-primary">
              Gợi ý buổi học hôm nay · Khoảng {recommendation.estimatedMinutes} phút
            </span>
            <span className="text-[11px] text-study-text-muted">
              Dành cho mục tiêu: {profile.goal === 'interview' ? 'Phỏng vấn' : 'Công sở'}
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-study-text">
              {recommendation.title}
            </h2>
            <p className="text-xs text-study-text-muted leading-relaxed max-w-xl">
              {recommendation.reason}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartTodaySession}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-all shadow-xs cursor-pointer"
            >
              <span>Bắt đầu buổi học hôm nay</span>
              <ArrowRight size={14} />
            </button>
            <Link
              to="/vocab"
              className="px-4 py-2.5 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-xs font-medium text-study-text transition-colors"
            >
              Xem chi tiết kho từ
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
