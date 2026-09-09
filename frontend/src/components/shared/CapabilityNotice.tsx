import { Gauge, RefreshCw, ShieldAlert } from 'lucide-react'
import type { CapabilityGateState } from '../../hook/useCapabilityGate'

interface CapabilityNoticeProps {
  gate: CapabilityGateState
  label: string
}

function resetLabel(resetAt?: string): string | null {
  if (!resetAt) return null
  const date = new Date(resetAt)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function CapabilityNotice({ gate, label }: CapabilityNoticeProps) {
  const reset = resetLabel(gate.usage?.resetAt)

  if (!gate.failure && !gate.blocked && !gate.usage) return null

  if (gate.blocked) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-left"
      >
        <span className="mt-0.5 rounded-lg bg-amber-500/10 p-1.5 text-amber-600">
          <ShieldAlert size={15} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-study-text">{label} đang tạm khóa</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-study-text-muted">
            {gate.reason ?? 'Thao tác này hiện chưa khả dụng.'}
            {reset ? ' Hạn mức sẽ làm mới ngày ' + reset + '.' : ''}
          </p>
        </div>
      </div>
    )
  }

  if (gate.failure) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-study-border bg-study-surface-muted/40 p-3 text-left"
      >
        <span className="mt-0.5 rounded-lg bg-study-surface-muted p-1.5 text-study-text-muted">
          <Gauge size={15} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-study-text">Chưa tải được hạn mức {label.toLowerCase()}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-study-text-muted">
            Bạn vẫn có thể thử thao tác; máy chủ sẽ kiểm tra hạn mức trước khi xử lý.
          </p>
        </div>
        <button
          type="button"
          onClick={gate.refresh}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-study-border bg-study-surface px-2 py-1.5 text-[11px] font-semibold text-study-text hover:bg-study-surface-hover"
        >
          <RefreshCw size={12} aria-hidden="true" />
          Tải lại
        </button>
      </div>
    )
  }

  if (!gate.usage) return null

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-xl border border-study-border bg-study-surface-muted/30 px-3 py-2 text-[11px] text-study-text-muted"
    >
      <Gauge size={14} className="shrink-0 text-study-primary" aria-hidden="true" />
      <span>
        {label}: còn <strong className="font-semibold text-study-text">{gate.usage.remaining}</strong>/
        {gate.usage.limit} lượt hôm nay
        {reset ? ' · làm mới ' + reset : ''}
      </span>
    </div>
  )
}
