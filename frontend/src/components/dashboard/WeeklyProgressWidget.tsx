import { Link } from 'react-router-dom'
import type { ProgressDay } from '../../type'
export function WeeklyProgressWidget({
  progress,
}: {
  progress: ProgressDay[]
}) {
  const total = progress.reduce((sum, day) => sum + day.minutes, 0)
  const active = progress.filter((day) => day.minutes > 0).length
  const max = Math.max(35, ...progress.map((day) => day.minutes))
  const days = progress.length
    ? progress
    : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => ({
        day,
        minutes: 0,
      }))
  return (
    <section
      className="flex h-full flex-col rounded-2xl border border-study-border bg-study-surface p-6"
      aria-labelledby="weekly-rhythm-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="weekly-rhythm-title" className="text-sm font-semibold">
          Nhịp học tuần này
        </h2>
        <Link
          to="/progress"
          className="text-xs font-medium text-study-primary hover:underline"
        >
          Chi tiết
        </Link>
      </div>
      <div className="mt-5">
        <span className="font-display text-4xl font-semibold tabular-nums">
          {total}
        </span>
        <span className="ml-2 text-sm text-study-text-muted">
          phút luyện tập
        </span>
      </div>
      <div
        className="mt-6 grid h-28 grid-cols-7 gap-2"
        role="img"
        aria-label={days
          .map((day) => day.day + ': ' + day.minutes + ' phút')
          .join(', ')}
      >
        {days.map((day) => (
          <div
            key={day.day}
            className="flex h-full flex-col items-center gap-2"
          >
            <div className="flex w-full max-w-6 flex-1 items-end rounded bg-study-surface-muted">
              <div
                className="w-full rounded bg-study-primary"
                style={{
                  height:
                    day.minutes > 0
                      ? Math.max(8, (day.minutes / max) * 100) + '%'
                      : '0%',
                }}
              />
            </div>
            <span className="text-xs text-study-text-muted">{day.day}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-study-border pt-4 text-xs text-study-text-muted">
        {active > 0
          ? active + ' ngày bạn đã dành thời gian cho bản thân.'
          : 'Hoàn thành buổi học đầu tiên để bắt đầu ghi lại nhịp học.'}
      </p>
    </section>
  )
}
