import { ArrowDownRight, ArrowUpRight, BookOpen, Check, Flame, Headphones, Mic2, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { commonMistakes, weeklyProgress } from '../mocks/progress'
import { ArrowLink, ProgressBar, SectionLabel } from '../components/shared/UI'

export function Progress() {
  const maxMinutes = Math.max(...weeklyProgress.map((day) => day.minutes))

  return (
    <div className="space-y-8">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <SectionLabel>PROGRESS AGENT · TUẦN 36</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight mt-1">
            Nhìn lại nhịp học<span className="text-study-primary">.</span>
          </h1>
          <p className="text-sm text-study-text-muted mt-1.5 max-w-md leading-relaxed">
            Tiến bộ là một quá trình tích lũy tự nhiên. Dưới đây là những thay đổi qua từng ngày.
          </p>
        </div>
        <Link
          to="/speaking"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs"
        >
          <Mic2 size={15} />
          <span>Luyện nói ngay</span>
        </Link>
      </div>

      {/* Top Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <article className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center font-bold text-xs">
              <BookOpen size={16} />
            </span>
            <span className="inline-flex items-center text-[11px] font-semibold text-study-primary">
              <ArrowUpRight size={13} /> +14
            </span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
              128
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-study-text-muted">
              Từ đã học
            </span>
          </div>
        </article>

        {/* Metric 2 */}
        <article className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
              <Mic2 size={16} />
            </span>
            <span className="inline-flex items-center text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              <ArrowUpRight size={13} /> +5
            </span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
              24
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-study-text-muted">
              Buổi speaking
            </span>
          </div>
        </article>

        {/* Metric 3 */}
        <article className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-study-accent-soft text-study-accent flex items-center justify-center font-bold text-xs">
              <Flame size={16} fill="currentColor" />
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-study-accent">
              <Trophy size={12} /> Kỷ lục 21
            </span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
              12
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-study-text-muted">
              Ngày streak
            </span>
          </div>
        </article>

        {/* Metric 4 */}
        <article className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
              <Headphones size={16} />
            </span>
            <span className="text-[11px] font-medium text-study-text-muted">
              Tuần này
            </span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
              6.4<span className="text-base font-normal ml-0.5 text-study-text-muted">h</span>
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-study-text-muted">
              Thời gian luyện
            </span>
          </div>
        </article>
      </section>

      {/* Main Analysis Layout: Rhythm Chart & CEFR Level Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Chart */}
        <section className="lg:col-span-7 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <SectionLabel>THỜI GIAN LUYỆN TẬP</SectionLabel>
                <h2 className="text-lg font-display font-semibold text-study-text mt-0.5">
                  Nhịp độ tuần qua
                </h2>
              </div>
              <span className="text-xs font-mono text-study-text-muted">
                01 — 07 THÁNG 9
              </span>
            </div>

            <div className="grid grid-cols-7 gap-3 h-36 items-end pt-4 pb-2">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full max-w-[40px] bg-study-surface-muted rounded-lg h-full flex flex-col justify-end p-1">
                    <div
                      className={`w-full rounded-md transition-all duration-300 ${
                        day.minutes === maxMinutes
                          ? 'bg-study-primary'
                          : day.minutes > 0
                          ? 'bg-study-primary/75 group-hover:bg-study-primary'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${day.minutes ? Math.max(14, (day.minutes / 40) * 100) : 4}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-study-text-muted mt-2">
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle mt-4 text-xs text-study-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-study-primary" />
                <span>Speaking</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-study-accent" />
                <span>Vocabulary</span>
              </span>
            </div>
            <strong className="text-study-primary font-medium">
              +22% so với tuần trước
            </strong>
          </div>
        </section>

        {/* Estimated Level Progress */}
        <section className="lg:col-span-5 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <SectionLabel>ƯỚC TÍNH TRÌNH ĐỘ (CEFR)</SectionLabel>
            <h2 className="text-lg font-display font-semibold text-study-text mt-0.5">
              Đang tiến gần mốc B1
            </h2>
            <p className="text-xs text-study-text-muted mt-2 leading-relaxed">
              Khả năng kết nối ý tưởng và dùng từ vựng theo cụm tự nhiên đã tăng rõ rệt. Hãy duy trì nhịp độ này để vượt ngưỡng trôi chảy tiếp theo.
            </p>
          </div>

          {/* CEFR Level Orbit Indicator */}
          <div className="flex items-center justify-center gap-4 py-2">
            <span className="text-xs font-semibold text-study-text-faint">A2</span>
            <div className="w-16 h-16 rounded-full bg-study-primary-soft border-2 border-study-primary flex items-center justify-center font-display font-bold text-xl text-study-primary shadow-xs">
              B1
            </div>
            <span className="text-xs font-semibold text-study-text-faint">B2</span>
          </div>

          <div className="space-y-1.5">
            <ProgressBar value={64} tone="calm" />
            <div className="flex items-center justify-between text-[11px] text-study-text-muted">
              <span>64% chặng đường đến B1 vững</span>
              <span>Dựa trên 24 phiên nói</span>
            </div>
          </div>
        </section>
      </div>

      {/* Common Mistakes / Speech Patterns */}
      <section className="bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <SectionLabel>MẪU DIỄN ĐẠT CỦA BẠN</SectionLabel>
            <h2 className="text-lg font-display font-semibold text-study-text mt-0.5">
              Những điểm ngập ngừng hay lặp lại
            </h2>
            <p className="text-xs text-study-text-muted mt-0.5">
              Speaking Agent theo dõi các mẫu này để bạn điều chỉnh dần mà không cảm thấy áp lực.
            </p>
          </div>
          <ArrowLink>Xem tất cả mẫu</ArrowLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonMistakes.map((mistake, index) => (
            <article
              key={mistake.id}
              className="p-4 rounded-xl bg-study-surface-muted/40 border border-study-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-study-primary">
                  0{index + 1} · {mistake.title}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-study-primary">
                  <ArrowDownRight size={13} /> {mistake.trend}
                </span>
              </div>

              <p className="text-xs text-study-text-muted leading-relaxed">
                {mistake.detail}
              </p>

              <div className="p-2.5 rounded-lg bg-study-surface border border-study-border text-xs text-study-text font-mono">
                {mistake.example}
              </div>

              <div className="text-[11px] text-study-text-muted">
                Xuất hiện <strong>{mistake.count}</strong> lần trong các bài luyện gần đây
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Daily Progress CTA Ribbon */}
      <div className="p-4 rounded-2xl bg-study-primary-soft/60 border border-study-primary-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-study-text">
          <span className="w-6 h-6 rounded-full bg-study-primary text-white flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={3} />
          </span>
          <span>
            Hôm nay bạn đã hoàn thành <strong>2 / 3</strong> mục tiêu ôn luyện.
          </span>
        </div>
        <Link
          to="/speaking"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs"
        >
          <span>Hoàn thành bài luyện nói</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  )
}
