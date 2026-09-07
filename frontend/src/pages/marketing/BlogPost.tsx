import { ArrowLeft, ArrowUpRight, Check, Clock3, Headphones, Lightbulb, Share2, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { blogPosts } from '../../mocks/blog'
import { usePageMeta } from '../../hook/usePageMeta'

export function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((item) => item.slug === slug)

  usePageMeta(
    post ? `${post.title} — HeyMimic Studio` : 'Không Tìm Thấy Bài Viết — HeyMimic',
    post?.excerpt ?? 'Bài viết không tồn tại trong danh mục.'
  )

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Không tìm thấy bài viết
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
            Đường dẫn bài viết <code className="font-mono text-study-primary font-semibold">"{slug}"</code> không tồn tại hoặc đã được chuyển hướng.
          </p>
        </div>

        <div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Quay về danh sách bài viết</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-12">
      {/* Back to Blog Navigation */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-xs font-semibold text-study-text-muted hover:text-study-text transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Quay lại tất cả ghi chú</span>
      </Link>

      {/* Article Header */}
      <header className="space-y-6 pb-8 border-b border-study-border">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-study-primary-soft text-study-primary border border-study-primary-border/60">
            {post.category}
          </span>
          <span className="text-study-text-muted">·</span>
          <span className="text-study-text-muted">{post.date}</span>
          <span className="text-study-text-muted">·</span>
          <span className="flex items-center gap-1 text-study-text-muted">
            <Clock3 size={13} /> {post.readingTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-study-text tracking-tight leading-[1.18]">
          {post.title}
        </h1>

        <p className="text-lg text-study-text-muted leading-relaxed font-light">
          {post.excerpt}
        </p>

        {/* Author Card */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-study-primary-soft text-study-primary font-bold text-xs flex items-center justify-center border border-study-primary-border/60">
              {post.author.initials}
            </div>
            <div>
              <strong className="block text-xs font-semibold text-study-text">
                {post.author.name}
              </strong>
              <span className="block text-[11px] text-study-text-muted">
                {post.author.role}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-study-text-muted">
            HEYMIMIC KNOWLEDGE BASE
          </div>
        </div>
      </header>

      {/* Pull Quote Highlight */}
      {post.pullQuote && (
        <div className="p-6 sm:p-8 rounded-3xl bg-study-primary-soft/30 border border-study-primary-border/50 text-base sm:text-lg text-study-text font-serif italic leading-relaxed text-center">
          {post.pullQuote}
        </div>
      )}

      {/* Main Content Paragraphs */}
      <div className="space-y-6 text-base text-study-text-soft leading-relaxed font-sans">
        {post.content.map((paragraph, index) => (
          <p key={index} className="text-study-text/90">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Key Takeaways Box */}
      {post.keyTakeaways && post.keyTakeaways.length > 0 && (
        <div className="clean-card p-6 sm:p-8 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-study-primary font-semibold text-xs uppercase tracking-wider font-mono">
            <Lightbulb size={16} />
            <span>ĐIỂM CỐT LÕI CẦN NHỚ</span>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-study-text">
            {post.keyTakeaways.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-study-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practice in HeyMimic CTA Box */}
      <div className="p-8 rounded-3xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-study-primary uppercase">
            <Headphones size={15} />
            <span>THỰC HÀNH NGAY HÔM NAY</span>
          </div>
          <p className="text-xs text-study-text-muted">
            Áp dụng phương pháp này vào phiên nói 60–90 giây trên HeyMimic.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs shrink-0"
        >
          <span>Vào practice room</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-study-border flex items-center justify-between text-xs text-study-text-muted">
        <Link to="/blog" className="hover:text-study-text transition-colors flex items-center gap-1.5">
          <ArrowLeft size={13} />
          <span>Xem các ghi chú khác</span>
        </Link>
        <span>HeyMimic Knowledge Base · 2026</span>
      </div>
    </article>
  )
}
