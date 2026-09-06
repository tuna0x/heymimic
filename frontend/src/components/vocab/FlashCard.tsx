import { Check, RotateCcw, Volume2 } from 'lucide-react'
import { useMimicStore } from '../../store/useMimicStore'
import type { VocabWord } from '../../type'

export function FlashCard({ word }: { word: VocabWord }) {
  const flipped = useMimicStore((state) => state.isFlashcardFlipped)
  const flip = useMimicStore((state) => state.flipFlashcard)
  const markWord = useMimicStore((state) => state.markWord)
  const remembered = useMimicStore((state) => state.rememberedWords.includes(word.id))

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Card Content Area */}
      <div className="bg-study-surface-muted/50 border border-study-border/80 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between transition-all">
        {!flipped ? (
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-study-text-muted">
              <span>TỪ VỰNG HÔM NAY</span>
              <span className="text-study-primary font-bold">●</span>
            </div>

            <div className="my-6">
              <div className="text-3xl font-display font-bold text-study-text tracking-tight mb-2">
                {word.word}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-study-primary-soft/80 border border-study-primary-border/60 text-xs font-mono font-medium text-study-primary">
                <span>{word.pronunciation}</span>
                <button
                  type="button"
                  className="hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Nghe phát âm"
                >
                  <Volume2 size={14} />
                </button>
              </div>
            </div>

            <p className="text-xs text-study-text-muted">
              Nhấn lật thẻ để xem định nghĩa, ví dụ câu và cách dùng tự nhiên.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-study-text-muted">
              <span>Ý NGHĨA · {word.partOfSpeech?.toUpperCase() || 'TỪ LOẠI'}</span>
              <span className="text-study-accent font-bold">●</span>
            </div>

            <div className="my-4">
              <div className="text-xl font-display font-semibold text-study-text mb-3">
                {word.meaning}
              </div>
              <div className="p-3 rounded-xl bg-study-surface border border-study-border text-xs text-study-text-soft italic leading-relaxed">
                “{word.example}”
              </div>
              <p className="text-xs text-study-text-muted mt-2">
                {word.translation}
              </p>
            </div>
          </div>
        )}

        {/* Flip toggle button */}
        <button
          type="button"
          onClick={flip}
          className="w-full mt-4 py-2.5 rounded-xl border border-study-border hover:border-study-primary/40 bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw size={13} className="text-study-text-muted" />
          <span>{flipped ? 'Xem lại từ gốc' : 'Lật thẻ xem nghĩa'}</span>
        </button>
      </div>

      {/* Memory Status Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          onClick={() => markWord(word.id, true)}
          className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            remembered
              ? 'bg-study-success text-white shadow-xs'
              : 'bg-study-surface hover:bg-study-surface-hover border border-study-border text-study-text-soft'
          }`}
        >
          <Check size={13} strokeWidth={2.5} />
          <span>Nhớ rồi</span>
        </button>

        <button
          type="button"
          onClick={() => markWord(word.id, false)}
          className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            !remembered
              ? 'bg-study-accent text-white shadow-xs'
              : 'bg-study-surface hover:bg-study-surface-hover border border-study-border text-study-text-soft'
          }`}
        >
          <span>Chưa nhớ</span>
          <span className="text-xs">↗</span>
        </button>
      </div>
    </div>
  )
}
