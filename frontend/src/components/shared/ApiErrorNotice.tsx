import { AlertCircle, Clock3, Gauge, RefreshCw, WifiOff } from 'lucide-react'
import type { ApiFailure } from '../../service/api'

interface ApiErrorNoticeProps {
  failure: ApiFailure
  onRetry?: () => void
}

export function ApiErrorNotice({ failure, onRetry }: ApiErrorNoticeProps) {
  const Icon =
    failure.kind === 'timeout'
      ? Clock3
      : failure.kind === 'quota' || failure.kind === 'rateLimit'
        ? Gauge
        : failure.kind === 'network'
          ? WifiOff
          : AlertCircle

  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-600">
          <Icon size={17} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-study-text">{failure.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-study-text-muted">{failure.message}</p>
          {failure.requestId && (
            <p className="mt-1 font-mono text-[10px] text-study-text-muted">
              Mã hỗ trợ: {failure.requestId}
            </p>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-study-border bg-study-surface px-3 py-2 text-xs font-semibold text-study-text transition-colors hover:bg-study-surface-hover"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Thử lại
          </button>
        )}
      </div>
    </div>
  )
}
