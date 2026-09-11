import { Bot, ChevronRight, Headphones, PenTool, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
const skills = [
  {
    to: '/listening',
    icon: Headphones,
    title: 'Nghe & Shadowing',
    text: 'Nghe kỹ, nói tự nhiên',
  },
  {
    to: '/speaking/dialogue',
    icon: Bot,
    title: 'Hội thoại AI',
    text: 'Tập phản xạ hai chiều',
  },
  {
    to: '/vocab',
    icon: Sparkles,
    title: 'Cụm từ tự nhiên',
    text: 'Học cách dùng từ cùng nhau',
  },
  {
    to: '/writing',
    icon: PenTool,
    title: 'Luyện viết',
    text: 'Diễn đạt rõ ý hơn',
  },
]
export function PersonalSkillPillarsGrid() {
  return (
    <section aria-labelledby="extra-practice-title">
      <h2 id="extra-practice-title" className="mb-3 text-lg font-semibold">
        Luyện thêm theo nhịp của bạn
      </h2>
      <div className="grid gap-x-8 sm:grid-cols-2">
        {skills.map(({ to, icon: Icon, title, text }) => (
          <Link
            key={title}
            to={to}
            className="group flex min-h-20 items-center gap-4 border-b border-study-border py-4"
          >
            <Icon size={20} className="shrink-0 text-study-text-muted" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold group-hover:text-study-primary">
                {title}
              </h3>
              <p className="mt-1 text-xs text-study-text-muted">{text}</p>
            </div>
            <ChevronRight size={16} className="text-study-text-muted" />
          </Link>
        ))}
      </div>
    </section>
  )
}
