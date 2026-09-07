import { ArrowUpRight, Check, Heart, Mail, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '../shared/BrandLogo'

export function MarketingFooter() {
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')
  const location = useLocation()

  const handleLinkClick = (to: string) => {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    setSubscribed(true)
  }

  return (
    <footer className="bg-study-surface border-t border-study-border pt-18 pb-12 text-study-text-muted mt-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-study-border">
          {/* Brand Info & Mission */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo
              size="lg"
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            />

            <p className="text-sm text-study-text-muted max-w-sm leading-relaxed">
              Phòng luyện nói tiếng Anh cá nhân hóa bằng AI. Giúp bạn biến từ vựng ngữ cảnh thành phản xạ giao tiếp tự nhiên trong không gian 100% riêng tư.
            </p>

            {/* Newsletter Box */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-study-text mb-2">
                Nhận ghi chú & phương pháp học mới nhất
              </span>
              {subscribed ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-study-success-soft text-study-success border border-study-success/30 text-xs font-medium animate-in fade-in">
                  <Check size={14} strokeWidth={2.5} />
                  <span>Cảm ơn bạn! HeyMimic sẽ gửi các bản tin hữu ích.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-study-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    Đăng ký
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 space-y-3">
            <small className="block text-xs font-mono font-bold uppercase tracking-wider text-study-text">
              KHÁM PHÁ
            </small>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/speaking-method"
                  onClick={() => handleLinkClick('/speaking-method')}
                  className="hover:text-study-primary transition-colors"
                >
                  Phương pháp Shadowing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => handleLinkClick('/about')}
                  className="hover:text-study-primary transition-colors"
                >
                  Vì sao HeyMimic
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  onClick={() => handleLinkClick('/blog')}
                  className="hover:text-study-primary transition-colors"
                >
                  Ghi chú học tập
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => handleLinkClick('/contact')}
                  className="hover:text-study-primary transition-colors"
                >
                  Gửi phản hồi
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 space-y-3">
            <small className="block text-xs font-mono font-bold uppercase tracking-wider text-study-text">
              PHÒNG HỌC
            </small>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => handleLinkClick('/dashboard')}
                  className="hover:text-study-primary transition-colors"
                >
                  Hôm nay
                </Link>
              </li>
              <li>
                <Link
                  to="/speaking"
                  onClick={() => handleLinkClick('/speaking')}
                  className="hover:text-study-primary transition-colors"
                >
                  Phòng luyện nói
                </Link>
              </li>
              <li>
                <Link
                  to="/vocab"
                  onClick={() => handleLinkClick('/vocab')}
                  className="hover:text-study-primary transition-colors"
                >
                  Bộ thẻ từ vựng
                </Link>
              </li>
              <li>
                <Link
                  to="/progress"
                  onClick={() => handleLinkClick('/progress')}
                  className="hover:text-study-primary transition-colors"
                >
                  Theo dõi nhịp học
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div className="md:col-span-3 space-y-3">
            <small className="block text-xs font-mono font-bold uppercase tracking-wider text-study-text">
              CAM KẾT HỌC TẬP
            </small>
            <div className="p-3.5 rounded-2xl bg-study-surface-muted/60 border border-study-border text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-study-primary font-semibold">
                <Sparkles size={13} />
                <span>Không gian riêng tư 100%</span>
              </div>
              <p className="text-[11px] text-study-text-muted leading-relaxed">
                Mọi dữ liệu âm thanh và bài tập nói đều thuộc quyền kiểm soát của bạn. Không ai phán xét hay xếp hạng áp lực.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-study-text-muted">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} HeyMimic Studio.</span>
            <span>·</span>
            <Link to="/terms" className="hover:text-study-primary transition-colors">
              Điều khoản sử dụng
            </Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-study-primary transition-colors">
              Chính sách bảo mật
            </Link>
          </div>

          {/* Real-time System Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-study-surface-muted border border-study-border text-[11px] font-mono text-study-text-muted">
            <span className="w-2 h-2 rounded-full bg-study-primary" />
            <span>Chế độ thử nghiệm (Frontend Demo)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
