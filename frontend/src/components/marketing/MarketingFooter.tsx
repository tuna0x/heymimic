import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function MarketingFooter() {
  return (
    <footer className="bg-study-surface border-t border-study-border pt-16 pb-12 text-study-text-muted">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pb-12 border-b border-study-border">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <Link className="inline-flex items-center gap-2.5 text-study-text font-display font-bold text-xl tracking-tight mb-4" to="/">
              <span className="w-8 h-8 rounded-xl bg-study-primary text-white font-bold flex items-center justify-center text-base shadow-xs">
                m
              </span>
              <span className="font-display">mimic</span>
              <span className="w-1.5 h-1.5 rounded-full bg-study-primary self-end mb-1" />
            </Link>
            <p className="text-sm text-study-text-muted max-w-sm leading-relaxed">
              Phòng luyện nói tiếng Anh cá nhân hóa bằng AI. Giúp bạn biến từ vựng và ngữ cảnh thực thành phản xạ nói tự nhiên, không gây mỏi mắt hay áp lực.
            </p>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-3">
            <small className="block text-xs font-bold text-study-text-faint tracking-wider uppercase mb-4">
              KHÁM PHÁ
            </small>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-study-primary transition-colors">
                  Vì sao chọn Mimic
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-study-primary transition-colors">
                  Ghi chú xây dựng
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-4">
            <small className="block text-xs font-bold text-study-text-faint tracking-wider uppercase mb-4">
              BẮT ĐẦU
            </small>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/signup" className="hover:text-study-primary transition-colors inline-flex items-center gap-1">
                  <span>Tạo tài khoản miễn phí</span>
                  <ArrowUpRight size={13} />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-study-primary transition-colors">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-study-primary transition-colors">
                  Liên hệ hỗ trợ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-study-text-faint">
          <div>© {new Date().getFullYear()} Mimic. Xây dựng cho trải nghiệm học tập bền bỉ và tập trung.</div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-study-text transition-colors">
              Phòng thực hành
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
