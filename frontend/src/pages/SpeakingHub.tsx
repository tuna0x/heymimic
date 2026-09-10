import {
  ArrowRight,
  Bot,
  Clock3,
  History,
  Mic2,
  ShieldCheck,
  Sparkles,
  Users2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionLabel, StatusPill } from '../components/shared/UI'
import { usePageMeta } from '../hook/usePageMeta'
import { ROUTES } from '../route/routePaths'
import { useMimicStore } from '../store/useMimicStore'

const categoryTone = [
  'bg-study-accent-soft text-study-accent border-study-accent/20',
  'bg-study-primary-soft text-study-primary border-study-primary-border/60',
  'bg-study-surface-muted text-study-text-muted border-study-border',
]

export function SpeakingHub() {
  usePageMeta(
    'Luyện nói & Kết nối — HeyMimic',
    'Chọn một mục tiêu nói rõ ràng, luyện cùng bạn học hoặc nhận phản hồi riêng cho bạn.'
  )

  const peerTopics = useMimicStore((state) => state.peerTopics)
  const peerSessions = useMimicStore((state) => state.peerSessions)
  const activeStudySession = useMimicStore((state) => state.activeStudySession)
  const featuredTopics = peerTopics.slice(0, 3)
  const latestSession = peerSessions[0]

  return (
    <div className="relative mx-auto max-w-6xl space-y-10 pb-16 text-left animate-fade-in">
      <div className="pointer-events-none absolute -right-24 -top-20 hidden h-72 w-72 rounded-full bg-study-primary-soft/50 blur-3xl lg:block" />

      <header className="relative grid gap-8 border-b border-study-border pb-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <SectionLabel className="uppercase tracking-[0.16em]">
            <Mic2 size={13} className="text-study-primary" />
            <span>Speaking / practice desk</span>
          </SectionLabel>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-[-0.04em] text-study-text sm:text-5xl lg:text-6xl">
            Nói để kết nối<span className="text-study-accent">.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-study-text-muted sm:text-base">
            Mỗi phiên bắt đầu bằng một mục tiêu cụ thể: nói mạch lạc hơn trong công việc,
            bớt ngập ngừng khi gặp người mới, hoặc tìm một bạn học để cùng tiến bộ.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusPill tone="calm">
              <Sparkles size={13} />
              Bài luyện theo mục tiêu
            </StatusPill>
            <span className="text-xs text-study-text-muted">1 mục tiêu · 1 cuộc nói chuyện · 1 điểm tiến bộ</span>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[1.75rem] border border-study-border bg-study-surface p-5 shadow-sm sm:p-6">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] bg-study-accent-soft/60" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel className="uppercase tracking-[0.14em]">Bước tiếp theo</SectionLabel>
              <span className="font-mono text-[10px] text-study-text-muted">01 / 03</span>
            </div>
            <h2 className="mt-5 max-w-xs font-display text-2xl font-semibold leading-tight text-study-text">
              Chọn một cuộc nói chuyện có lý do để bắt đầu.
            </h2>
            <p className="mt-3 text-xs leading-6 text-study-text-muted">
              HeyMimic giữ khung hội thoại ngắn và rõ để bạn tập trung vào lượt nói của mình.
            </p>
            {activeStudySession?.currentStep === 'speaking' && (
              <Link
                to={ROUTES.SPEAKING_SOLO}
                className="mb-3 inline-flex items-center gap-2 rounded-xl bg-study-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-study-primary-hover"
              >
                <Mic2 size={14} />
                Tiếp tục phiên đang dở
                <ArrowRight size={14} />
              </Link>
            )}
            <Link
              to={ROUTES.PEER_PRACTICE}
              className="group mt-6 inline-flex items-center gap-2 text-xs font-semibold text-study-accent transition-colors hover:text-study-accent-hover"
            >
              Mở danh sách chủ đề
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </aside>
      </header>

      <section aria-labelledby="practice-modes-title" className="relative">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <SectionLabel className="uppercase tracking-[0.14em]">Chọn cách luyện</SectionLabel>
            <h2 id="practice-modes-title" className="mt-1 font-display text-2xl font-semibold text-study-text">
              Một phòng luyện, ba cách tiến bộ
            </h2>
          </div>
          <Link
            to={ROUTES.SPEAKING_HISTORY}
            className="hidden items-center gap-1.5 text-xs font-semibold text-study-text-muted transition-colors hover:text-study-text sm:inline-flex"
          >
            <History size={14} />
            Lịch sử của bạn
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr_0.9fr]">
          <Link
            to={ROUTES.PEER_PRACTICE}
            className="group relative min-h-64 overflow-hidden rounded-[1.75rem] bg-study-accent p-6 text-white shadow-sm transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-study-accent focus-visible:ring-offset-2"
          >
            <div className="absolute -bottom-16 -right-10 h-52 w-52 rounded-full border-[22px] border-white/10" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <Users2 size={22} />
                </span>
                <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-12 max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Cùng bạn học</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">Nói cùng một người thật</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">
                  Luân phiên theo vai, có gợi ý đúng lúc và một mục tiêu chung để cuộc trò chuyện không bị trôi.
                </p>
              </div>
            </div>
          </Link>

          <Link
            to={ROUTES.SPEAKING_SOLO}
            className="group flex min-h-64 flex-col justify-between rounded-[1.75rem] border border-study-primary-border/60 bg-study-primary-soft/50 p-6 transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-study-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-study-surface text-study-primary shadow-xs">
                <Mic2 size={21} />
              </span>
              <ArrowRight size={18} className="text-study-primary transition-transform group-hover:translate-x-1" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-study-primary">Tự luyện</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-study-text">Ghi âm 60–90 giây</h3>
              <p className="mt-2 text-sm leading-6 text-study-text-muted">
                Nhận transcript, phân tích và một gợi ý diễn đạt để thử lại ngay.
              </p>
            </div>
          </Link>

          <Link
            to={ROUTES.SPEAKING_DIALOGUE}
            className="group flex min-h-64 flex-col justify-between rounded-[1.75rem] border border-study-border bg-study-surface p-6 transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-study-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-study-surface-muted text-study-text">
                <Bot size={21} />
              </span>
              <ArrowRight size={18} className="text-study-text-muted transition-transform group-hover:translate-x-1" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-study-text-muted">Roleplay AI</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-study-text">Tập phản xạ hai chiều</h3>
              <p className="mt-2 text-sm leading-6 text-study-text-muted">
                Thử một vai trò, trả lời câu hỏi tiếp theo và giữ mạch hội thoại tự nhiên.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section aria-labelledby="scenario-title" className="relative grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <SectionLabel className="uppercase tracking-[0.14em]">Chủ đề có mục tiêu</SectionLabel>
          <h2 id="scenario-title" className="mt-1 max-w-sm font-display text-3xl font-semibold leading-tight text-study-text">
            Những cuộc nói chuyện đáng để chuẩn bị.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-study-text-muted">
            Mỗi chủ đề có bốn vòng: khởi động, lượt nói chính, đổi vai và nhận xét riêng cho nhau.
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-study-border bg-study-surface p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-study-primary" />
            <p className="text-xs leading-5 text-study-text-muted">
              Bạn luôn có thể rời phòng, tắt mic hoặc báo cáo. Quy tắc an toàn được đặt cạnh mỗi phiên.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {featuredTopics.map((topic, index) => (
            <Link
              key={topic.id}
              to={ROUTES.PEER_PRACTICE}
              state={{ topicId: topic.id }}
              className="group grid gap-4 rounded-2xl border border-study-border bg-study-surface p-4 transition-colors hover:border-study-border-focus hover:bg-study-surface-hover/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-study-primary focus-visible:ring-offset-2 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center sm:p-5"
            >
              <span className="font-display text-3xl font-semibold tracking-tight text-study-text/20">0{index + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${categoryTone[index]}`}>
                    {topic.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-study-text-muted">
                    <Clock3 size={12} />
                    {topic.defaultDurationMinutes} phút · {topic.level}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-base font-semibold leading-snug text-study-text sm:text-lg">
                  {topic.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-study-text-muted">{topic.description}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-study-accent sm:justify-self-end">
                Chọn chủ đề
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 border-t border-study-border pt-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <SectionLabel className="uppercase tracking-[0.14em]">Nhịp học của bạn</SectionLabel>
          {latestSession ? (
            <p className="mt-1 text-sm text-study-text-muted">
              Lần gần nhất: <span className="font-semibold text-study-text">{latestSession.topicTitle}</span> cùng {latestSession.partner.name}.
            </p>
          ) : (
            <p className="mt-1 text-sm text-study-text-muted">Chưa có phiên 1–1 nào. Một cuộc nói chuyện ngắn là đủ để bắt đầu.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={ROUTES.SPEAKING_HISTORY}
            className="inline-flex items-center gap-2 rounded-xl border border-study-border bg-study-surface px-3.5 py-2.5 text-xs font-semibold text-study-text-muted transition-colors hover:bg-study-surface-hover hover:text-study-text"
          >
            <History size={14} />
            Xem lịch sử
          </Link>
          <Link
            to={ROUTES.PEER_PRACTICE}
            className="inline-flex items-center gap-2 rounded-xl bg-study-text px-4 py-2.5 text-xs font-semibold text-study-surface transition-colors hover:bg-study-text/90"
          >
            Bắt đầu phiên đầu tiên
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
