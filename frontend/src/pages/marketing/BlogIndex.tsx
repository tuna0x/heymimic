import { ArrowUpRight, BookOpen, Clock3, Filter, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../../mocks/blog'
import { usePageMeta } from '../../hook/usePageMeta'

const categories = ['Tất cả', 'Shadowing', 'Contextual Vocab', 'Tâm lý học', 'Nhật ký phát triển']

export function BlogIndex() {
  usePageMeta(
    'Ghi chú học tập & Nghiên cứu — HeyMimic Studio',
    'Những bài viết và ghi chú ngắn về kỹ thuật Shadowing, bóc tách từ vựng ngữ cảnh và tâm lý học nói tiếng Anh tự nhiên.'
  )

  const [selectedCat, setSelectedCat] = useState('Tất cả')

  const filteredPosts = useMemo(() => {
    if (selectedCat === 'Tất cả') return blogPosts
    return blogPosts.filter((p) => p.category === selectedCat)
  }, [selectedCat])

  const featuredPost = blogPosts[0]
  const listPosts = selectedCat === 'Tất cả' ? filteredPosts.slice(1) : filteredPosts

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-16">
      {/* =========================================================================
          1. HEADER SECTION
         ========================================================================= */}
      <section className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-study-primary-soft text-study-primary border border-study-primary-border/60">
          <BookOpen size={13} />
          <span>GHI CHÚ THỰC HÀNH & NGHIÊN CỨU</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-bold text-study-text tracking-tight leading-[1.15]">
          Những ghi chú để <br />
          <span className="italic font-serif font-normal text-study-primary">
            nói tự nhiên hơn mỗi ngày.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-study-text-muted leading-relaxed">
          Đúc kết từ hành trình tự học và kiểm nghiệm thực tế: kỹ thuật Shadowing, bóc tách từ vựng ngữ cảnh và tháo gỡ rào cản tâm lý khi mở lời.
        </p>
      </section>

      {/* =========================================================================
          2. CATEGORY FILTER PILLS
         ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-study-border">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCat === cat
                ? 'bg-study-primary text-white shadow-xs'
                : 'bg-study-surface hover:bg-study-surface-hover border border-study-border text-study-text-muted hover:text-study-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* =========================================================================
          3. FEATURED POST (When "Tất cả" is selected)
         ========================================================================= */}
      {selectedCat === 'Tất cả' && featuredPost && (
        <article className="clean-card p-8 sm:p-10 rounded-2xl relative overflow-hidden group">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3 text-xs text-study-text-muted">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-study-primary-soft text-study-primary">
                  BÀI VIẾT NỔI BẬT · {featuredPost.category}
                </span>
                <span>·</span>
                <span>{featuredPost.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock3 size={13} /> {featuredPost.readingTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-study-text group-hover:text-study-primary transition-colors leading-snug">
                <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>

              <p className="text-sm text-study-text-muted leading-relaxed max-w-2xl">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-study-primary-soft text-study-primary font-bold text-xs flex items-center justify-center">
                  {featuredPost.author.initials}
                </div>
                <div className="text-xs">
                  <strong className="block font-semibold text-study-text">
                    {featuredPost.author.name}
                  </strong>
                  <span className="text-[11px] text-study-text-muted">
                    {featuredPost.author.role}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/blog/${featuredPost.slug}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-all shrink-0 shadow-xs"
            >
              <span>Đọc bài viết</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </article>
      )}

      {/* =========================================================================
          4. POSTS GRID
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {listPosts.map((post) => (
          <article
            key={post.slug}
            className="clean-card clean-card-hover p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-study-text-muted">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-study-surface-muted border border-study-border text-study-text-soft">
                  {post.category}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock3 size={12} /> {post.readingTime}
                </span>
              </div>

              <h3 className="text-xl font-display font-semibold text-study-text group-hover:text-study-primary transition-colors leading-snug">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>

              <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-study-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-study-text-muted font-medium">
                {post.date} · {post.author.name}
              </span>

              <Link
                to={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-study-primary group-hover:underline"
              >
                <span>Đọc tiếp</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom Authenticity Guarantee */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border flex items-center gap-3 text-xs text-study-text-muted">
        <Sparkles size={16} className="text-study-primary shrink-0" />
        <span>
          Mọi bài viết đều được viết dựa trên kinh nghiệm tự học và thử nghiệm thực tế cùng người học tại HeyMimic Studio, không sử dụng số liệu phóng đại hay nội dung rác.
        </span>
      </div>
    </div>
  )
}
