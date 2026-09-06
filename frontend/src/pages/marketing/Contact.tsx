import { ArrowLeft, ArrowUpRight, Check, Mail } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from './MarketingLayout'

export function Contact() {
  usePageMeta('Liên hệ', 'Gửi lời nhắn cho người đang xây dựng Mimic.')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '')
    const message = String(data.get('message') ?? '')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Nhập một email hợp lệ nhé.')
    if (!message.trim()) return setError('Viết một chút để mình biết bạn đang nghĩ gì.')
    setError('')
    setSent(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Intro Left */}
        <div className="md:col-span-5 space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-text-muted hover:text-study-text transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Về trang chủ</span>
          </Link>

          <div className="space-y-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-study-primary">
              GỬI LỜI NHẮN
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight leading-tight">
              Mình đang <br />
              <em className="italic text-study-primary font-serif">lắng nghe bạn.</em>
            </h1>
            <p className="text-sm text-study-text-muted leading-relaxed">
              Một câu hỏi về cách học, góp ý tính năng, hay bất kỳ lỗi hiển thị nào bạn gặp — cứ nhắn cho mình nhé.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="mailto:hello@mimic.study"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-study-surface border border-study-border text-xs font-mono font-medium text-study-text hover:text-study-primary hover:border-study-primary/40 transition-colors shadow-xs"
            >
              <Mail size={15} className="text-study-primary" />
              <span>hello@mimic.study</span>
            </a>
          </div>
        </div>

        {/* Form Right */}
        <div className="md:col-span-7 bg-study-surface border border-study-border rounded-3xl p-8 sm:p-10 shadow-xs">
          {sent ? (
            <div className="py-8 space-y-4 text-center flex flex-col items-center">
              <span className="w-12 h-12 rounded-2xl bg-study-primary-soft text-study-primary flex items-center justify-center">
                <Check size={24} strokeWidth={2.5} />
              </span>
              <h2 className="text-xl font-display font-semibold text-study-text">
                Cảm ơn bạn đã nhắn gửi!
              </h2>
              <p className="text-xs text-study-text-muted max-w-sm leading-relaxed">
                Mình sẽ đọc và phản hồi qua email sớm nhất có thể. Trong lúc đó, bạn có thể vào trải nghiệm phòng luyện nói.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-study-primary text-white font-semibold text-xs hover:bg-study-primary-hover transition-colors shadow-xs mt-4"
              >
                <span>Vào practice room</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <div className="flex items-center justify-between pb-3 border-b border-study-border">
                <span className="text-xs font-mono font-semibold text-study-text-muted">LIÊN HỆ TRỰC TIẾP</span>
                <span className="text-[11px] text-study-text-muted">Thường phản hồi trong 24h</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-study-text">Tên của bạn</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Tuna"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-study-text">Email nhận phản hồi</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-study-text">Nội dung tin nhắn</label>
                <textarea
                  name="message"
                  placeholder="Mình muốn chia sẻ với Mimic rằng..."
                  rows={5}
                  required
                  className="w-full p-3.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors resize-none leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-study-primary text-white font-semibold text-xs hover:bg-study-primary-hover transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
              >
                <span>Gửi lời nhắn</span>
                <ArrowUpRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
