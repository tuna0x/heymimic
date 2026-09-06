import { ArrowRight, Lightbulb } from 'lucide-react'
import type { AgentFeedback } from '../../type'

export function FeedbackCard({ feedback }: { feedback: AgentFeedback }) {
  return (
    <article className="p-4 rounded-2xl bg-study-surface-muted/40 border border-study-border hover:border-study-border-hover transition-colors flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-study-primary" />
          <span>{feedback.label}</span>
        </span>
        <span className="text-[11px] font-mono text-study-text-muted">
          {feedback.id.replace('f', '#0')}
        </span>
      </div>

      {feedback.category === 'suggestion' ? (
        <div className="flex items-start gap-3 my-1">
          <span className="p-1.5 rounded-lg bg-study-accent-soft text-study-accent shrink-0 mt-0.5">
            <Lightbulb size={16} />
          </span>
          <div>
            <p className="text-xs font-medium text-study-text leading-relaxed">
              {feedback.improved}
            </p>
            <small className="block text-[11px] text-study-text-muted mt-1 leading-normal">
              {feedback.note}
            </small>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 my-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 line-through">
              {feedback.original}
            </span>
            <ArrowRight size={13} className="text-study-text-muted" />
            <span className="px-2 py-1 rounded-md bg-study-primary-soft text-study-primary font-medium">
              {feedback.improved}
            </span>
          </div>
          <p className="text-xs text-study-text-muted leading-relaxed">
            {feedback.note}
          </p>
        </div>
      )}
    </article>
  )
}
