import type { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  children?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-study-border bg-study-surface-muted/30 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-study-surface border border-study-border flex items-center justify-center text-study-primary mb-4 shadow-xs">
        <Icon size={22} strokeWidth={1.75} />
      </div>

      <h3 className="text-base font-display font-semibold text-study-text mb-1.5">
        {title}
      </h3>

      <p className="text-xs text-study-text-muted leading-relaxed max-w-xs mb-6">
        {description}
      </p>

      {children}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer"
          >
            {actionLabel}
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="px-4 py-2 rounded-xl border border-study-border bg-study-surface text-study-text-muted hover:text-study-text text-xs font-medium hover:bg-study-surface-hover transition-colors cursor-pointer"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
