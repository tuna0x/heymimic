import { Check, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { useMimicStore } from '../../store/useMimicStore'
import type { VocabWord } from '../../type'

interface FlashCardProps {
  word: VocabWord
  mode?: 'preview' | 'review'
  onRate?: (rating: 'remembered' | 'needsReview') => void
}

export function FlashCard({ word, mode = 'preview', onRate }: FlashCardProps) {
  const flipped = useMimicStore((state) => state.isFlashcardFlipped)
  const flip = useMimicStore((state) => state.flipFlashcard)
  const [speaking, setSpeaking] = useState(false)
  const [speakError, setSpeakError] = useState(false)

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeakError(true)
      setTimeout(() => setSpeakError(false), 2000)
      return
    }

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => {
        setSpeaking(false)
        setSpeakError(true)
        setTimeout(() => setSpeakError(false), 2000)
      }
      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeakError(true)
      setTimeout(() => setSpeakError(false), 2000)
    }
  }

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Card Content Area */}
      <div className="bg-study-surface-muted/50 border border-study-border/80 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between transition-all">
        {!flipped ? (
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-study-text-muted">
              <span>Từ vựng</span>
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
                  onClick={speak}
                  className={`hover:scale-110 transition-transform cursor-pointer p-0.5 ${
                    speaking ? 'text-study-accent animate-pulse' : ''
                  }`}
                  aria-label="Nghe phát âm chuẩn"
                  title="Phát âm bằng giọng đọc thiết bị"
                >
                  {speakError ? <VolumeX size={14} className="text-rose-500" /> : <Volume2 size={14} />}
                </button>
              </div>
              {speakError && (
                <span className="block text-[10px] text-rose-500 mt-1">
                  Thiết bị không hỗ trợ âm thanh
                </span>
              )}
            </div>

            <p className="text-xs text-study-text-muted">
              Nhấn lật thẻ để xem định nghĩa, ví dụ câu và cách dùng tự nhiên.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-study-text-muted">
              <span>Ý nghĩa · {word.partOfSpeech || 'Từ loại'}</span>
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

      {/* Memory Status Action Buttons - Only when flipped in review or custom onRate */}
      {onRate && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            disabled={!flipped}
            onClick={() => onRate('needsReview')}
            className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !flipped
                ? 'opacity-40 cursor-not-allowed bg-study-surface border border-study-border text-study-text-muted'
                : 'bg-study-accent-soft hover:bg-study-accent/20 border border-study-accent/30 text-study-accent'
            }`}
          >
            <span>Cần ôn lại</span>
          </button>

          <button
            type="button"
            disabled={!flipped}
            onClick={() => onRate('remembered')}
            className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !flipped
                ? 'opacity-40 cursor-not-allowed bg-study-surface border border-study-border text-study-text-muted'
                : 'bg-study-success text-white hover:opacity-90 shadow-xs'
            }`}
          >
            <Check size={13} strokeWidth={2.5} />
            <span>Đã nhớ</span>
          </button>
        </div>
      )}
    </div>
  )
}

