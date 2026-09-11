import { BookOpen, CheckCircle2, Clock3, Mic2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type {
  DailyRecommendation,
  LearnerProfile,
  SpeakingTopic,
  StudySession,
} from '../../type'
interface TodaySessionFocusProps {
  activeStudySession: StudySession | null
  targetTopic?: SpeakingTopic
  recommendation: DailyRecommendation
  profile: LearnerProfile
  onStartTodaySession: () => void
  onResumeSession: () => void
}
export function TodaySessionFocus({
  activeStudySession,
  targetTopic,
  recommendation,
  onStartTodaySession,
  onResumeSession,
}: TodaySessionFocusProps) {
  const complete = activeStudySession?.status === 'completed'
  const inProgress = activeStudySession?.status === 'inProgress'
  return (
    <section
      className="session-focus flex h-full flex-col justify-between gap-8 rounded-2xl p-6 sm:p-8"
      aria-labelledby="today-session-title"
    >
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-study-primary">
          <span className="flex items-center gap-2 font-semibold">
            {complete ? <CheckCircle2 size={18} /> : <BookOpen size={18} />}
            {complete
              ? 'Đã hoàn thành hôm nay'
              : inProgress
                ? 'Buổi học đang tiếp tục'
                : 'Buổi học dành cho bạn'}
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <Clock3 size={14} />
            {recommendation.estimatedMinutes} phút
          </span>
        </div>
        <h2
          id="today-session-title"
          className="max-w-xl font-display text-2xl font-bold leading-snug sm:text-3xl"
        >
          {complete
            ? 'Thêm một ngày tiến bộ.'
            : inProgress
              ? (targetTopic?.title ?? 'Tiếp tục từ nơi bạn dừng lại.')
              : recommendation.title}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-study-text-soft">
          {complete
            ? 'Buổi học đã được lưu. Xem lại những điều bạn vừa luyện và mang chúng vào cuộc trò chuyện tiếp theo.'
            : inProgress
              ? 'Hoàn thành phần còn lại để lưu nhận xét và giữ nhịp học hôm nay.'
              : recommendation.reason}
        </p>
      </div>
      {!complete && (
        <ol className="session-plan flex flex-wrap gap-x-6 gap-y-3 text-sm text-study-text-soft">
          <li>Ôn từ vựng</li>
          <li>Luyện nói</li>
          <li>Xem phản hồi</li>
        </ol>
      )}
      <div className="flex flex-wrap items-center gap-4">
        {complete ? (
          <Link
            to={'/session/' + activeStudySession.id + '/summary'}
            className="inline-flex min-h-12 items-center rounded-xl bg-study-accent px-5 text-sm font-semibold text-white hover:bg-study-accent-hover"
          >
            Xem tổng kết buổi học
          </Link>
        ) : (
          <button
            type="button"
            onClick={inProgress ? onResumeSession : onStartTodaySession}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-study-accent px-5 text-sm font-semibold text-white hover:bg-study-accent-hover"
          >
            <Play size={16} />
            {inProgress ? 'Tiếp tục buổi học' : 'Bắt đầu buổi học'}
          </button>
        )}
        <Link
          to={complete ? '/speaking' : '/vocab'}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-study-text-soft hover:text-study-primary"
        >
          {complete && <Mic2 size={16} />}
          {complete ? 'Luyện thêm chủ đề khác' : 'Khám phá kho từ'}
        </Link>
      </div>
    </section>
  )
}
