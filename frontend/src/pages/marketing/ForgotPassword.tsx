import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react'
import { FormField } from '../../components/shared/FormField'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'
import { authService } from '../../service/authService'
import { describeApiError } from '../../service/api'

export function ForgotPassword() {
  usePageMeta('Quên mật khẩu — HeyMimic', 'Khôi phục mật khẩu tài khoản học tiếng Anh HeyMimic.')

  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập định dạng email hợp lệ.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword(email.trim())
      setIsSubmitted(true)
    } catch (cause) {
      setError(describeApiError(cause).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 text-left">
      <div className="w-full max-w-md space-y-6">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs text-study-text-muted hover:text-study-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại trang đăng nhập</span>
        </Link>

        <div className="bg-study-surface border border-study-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <h1 className="text-2xl font-display font-bold text-study-text">Khôi phục mật khẩu</h1>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Nhập email tài khoản để nhận liên kết thiết lập lại mật khẩu.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="forgot-email"
                label="Địa chỉ email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                error={error}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Mail size={15} />
                <span>{loading ? 'Đang gửi…' : 'Gửi yêu cầu khôi phục'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-fade-in text-center">
              <CheckCircle2 size={42} className="mx-auto text-study-success" />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-study-text">Kiểm tra hộp thư của bạn</h2>
                <p className="text-xs text-study-text-muted leading-relaxed">
                  Nếu email tồn tại, HeyMimic đã gửi liên kết khôi phục. Vì lý do bảo mật, hệ thống luôn hiển thị cùng một thông báo.
                </p>
              </div>
              <Link
                to={ROUTES.LOGIN}
                className="block w-full py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover"
              >
                Quay lại đăng nhập
              </Link>
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
