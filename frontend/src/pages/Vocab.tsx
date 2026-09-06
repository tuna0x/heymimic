import { Plus, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { todayWords, extractedWords } from '../mocks/vocab'
import { useMimicStore } from '../store/useMimicStore'
import { FlashCard } from '../components/vocab/FlashCard'
import { VocabList } from '../components/vocab/VocabList'
import { SectionLabel, StatusPill } from '../components/shared/UI'

export function Vocab() {
  const [query, setQuery] = useState('')
  const [context, setContext] = useState('')
  const [showExtracted, setShowExtracted] = useState(false)
  const selectedId = useMimicStore((state) => state.selectedWordId)
  const selectedWord = todayWords.find((word) => word.id === selectedId) ?? todayWords[0]
  const filteredWords = useMemo(
    () => todayWords.filter((word) => `${word.word} ${word.meaning}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  )

  return (
    <div className="space-y-8">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <SectionLabel>HÔM NAY · 6 TỪ VỰNG</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight mt-1">
            Học từ mới<span className="text-study-primary">.</span>
          </h1>
          <p className="text-sm text-study-text-muted mt-1.5 max-w-md leading-relaxed">
            Những từ xuất hiện trong ngữ cảnh bạn vừa luyện nói hoặc thảo luận gần đây.
          </p>
        </div>
        <StatusPill tone="calm">42% BUỔI HỌC HOÀN THÀNH</StatusPill>
      </div>

      {/* Main Vocab Grid: Words List on Left, Active Flashcard on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Words List Panel */}
        <section className="lg:col-span-7 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <SectionLabel>BỘ TỪ CỦA BẠN</SectionLabel>
              <h2 className="text-lg font-display font-semibold text-study-text mt-0.5">
                Danh sách hôm nay
              </h2>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-study-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm từ hoặc nghĩa..."
                aria-label="Tìm từ"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
              />
            </div>
          </div>

          <VocabList words={filteredWords} />
        </section>

        {/* Active FlashCard Panel */}
        <aside className="lg:col-span-5 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs lg:sticky lg:top-24">
          <div className="mb-4">
            <SectionLabel>THẺ TỪ ĐANG CHỌN</SectionLabel>
          </div>
          <FlashCard word={selectedWord} />
        </aside>
      </div>

      {/* Vocab Agent Context Capture */}
      <section className="bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs">
        <div className="flex items-start gap-3.5 mb-5">
          <span className="w-9 h-9 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </span>
          <div>
            <SectionLabel>VOCAB AGENT · BÓC TÁCH NGỮ CẢNH</SectionLabel>
            <h2 className="text-lg font-display font-semibold text-study-text mt-0.5">
              Thêm từ từ tài liệu bạn đọc hàng ngày
            </h2>
            <p className="text-xs text-study-text-muted mt-1 leading-relaxed max-w-xl">
              Dán một đoạn văn tiếng Anh bạn vừa đọc, bài báo hoặc email công việc. Mimic sẽ phân tích và gợi ý những từ vựng đắt giá nhất.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Dán câu hoặc đoạn văn bạn quan tâm vào đây..."
            rows={3}
            className="w-full rounded-xl bg-study-surface-muted/60 border border-study-border p-3.5 text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors resize-none leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowExtracted(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-study-primary text-white font-medium text-xs hover:bg-study-primary-hover transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>Bóc tách từ vựng</span>
            </button>
          </div>
        </div>

        {/* Extracted results popup/drawer */}
        {showExtracted && (
          <div className="mt-5 pt-5 border-t border-study-border">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-study-primary">
                <span className="w-2 h-2 rounded-full bg-study-primary animate-ping" />
                <span>Tìm thấy 3 từ vựng hữu ích</span>
              </span>
              <button
                type="button"
                onClick={() => setShowExtracted(false)}
                className="text-xs text-study-text-muted hover:text-study-text"
              >
                Thu gọn
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {extractedWords.map((item) => (
                <div
                  key={item.word}
                  className="p-3 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs"
                >
                  <strong className="block font-semibold text-study-text text-sm">
                    {item.word}
                  </strong>
                  <span className="block text-study-primary font-medium mt-0.5">
                    {item.meaning}
                  </span>
                  <small className="block text-study-text-muted mt-1.5 italic">
                    “{item.context}”
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
