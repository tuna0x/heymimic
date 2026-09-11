import { BookOpen, CheckCircle2, RotateCcw, Search, Volume2, X, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMimicStore } from '../store/useMimicStore'
import { FlashCard } from '../components/vocab/FlashCard'
import { VocabList } from '../components/vocab/VocabList'
import { ContextCapture } from '../components/vocab/ContextCapture'
import { EmptyState } from '../components/shared/EmptyState'
import { SectionLabel } from '../components/shared/UI'
import { usePageMeta } from '../hook/usePageMeta'
import type { VocabStatus } from '../type'
import type { VocabWord } from '../type'
import { ApiErrorNotice } from '../components/shared/ApiErrorNotice'
import { describeApiError, type ApiFailure } from '../service/api'
import { vocabService } from '../service/vocabService'

type FilterTab = 'all' | VocabStatus

export function Vocab() {
  usePageMeta('Kho Từ Vựng — HeyMimic', 'Kho từ vựng cá nhân hóa bóc tách từ ngữ cảnh giao tiếp thực tế.')

  const [vocabWords, setVocabWords] = useState<VocabWord[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setFailure(null)
    vocabService
      .getVocabWords({}, controller.signal)
      .then((words) => {
        setVocabWords(words)
        setSelectedId((current) =>
          words.some((word) => word.id === current) ? current : (words[0]?.id ?? '')
        )
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [reloadKey])

  const filteredWords = useMemo(() => {
    return vocabWords.filter((word) => {
      const matchesQuery =
        !query ||
        `${word.word} ${word.meaning}`.toLowerCase().includes(query.toLowerCase())
      const matchesTab = activeTab === 'all' || word.status === activeTab
      return matchesQuery && matchesTab
    })
  }, [vocabWords, query, activeTab])

  // Guard selected word to ensure it's never undefined
  const currentWord = useMemo(() => {
    return (
      filteredWords.find((w) => w.id === selectedId) ??
      filteredWords[0] ??
      vocabWords[0]
    )
  }, [filteredWords, selectedId, vocabWords])

  const wordsDueCount = vocabWords.filter(
    (w) => w.status === 'reviewing' || w.status === 'new'
  ).length

  const collocationPairs = useMimicStore((state) => state.collocationPairs)
  const updateCollocationStatus = useMimicStore((state) => state.updateCollocationStatus)

  const [vocabSection, setVocabSection] = useState<'words' | 'collocations'>('words')
  const [collocCategory, setCollocCategory] = useState<'all' | 'work' | 'tech' | 'communication'>('all')

  const filteredCollocations = useMemo(() => {
    return collocationPairs.filter((c) => {
      if (collocCategory !== 'all' && c.category !== collocCategory) return false
      if (query) {
        return (
          c.fullChunk.toLowerCase().includes(query.toLowerCase()) ||
          c.translation.toLowerCase().includes(query.toLowerCase()) ||
          c.commonMistake.toLowerCase().includes(query.toLowerCase())
        )
      }
      return true
    })
  }, [collocationPairs, collocCategory, query])

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-study-border">
        <div>
          <SectionLabel>Kho ngữ liệu cá nhân</SectionLabel>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text tracking-tight mt-1">
            Từ vựng của bạn
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1 max-w-lg leading-relaxed">
            Học từ gắn liền với tình huống giao tiếp và tư duy theo khối ngữ liệu để nói bật ra trôi chảy.
          </p>
        </div>

        {/* CTA to start focused review */}
        <Link
          to="/vocab/review"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-all shadow-xs cursor-pointer shrink-0"
        >
          <RotateCcw size={14} />
          <span>Ôn {wordsDueCount} từ đến hạn ngay</span>
        </Link>
      </div>

      {loading && (
        <div role="status" className="rounded-2xl border border-study-border bg-study-surface p-5 text-xs text-study-text-muted">
          Đang tải kho từ vựng…
        </div>
      )}
      {failure && (
        <ApiErrorNotice failure={failure} onRetry={() => setReloadKey((value) => value + 1)} />
      )}

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-study-border pb-1">
        <button
          type="button"
          onClick={() => setVocabSection('words')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-1 ${
            vocabSection === 'words'
              ? 'border-study-primary text-study-primary bg-study-surface-muted/40'
              : 'border-transparent text-study-text-muted hover:text-study-text'
          }`}
        >
          Từ vựng đơn lẻ ({vocabWords.length})
        </button>

        <button
          type="button"
          onClick={() => setVocabSection('collocations')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-1 flex items-center gap-2 ${
            vocabSection === 'collocations'
              ? 'border-study-primary text-study-primary bg-study-surface-muted/40'
              : 'border-transparent text-study-text-muted hover:text-study-text'
          }`}
        >
          <span>Cụm từ tự nhiên (Collocations)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-study-accent-soft text-study-accent font-mono">
            {collocationPairs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Single Words View */}
      {vocabSection === 'words' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Words List Panel */}
            <section className="lg:col-span-7 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-study-text">Danh sách từ ({filteredWords.length})</span>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-study-text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Tìm từ hoặc nghĩa..."
                    aria-label="Tìm từ"
                    className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-study-text-muted hover:text-study-text cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 border-b border-study-border/60 pb-3 overflow-x-auto">
                {(
                  [
                    { id: 'all', label: 'Tất cả' },
                    { id: 'reviewing', label: 'Cần ôn' },
                    { id: 'new', label: 'Mới' },
                    { id: 'mastered', label: 'Đã thuộc' },
                  ] as const
                ).map((tab) => {
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                        active
                          ? 'bg-study-primary text-white font-semibold shadow-2xs'
                          : 'text-study-text-muted hover:text-study-text hover:bg-study-surface-hover'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* List or Empty State */}
              {filteredWords.length > 0 ? (
                <VocabList
                  words={filteredWords}
                  selectedWordId={currentWord?.id}
                  onSelectWord={setSelectedId}
                />
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="Không tìm thấy từ vựng nào"
                  description={
                    query
                      ? `Không có kết quả nào khớp với "${query}".`
                      : 'Chưa có từ nào trong danh mục này.'
                  }
                  actionLabel="Xóa bộ lọc"
                  onAction={() => {
                    setQuery('')
                    setActiveTab('all')
                  }}
                />
              )}
            </section>

            {/* Active FlashCard Panel */}
            <aside className="lg:col-span-5 bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs lg:sticky lg:top-24">
              <div className="mb-4">
                <span className="text-xs font-semibold text-study-text-muted">Chi tiết từ đang chọn</span>
              </div>
              {currentWord ? (
                <FlashCard word={currentWord} />
              ) : (
                <div className="text-center py-12 text-xs text-study-text-muted">
                  Chọn một từ bên trái để xem thẻ chi tiết
                </div>
              )}
            </aside>
          </div>

          {/* Context Capture Section */}
          <ContextCapture
            onWordsAdded={(savedWords) => {
              setVocabWords((current) => {
                const savedIds = new Set(savedWords.map((word) => word.id))
                return [...savedWords, ...current.filter((word) => !savedIds.has(word.id))]
              })
              setSelectedId(savedWords[0]?.id ?? '')
              setActiveTab('all')
            }}
          />
        </div>
      )}

      {/* Tab 2: Collocations View */}
      {vocabSection === 'collocations' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'work', label: 'Quản lý & Công việc' },
                  { id: 'communication', label: 'Giao tiếp & Thảo luận' },
                  { id: 'tech', label: 'Kỹ thuật & Dự án' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCollocCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    collocCategory === cat.id
                      ? 'bg-study-accent text-white'
                      : 'bg-study-surface-muted text-study-text-muted hover:text-study-text'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-study-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm cụm từ..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
              />
            </div>
          </div>

          {/* Collocations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCollocations.map((colloc) => (
              <div
                key={colloc.id}
                className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3.5 flex flex-col justify-between group hover:border-study-primary/40 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-study-surface-muted text-[10px] font-semibold text-study-text-muted border border-study-border">
                      {colloc.categoryLabel}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateCollocationStatus(
                          colloc.id,
                          colloc.status === 'mastered' ? 'learning' : 'mastered'
                        )
                      }
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border ${
                        colloc.status === 'mastered'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-study-surface-muted text-study-text-muted border-study-border hover:text-study-text'
                      }`}
                    >
                      {colloc.status === 'mastered' ? '✓ Đã thuộc' : 'Đang học'}
                    </button>
                  </div>

                  {/* Contrast: Don't say X, Say Y */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-study-surface-muted/40 border border-study-border font-mono text-xs">
                    <div className="text-rose-600 line-through opacity-80 flex items-center gap-1.5">
                      <XCircle size={13} className="shrink-0" />
                      <span>{colloc.commonMistake}</span>
                    </div>
                    <div className="text-emerald-600 font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="shrink-0" />
                        <span>{colloc.fullChunk}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                            window.speechSynthesis.cancel()
                            const utt = new SpeechSynthesisUtterance(colloc.fullChunk)
                            utt.lang = 'en-US'
                            utt.rate = 0.95
                            window.speechSynthesis.speak(utt)
                          }
                        }}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                        title="Nghe phát âm cụm từ này"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Context Example */}
                  <p className="text-xs text-study-text leading-relaxed font-mono">
                    “{colloc.contextExample}”
                  </p>

                  <p className="text-[11px] text-study-text-muted italic">
                    {colloc.translation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

