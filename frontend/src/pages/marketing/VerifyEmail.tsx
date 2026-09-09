import { useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle, Mail, ShieldCheck, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { FormField } from '../../components/shared/FormField'
import { BrandLogo } from '../../components/shared/BrandLogo'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'
import { authService } from '../../service/authService'
import { describeApiError } from '../../service/api'

type VerificationState = 'loading' | 'success' | 'error' | 'missing'

const verificationRequests = new Map<string, Promise<void>>()

function verifyEmailOnce(token: string): Promise<void> {
  const existing = verificationRequests.get(token)
  if (existing) return existing
  const request = authService.verifyEmail(token).finally(() => {
    verificationRequests.delete(token)
  })
  verificationRequests.set(token, request)
  return request
}

export function VerifyEmail() {
  usePageMeta('Xác nhận email — HeyMimic', 'Xác nhận email để mở khóa các bài luyện cá nhân hóa.')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'missing')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')

  useEffect(() => {
    if (!token) return
    let active = true
    void verifyEmailOnce(token)
      .then(() => {
        if (active) setState('success')
      })
      .catch((cause: unknown) => {
        if (!active) return
        setState('error')
        setError(describeApiError(cause).message)
      })
    return () => {
      active = false
    }
  }, [token])

  const resend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) return
    setResendState('sending')
    setError('')
    try {
      await authService.resendVerification(email.trim())
      setResendState('sent')
    } catch (cause) {
      setResendState('idle')
      setError(describeApiError(cause).message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] space-y-6">
        <Link to={ROUTES.LOGIN} className="text-xs text-study-text-muted hover:text-study-primary">
          Về trang đăng nhập
        </Link>

        <div className="clean-card rounded-2xl p-7 sm:p-9 space-y-6 bg-study-surface border border-study-border shadow-sm">
          <div className="flex flex-col items-center text-center gap-3">
            <BrandLogo size="md" />
            <div>
              <h1 className="text-2xl font-display font-bold text-study-text">Xác nhận email</h1>
              <p className="text-xs text-study-text-muted mt-1">
                Một bước nhỏ để bảo vệ tài khoản và bật các bài luyện cần AI.
              </p>
            </div>
          </div>

          {state === 'loading' && (
            <div className="py-8 text-center text-study-text-muted text-sm">
              <LoaderCircle size={24} className="animate-spin mx-auto mb-3 text-study-primary" />
              Đang xác nhận liên kết…
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-4 text-center">
              <CheckCircle2 size={42} className="mx-auto text-study-success" />
              <div>
                <h2 className="font-semibold text-study-text">Email đã được xác nhận</h2>
                <p className="text-xs text-study-text-muted mt-1">
                  Bạn có thể đăng nhập và bắt đầu vòng học cá nhân hóa.
                </p>
              </div>
              <Link
                to={ROUTES.LOGIN}
                className="block w-full py-3 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {(state === 'error' || state === 'missing') && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-study-text flex gap-3">
                <XCircle size={20} className="text-rose-500 shrink-0" />
                <p>
                  {state === 'missing'
                    ? 'Liên kết xác nhận không có token hoặc đã bị cắt khi sao chép.'
                    : error || 'Liên kết không còn hợp lệ. Bạn có thể yêu cầu gửi lại email.'}
                </p>
              </div>

              <form onSubmit={resend} className="space-y-3">
                <FormField
                  id="verify-email"
                  label="Email tài khoản"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                />
                <button
                  type="submit"
                  disabled={resendState === 'sending'}
                  className="w-full py-3 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Mail size={15} />
                  {resendState === 'sending' ? 'Đang gửi…' : 'Gửi lại email xác nhận'}
                </button>
                {resendState === 'sent' && (
                  <p className="text-xs text-study-success flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Nếu tài khoản tồn tại, email mới sẽ được gửi.
                  </p>
                )}
                {error && state === 'missing' && <p className="text-xs text-rose-600">{error}</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
