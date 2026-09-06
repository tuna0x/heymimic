import { ArrowLeft, ArrowUpRight, Check, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageMeta } from './MarketingLayout'

const goals = ['Nói tự tin hơn', 'Mở rộng vốn từ ngữ cảnh', 'Chuẩn bị cho công việc', 'Tạo thói quen đều đặn']

export function Signup() {
  usePageMeta('Tạo tài khoản', 'Tạo practice room cá nhân hóa của bạn trên Mimic.')
  const [goal, setGoal] = useState('Nói tự tin hơn')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const password = String(data.get('password') ?? '')
    if (!name) return setError('Cho Mimic biết tên của bạn nhé.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Nhập một email hợp lệ nhé.')
    if (password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.')
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
              KHÔNG GIAN LUYỆN TẬP CỦA BẠN
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight leading-tight">
              Thử nói tiếng Anh <br />
              <em className="italic text-study-primary font-serif">theo cách mới.</em>
            </h1>
            <p className="text-sm text-study-text-muted leading-relaxed">
              Một phòng luyện nói được điều chỉnh theo đúng những gì bạn đang học, đang nói và hay vấp ngã.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs text-study-text-soft">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-study-primary-soft text-study-primary flex items-center justify-center">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>6 từ vựng ngữ cảnh của ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-study-primary-soft text-study-primary flex items-center justify-center">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>1 chủ đề luyện nói ngắn gọn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-study-primary-soft text-study-primary flex items-center justify-center">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>Phản hồi chi tiết không phán xét</span>
            </div>
          </div>
        </div>

        {/* Form Right */}
        <div className="md:col-span-7 bg-study-surface border border-study-border rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-study-border">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-study-primary-soft text-study-primary flex items-center justify-center">
                <Sparkles size={15} />
              </span>
              <span className="text-xs font-mono font-semibold text-study-text-muted">ĐĂNG KÝ MIỄN PHÍ</span>
            </div>
            <p className="text-xs text-study-text-muted">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-study-primary font-semibold hover:underline inline-flex items-center gap-0.5">
                <span>Đăng nhập</span>
                <ArrowUpRight size={12} />
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-study-text">Tên của bạn</label>
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Tuna"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
              />
            </div>

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
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Ít nhất 6 ký tự"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
              />
            </div>

            {/* Goal Selector */}
            <div className="space-y-2 pt-1">
              <span className="block text-xs font-semibold text-study-text">
                Mục tiêu ưu tiên của bạn hiện tại?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {goals.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setGoal(item)}
                    className={`p-2.5 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-colors cursor-pointer ${
                      goal === item
                        ? 'bg-study-primary-soft border-study-primary text-study-primary font-semibold'
                        : 'bg-study-surface-muted/40 border-study-border text-study-text-soft hover:bg-study-surface-hover'
                    }`}
                  >
                    <span>{item}</span>
                    {goal === item && <Check size={13} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
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
              <span>Tạo tài khoản và bắt đầu</span>
              <ArrowUpRight size={14} />
            </button>
          </form>

          <small className="block text-[11px] text-study-text-faint text-center leading-normal">
            Bằng việc tiếp tục, bạn đồng ý với chính sách sử dụng và bảo mật của Mimic.
          </small>
        </div>
      </div>
    </div>
  )
}
