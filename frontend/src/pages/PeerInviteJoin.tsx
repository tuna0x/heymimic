import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, Users2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SectionLabel, StatusPill } from '../components/shared/UI'
import { usePageMeta } from '../hook/usePageMeta'
import { ROUTES } from '../route/routePaths'
import { useMimicStore } from '../store/useMimicStore'
import { describeApiError, getAccessToken } from '../service/api'
import { peerService, toPeerTopic, type PeerSessionDto } from '../service/peerService'

export function PeerInviteJoin() {
  usePageMeta(
    'Tham gia phiên luyện nói — HeyMimic',
    'Xem mục tiêu chung và tham gia phiên luyện nói 1-kèm-1 qua lời mời riêng.'
  )

  const location = useLocation()
  const navigate = useNavigate()
  const { peerTopics, peerPartners, startPeerSession } = useMimicStore()
  const [serverSession, setServerSession] = useState<PeerSessionDto | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inviteParams = new URLSearchParams(location.hash.replace(/^#/, ''))
  const token = inviteParams.get('token')
  const topicId = inviteParams.get('topic')
  const isDemoInvite = Boolean(token?.startsWith('demo-'))
  const localTopic = peerTopics.find((item) => item.id === topicId)
  const topic = serverSession ? toPeerTopic(serverSession.scenario) : isDemoInvite ? localTopic : undefined
  const isValidInvite = Boolean(token && (isDemoInvite ? topic : getAccessToken()))

  const handleAccept = async () => {
    if (!token || !isValidInvite || isAccepting) return
    if (isDemoInvite) {
      if (!topic) return
      startPeerSession(topic.id, peerPartners[0]?.id)
      navigate(ROUTES.PEER_ROOM)
      return
    }

    setIsAccepting(true)
    setError(null)
    try {
      const session = await peerService.acceptInvite(token)
      setServerSession(session)
      navigate(`${ROUTES.PEER_ROOM}/${session.id}`)
    } catch (cause) {
      setError(describeApiError(cause).message)
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <div className="relative mx-auto max-w-4xl pb-16 text-left animate-fade-in">
      <div className="pointer-events-none absolute -right-24 -top-24 hidden h-72 w-72 rounded-full bg-study-accent-soft/50 blur-3xl lg:block" />

      <Link
        to={ROUTES.SPEAKING}
        className="relative inline-flex items-center gap-1.5 text-xs font-semibold text-study-text-muted transition-colors hover:text-study-text"
      >
        <ArrowLeft size={14} />
        Về phòng luyện nói
      </Link>

      <div className="relative mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <SectionLabel className="uppercase tracking-[0.16em]">
            <Users2 size={13} className="text-study-accent" />
            <span>Lời mời riêng · Peer practice</span>
          </SectionLabel>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-[-0.04em] text-study-text sm:text-5xl">
            Một cuộc nói chuyện đang chờ bạn<span className="text-study-accent">.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-study-text-muted sm:text-base">
            Hai người cùng theo một mục tiêu, luân phiên theo vai và kết thúc bằng một nhận xét hữu ích cho nhau.
          </p>

          {error && (
            <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              {error}
            </div>
          )}
          {isValidInvite && !topic && (
            <div role="status" className="mt-8 rounded-2xl border border-study-accent/25 bg-study-accent-soft/30 p-5 shadow-sm">
              <h2 className="font-semibold text-study-text">Lời mời server đã sẵn sàng</h2>
              <p className="mt-1 text-xs leading-5 text-study-text-muted">Mục tiêu và vai sẽ được tải sau khi bạn tham gia phiên.</p>
            </div>
          )}
          {isValidInvite && topic ? (
            <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-study-accent/25 bg-study-surface shadow-sm">
              <div className="border-b border-study-border bg-study-accent-soft/40 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone="signal">Được mời tham gia</StatusPill>
                  <span className="text-[11px] text-study-text-muted">Mã lời mời đã sẵn sàng</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-study-text">{topic.title}</h2>
                <p className="mt-2 text-sm leading-6 text-study-text-muted">{topic.description}</p>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                <div className="rounded-xl bg-study-surface-muted p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-study-text-muted">Trình độ</span>
                  <strong className="mt-1 block text-sm text-study-text">{topic.level}</strong>
                </div>
                <div className="rounded-xl bg-study-surface-muted p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-study-text-muted">Thời lượng</span>
                  <strong className="mt-1 flex items-center gap-1.5 text-sm text-study-text"><Clock3 size={14} />{topic.defaultDurationMinutes} phút</strong>
                </div>
                <div className="rounded-xl bg-study-surface-muted p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-study-text-muted">Cấu trúc</span>
                  <strong className="mt-1 block text-sm text-study-text">{topic.rounds.length} vòng</strong>
                </div>
              </div>
            </div>
          ) : !isValidInvite ? (
            <div role="alert" className="mt-8 rounded-2xl border border-study-border bg-study-surface p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-study-accent" />
                <div>
                  <h2 className="font-semibold text-study-text">Lời mời không còn hợp lệ</h2>
                  <p className="mt-1 text-xs leading-5 text-study-text-muted">
                    Link có thể đã hết hạn hoặc thiếu mã phiên. Bạn có thể chọn một chủ đề mới để tạo lời mời khác.
                  </p>
                  <Link to={ROUTES.PEER_PRACTICE} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-study-accent hover:text-study-accent-hover">
                    Mở danh sách chủ đề <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="relative rounded-[1.75rem] border border-study-border bg-study-surface p-5 shadow-sm sm:p-6 lg:mt-12">
          <div className="flex items-center gap-2 text-study-primary">
            <LockKeyhole size={17} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">Bạn sẽ kiểm soát lượt nói</span>
          </div>
          <ul className="mt-5 space-y-4 text-sm text-study-text-muted">
            <li className="flex items-start gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-study-primary" /><span>Vai riêng chỉ hiện sau khi bạn vào phiên.</span></li>
            <li className="flex items-start gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-study-primary" /><span>Có thể tắt mic hoặc rời phòng bất cứ lúc nào.</span></li>
            <li className="flex items-start gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-study-primary" /><span>Nhận xét tập trung vào cách nói, không xếp hạng người học.</span></li>
          </ul>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!isValidInvite || isAccepting}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-study-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-study-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isAccepting ? 'Đang tham gia…' : 'Tham gia phiên luyện nói'}
            <ArrowRight size={16} />
          </button>
          <p className="mt-3 text-center text-[11px] leading-5 text-study-text-muted">
            Bạn sẽ được đưa vào lobby để kiểm tra mic trước khi bắt đầu.
          </p>
        </aside>
      </div>
    </div>
  )
}
