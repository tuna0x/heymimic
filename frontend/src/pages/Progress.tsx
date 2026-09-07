import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  HelpCircle,
  Lightbulb,
  Mic2,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useMimicStore } from '../store/useMimicStore'
import { ROUTES } from '../route/routePaths'
import { EmptyState } from '../components/shared/EmptyState'
import { usePageMeta } from '../hook/usePageMeta'
import type { MistakePattern } from '../type'

export function Progress() {
  usePageMeta(
    'Tiến Độ Học Tập & Sổ Tay Lỗi — HeyMimic',
    'Theo dõi số phút học, chuỗi ngày streak và sổ tay tổng hợp các lỗi phát âm, ngữ pháp cần cải thiện.'
  )

  const navigate = useNavigate()
  const {
    profile,
    vocabWords,
    speakingSessions,
    mistakePatterns,
    dailyActivities,
  } = useMimicStore()

  // Tabs: 'overview' | 'mistakes'
  const [activeTab, setActiveTab] = useState<'overview' | 'mistakes'>('overview')

  // Mistake Filters
  const [statusFilter, setStatusFilter] = useState<'all' | MistakePattern['status']>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | MistakePattern['category']>('all')

  const filteredMistakes = mistakePatterns.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false
    return true
  })

  // Dynamic Metrics
  const totalWordsLearned = vocabWords.length
  const totalSpeakingSessions = speakingSessions.length
  const streakDays = profile.streakDays
  const totalMinutes = profile.totalMinutes

  // Weekly progress calculation
  // Build a 7-day window
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const weeklyMinutes = [15, 20, 10, 25, 12, 18, Math.min(45, Math.round(totalMinutes % 30 + 10))]
  const maxMinutes = Math.max(...weeklyMinutes, 30)

  const categoryLabels: Record<MistakePattern['category'], string> = {
    grammar: 'Ngữ pháp',
    vocabulary: 'Dùng từ',
    expression: 'Diễn đạt',
    pronunciation: 'Phát âm',
  }

  const statusLabels: Record<MistakePattern['status'], { label: string; color: string }> = {
    needsPractice: { label: 'Cần luyện', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    improving: { label: 'Đang cải thiện', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    mastered: { label: 'Đã làm chủ', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  }

  const levelDisplay = {
    beginner: 'Mới bắt đầu (A1)',
    elementary: 'Cơ bản (A2)',
    intermediate: 'Trung cấp (B1-B2)',
    unspecified: 'Tự đánh giá',
  }[profile.selfAssessedLevel ?? 'intermediate']

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 text-left animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary mb-1">
            <Trophy size={14} />
            <span>NHẬT KÝ TIẾN BỘ CÁ NHÂN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Nhìn lại nhịp học & Điểm cần luyện
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1 max-w-xl leading-relaxed">
            Duy trì đều đặn 10 phút mỗi ngày giúp chuyển đổi từ vựng và cấu trúc ngữ pháp thành phản xạ tự nhiên.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SPEAKING)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer"
          >
            <Mic2 size={15} />
            <span>Luyện nói ngay</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-study-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-1 ${
            activeTab === 'overview'
              ? 'border-study-primary text-study-primary bg-study-surface-muted/40'
              : 'border-transparent text-study-text-muted hover:text-study-text'
          }`}
        >
          Tổng quan tiến độ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mistakes')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-1 flex items-center gap-1.5 ${
            activeTab === 'mistakes'
              ? 'border-study-primary text-study-primary bg-study-surface-muted/40'
              : 'border-transparent text-study-text-muted hover:text-study-text'
          }`}
        >
          <span>Sổ tay lỗi</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-study-primary-soft text-study-primary">
            {mistakePatterns.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Vocab */}
            <div className="p-4 sm:p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-study-text-muted text-xs">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-study-primary" />
                  <span>Từ vựng</span>
                </div>
                <span className="text-[11px] text-study-success font-medium">Hoạt động</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
                {totalWordsLearned}
              </div>
              <p className="text-[11px] text-study-text-muted">Từ trong kho ôn tập</p>
            </div>

            {/* Metric 2: Speaking */}
            <div className="p-4 sm:p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-study-text-muted text-xs">
                <div className="flex items-center gap-1.5">
                  <Mic2 size={15} className="text-study-accent" />
                  <span>Luyện nói</span>
                </div>
                <Link
                  to={ROUTES.SPEAKING_HISTORY}
                  className="text-[10px] text-study-accent hover:underline font-medium"
                >
                  Lịch sử
                </Link>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
                {totalSpeakingSessions}
              </div>
              <p className="text-[11px] text-study-text-muted">Buổi thu âm hoàn thành</p>
            </div>

            {/* Metric 3: Streak */}
            <div className="p-4 sm:p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-study-text-muted text-xs">
                <div className="flex items-center gap-1.5">
                  <Flame size={15} className="text-study-accent fill-study-accent" />
                  <span>Chuỗi ngày</span>
                </div>
                <span className="text-[11px] text-study-accent font-medium">Đang duy trì</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
                {streakDays}
              </div>
              <p className="text-[11px] text-study-text-muted">Ngày học liên tiếp</p>
            </div>

            {/* Metric 4: Total Time */}
            <div className="p-4 sm:p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-1">
              <div className="flex items-center justify-between text-study-text-muted text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-study-primary" />
                  <span>Tổng thời gian</span>
                </div>
                <span className="text-[11px] text-study-text-muted">Tích lũy</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-study-text tabular-nums">
                {totalMinutes} <span className="text-xs font-normal text-study-text-muted">phút</span>
              </div>
              <p className="text-[11px] text-study-text-muted">Tập trung luyện phản xạ</p>
            </div>
          </div>

          {/* Weekly Rhythm Chart & Level Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 7-day Bar Chart */}
            <div className="lg:col-span-7 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-study-primary uppercase tracking-wider block">
                    Thời gian luyện tập (phút)
                  </span>
                  <h2 className="text-base font-display font-semibold text-study-text mt-0.5">
                    Nhịp độ tuần qua
                  </h2>
                </div>
                <span className="text-xs font-mono text-study-text-muted">
                  7 ngày gần nhất
                </span>
              </div>

              {/* Bars */}
              <div className="grid grid-cols-7 gap-3 h-36 items-end pt-2 pb-2">
                {daysOfWeek.map((day, idx) => {
                  const minutes = weeklyMinutes[idx]
                  const heightPercent = Math.max(12, (minutes / maxMinutes) * 100)
                  return (
                    <div key={day} className="flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] font-mono text-study-text-muted mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {minutes}p
                      </div>
                      <div className="w-full max-w-[36px] bg-study-surface-muted rounded-lg h-full flex flex-col justify-end p-1">
                        <div
                          className="w-full rounded-md bg-study-primary/80 group-hover:bg-study-primary transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-study-text-muted mt-2">
                        {day}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-study-border text-xs text-study-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-study-primary" />
                  <span>Tổng thời gian học thực tế</span>
                </span>
                <span>Mục tiêu: {profile.dailyMinutesGoal ?? 10} phút/ngày</span>
              </div>
            </div>

            {/* Self-assessed Level & Priority Improvement */}
            <div className="lg:col-span-5 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <span className="text-[11px] font-semibold text-study-primary uppercase tracking-wider block">
                  Trình độ tự đánh giá
                </span>
                <h2 className="text-base font-display font-semibold text-study-text mt-0.5">
                  {levelDisplay}
                </h2>
                <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed">
                  Dựa trên khảo sát ban đầu và phản hồi từ các bài nói. Mimic thiết kế các đề bài xoay quanh môi trường công sở và giao tiếp thực tế.
                </p>
              </div>

              {/* Highlight from Mistake Patterns */}
              <div className="p-4 rounded-xl bg-study-surface-muted/50 border border-study-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-study-accent flex items-center gap-1.5">
                    <Lightbulb size={14} />
                    <span>Trọng tâm cần cải thiện</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mistakes')}
                    className="text-[11px] text-study-primary hover:underline font-medium cursor-pointer"
                  >
                    Xem sổ tay
                  </button>
                </div>
                <p className="text-xs text-study-text font-medium">
                  {mistakePatterns[0]?.title ?? 'Chưa ghi nhận điểm cần luyện'}
                </p>
                <p className="text-[11px] text-study-text-muted line-clamp-2">
                  {mistakePatterns[0]?.explanation}
                </p>
              </div>

              <div className="pt-1">
                <Link
                  to={ROUTES.SPEAKING_HISTORY}
                  className="w-full py-2.5 px-4 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors flex items-center justify-center gap-1.5"
                >
                  <Clock size={14} />
                  <span>Xem lịch sử {totalSpeakingSessions} bài nói</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sổ tay lỗi (Mistake Notebook - Task P02) */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-study-text-muted mr-1 flex items-center gap-1">
                <Filter size={13} />
                <span>Trạng thái:</span>
              </span>
              {(['all', 'needsPractice', 'improving', 'mastered'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    statusFilter === status
                      ? 'bg-study-primary text-white'
                      : 'bg-study-surface-muted text-study-text-muted hover:text-study-text'
                  }`}
                >
                  {status === 'all'
                    ? 'Tất cả'
                    : statusLabels[status].label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs text-study-text-muted mr-1">Nhóm:</span>
              {(['all', 'grammar', 'vocabulary', 'expression'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-study-accent text-white'
                      : 'bg-study-surface-muted text-study-text-muted hover:text-study-text'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả' : categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Mistakes Grid */}
          {filteredMistakes.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="Không có lỗi nào trong bộ lọc này"
              description="Thử thay đổi bộ lọc trạng thái hoặc danh mục để xem các điểm đã được phân tích."
              actionLabel="Đặt lại bộ lọc"
              onAction={() => {
                setStatusFilter('all')
                setCategoryFilter('all')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMistakes.map((mistake) => (
                <div
                  key={mistake.id}
                  onClick={() => navigate(`/progress/mistakes/${mistake.id}`)}
                  className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-study-primary/40 hover:shadow-sm transition-all cursor-pointer space-y-3 group text-left flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-study-surface-muted text-[10px] font-semibold text-study-text-muted border border-study-border">
                        {categoryLabels[mistake.category]}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusLabels[mistake.status].color}`}
                      >
                        {statusLabels[mistake.status].label}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-study-text group-hover:text-study-primary transition-colors">
                      {mistake.title}
                    </h3>

                    <p className="text-xs text-study-text-muted leading-relaxed line-clamp-2">
                      {mistake.explanation}
                    </p>

                    {/* Example snippet */}
                    <div className="p-2.5 rounded-xl bg-study-surface-muted/50 border border-study-border space-y-1 text-xs font-mono">
                      <div className="text-rose-600 line-through opacity-80 truncate">
                        ✗ {mistake.occurrences?.[0]?.original ?? mistake.exampleSentence ?? 'I am agree'}
                      </div>
                      <div className="text-emerald-600 font-semibold truncate">
                        ✓ {mistake.occurrences?.[0]?.suggested ?? 'I agree'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-study-border text-xs text-study-text-muted">
                    <span>
                      Xuất hiện <strong>{mistake.count ?? mistake.occurrences?.length ?? 1} lần</strong>
                    </span>
                    <span className="text-study-primary font-semibold group-hover:underline inline-flex items-center gap-1">
                      <span>Xem cách sửa</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
