import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock3,
  Flame,
  Headphones,
  Mic2,
  PenTool,
  Play,
  Sparkles,
  Tv,
  Users2,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { weeklyProgress } from '../mocks/progress'
import { speakingTopics } from '../mocks/speaking'
import { ProgressBar, SectionLabel, Streak } from '../components/shared/UI'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'

export function Dashboard() {
  usePageMeta('Hôm nay — Phòng Luyện Tập HeyMimic', 'Phòng học cá nhân hóa hôm nay: từ vựng và bài luyện phản xạ nói 60–90 giây.')

  const navigate = useNavigate()
  const profile = useMimicStore((state) => state.profile)
  const activeStudySession = useMimicStore((state) => state.activeStudySession)
  const startStudySession = useMimicStore((state) => state.startStudySession)
  const getDailyRecommendation = useMimicStore((state) => state.getDailyRecommendation)
  const vocabWords = useMimicStore((state) => state.vocabWords)

  const recommendation = useMemo(() => getDailyRecommendation(), [getDailyRecommendation])
  const targetTopic = useMemo(
    () => speakingTopics.find((t) => t.id === recommendation.targetId) ?? speakingTopics[0],
    [recommendation.targetId]
  )

  const wordsDueCount = vocabWords.filter((w) => w.status === 'reviewing' || w.status === 'new').length

  const todayStr = useMemo(() => {
    const now = new Date()
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(now)
  }, [])

  const totalMinutes = weeklyProgress.reduce((sum, day) => sum + day.minutes, 0)
  const activeDays = weeklyProgress.filter((day) => day.minutes > 0).length

  const handleStartTodaySession = () => {
    const session = startStudySession(['vocab', 'speaking'])
    navigate('/vocab/review')
  }

  const handleResumeSession = () => {
    if (!activeStudySession) return
    if (activeStudySession.currentStep === 'speaking') {
      navigate('/speaking')
    } else {
      navigate('/vocab/review')
    }
  }

  return (
    <div className="space-y-8 text-left">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <SectionLabel>{todayStr}</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight mt-1">
            Chào {profile.name || 'bạn'}<span className="text-study-primary">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1.5 max-w-md leading-relaxed">
            {profile.streakDays > 0
              ? 'Một chút đều đặn hôm nay sẽ tạo nên sự tự tin tự nhiên khi trò chuyện sau này.'
              : 'Chào mừng bạn đến với Mimic. Hãy bắt đầu buổi học đầu tiên để tạo đà tự tin!'}
          </p>
        </div>

        {/* Dynamic Streak Card */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-study-surface border border-study-border shadow-xs">
          <div className="p-2.5 rounded-xl bg-study-accent-soft text-study-accent">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <Streak count={profile.streakDays} compact={false} />
            <span className="block text-[11px] text-study-text-muted mt-0.5">
              {profile.streakDays > 0 ? `Đang duy trì nhịp học đều đặn` : 'Bắt đầu chuỗi học hôm nay'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Focus: Today's Study Session (4 States) */}
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
              onClick={handleResumeSession}
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
                onClick={handleStartTodaySession}
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

      {/* Daily Priority Grid: Vocab & Speaking independent gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vocab Teaser Card */}
        <section className="bg-study-surface border border-study-border hover:border-study-primary-border/70 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-study-text-muted">Kho từ vựng cá nhân</span>
              <span className="w-9 h-9 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center">
                <BookOpen size={18} />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="max-w-xs">
                <h3 className="text-lg font-display font-semibold text-study-text group-hover:text-study-primary transition-colors">
                  Ôn từ vựng đến hạn
                </h3>
                <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed">
                  {wordsDueCount} từ vựng cần gặp lại theo nhịp lặp ngắt quãng để ghi nhớ sâu.
                </p>
              </div>

              {/* Word preview stack */}
              <div className="flex flex-wrap sm:flex-col gap-1.5 sm:w-28 shrink-0">
                {vocabWords.slice(0, 2).map((w) => (
                  <span
                    key={w.id}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-study-surface-muted text-study-text-soft border border-study-border/60 truncate"
                  >
                    {w.word}
                  </span>
                ))}
                {vocabWords.length > 2 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-study-primary-soft text-study-primary border border-study-primary-border/60">
                    +{vocabWords.length - 2} từ khác
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle text-xs text-study-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} /> ~4–6 phút
            </span>
            <Link
              to="/vocab"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-primary text-white font-medium text-xs hover:bg-study-primary-hover transition-colors shadow-xs"
            >
              <span>Vào kho từ</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        {/* Speaking Teaser Card */}
        <section className="bg-study-surface border border-study-border hover:border-study-accent/40 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-study-text-muted">Phòng luyện phản xạ nói</span>
              <span className="w-9 h-9 rounded-xl bg-study-accent-soft text-study-accent flex items-center justify-center">
                <Mic2 size={18} />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-display font-semibold text-study-text group-hover:text-study-accent transition-colors leading-snug">
                  {targetTopic.title}
                </h3>
                <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed max-w-sm">
                  {targetTopic.prompt}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-study-surface-muted border border-study-border text-[11px] font-medium text-study-text-soft shrink-0">
                <Play size={10} fill="currentColor" className="text-study-accent" />
                <span>60–90 giây</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle text-xs text-study-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} /> Nói & xem phản hồi
            </span>
            <Link
              to="/speaking"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-study-text font-semibold text-xs transition-colors"
            >
              <span>Mở bài nói</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      {/* Flagship Features: 1-on-1 Peer Practice & Video Shadowing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-study-accent uppercase tracking-wider block">
              Tâm điểm rèn luyện tương tác
            </span>
            <h3 className="text-lg font-display font-semibold text-study-text mt-0.5">
              Nói trực tiếp 1-kèm-1 & Học phản xạ qua Video
            </h3>
          </div>
          <span className="text-xs text-study-text-muted hidden sm:inline">Phản xạ thực chiến</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 1-on-1 Peer Practice */}
          <Link
            to="/peer-practice"
            className="p-6 rounded-2xl bg-gradient-to-br from-study-surface via-study-surface to-study-accent-soft/30 border border-study-accent/40 hover:border-study-accent shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-study-accent text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Users2 size={22} />
                </div>
                <span className="px-3 py-1 rounded-full bg-study-accent/15 text-study-accent text-[11px] font-bold">
                  KẾT NỐI NGƯỜI DÙNG 1-KÈM-1
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-display font-bold text-study-text group-hover:text-study-accent transition-colors">
                Luyện nói 1-kèm-1 theo chủ đề
              </h4>
              <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed">
                Ghép đôi với bạn học cùng trình độ. Đàm thoại theo kịch bản 4 vòng có gợi ý câu hỏi và đồng hồ luân phiên, không sợ im lặng ngượng ngùng.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-study-border-subtle flex items-center justify-between text-xs text-study-accent font-semibold">
              <span>Tìm bạn học & Vào phòng đàm thoại</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Video Shadowing Studio */}
          <Link
            to="/video-learning"
            className="p-6 rounded-2xl bg-gradient-to-br from-study-surface via-study-surface to-study-primary-soft/30 border border-study-primary-border/70 hover:border-study-primary shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-study-primary text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Tv size={22} />
                </div>
                <span className="px-3 py-1 rounded-full bg-study-primary/15 text-study-primary text-[11px] font-bold">
                  HỌC QUA VIDEO
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-display font-bold text-study-text group-hover:text-study-primary transition-colors">
                Xem video, nghe & nhại âm theo
              </h4>
              <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed">
                Các đoạn trích TED, đàm phán công sở và phỏng vấn. Bấm vào bất kỳ dòng phụ đề nào để tua và thu âm nói theo khẩu hình người bản xứ.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-study-border-subtle flex items-center justify-between text-xs text-study-primary font-semibold">
              <span>Khám phá thư viện video & Shadowing</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4 Pillars Ecosystem Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-study-primary uppercase tracking-wider block">
              Bổ trợ kỹ năng cá nhân
            </span>
            <h3 className="text-lg font-display font-semibold text-study-text mt-0.5">
              Các phòng luyện tập tự học
            </h3>
          </div>
          <span className="text-xs text-study-text-muted hidden sm:inline">Nghe · Viết · Cụm từ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Listening Lab */}
          <Link
            to="/listening"
            className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-study-primary-border/80 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Headphones size={18} />
              </div>
              <h4 className="text-sm font-semibold text-study-text group-hover:text-study-primary transition-colors">
                Luyện nghe & Shadowing
              </h4>
              <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
                Tách câu từng đoạn, chỉnh tốc độ 0.8x–1.2x và nhại âm theo ngữ điệu bản xứ.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-study-primary font-medium">
              <span>Bắt đầu nghe</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* 2. Dialogue Roleplay */}
          <Link
            to="/speaking/dialogue"
            className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-study-accent/50 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Bot size={18} />
              </div>
              <h4 className="text-sm font-semibold text-study-text group-hover:text-study-accent transition-colors">
                Hội thoại AI 2 chiều
              </h4>
              <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
                Đàm phán lùi deadline, phỏng vấn thử thách với phản hồi độ lịch sự và rõ ràng.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-study-accent font-medium">
              <span>Thực hành roleplay</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* 3. Collocations & Chunks */}
          <Link
            to="/vocab"
            className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-emerald-500/50 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles size={18} />
              </div>
              <h4 className="text-sm font-semibold text-study-text group-hover:text-emerald-500 transition-colors">
                Cụm từ & Collocations
              </h4>
              <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
                Thẻ tương phản "Đừng nói X, hãy nói Y" giúp chuyển hóa thói quen dịch từng từ.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-emerald-500 font-medium">
              <span>Học cụm từ</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* 4. Writing & Reflex */}
          <Link
            to="/writing"
            className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-indigo-500/50 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PenTool size={18} />
              </div>
              <h4 className="text-sm font-semibold text-study-text group-hover:text-indigo-500 transition-colors">
                Luyện viết & Phản xạ
              </h4>
              <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
                Chuốt email/Slack chuyên nghiệp và dịch phản xạ Việt - Anh tự nhiên.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-indigo-500 font-medium">
              <span>Luyện viết ngay</span>
              <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>

      {/* Secondary Grid: Weekly Practice Rhythm & Insight */}
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
    </div>
  )
}

