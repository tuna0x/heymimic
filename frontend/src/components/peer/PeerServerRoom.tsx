import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, CheckCircle2, Clock3, Copy, LogOut, Mic2, Radio, ShieldCheck, Users2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { SectionLabel, StatusPill } from '../shared/UI'
import { PeerLobby } from './PeerLobby'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'
import { describeApiError } from '../../service/api'
import { peerService, toPeerPartner, toPeerTopic, type PeerParticipantDto, type PeerSessionDto } from '../../service/peerService'
import type { PeerPartner, PeerTopic } from '../../type'

interface PeerServerRoomProps {
  sessionId: string
}

const TERMINAL_STATUSES = new Set(['ENDED', 'CANCELLED', 'EXPIRED'])

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function waitingPartner(): PeerPartner {
  return {
    id: 'waiting-participant',
    name: 'Đang chờ bạn học',
    avatar: '',
    targetLevel: 'Peer practice',
    city: '',
    goal: 'Gửi link mời để bắt đầu cùng một người học khác.',
    rating: 0,
    totalSessions: 0,
    bio: '',
  }
}

function partnerFor(session: PeerSessionDto): PeerPartner {
  const partner =
    session.participants.find((participant) => participant.id !== session.viewerParticipantId) ??
    session.participants.find((participant) => participant.role !== session.viewerRole)
  return partner ? toPeerPartner(partner) : waitingPartner()
}

