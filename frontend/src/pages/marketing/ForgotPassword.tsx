import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Info, KeyRound, Mail, Sparkles } from 'lucide-react'
import { FormField } from '../../components/shared/FormField'
import { BrandLogo } from '../../components/shared/BrandLogo'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'

export function ForgotPassword() {
  usePageMeta('Quên Mật Khẩu (Demo) — HeyMimic', 'Khôi phục mật khẩu tài khoản học tiếng Anh HeyMimic.')
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập định dạng email hợp lệ.')
      return
    }
    setError('')
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 text-left">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs text-study-text-muted hover:text-study-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại trang đăng nhập</span>
        </Link>

        {/* Card */}
        <div className="bg-study-surface border border-study-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <h1 className="text-2xl font-display font-bold text-study-text">
              Khôi phục mật khẩu
            </h1>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Nhập email tài khoản bạn đã đăng ký để nhận liên kết thiết lập lại mật khẩu.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="forgot-email"
                label="Địa chỉ email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                error={error}
                required
              />

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Mail size={15} />
                <span>Gửi yêu cầu khôi phục</span>
              </button>
            </form>
          ) : (
            /* Honest Demo Notice */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-study-primary-soft/40 border border-study-primary-border/60 text-xs text-study-text space-y-2">
                <div className="flex items-center gap-2 font-semibold text-study-primary">
                  <Info size={16} />
                  <span>Chế độ thử nghiệm (Demo)</span>
                </div>
                <p className="leading-relaxed text-study-text-soft">
                  HeyMimic hiện đang chạy ở phiên bản trải nghiệm độc lập (mock frontend). Hệ thống <strong>không gửi email thật</strong> đến hòm thư <span className="font-mono font-semibold">{email}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-study-surface-muted border border-study-border text-xs text-study-text-muted space-y-2">
                <p>
                  Bạn có thể chuyển sang giao diện tạo mật khẩu mới mẫu ngay dưới đây để kiểm tra trải nghiệm người dùng:
                </p>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.RESET_PASSWORD)}
                  className="w-full py-2.5 px-4 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Xem bước đặt mật khẩu mẫu</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 text-center border-t border-study-border text-xs text-study-text-muted">
            <span>Nhớ mật khẩu rồi? </span>
            <Link to={ROUTES.LOGIN} className="text-study-primary hover:underline font-semibold">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
