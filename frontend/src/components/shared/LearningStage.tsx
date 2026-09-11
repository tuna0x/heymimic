import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface LearningStageProps {
  children: ReactNode
  support?: ReactNode
  className?: string
  supportClassName?: string
}

export function LearningStage({ children, support, className, supportClassName }: LearningStageProps) {
  return (
    <section className={cn('learning-stage', className)}>
      <div className="learning-stage__main">{children}</div>
      {support && <aside className={cn('learning-stage__support', supportClassName)}>{support}</aside>}
    </section>
  )
}
