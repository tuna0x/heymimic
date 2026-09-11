import { ChevronRight, Tv, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'
const features = [
  {
    to: '/peer-practice',
    icon: Users2,
    title: 'Nói cùng bạn học',
    text: 'Luyện theo chủ đề, luân phiên nói và góp ý cho nhau.',
  },
  {
    to: '/video-learning',
    icon: Tv,
    title: 'Học qua video',
    text: 'Nghe từng câu, nói theo và luyện ngữ điệu tự nhiên.',
  },
]
export function FlagshipFeaturesBanner() {
  return (
    <section aria-labelledby="practice-together-title">
      <h2 id="practice-together-title" className="mb-4 text-lg font-semibold">
        Đổi cách luyện, giữ hứng thú
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ to, icon: Icon, title, text }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-xl border border-study-border bg-study-surface p-5 hover:border-study-primary-border"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-study-surface-muted text-study-primary">
              <Icon size={22} strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold group-hover:text-study-primary">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-study-text-muted">
                {text}
              </p>
            </div>
            <ChevronRight
              size={18}
              className="shrink-0 text-study-text-muted"
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
