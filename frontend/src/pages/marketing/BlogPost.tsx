import { ArrowLeft, ArrowUpRight, Clock3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { blogPosts } from '../../mocks/blog'
import { usePageMeta } from './MarketingLayout'

export function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((item) => item.slug === slug) ?? blogPosts[0]
  usePageMeta(post.title, post.excerpt)

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-10">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-text-muted hover:text-study-text transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Tất cả ghi chú</span>
      </Link>

      <header className="space-y-4 pb-8 border-b border-study-border">
        <span className="text-xs font-semibold tracking-wider uppercase text-study-primary font-mono">
          GHI CHÚ XÂY DỰNG · {post.date}
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-medium text-study-text tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-study-text-muted leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs text-study-text-muted pt-2">
          <span className="flex items-center gap-1">
            <Clock3 size={13} /> {post.readingTime}
          </span>
          <span>·</span>
          <span>Bởi người xây dựng Mimic</span>
        </div>
      </header>

      {/* Article Content */}
      <div className="space-y-6 text-base text-study-text-soft leading-relaxed font-sans">
        {post.content.map((paragraph, i) => (
          <p key={i} className="text-study-text/90">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Post Ending */}
      <div className="pt-10 border-t border-study-border flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-study-primary text-white font-bold flex items-center justify-center text-sm shadow-xs">
            m
          </span>
          <span className="text-xs text-study-text-muted">
            Hẹn gặp bạn trong câu nói tiếp theo ngày mai.
          </span>
        </div>

        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs"
        >
          <span>Thử practice room</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  )
}
