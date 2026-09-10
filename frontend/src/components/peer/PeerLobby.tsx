import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, LockKeyhole, Mic2, ShieldCheck, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionLabel, StatusPill } from '../shared/UI'
import { ROUTES } from '../../route/routePaths'
import type { PeerPartner, PeerTopic } from '../../type'

interface PeerLobbyProps {
  topic: PeerTopic
  partner: PeerPartner
  onStart: () => void
}

type MicState = 'idle' | 'checking' | 'ready' | 'denied'

function partnerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function PeerLobby({ topic, partner, onStart }: PeerLobbyProps) {
  const [micState, setMicState] = useState<MicState>('idle')

  const checkMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState('denied')
      return
    }
    setMicState('checking')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setMicState('ready')
    } catch {
      setMicState('denied')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 text-left animate-fade-in">
      <div className="flex flex-col gap-4 border-b border-study-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to={ROUTES.PEER_PRACTICE}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-study-text-muted transition-colors hover:text-study-text"
          >
            <ArrowLeft size={14} />
            Về danh sách phiên
          </Link>
          <SectionLabel className="uppercase tracking-[0.16em]">
            <Users2 size={13} className="text-study-accent" />
            <span>Lobby · chuẩn bị trước khi nói</span>
          </SectionLabel>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-[-0.03em] text-study-text sm:text-4xl">
            Cùng thống nhất cách bắt đầu<span className="text-study-accent">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-study-text-muted">
            Xem mục tiêu chung, kiểm tra thiết bị và vào phòng khi bạn đã sẵn sàng. Vai riêng sẽ mở sau bước này.
          </p>
        </div>
        <StatusPill tone="calm">Chờ bắt đầu</StatusPill>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[1.75rem] border border-study-border bg-study-surface shadow-sm">
          <div className="border-b border-study-border bg-study-surface-muted/60 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-study-accent">Mục tiêu chung</span>
                <h2 className="mt-2 max-w-xl font-display text-2xl font-semibold leading-tight text-study-text">{topic.title}</h2>
              </div>
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-study-accent-soft text-study-accent sm:flex">
                <Users2 size={21} />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-study-text-muted">{topic.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-study-text-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-study-border bg-study-surface px-2.5 py-1"><Clock3 size={12} />{topic.defaultDurationMinutes} phút</span>
              <span className="rounded-full border border-study-border bg-study-surface px-2.5 py-1">{topic.level}</span>
              <span className="rounded-full border border-study-border bg-study-surface px-2.5 py-1">{topic.rounds.length} vòng</span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-base font-semibold text-study-text">Nhịp của phiên</h3>
              <span className="text-[11px] text-study-text-muted">Không cần chuẩn bị trước</span>
            </div>
            <ol className="mt-4 space-y-3">
              {topic.rounds.map((round) => (
                <li key={round.roundNumber} className="flex items-start gap-3 rounded-xl border border-study-border/70 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-study-primary-soft font-mono text-xs font-bold text-study-primary">{round.roundNumber}</span>
                  <div className="min-w-0">
                    <strong className="block text-sm font-semibold text-study-text">{round.title}</strong>
                    <span className="mt-0.5 block text-xs text-study-text-muted">{Math.round(round.durationSeconds / 60)} phút · đổi vai khi có tín hiệu</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-study-accent/25 bg-study-accent-soft/35 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              {partner.avatar ? (
                <img src={partner.avatar} alt="" className="h-12 w-12 rounded-2xl object-cover" />
              ) : (
                <div aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-study-primary-soft font-display text-sm font-bold text-study-primary">
                  {partnerInitials(partner.name)}
                </div>
              )}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-study-accent">Bạn học trong phiên</span>
                <h2 className="mt-1 font-display text-lg font-semibold text-study-text">{partner.name}</h2>
                <p className="text-xs text-study-text-muted">{partner.city ? `${partner.targetLevel} · ${partner.city}` : partner.targetLevel}</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-study-text-muted">“{partner.goal}”</p>
          </div>

          <div className="rounded-[1.75rem] border border-study-border bg-study-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-study-primary">
              <Mic2 size={17} />
              <h2 className="text-sm font-semibold text-study-text">Kiểm tra trước khi vào phòng</h2>
            </div>
            <div className="mt-4 space-y-3 text-xs text-study-text-muted">
              <button type="button" onClick={checkMicrophone} disabled={micState === 'checking'} className="flex w-full items-start gap-3 text-left transition-colors hover:text-study-text disabled:cursor-wait">
                <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${micState === 'ready' ? 'text-study-success' : 'text-study-text-muted'}`} />
                <span>Kiểm tra micro trước khi vào phòng.</span>
              </button>
              {micState === 'checking' && <p role="status" aria-live="polite" className="ml-7 text-[11px] text-study-primary">Đang kiểm tra quyền truy cập micro…</p>}
              {micState === 'ready' && <p role="status" aria-live="polite" className="ml-7 text-[11px] text-study-success">Micro đã sẵn sàng trên thiết bị này.</p>}
              {micState === 'denied' && <p role="alert" className="ml-7 text-[11px] text-rose-600">Không thể truy cập micro. Hãy cấp quyền rồi thử lại.</p>}
              <div className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-study-success" /><span>Chọn một nơi yên tĩnh để nghe rõ lượt nói của bạn học.</span></div>
              <div className="flex items-start gap-3"><LockKeyhole size={16} className="mt-0.5 shrink-0 text-study-primary" /><span>Vai riêng không xuất hiện trong link mời.</span></div>
            </div>
            <button
              type="button"
              onClick={onStart}
              disabled={micState !== 'ready'}
              aria-disabled={micState !== 'ready'}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-study-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-study-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-study-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Mic2 size={16} />
              Vào phòng luyện nói
            </button>
            <div className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-study-text-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-study-primary" />
              <span>Rời phòng bất cứ lúc nào nếu bạn không thấy thoải mái.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
