import { ArrowUpRight, BookOpen, ChevronRight, Clock3, Flame, Mic2, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { weeklyProgress } from '../mocks/progress'
import { todayPrompt } from '../mocks/speaking'
import { ArrowLink, ProgressBar, SectionLabel, Streak } from '../components/shared/UI'
import { usePageMeta } from '../hook/usePageMeta'

export function Dashboard() {
  usePageMeta('Hôm nay — Phòng Luyện Tập HeyMimic', 'Phòng học cá nhân hóa hôm nay: từ vựng và bài luyện phản xạ nói 60–90 giây.')

  const totalMinutes = weeklyProgress.reduce((sum, day) => sum + day.minutes, 0)
  const activeDays = weeklyProgress.filter((day) => day.minutes > 0).length

  return (
    <div className="space-y-8">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <SectionLabel>THỨ NĂM · TUẦN 36</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight mt-1">
            Chào Tuna<span className="text-study-primary">.</span>
          </h1>
          <p className="text-sm text-study-text-muted mt-1.5 max-w-md leading-relaxed">
            Một chút đều đặn hôm nay sẽ tạo nên sự tự tin tự nhiên khi trò chuyện sau này.
          </p>
        </div>

        {/* Streak Highlight Card */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-study-surface border border-study-border shadow-xs">
          <div className="p-2.5 rounded-xl bg-study-accent-soft text-study-accent">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <Streak compact={false} />
            <span className="block text-[11px] text-study-text-muted mt-0.5">Kỷ lục của bạn: 21 ngày</span>
          </div>
        </div>
      </div>

      {/* Daily Priority Grid: Vocab & Speaking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vocab Teaser Card */}
        <section className="bg-study-surface border border-study-border hover:border-study-primary-border/70 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>VOCAB AGENT · SẴN SÀNG</SectionLabel>
              <span className="w-9 h-9 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center">
                <BookOpen size={18} />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="max-w-xs">
                <h2 className="text-xl font-display font-semibold text-study-text group-hover:text-study-primary transition-colors">
                  Học từ mới hôm nay
                </h2>
                <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed">
                  6 từ vựng cốt lõi được chắt lọc từ những chủ đề bạn đang luyện nói gần đây.
                </p>
              </div>

              {/* Word preview stack */}
              <div className="flex flex-wrap sm:flex-col gap-1.5 sm:w-28 shrink-0">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-study-surface-muted text-study-text-soft border border-study-border/60">
                  resilient
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-study-surface-muted text-study-text-soft border border-study-border/60">
                  nuance
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-study-primary-soft text-study-primary border border-study-primary-border/60">
                  +4 từ khác
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle text-xs text-study-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} /> ~8 phút
            </span>
            <Link
              to="/vocab"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-primary text-white font-medium text-xs hover:bg-study-primary-hover transition-colors shadow-xs"
            >
              <span>Mở bộ từ</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        {/* Speaking Teaser Card */}
        <section className="bg-study-surface border border-study-border hover:border-study-accent/40 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>GỢI Ý HÔM NAY · NÓI TỰ NHIÊN</SectionLabel>
              <span className="w-9 h-9 rounded-xl bg-study-accent-soft text-study-accent flex items-center justify-center">
                <Mic2 size={18} />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-study-text group-hover:text-study-accent transition-colors leading-snug">
                  {todayPrompt.title}
                </h2>
                <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed max-w-sm">
                  {todayPrompt.description}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-study-surface-muted border border-study-border text-[11px] font-medium text-study-text-soft shrink-0">
                <Play size={10} fill="currentColor" className="text-study-accent" />
                <span>Nghe mẫu</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle text-xs text-study-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} /> 60–90 giây
            </span>
            <Link
              to="/speaking"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-accent text-white font-medium text-xs hover:bg-study-accent-hover transition-colors shadow-xs"
            >
              <span>Bắt đầu nói</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      {/* Secondary Grid: Weekly Practice Rhythm & Agent Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Chart */}
        <section className="lg:col-span-2 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <SectionLabel>NHỊP HỌC TRONG TUẦN</SectionLabel>
                <h2 className="text-lg font-display font-semibold text-study-text mt-0.5">
                  Thời lượng duy trì
                </h2>
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
              {weeklyProgress.map((day) => (
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
              <span>{activeDays} / 7 ngày đã luyện tập</span>
            </span>
            <Link to="/progress" className="text-xs font-semibold text-study-primary hover:underline inline-flex items-center gap-1">
              <span>Xem chi tiết</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>

        {/* Progress Agent Insight Note */}
        <section className="bg-study-primary-soft/40 border border-study-primary-border/50 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4 text-study-primary">
              <span className="w-7 h-7 rounded-lg bg-study-primary-soft flex items-center justify-center border border-study-primary-border/60">
                <Sparkles size={15} />
              </span>
              <SectionLabel className="!text-study-primary">PROGRESS AGENT</SectionLabel>
            </div>
            <h3 className="font-display font-medium text-base text-study-text leading-snug">
              “Bạn thường nói trôi chảy và tự tin hơn sau 3 phút khởi động nhẹ.”
            </h3>
            <p className="text-xs text-study-text-muted mt-2.5 leading-relaxed">
              Hôm nay, hãy thử bắt đầu bằng một câu chào hỏi đơn giản trước khi đi sâu vào chi tiết nhé.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-study-primary-border/40">
            <Link
              to="/speaking"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary hover:text-study-primary-hover transition-colors"
            >
              <span>Thử bài tập ngay</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      {/* Up Next / Spaced Repetition Reminder */}
      <div className="bg-study-surface border border-study-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-study-surface-muted text-study-text font-mono font-bold text-sm flex items-center justify-center shrink-0 border border-study-border">
            02
          </span>
          <div>
            <strong className="block text-sm font-semibold text-study-text">
              Ôn lại từ vựng: “hesitate” và “intonation”
            </strong>
            <small className="block text-xs text-study-text-muted mt-0.5">
              2 từ sắp đến chu kỳ lặp lại ngắt quãng (SRS) · mất khoảng 2 phút
            </small>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-28 hidden sm:block">
            <ProgressBar value={42} tone="calm" />
          </div>
          <Link
            to="/vocab"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text transition-colors"
          >
            <span>Ôn ngay</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