export function PeerServerRoom({ sessionId }: PeerServerRoomProps) {
  usePageMeta('Phòng peer đang đồng bộ — HeyMimic', 'Phiên luyện nói 1-kèm-1 với trạng thái server và agenda chung.')

  const navigate = useNavigate()
  const [session, setSession] = useState<PeerSessionDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readySent, setReadySent] = useState(false)
  const [isActionPending, setIsActionPending] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const result = await peerService.getSession(sessionId)
        if (!active) return
        setSession(result)
        setError(null)
      } catch (cause) {
        if (!active) return
        setError(describeApiError(cause).message)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [sessionId])

  useEffect(() => {
    if (!session || TERMINAL_STATUSES.has(session.status)) return
    const timer = window.setInterval(async () => {
      try {
        const result = await peerService.getSession(sessionId)
        setSession(result)
        setError(null)
      } catch {
        // Keep the last known server snapshot while a transient poll fails.
      }
    }, 3000)
    return () => window.clearInterval(timer)
  }, [session, sessionId])

  const topic: PeerTopic | null = useMemo(
    () => (session ? toPeerTopic(session.scenario) : null),
    [session]
  )
  const partner: PeerPartner = useMemo(
    () => (session ? partnerFor(session) : waitingPartner()),
    [session]
  )

  const handleReady = async () => {
    if (!session || isActionPending) return
    setIsActionPending(true)
    try {
      const next = await peerService.setReady(session.id, true, session.version)
      setSession(next)
      setReadySent(true)
      if (next.status === 'READY') {
        const started = await peerService.startSession(next.id, next.version)
        setSession(started)
        setReadySent(false)
      }
    } catch (cause) {
      setError(describeApiError(cause).message)
    } finally {
      setIsActionPending(false)
    }
  }

  const handleStart = async () => {
    if (!session || session.status !== 'READY' || isActionPending) return
    setIsActionPending(true)
    try {
      setSession(await peerService.startSession(session.id, session.version))
      setReadySent(false)
    } catch (cause) {
      setError(describeApiError(cause).message)
    } finally {
      setIsActionPending(false)
    }
  }

  const handleCopyInvite = async () => {
    if (!session || isActionPending) return
    setIsActionPending(true)
    try {
      const invite = await peerService.createInvite(session.id)
      const inviteUrl = window.location.origin + ROUTES.PEER_JOIN + '#token=' + encodeURIComponent(invite.token)
      await navigator.clipboard.writeText(inviteUrl)
      setInviteCopied(true)
      setError(null)
      window.setTimeout(() => setInviteCopied(false), 2400)
    } catch (cause) {
      setInviteCopied(false)
      setError(describeApiError(cause).message)
    } finally {
      setIsActionPending(false)
    }
  }

  const handleEnd = async () => {
    if (!session || isActionPending) return
    setIsActionPending(true)
    try {
      await peerService.endSession(session.id, session.version, 'USER_ENDED')
      navigate(ROUTES.PEER_PRACTICE)
    } catch (cause) {
      setError(describeApiError(cause).message)
      setIsActionPending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-study-border bg-study-surface p-8 text-center">
        <Radio className="mx-auto animate-pulse text-study-accent" size={24} />
        <p className="mt-3 text-sm text-study-text-muted">Đang tải trạng thái phòng…</p>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-left">
        <h1 className="font-display text-xl font-semibold text-rose-900">Không thể mở phiên</h1>
        <p className="mt-2 text-sm text-rose-800">{error}</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PEER_PRACTICE)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-study-accent px-4 py-2.5 text-xs font-semibold text-white"
        >
          <ArrowLeft size={15} /> Về danh sách chủ đề
        </button>
      </div>
    )
  }

  if (!session || !topic) return null

  if (session.status === 'ACTIVE') {
    return (
      <ServerActiveRoom
        session={session}
        topic={topic}
        partner={partner}
        currentPhaseIndex={currentPhaseIndex}
        onPhaseChange={setCurrentPhaseIndex}
        onEnd={handleEnd}
        isActionPending={isActionPending}
        error={error}
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 text-left animate-fade-in">
      <div className="flex items-end justify-between gap-4 border-b border-study-border pb-6">
        <div>
          <Link
            to={ROUTES.PEER_PRACTICE}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-study-text-muted hover:text-study-text"
          >
            <ArrowLeft size={14} /> Về danh sách phiên
          </Link>
          <SectionLabel className="uppercase tracking-[0.16em]">
            <Users2 size={13} className="text-study-accent" />
            <span>Server room · {session.status}</span>
          </SectionLabel>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-study-text">
            {topic.title}<span className="text-study-accent">.</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCopyInvite}
            disabled={isActionPending || session.status !== 'WAITING'}
            className="inline-flex items-center gap-1.5 rounded-xl border border-study-accent/30 bg-study-accent-soft px-3 py-2 text-[11px] font-semibold text-study-accent transition-colors hover:bg-study-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inviteCopied ? <Check size={14} /> : <Copy size={14} />}
            {inviteCopied ? 'Đã sao chép' : 'Mời bạn học'}
          </button>
          <StatusPill tone={session.status === 'READY' ? 'signal' : 'calm'}>
            {session.status === 'READY' ? 'Cả hai đã sẵn sàng' : 'Đang chờ bạn học'}
          </StatusPill>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      <PeerLobby topic={topic} partner={partner} onStart={handleReady} />

      {readySent && session.status === 'WAITING' && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-study-primary/25 bg-study-primary-soft/40 p-4 text-sm text-study-text">
          <CheckCircle2 className="mt-0.5 shrink-0 text-study-primary" size={18} />
          <div>
            <strong className="font-semibold">Đã ghi nhận bạn sẵn sàng.</strong>
            <p className="mt-1 text-xs text-study-text-muted">Phòng sẽ tự đồng bộ khi bạn học tham gia và bật trạng thái sẵn sàng.</p>
          </div>
        </div>
      )}

      {session.status === 'READY' && (
        <div className="flex flex-col gap-4 rounded-2xl border border-study-success/30 bg-study-success-soft/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="text-sm font-semibold text-study-text">Hai người đã sẵn sàng.</strong>
            <p className="mt-1 text-xs text-study-text-muted">Bắt đầu agenda chung khi cả hai đã kiểm tra thiết bị.</p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={isActionPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-study-accent px-5 py-3 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-50"
          >
            <Mic2 size={15} /> {isActionPending ? 'Đang mở phòng…' : 'Bắt đầu phiên'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleEnd}
        disabled={isActionPending}
        className="inline-flex items-center gap-2 rounded-xl border border-study-border px-4 py-2.5 text-xs font-semibold text-study-text-muted hover:text-rose-600 disabled:opacity-50"
      >
        <LogOut size={15} /> Huỷ phiên
      </button>
    </div>
  )
}

interface ServerActiveRoomProps {
  session: PeerSessionDto
  topic: PeerTopic
  partner: PeerPartner
  currentPhaseIndex: number
  onPhaseChange: (index: number) => void
  onEnd: () => void
  isActionPending: boolean
  error: string | null
}

function ServerActiveRoom({
  session,
  topic,
  partner,
  currentPhaseIndex,
  onPhaseChange,
  onEnd,
  isActionPending,
  error,
}: ServerActiveRoomProps) {
  const phase = topic.rounds[currentPhaseIndex] ?? topic.rounds[0]
  const isLastPhase = currentPhaseIndex === topic.rounds.length - 1

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 text-left animate-fade-in">
      <div className="flex flex-col gap-4 rounded-2xl border border-study-border bg-study-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-study-accent-soft text-study-accent">
            <Users2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-study-accent">ĐANG DIỄN RA · SERVER STATE</span>
              <span className="h-2 w-2 rounded-full bg-study-success animate-pulse" />
            </div>
            <h2 className="mt-0.5 font-display text-base font-semibold text-study-text">{topic.title}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onEnd}
          disabled={isActionPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-600 disabled:opacity-50"
        >
          <LogOut size={15} /> Rời phiên
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>Trạng thái phòng và agenda đã đồng bộ qua server. Audio WebRTC/LiveKit chưa được bật nên màn này chưa truyền tiếng thật.</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantCard
          label="Bạn"
          participant={session.participants.find((item) => item.id === session.viewerParticipantId)}
          fallback="Bạn"
        />
        <ParticipantCard
          label="Bạn học"
          participant={session.participants.find((item) => item.id !== session.viewerParticipantId)}
          fallback={partner.name}
        />
      </div>

      <section className="rounded-3xl border border-study-border bg-study-surface p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 border-b border-study-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-study-accent">
              Vòng {currentPhaseIndex + 1}/{topic.rounds.length}
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-study-text">{phase.title}</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-study-surface-muted px-3 py-2 text-xs font-mono font-semibold text-study-text-muted">
            <Clock3 size={14} /> {Math.round(phase.durationSeconds / 60)} phút
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-study-border bg-study-surface-muted/50 p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-study-primary">Prompt chung</span>
          <p className="mt-2 text-base font-medium leading-7 text-study-text">“{phase.promptEn}”</p>
          <p className="mt-2 text-xs italic leading-5 text-study-text-muted">({phase.promptVi})</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {topic.recommendedVocab.map((word) => (
            <span key={word} className="rounded-lg border border-study-primary-border/60 bg-study-primary-soft px-2.5 py-1 text-xs font-mono font-semibold text-study-primary">
              {word}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-study-text-muted">Vai của bạn: {session.viewerRole ?? 'participant'}</span>
          <button
            type="button"
            onClick={() => onPhaseChange(isLastPhase ? 0 : currentPhaseIndex + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-study-accent px-4 py-2.5 text-xs font-semibold text-white"
          >
            <CheckCircle2 size={15} /> {isLastPhase ? 'Quay lại vòng đầu' : 'Sang vòng tiếp theo'}
          </button>
        </div>
      </section>
    </div>
  )
}

function ParticipantCard({
  label,
  participant,
  fallback,
}: {
  label: string
  participant?: PeerParticipantDto
  fallback: string
}) {
  const name = participant?.displayName ?? fallback
  const status = participant?.status ?? 'JOINING'
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-study-border bg-study-surface p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-study-primary-soft text-sm font-bold text-study-primary">
        {initials(name) || '??'}
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-study-text-muted">{label}</span>
        <strong className="mt-1 block truncate text-sm font-semibold text-study-text">{name}</strong>
        <span className="mt-0.5 block text-xs text-study-text-muted">{status.toLowerCase()}</span>
      </div>
    </div>
  )
}