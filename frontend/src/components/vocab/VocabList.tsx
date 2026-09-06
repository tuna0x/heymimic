import { Check, Circle, RotateCcw } from 'lucide-react'
import { useMimicStore } from '../../store/useMimicStore'
import type { VocabWord } from '../../type'
import { ProgressBar } from '../shared/UI'

function statusLabel(status: VocabWord['status']) {
  return status === 'new' ? 'MỚI' : status === 'reviewing' ? 'ĐANG ÔN' : 'ĐÃ THUỘC'
}

export function VocabList({ words }: { words: VocabWord[] }) {
  const selected = useMimicStore((state) => state.selectedWordId)
  const selectWord = useMimicStore((state) => state.selectWord)

  return (
    <div className="space-y-1.5">
      {words.map((word, index) => {
        const isSelected = selected === word.id
        return (
          <button
            key={word.id}
            type="button"
            onClick={() => selectWord(word.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border cursor-pointer ${
              isSelected
                ? 'bg-study-primary-soft/60 border-study-primary-border shadow-xs'
                : 'bg-transparent border-transparent hover:bg-study-surface-hover hover:border-study-border/60'
            }`}
          >
            {/* Color Accent Pill */}
            <span
              className={`w-1.5 h-6 rounded-full shrink-0 ${
                word.status === 'mastered'
                  ? 'bg-study-success'
                  : word.status === 'reviewing'
                  ? 'bg-study-accent'
                  : 'bg-study-text-faint'
              }`}
            />

            {/* Index */}
            <span className="text-xs font-mono font-medium text-study-text-muted w-5 shrink-0">
              0{index + 1}
            </span>

            {/* Word & Brief Meaning */}
            <div className="flex-1 min-w-0 pr-2">
              <strong className="block text-sm font-semibold text-study-text truncate">
                {word.word}
              </strong>
              <span className="block text-xs text-study-text-muted truncate">
                {word.meaning}
              </span>
            </div>

            {/* Mastery percentage & bar */}
            <div className="hidden sm:flex flex-col items-end gap-1 w-20 shrink-0">
              <ProgressBar
                value={word.mastery}
                tone={word.status === 'mastered' ? 'calm' : 'signal'}
              />
              <span className="text-[10px] font-mono font-medium text-study-text-muted tabular-nums">
                {word.mastery}%
              </span>
            </div>

            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shrink-0 border ${
                word.status === 'mastered'
                  ? 'bg-study-success-soft text-study-success border-study-success/20'
                  : word.status === 'reviewing'
                  ? 'bg-study-accent-soft text-study-accent border-study-accent/25'
                  : 'bg-study-surface-muted text-study-text-muted border-study-border'
              }`}
            >
              {word.status === 'mastered' ? (
                <Check size={11} strokeWidth={2.5} />
              ) : word.status === 'reviewing' ? (
                <RotateCcw size={10} strokeWidth={2.5} />
              ) : (
                <Circle size={6} fill="currentColor" />
              )}
              <span>{statusLabel(word.status)}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
