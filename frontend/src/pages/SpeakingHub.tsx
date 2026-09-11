import { Bot, ChevronRight, Clock3, History, Mic2, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hook/usePageMeta'
import { ROUTES } from '../route/routePaths'
import { useMimicStore } from '../store/useMimicStore'

export function SpeakingHub() {
  usePageMeta(
    'Luyện nói — HeyMimic',
    'Chọn cách luyện nói phù hợp: tự ghi âm, hội thoại AI hoặc trò chuyện cùng bạn học.'
  )
  const peerTopics = useMimicStore((state) => state.peerTopics)
  const peerSessions = useMimicStore((state) => state.peerSessions)
  const activeStudySession = useMimicStore((state) => state.activeStudySession)
  const latestSession = peerSessions[0]
  return (
    <div className="space-y-8 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm text-study-text-muted">Không gian luyện nói</p>
          <h1 className="mt-2 font-display">Tự tin hơn qua mỗi lần nói.</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-study-text-muted">
            Một chủ đề quen thuộc, một cuộc trò chuyện ngắn. Chọn cách luyện phù
            hợp với bạn hôm nay.
          </p>
        </div>
        <Link
          to={ROUTES.SPEAKING_HISTORY}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-study-border bg-study-surface px-4 text-sm font-medium text-study-text-soft hover:bg-study-surface-muted"
        >
          <History size={16} />
          Lịch sử luyện nói
        </Link>
      </header>
      {activeStudySession?.currentStep === 'speaking' &&
        activeStudySession.status === 'inProgress' && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-study-primary-border bg-study-primary-soft px-5 py-4">
            <p className="text-sm text-study-text-soft">
              Bạn còn một bài nói trong buổi học đang dở.
            </p>
            <Link
              to={ROUTES.SPEAKING_SOLO}
              className="text-sm font-semibold text-study-primary hover:underline"
            >
              Tiếp tục buổi học
            </Link>
          </div>
        )}
      <section
        aria-labelledby="solo-practice-title"
        className="grid overflow-hidden rounded-2xl border border-study-primary-border bg-study-primary-soft lg:grid-cols-[1.2fr_1fr]"
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-study-primary">
            <Mic2 size={18} />
            Luyện nói cá nhân
          </div>
          <h2
            id="solo-practice-title"
            className="max-w-md font-display text-2xl font-bold leading-snug sm:text-3xl"
          >
            Bắt đầu bằng 60 giây
            <br className="hidden sm:block" /> nói theo cách của bạn.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-study-text-soft">
            Ghi âm theo chủ đề, xem lại cách diễn đạt và thử nói thêm lần nữa
            với những gợi ý dành riêng cho bạn.
          </p>
          <Link
            to={ROUTES.SPEAKING_SOLO}
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-study-accent px-5 text-sm font-semibold text-white hover:bg-study-accent-hover"
          >
            <Mic2 size={17} />
            Mở phòng ghi âm
          </Link>
        </div>
        <div className="m-4 rounded-xl bg-study-surface p-6 sm:m-6 sm:p-7">
          <p className="text-xs font-medium text-study-text-muted">
            Một buổi luyện nói
          </p>
          <ol className="mt-5 space-y-6">
            {[
              [
                '01',
                'Chọn điều bạn muốn nói',
                'Công việc, phỏng vấn hay một tình huống hằng ngày.',
              ],
              [
                '02',
                'Mở mic và thử diễn đạt',
                'Không cần hoàn hảo. Cứ bắt đầu với những gì bạn biết.',
              ],
              [
                '03',
                'Nhận góp ý, thử lại',
                'Đọc bản chép lời và luyện lại cách nói tự nhiên hơn.',
              ],
            ].map(([number, title, text]) => (
              <li key={number} className="flex gap-4">
                <span className="pt-0.5 text-sm font-semibold tabular-nums text-study-primary">
                  {number}
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-study-text-muted">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section aria-labelledby="other-speaking-title">
        <h2 id="other-speaking-title" className="mb-4 text-lg font-semibold">
          Thêm một cách để cất lời
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              to: ROUTES.PEER_PRACTICE,
              icon: Users2,
              title: 'Nói cùng bạn học',
              text: 'Thực hành theo vai, đổi lượt nói và nhận góp ý từ người cùng học.',
              action: 'Tìm bạn luyện nói',
            },
            {
              to: ROUTES.SPEAKING_DIALOGUE,
              icon: Bot,
              title: 'Trò chuyện cùng AI',
              text: 'Tập phản xạ trong một tình huống cụ thể và giữ mạch hội thoại.',
              action: 'Chọn tình huống',
            },
          ].map(({ to, icon: Icon, title, text, action }) => (
            <Link
              to={to}
              key={to}
              className="group rounded-xl border border-study-border bg-study-surface p-6 hover:border-study-primary-border"
            >
              <div className="flex items-center gap-3">
                <Icon size={21} className="text-study-primary" />
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-study-text-muted">
                {text}
              </p>
              <span className="mt-5 flex items-center justify-between text-sm font-medium text-study-primary">
                {action}
                <ChevronRight size={17} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="speaking-topics-title">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h2 id="speaking-topics-title" className="text-lg font-semibold">
            Chủ đề để nói cùng nhau
          </h2>
          <Link
            to={ROUTES.PEER_PRACTICE}
            className="text-sm text-study-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div>
          {peerTopics.slice(0, 3).map((topic) => (
            <Link
              key={topic.id}
              to={ROUTES.PEER_PRACTICE}
              className="group flex flex-wrap items-center justify-between gap-4 border-b border-study-border py-5"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold group-hover:text-study-primary">
                  {topic.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-study-text-muted">
                  {topic.description}
                </p>
              </div>
              <span className="flex items-center gap-2 text-xs text-study-text-muted">
                <Clock3 size={14} />
                {topic.defaultDurationMinutes} phút
                <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <p className="text-sm text-study-text-muted">
        {latestSession
          ? 'Lần luyện cùng bạn học gần nhất: ' +
            latestSession.topicTitle +
            ', cùng ' +
            latestSession.partner.name +
            '.'
          : 'Chưa có phiên luyện cùng bạn học. Bắt đầu bằng một chủ đề bạn thấy thoải mái.'}
      </p>
    </div>
  )
}
