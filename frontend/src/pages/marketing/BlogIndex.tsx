import { ArrowUpRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../../mocks/blog'
import { usePageMeta } from './MarketingLayout'

export function BlogIndex() {
  usePageMeta('Ghi chú xây dựng', 'Những ghi chú ngắn về học tiếng Anh, speaking và quá trình xây Mimic.')

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-16">
      {/* Header */}
      <section className="space-y-4">
        <span className="text-xs font-semibold tracking-wider uppercase text-study-primary">
          NHẬT KÝ PHÒNG LUYỆN TẬP
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-medium text-study-text tracking-tight leading-tight">
          Ghi chú để <br />
          <em className="italic text-study-primary font-serif">nói tự nhiên hơn.</em>
        </h1>
        <p className="text-lg text-study-text-muted leading-relaxed max-w-2xl">
          Những điều mình đang học, đang thử nghiệm và đang xây dựng quanh việc đưa tiếng Anh vào phản xạ đời sống thật.
        </p>
      </section>

      {/* Post List */}
      <div className="space-y-6 pt-4 border-t border-study-border">
        {blogPosts.map((post, index) => (
          <article
            key={post.slug}
            className="p-6 sm:p-8 rounded-3xl bg-study-surface border border-study-border hover:border-study-primary/40 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start justify-between gap-6 group"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 text-xs text-study-text-muted">
                <span className="font-mono text-study-primary font-semibold">0{index + 1}</span>
                <span>·</span>
                <span>{post.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock3 size={12} /> {post.readingTime}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-semibold text-study-text group-hover:text-study-primary transition-colors">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              <p className="text-sm text-study-text-muted leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-study-surface-muted group-hover:bg-study-primary group-hover:text-white text-xs font-semibold text-study-text transition-all shrink-0"
            >
              <span>Đọc bài</span>
              <ArrowUpRight size={14} />
            </Link>
          </article>
        ))}
      </div>

      {/* Philosophy note */}
      <div className="p-6 rounded-2xl bg-study-surface-muted/40 border border-study-border text-xs text-study-text-muted leading-relaxed">
        <span className="font-semibold text-study-text block mb-1">Tính chân thực trong học tập:</span>
        Tất cả các bài viết đều xuất phát từ kinh nghiệm tự học và kiểm nghiệm thực tế của người xây dựng Mimic, không có các lời chứng thực hay số liệu được phóng đại.
      </div>
    </div>
  )
}
