import { Check, Sparkles, Volume2 } from 'lucide-react'
import { useState } from 'react'

interface RephraseItem {
  original: string
  native: string
  explanation: string
}

interface SentenceDiffCardProps {
  rephrases: RephraseItem[]
  onSpeak: (text: string) => void
  onPracticeSentence?: (sentence: string) => void
}

export function SentenceDiffCard({ rephrases, onSpeak, onPracticeSentence }: SentenceDiffCardProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  const handlePlay = (text: string, index: number) => {
    setPlayingIndex(index)
    onSpeak(text)
    // Clear playing indicator after a few seconds
    setTimeout(() => {
      setPlayingIndex(null)
    }, 3500)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-study-primary">
          Đối chiếu câu nói & gợi ý tự nhiên
        </span>
        <span className="text-[11px] text-study-text-muted">
          Bấm loa để nghe mẫu phát âm
        </span>
      </div>

      <div className="space-y-3">
        {rephrases.map((item, idx) => {
          const isPlaying = playingIndex === idx

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3.5 hover:border-study-primary-border/60 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before: Hesitant version */}
                <div className="p-3.5 rounded-xl bg-study-surface-muted/50 border border-study-border/60 space-y-1.5">
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    Cách nói khi còn ngập ngừng
                  </span>
                  <p className="text-xs text-study-text-muted italic line-through leading-relaxed">
                    “{item.original}”
                  </p>
                </div>

                {/* After: Native recommendation */}
                <div className="p-3.5 rounded-xl bg-study-primary-soft/40 border border-study-primary-border/60 space-y-1.5 relative">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-study-primary flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>Cách nói tự nhiên hơn</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlay(item.native, idx)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-study-primary text-white scale-105'
                            : 'bg-study-surface border border-study-primary-border/60 text-study-primary hover:bg-study-primary hover:text-white'
                        }`}
                        title="Nghe giọng bản xứ phát âm câu này"
                      >
                        <Volume2 size={13} className={isPlaying ? 'animate-pulse' : ''} />
                        <span>{isPlaying ? 'Đang phát...' : 'Nghe mẫu'}</span>
                      </button>

                      {onPracticeSentence && (
                        <button
                          type="button"
                          onClick={() => onPracticeSentence(item.native)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-study-accent-soft text-study-accent hover:bg-study-accent hover:text-white transition-colors cursor-pointer"
                          title="Thu âm thử câu này"
                        >
                          Luyện câu này
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-medium text-study-text leading-relaxed">
                    “{item.native}”
                  </p>
                </div>
              </div>


              {/* Pedagogy explanation */}
              <div className="flex items-start gap-2 text-xs text-study-text-soft pt-1 border-t border-study-border/40">
                <span className="w-4 h-4 rounded-full bg-study-primary-soft text-study-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={10} strokeWidth={3} />
                </span>
                <p className="text-[11px] text-study-text-muted leading-relaxed">
                  <strong className="text-study-text font-semibold">Tại sao tự nhiên hơn: </strong>
                  {item.explanation}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
