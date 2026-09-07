import { useEffect, useRef, type ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'warning' | 'primary'
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  tone = 'danger',
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus cancel button by default for safety
    cancelBtnRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const confirmColors = {
    danger: 'bg-study-danger text-white hover:opacity-90',
    warning: 'bg-study-accent text-white hover:bg-study-accent-hover',
    primary: 'bg-study-primary text-white hover:bg-study-primary-hover',
  }[tone]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-md bg-study-surface border border-study-border rounded-2xl p-6 shadow-xl space-y-4 animate-scale-up"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                tone === 'danger'
                  ? 'bg-study-danger-soft text-study-danger'
                  : 'bg-study-accent-soft text-study-accent'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <h2 id="confirm-modal-title" className="text-base font-display font-semibold text-study-text">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-study-text-muted hover:text-study-text rounded-lg hover:bg-study-surface-muted transition-colors cursor-pointer"
            aria-label="Đóng hộp thoại"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-study-text-muted leading-relaxed">
          {description}
        </p>

        {children}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-study-border bg-study-surface text-study-text-muted hover:text-study-text text-xs font-semibold hover:bg-study-surface-muted transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${confirmColors}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
