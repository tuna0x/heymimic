import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import { FormField } from '../../components/shared/FormField'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'
import { authService } from '../../service/authService'
import { describeApiError } from '../../service/api'

export function ResetPassword() {
  usePageMeta('Đặt lại mật khẩu — HeyMimic', 'Tạo mật khẩu mới cho tài khoản học tiếng Anh.')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(token ? '' : 'Liên kết đặt lại mật khẩu không có token.')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setError('Hãy mở liên kết đặt lại mật khẩu từ email của bạn.')
      return
    }
    if (password.length < 12) {
      setError('Mật khẩu cần tối thiểu 12 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await authService.resetPassword(token, password)
      setIsSuccess(true)
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
          <span>Quay lại đăng nhập</span>
        </Link>

        <div className="bg-study-surface border border-study-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <h1 className="text-2xl font-display font-bold text-study-text">Tạo mật khẩu mới</h1>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Liên kết trong email chỉ dùng được một lần và sẽ hết hạn sau thời gian giới hạn.
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="reset-pass"
                label="Mật khẩu mới"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tối thiểu 12 ký tự"
                error={error}
                required
              />

              <FormField
                id="reset-confirm-pass"
                label="Xác nhận mật khẩu mới"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 px-4 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover disabled:opacity-60 shadow-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>{loading ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-fade-in text-center py-4">
              <CheckCircle2 size={42} className="mx-auto text-study-success" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-study-text">Đặt lại mật khẩu thành công</h3>
                <p className="text-xs text-study-text-muted max-w-xs mx-auto leading-relaxed">
                  Tất cả phiên đăng nhập cũ đã được thu hồi. Bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full py-2.5 px-4 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover"
              >
                Đến trang đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
