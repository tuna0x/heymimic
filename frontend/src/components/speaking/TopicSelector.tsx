import { Briefcase, Coffee, Lightbulb, UserCheck } from 'lucide-react'
import type { SpeakingTopic } from '../../type'

interface TopicSelectorProps {
  topics: SpeakingTopic[]
  activeTopicId: string
  onSelectTopic: (topic: SpeakingTopic) => void
  disabled?: boolean
}

export function TopicSelector({
  topics,
  activeTopicId,
  onSelectTopic,
  disabled = false,
}: TopicSelectorProps) {
  const getCategoryIcon = (category: SpeakingTopic['category']) => {
    switch (category) {
      case 'work':
        return <Briefcase size={14} />
      case 'interview':
        return <UserCheck size={14} />
      case 'casual':
        return <Coffee size={14} />
      case 'opinion':
        return <Lightbulb size={14} />
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-study-primary font-mono">
          CHỦ ĐỀ LUYỆN NÓI HÔM NAY
        </span>
        <span className="text-[11px] text-study-text-muted">
          4 kịch bản thực tế
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topics.map((topic) => {
          const isActive = topic.id === activeTopicId

          return (
            <button
              key={topic.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTopic(topic)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer select-none flex flex-col justify-between gap-2.5 ${
                isActive
                  ? 'bg-study-primary-soft/60 border-study-primary text-study-text shadow-xs ring-1 ring-study-primary/30'
                  : 'bg-study-surface border-study-border hover:border-study-primary-border/60 hover:bg-study-surface-muted/40 text-study-text-soft'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${
                    isActive
                      ? 'bg-study-primary text-white'
                      : 'bg-study-surface-muted text-study-text-muted'
                  }`}
                >
                  {getCategoryIcon(topic.category)}
                  <span>{topic.categoryLabel}</span>
                </span>

                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-study-surface border border-study-border/60 text-study-text-muted">
                  {topic.level}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-study-text line-clamp-2 leading-snug">
                {topic.title}
              </h4>
            </button>
          )
        })}
      </div>
    </div>
  )
}
