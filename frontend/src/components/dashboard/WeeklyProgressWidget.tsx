import { ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProgressDay } from '../../type'

interface WeeklyProgressWidgetProps {
  progress: ProgressDay[]
}

export function WeeklyProgressWidget({ progress }: WeeklyProgressWidgetProps) {
  const totalMinutes = progress.reduce((sum, day) => sum + day.minutes, 0)
  const activeDays = progress.filter((day) => day.minutes > 0).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Weekly Chart */}
      <section className="lg:col-span-2 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-medium text-study-text-muted">Nhịp học trong tuần</span>
              <h3 className="text-base font-display font-semibold text-study-text mt-0.5">
                Thời lượng duy trì tích cực
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-display text-study-text tabular-nums">
                {totalMinutes}
              </span>
              <span className="text-xs text-study-text-muted ml-1">phút tổng</span>
            </div>
          </div>

          {/* Weekly bar columns */}
          <div className="grid grid-cols-7 gap-3 h-28 items-end pt-2 pb-1">
            {progress.map((day) => (
              <div key={day.day} className="flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[36px] bg-study-surface-muted rounded-lg h-full flex flex-col justify-end p-1">
                  <div
                    className={`w-full rounded-md transition-all duration-300 ${
                      day.minutes > 0
                        ? 'bg-study-primary group-hover:bg-study-primary-hover'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(day.minutes ? 18 : 0, (day.minutes / 35) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-study-text-muted mt-2 group-hover:text-study-text transition-colors">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle mt-4 text-xs text-study-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-study-primary" />
            <span>{activeDays} / 7 ngày có luyện tập</span>
          </span>
          <Link to="/progress" className="text-xs font-semibold text-study-primary hover:underline inline-flex items-center gap-1">
            <span>Xem sổ tay tiến độ</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>

      {/* Progress Insight Note */}
      <section className="bg-study-primary-soft/40 border border-study-primary-border/50 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 text-study-primary">
            <span className="w-7 h-7 rounded-lg bg-study-primary-soft flex items-center justify-center border border-study-primary-border/60">
              <Sparkles size={15} />
            </span>
            <span className="text-xs font-semibold">Gợi ý phản xạ</span>
          </div>
          <h4 className="font-display font-medium text-base text-study-text leading-snug">
            “Nói trôi chảy đến từ việc giảm thời gian dịch từ tiếng Việt sang tiếng Anh trong đầu.”
          </h4>
          <p className="text-xs text-study-text-muted mt-2.5 leading-relaxed">
            Hãy tập dùng ngay các cụm từ nối quen thuộc như <em>“First of all...”, “Mainly focused on...”</em> để giữ nhịp tự nhiên.
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-study-primary-border/40">
          <Link
            to="/speaking"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary hover:text-study-primary-hover transition-colors"
          >
            <span>Vào phòng luyện nói ngay</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
