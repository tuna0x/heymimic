import { ArrowLeft, ArrowUpRight, Check, Mail, MessageSquare, Send, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandGlyph } from '../../components/shared/BrandLogo'
import { usePageMeta } from '../../hook/usePageMeta'

const topics = [
  'Góp ý tính năng mới',
  'Báo lỗi kỹ thuật / hiển thị',
  'Đề xuất hợp tác nội dung',
  'Trao đổi về phương pháp học',
]

export function Contact() {
  usePageMeta(
    'Liên hệ HeyMimic Studio',
    'Gửi lời nhắn, góp ý tính năng hoặc trao đổi về phương pháp luyện nói tiếng Anh cùng đội ngũ HeyMimic.'
  )

  const [selectedTopic, setSelectedTopic] = useState(topics[0])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '')
    const message = String(data.get('message') ?? '')

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Vui lòng nhập một địa chỉ email hợp lệ nhé.')
    }
    if (!message.trim() || message.trim().length < 5) {
      return setError('Viết vài dòng chia sẻ để chúng mình hiểu bạn đang cần gì nhé.')
    }

    setError('')
    setSent(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-16">
      {/* Header & Back Link */}
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-text-muted hover:text-study-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Về trang chủ</span>
        </Link>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-study-primary">
            KẾT NỐI VỚI HEYMIMIC
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-study-text tracking-tight leading-[1.15]">
            Chúng mình luôn <br />
            <span className="italic font-serif font-normal text-study-primary">
              lắng nghe bạn.
            </span>
          </h1>
          <p className="text-base text-study-text-muted leading-relaxed max-w-xl">
            Mọi góp ý về bài tập nói, câu hỏi về phương pháp hay lỗi hiển thị bạn gặp — hãy gửi lời nhắn trực tiếp cho đội ngũ xây dựng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Left Side: Contact Badges & Details (Col 5) */}
        <div className="md:col-span-5 space-y-6">
          <div className="clean-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <BrandGlyph size={36} />
              <div>
                <strong className="block text-sm font-semibold text-study-text">
                  HeyMimic Studio
                </strong>
                <span className="block text-[11px] text-study-text-muted">
                  Hỗ trợ người học trực tiếp
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <a
                href="mailto:hello@heymimic.com"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-study-surface-muted border border-study-border text-xs font-mono font-medium text-study-text hover:text-study-primary transition-colors"
              >
                <Mail size={15} className="text-study-primary" />
                <span>hello@heymimic.com</span>
              </a>

              <div className="p-3.5 rounded-xl bg-study-primary-soft text-xs text-study-text-muted space-y-1">
                <span className="font-semibold text-study-primary block">Thời gian phản hồi:</span>
                <p className="text-[11px] leading-relaxed">
                  Chúng mình đọc tất cả email và thường hồi âm trong vòng 24 giờ làm việc.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-study-surface border border-study-border text-xs text-study-text-muted space-y-2">
            <span className="font-semibold text-study-text block">Cam kết tôn trọng:</span>
            <p className="leading-relaxed">
              HeyMimic không gửi thư rác, không chia sẻ email của bạn với bất kỳ mạng lưới quảng cáo nào.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Contact Form (Col 7) */}
        <div className="md:col-span-7">
          <div className="clean-card p-8 sm:p-10 rounded-2xl shadow-xs">
            {sent ? (
              <div className="py-12 text-center space-y-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-study-success-soft text-study-success flex items-center justify-center border border-study-success/30">
                  <Check size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-display font-bold text-study-text">
                  Cảm ơn bạn đã nhắn gửi!
                </h2>
                <p className="text-xs sm:text-sm text-study-text-muted max-w-sm leading-relaxed">
                  Góp ý của bạn đã được ghi nhận vào phiên thử nghiệm giao diện. Vì đây là bản demo frontend độc lập, tin nhắn chưa được gửi qua máy chủ email thật. Để trao đổi trực tiếp, bạn có thể gửi tới <span className="font-mono text-study-primary font-semibold">hello@heymimic.com</span>.
                </p>
                <div className="pt-4">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs"
                  >
                    <span>Vào phòng luyện nói</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1 pb-3 border-b border-study-border">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-study-text">
                    GỬI THÔNG ĐIỆP
                  </span>
                  <p className="text-xs text-study-text-muted">
                    Chọn chủ đề phù hợp nhất với ý kiến của bạn:
                  </p>
                </div>

                {/* Topic Selector Chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-study-text">
                    Chủ đề
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTopic(t)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                          selectedTopic === t
                            ? 'bg-study-primary text-white shadow-2xs'
                            : 'bg-study-surface-muted border border-study-border text-study-text-muted hover:text-study-text'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-study-text">
                    Tên của bạn
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Ví dụ: Hoàng Nam"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-study-text">
                    Email nhận hồi âm
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@domain.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-study-text">
                    Nội dung lời nhắn
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Chia sẻ chi tiết câu hỏi, ý tưởng tính năng hoặc trải nghiệm của bạn..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors resize-none leading-relaxed"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>Gửi lời nhắn tới HeyMimic</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
