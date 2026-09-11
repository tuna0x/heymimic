import type { ReactNode } from 'react'
import { ArrowUpRight, Check, ChevronRight, Flame } from 'lucide-react'

export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`section-label text-xs font-medium text-study-text-muted/90 flex items-center gap-1.5 ${className}`}>
      {children}
    </div>
  )
}

export function ArrowLink({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary hover:text-study-primary-hover transition-colors group cursor-pointer ${className}`}
    >
      <span>{children}</span>
      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  )
}

export function StatusPill({
  children,
  tone = 'muted',
  className = '',
}: {
  children: ReactNode
  tone?: 'muted' | 'signal' | 'calm'
  className?: string
}) {
  const toneStyles = {
    muted: 'bg-study-surface-muted text-study-text-muted border-study-border',
    signal: 'bg-study-accent-soft text-study-accent border-study-accent/25',
    calm: 'bg-study-primary-soft text-study-primary border-study-primary-border/60',
  }[tone]

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${toneStyles} ${className}`}>
      {tone === 'calm' && <span className="w-1.5 h-1.5 rounded-full bg-study-primary" />}
      {tone === 'signal' && <span className="w-1.5 h-1.5 rounded-full bg-study-accent animate-pulse" />}
      {children}
    </span>
  )
}

export function Streak({ count, compact = false, className = '' }: { count?: number; compact?: boolean; className?: string }) {
  const displayCount = count ?? 4
  return (
    <div className={`inline-flex items-center gap-1.5 text-study-accent ${className}`}>
      <Flame size={compact ? 15 : 18} fill="currentColor" className="shrink-0" />
      <span className={compact ? 'text-xs' : 'text-sm'}>
        <strong className="font-bold tabular-nums mr-0.5">{displayCount}</strong>
        {compact ? ' ngày' : ' ngày streak'}
      </span>
    </div>
  )
}


export function MiniCheck({ done = false }: { done?: boolean }) {
  return (
    <span
      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
        done
          ? 'bg-study-primary border-study-primary text-white'
          : 'border-study-border text-transparent'
      }`}
    >
      <Check size={10} strokeWidth={3} />
    </span>
  )
}

export function ProgressBar({ value, tone = 'signal' }: { value: number; tone?: 'signal' | 'calm' }) {
  return (
    <div className="w-full h-1.5 bg-study-surface-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          tone === 'calm' ? 'bg-study-primary' : 'bg-study-accent'
        }`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function CornerArrow() {
  return (
    <span className="w-7 h-7 rounded-lg bg-study-surface-muted flex items-center justify-center text-study-text-muted group-hover:text-study-primary group-hover:bg-study-primary-soft transition-colors">
      <ChevronRight size={16} />
    </span>
  )
}
