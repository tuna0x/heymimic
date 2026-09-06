import { ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageMeta } from './MarketingLayout'

export function Login() {
  usePageMeta('Đăng nhập', 'Đăng nhập vào practice room cá nhân của bạn trên Mimic.')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '')
    const password = String(data.get('password') ?? '')
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return setError('Nhập một email hợp lệ nhé.')
    if (!password) return setError('Nhập mật khẩu để tiếp tục.')
    navigate('/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
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
              CHÀO MỪNG TRỞ LẠI
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight leading-tight">
              Quay lại <br />
              <em className="italic text-study-primary font-serif">phòng luyện nói.</em>
            </h1>
            <p className="text-sm text-study-text-muted leading-relaxed">
              Tiếp tục đúng từ nơi bạn đã tạm dừng buổi luyện tập gần nhất.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs text-study-text-soft">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-study-primary-soft text-study-primary flex items-center justify-center">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>Luyện nói 60–90 giây mỗi ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-study-primary-soft text-study-primary flex items-center justify-center">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>Phản hồi cá nhân hóa tức thì</span>
            </div>
          </div>
        </div>

        {/* Form Right */}
        <div className="md:col-span-7 bg-study-surface border border-study-border rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-study-border">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-study-primary-soft text-study-primary flex items-center justify-center">
                <LockKeyhole size={15} />
              </span>
              <span className="text-xs font-mono font-semibold text-study-text-muted">ĐĂNG NHẬP</span>
            </div>
            <p className="text-xs text-study-text-muted">
              Chưa có tài khoản?{' '}
              <Link to="/signup" className="text-study-primary font-semibold hover:underline inline-flex items-center gap-0.5">
                <span>Tạo tài khoản</span>
                <ArrowUpRight size={12} />
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-study-text">Email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-study-text">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-study-text-muted hover:text-study-text"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-study-text-muted pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-study-border text-study-primary focus:ring-0" />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>
              <button type="button" className="hover:text-study-primary transition-colors">
                Quên mật khẩu?
              </button>
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
              <span>Đăng nhập</span>
              <ArrowUpRight size={14} />
            </button>
          </form>

          <div className="relative flex items-center justify-center pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-study-border" />
            </div>
            <span className="relative px-3 bg-study-surface text-[11px] text-study-text-faint uppercase font-mono">
              hoặc
            </span>
          </div>

          <button
            type="button"
            className="w-full py-2.5 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="font-bold text-study-primary">G</span>
            <span>Tiếp tục với Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}
