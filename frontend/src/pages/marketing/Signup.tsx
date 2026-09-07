import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/shared/BrandLogo'
import { usePageMeta } from '../../hook/usePageMeta'

export function Signup() {
  usePageMeta(
    'Tạo tài khoản — HeyMimic Studio',
    'Tạo phòng luyện nói cá nhân hóa của bạn trên HeyMimic.'
  )

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return setError('Vui lòng nhập tên của bạn.')
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Vui lòng nhập địa chỉ email hợp lệ.')
    }
    if (password.length < 6) {
      return setError('Mật khẩu cần ít nhất 6 ký tự.')
    }

    setLoading(true)
    setError('')
    setTimeout(() => {
      navigate('/dashboard')
    }, 350)
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-study-text-muted hover:text-study-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Về trang chủ</span>
        </Link>

        {/* Minimalist Card */}
        <div className="clean-card rounded-2xl p-7 sm:p-9 space-y-6 shadow-sm">
          {/* Header */}
          <div className="space-y-3 text-center flex flex-col items-center">
            <BrandLogo size="md" />
            <div>
              <h1 className="text-2xl font-display font-bold text-study-text tracking-tight">
                Tạo tài khoản
              </h1>
              <p className="text-xs text-study-text-muted mt-1">
                Bắt đầu phòng luyện nói riêng tư của bạn
              </p>
            </div>
          </div>

          {/* 1-Click Google OAuth */}
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setTimeout(() => navigate('/dashboard'), 300)
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-study-border hover:border-study-border-subtle bg-study-surface hover:bg-study-surface-muted text-xs font-semibold text-study-text flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng ký với Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-study-border w-full" />
            <span className="bg-study-surface px-3 text-[11px] text-study-text-faint uppercase tracking-wider absolute">
              hoặc
            </span>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-study-text">
                Tên của bạn
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-study-text-muted pointer-events-none"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Nam"
                  autoComplete="name"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-study-text">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-study-text-muted pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-study-text">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-study-text-muted pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-study-text-muted hover:text-study-text cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover shadow-xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? 'Đang khởi tạo...' : 'Tạo tài khoản miễn phí'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-2 text-center text-xs text-study-text-muted">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-study-primary font-semibold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
