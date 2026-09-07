import { useState } from 'react'
import { Check, Copy, Sparkles, Plus, AlertCircle } from 'lucide-react'
import { useMimicStore } from '../../store/useMimicStore'
import type { ContextSuggestion } from '../../type'

const SAMPLE_TEXT =
  "During the sprint standup, we had to articulate the unexpected nuances of the new payment flow. The team was remarkably resilient and managed to resolve the edge-case errors without any major blockers."

const MOCK_SUGGESTIONS: Array<Omit<ContextSuggestion, 'selected'>> = [
  {
    id: 'sug-1',
    word: 'articulate',
    meaning: 'diễn đạt rõ ràng, gãy gọn',
    sourceSentence: 'We had to articulate the unexpected nuances...',
  },
  {
    id: 'sug-2',
    word: 'nuance',
    meaning: 'sắc thái tinh tế, chi tiết nhỏ',
    sourceSentence: '...the unexpected nuances of the new payment flow.',
  },
  {
    id: 'sug-3',
    word: 'resilient',
    meaning: 'kiên cường, có khả năng thích ứng nhanh',
    sourceSentence: 'The team was remarkably resilient...',
  },
  {
    id: 'sug-4',
    word: 'standup',
    meaning: 'cuộc họp ngắn đầu ngày trong mô hình Agile',
    sourceSentence: 'During the sprint standup, we had to...',
  },
]

export function ContextCapture({ onWordsAdded }: { onWordsAdded?: () => void }) {
  const vocabWords = useMimicStore((state) => state.vocabWords)
  const addCustomWords = useMimicStore((state) => state.addCustomWords)

  const [text, setText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<ContextSuggestion[]>([])
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleFillSample = () => {
    setText(SAMPLE_TEXT)
    setError('')
  }

  const handleAnalyze = () => {
    if (!text.trim()) {
      setError('Vui lòng dán hoặc nhập một đoạn văn bản tiếng Anh.')
      return
    }
    if (text.length > 5000) {
      setError('Đoạn văn vượt quá giới hạn 5.000 ký tự.')
      return
    }

    setError('')
    setAnalyzing(true)
    setSavedSuccess(false)

    // Simulate extraction latency
    setTimeout(() => {
      // Check existing words
      const existingWordSet = new Set(vocabWords.map((w) => w.word.toLowerCase()))
      const mapped: ContextSuggestion[] = MOCK_SUGGESTIONS.map((item) => ({
        ...item,
        existingWordId: existingWordSet.has(item.word.toLowerCase()) ? item.word : undefined,
        selected: !existingWordSet.has(item.word.toLowerCase()), // auto select new words
      }))

      setSuggestions(mapped)
      setAnalyzing(false)
    }, 450)
  }

  const toggleSelect = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
  }

  const handleSaveSelected = () => {
    const toAdd = suggestions.filter((s) => s.selected && !s.existingWordId)
    if (toAdd.length === 0) return

    addCustomWords(
      toAdd.map((s) => ({
        word: s.word,
        pronunciation: '/.../',
        meaning: s.meaning,
        partOfSpeech: 'từ vựng',
        example: s.sourceSentence,
        translation: s.meaning,
        sourceContext: text.slice(0, 120) + '...',
      }))
    )

    setSavedSuccess(true)
    setSuggestions([])
    setText('')
    onWordsAdded?.()
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const selectedCount = suggestions.filter((s) => s.selected && !s.existingWordId).length

  return (
    <div className="rounded-2xl border border-study-border bg-study-surface p-6 shadow-xs space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-study-primary" />
            <h3 className="text-base font-display font-semibold text-study-text">
              Thêm từ từ ngữ cảnh của bạn
            </h3>
          </div>
          <p className="text-xs text-study-text-muted mt-1">
            Dán email công việc, bài báo hoặc đoạn chat để hệ thống gợi ý các từ cốt lõi nên học.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillSample}
          className="text-xs text-study-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Copy size={13} />
          <span>Dùng đoạn văn mẫu</span>
        </button>
      </div>

      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (error) setError('')
          }}
          placeholder="Dán đoạn văn tiếng Anh vào đây (tối đa 5.000 ký tự)..."
          rows={3}
          maxLength={5000}
          className="w-full p-3.5 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between text-[11px] text-study-text-muted">
          <span>{text.length} / 5.000 ký tự</span>
          <button
            type="button"
            disabled={analyzing || !text.trim()}
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover disabled:opacity-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>{analyzing ? 'Đang trích xuất...' : 'Xem từ gợi ý (Demo)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-study-success-soft border border-study-success/20 text-xs text-study-success flex items-center gap-2 animate-fade-in">
          <Check size={15} />
          <span>Đã lưu các từ mới vào kho từ vựng cá nhân thành công!</span>
        </div>
      )}

      {/* Extracted Suggestions List */}
      {suggestions.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-study-border/80 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-study-text">
              Tìm thấy {suggestions.length} từ tiềm năng trong ngữ cảnh:
            </span>
            <span className="text-study-text-muted text-[11px]">
              (Dữ liệu gợi ý minh họa mẫu)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestions.map((sug) => {
              const isExisting = !!sug.existingWordId
              return (
                <div
                  key={sug.id}
                  onClick={() => !isExisting && toggleSelect(sug.id)}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                    isExisting
                      ? 'bg-study-surface-muted/40 border-study-border opacity-70 cursor-not-allowed'
                      : sug.selected
                      ? 'bg-study-primary-soft/40 border-study-primary/50 cursor-pointer shadow-2xs'
                      : 'bg-study-surface border-study-border hover:bg-study-surface-muted/40 cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={isExisting}
                    checked={sug.selected && !isExisting}
                    onChange={() => !isExisting && toggleSelect(sug.id)}
                    className="mt-0.5 rounded border-study-border text-study-primary accent-study-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-study-text font-semibold font-mono">
                        {sug.word}
                      </strong>
                      {isExisting && (
                        <span className="text-[10px] text-study-text-muted bg-study-surface-muted px-1.5 py-0.5 rounded">
                          Đã có
                        </span>
                      )}
                    </div>
                    <p className="text-study-text-muted text-[11px] mt-0.5">{sug.meaning}</p>
                    <p className="text-[10px] text-study-text-soft italic mt-1 line-clamp-1">
                      “{sug.sourceSentence}”
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSuggestions([])}
              className="px-3 py-1.5 rounded-lg text-xs text-study-text-muted hover:text-study-text"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleSaveSelected}
              className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm {selectedCount} từ đã chọn vào kho</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
