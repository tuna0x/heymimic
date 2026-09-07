import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { FormField } from '../../components/shared/FormField'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'

export function ResetPassword() {
  usePageMeta('Đặt Lại Mật Khẩu (Demo) — HeyMimic', 'Tạo mật khẩu mới cho tài khoản học tiếng Anh.')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setError('')
    setIsSuccess(true)
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
            <h1 className="text-2xl font-display font-bold text-study-text">
              Tạo mật khẩu mới
            </h1>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Màn hình mô phỏng luồng đặt mật khẩu mới sau khi xác nhận liên kết khôi phục.
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="reset-pass"
                label="Mật khẩu mới"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
              />

              <FormField
                id="reset-confirm-pass"
                label="Xác nhận mật khẩu mới"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                error={error}
                required
              />

              <div className="p-3 rounded-xl bg-study-surface-muted border border-study-border text-[11px] text-study-text-muted">
                Lưu ý: Đây là thao tác minh họa cho luồng frontend, không lưu mật khẩu thật vào cơ sở dữ liệu.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>Cập nhật mật khẩu mẫu</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-fade-in text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-study-text">
                  Đặt lại mật khẩu thành công!
                </h3>
                <p className="text-xs text-study-text-muted max-w-xs mx-auto leading-relaxed">
                  Bạn có thể dùng tài khoản mẫu để đăng nhập vào phòng học bất kỳ lúc nào.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="w-full py-2.5 px-4 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer"
                >
                  Đến trang đăng nhập
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
