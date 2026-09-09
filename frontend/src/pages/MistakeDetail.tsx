import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Mic2,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react'
import { ROUTES } from '../route/routePaths'
import { EmptyState } from '../components/shared/EmptyState'
import { ApiErrorNotice } from '../components/shared/ApiErrorNotice'
import { usePageMeta } from '../hook/usePageMeta'
import type { MistakeOccurrence, MistakePattern } from '../type'
import { describeApiError, type ApiFailure } from '../service/api'
import { progressService } from '../service/progressService'

export function MistakeDetail() {
  const { mistakeId } = useParams<{ mistakeId: string }>()
  const navigate = useNavigate()
  const [pattern, setPattern] = useState<MistakePattern | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [updating, setUpdating] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!mistakeId) {
      setLoadState('ready')
      return
    }
    const controller = new AbortController()
    setLoadState('loading')
    setFailure(null)
    progressService
      .getMistake(mistakeId, controller.signal)
      .then((value) => {
        setPattern(value)
        setLoadState('ready')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
        setLoadState('error')
      })
    return () => controller.abort()
  }, [mistakeId, reloadKey])

  usePageMeta(
    pattern ? `Điểm cần luyện: ${pattern.title} — HeyMimic` : 'Chi Tiết Điểm Cần Luyện — HeyMimic',
    'Hướng dẫn sửa lỗi ngữ pháp, cách dùng từ và mẫu câu tự nhiên trong tiếng Anh giao tiếp.'
  )

  // Interactive Mini Practice State
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasSubmittedPractice, setHasSubmittedPractice] = useState(false)

  if (loadState === 'loading') {
    return (
      <div
        role="status"
        className="mx-auto max-w-4xl rounded-2xl border border-study-border bg-study-surface p-6 text-sm text-study-text-muted"
      >
        Đang tải chi tiết điểm cần luyện…
      </div>
    )
  }

  if (loadState === 'error' && failure) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <ApiErrorNotice failure={failure} onRetry={() => setReloadKey((value) => value + 1)} />
      </div>
    )
  }

  if (!pattern) {
    return (
      <div className="max-w-md mx-auto py-16 text-left">
        <EmptyState
          icon={HelpCircle}
          title="Không tìm thấy mẫu lỗi"
          description="Không tìm thấy thông tin của điểm luyện tập này. Danh mục có thể đã được cập nhật."
          actionLabel="Về sổ tay lỗi"
          onAction={() => navigate(ROUTES.PROGRESS)}
        />
      </div>
    )
  }

  const categoryLabels: Record<MistakePattern['category'], string> = {
    grammar: 'Ngữ pháp',
    vocabulary: 'Dùng từ',
    expression: 'Diễn đạt',
    pronunciation: 'Phát âm',
  }

  const statusLabels: Record<MistakePattern['status'], { label: string; color: string }> = {
    needsPractice: { label: 'Cần luyện', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    improving: { label: 'Đang cải thiện', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    mastered: { label: 'Đã làm chủ', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  }

  const primaryOccurrence = pattern.occurrences?.[0]
  const originalSentence = primaryOccurrence?.original ?? pattern.exampleSentence ?? 'I am agree with that point.'
  const correctedSentence = primaryOccurrence?.suggested ?? 'I agree with that point.'
  const totalCount = pattern.count ?? pattern.occurrences?.length ?? 1

  // Generate mini-practice options dynamically based on pattern
  const practiceOptions = [
    { text: correctedSentence, isCorrect: true },
    { text: originalSentence, isCorrect: false },
    {
      text: originalSentence.replace('will', 'is going to').replace('have', 'had'),
      isCorrect: false,
    },
  ].sort((a, b) => a.text.localeCompare(b.text))

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    } catch {
      // Ignore audio synthesis errors
    }
  }

  const updateStatus = async (status: MistakePattern['status']) => {
    setUpdating(true)
    setFailure(null)
    try {
      setPattern(await progressService.updateMistakeStatus(pattern, status))
    } catch (error) {
      setFailure(describeApiError(error))
    } finally {
      setUpdating(false)
    }
  }

  const handlePracticeSubmit = () => {
    if (selectedOption === null) return
    setHasSubmittedPractice(true)
    const isCorrect = practiceOptions[selectedOption]?.isCorrect
    if (isCorrect && pattern.status === 'needsPractice') {
      void updateStatus('improving')
    }
  }

  const isCurrentSelectionCorrect =
    selectedOption !== null && practiceOptions[selectedOption]?.isCorrect

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-left animate-fade-in">
      {/* Back Button */}
      <div>
        <Link
          to={ROUTES.PROGRESS}
          className="inline-flex items-center gap-1.5 text-xs text-study-text-muted hover:text-study-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại tiến độ & sổ tay lỗi</span>
        </Link>
      </div>

      {failure && <ApiErrorNotice failure={failure} />}

      {/* Main Header Card */}
      <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-study-surface-muted text-xs font-semibold text-study-text-muted border border-study-border">
              {categoryLabels[pattern.category]}
            </span>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusLabels[pattern.status].color}`}
            >
              {statusLabels[pattern.status].label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {pattern.status !== 'mastered' ? (
              <button
                type="button"
                disabled={updating}
                onClick={() => void updateStatus('mastered')}
                className="px-3 py-1.5 rounded-lg border border-study-border text-xs font-semibold text-study-text hover:bg-study-surface-hover transition-colors cursor-pointer"
              >
                Đánh dấu đã làm chủ
              </button>
            ) : (
              <button
                type="button"
                disabled={updating}
                onClick={() => void updateStatus('improving')}
                className="px-3 py-1.5 rounded-lg border border-study-border text-xs font-semibold text-study-text hover:bg-study-surface-hover transition-colors cursor-pointer"
              >
                Đưa về đang luyện
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(ROUTES.SPEAKING)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors cursor-pointer"
            >
              <Mic2 size={13} />
              <span>Luyện trong bài nói</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            {pattern.title}
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-2 leading-relaxed">
            Đã xuất hiện <strong>{totalCount} lần</strong> trong các bài luyện nói của bạn.
          </p>
        </div>
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Sentence */}
        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
              <XCircle size={14} />
              <span>Cách nói thường gặp</span>
            </span>
          </div>
          <p className="text-sm font-medium text-study-text leading-relaxed font-mono">
            “{originalSentence}”
          </p>
        </div>

        {/* Corrected Sentence */}
        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Cách nói tự nhiên hơn</span>
            </span>
            <button
              type="button"
              onClick={() => handleSpeak(correctedSentence)}
              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
              title="Nghe phát âm mẫu"
            >
              <Volume2 size={15} />
            </button>
          </div>
          <p className="text-sm font-medium text-study-text leading-relaxed font-mono">
            “{correctedSentence}”
          </p>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-study-primary">
          <Lightbulb size={16} />
          <span>Tại sao nên điều chỉnh điểm này?</span>
        </div>
        <p className="text-xs sm:text-sm text-study-text leading-relaxed">
          {pattern.explanation}
        </p>
        <p className="text-xs text-study-text-muted leading-relaxed pt-1">
          Trong giao tiếp công việc và phỏng vấn quốc tế, việc dùng chuẩn các mốc thời gian và cụm từ nối thể hiện sự tư duy mạch lạc và phong thái chuyên nghiệp.
        </p>
      </div>

      {/* Interactive 1-Sentence Mini Practice */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-study-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Bài tập củng cố 1 câu</span>
          </span>
          <span className="text-[10px] font-medium text-study-text-muted bg-study-surface-muted px-2 py-0.5 rounded border border-study-border">
            Tự kiểm tra
          </span>
        </div>

        <p className="text-xs sm:text-sm text-study-text">
          Chọn phương án diễn đạt chuẩn ngữ cảnh nhất dưới đây:
        </p>

        <div className="space-y-2">
          {practiceOptions.map((opt, idx) => {
            const isSelected = selectedOption === idx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedOption(idx)
                  setHasSubmittedPractice(false)
                }}
                className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer font-mono flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-study-primary bg-study-primary-soft/40 text-study-text'
                    : 'border-study-border bg-study-surface hover:bg-study-surface-hover text-study-text'
                }`}
              >
                <span>“{opt.text}”</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'border-study-primary bg-study-primary text-white'
                      : 'border-study-border'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </button>
            )
          })}
        </div>

        {hasSubmittedPractice && (
          <div
            className={`p-4 rounded-xl text-xs space-y-1 ${
              isCurrentSelectionCorrect
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              {isCurrentSelectionCorrect ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Chính xác! Bạn đã chọn đúng mẫu câu tự nhiên.</span>
                </>
              ) : (
                <>
                  <XCircle size={15} />
                  <span>Chưa chính xác. Hãy để ý thì và mốc thời gian của câu.</span>
                </>
              )}
            </div>
            {isCurrentSelectionCorrect && (
              <p className="opacity-90">
                Mẫu câu này đã được chuyển trạng thái sang "Đang cải thiện" trong sổ tay của bạn.
              </p>
            )}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={selectedOption === null}
            onClick={handlePracticeSubmit}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedOption === null
                ? 'bg-study-surface-muted text-study-text-muted cursor-not-allowed border border-study-border'
                : 'bg-study-primary text-white hover:bg-study-primary-hover shadow-xs'
            }`}
          >
            Kiểm tra đáp án
          </button>
        </div>
      </div>

      {/* Occurrences list if available */}
      {pattern.occurrences && pattern.occurrences.length > 0 && (
        <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-study-text">
            Lịch sử xuất hiện trong các bài luyện nói ({pattern.occurrences.length} lần)
          </h3>
          <div className="space-y-2">
            {pattern.occurrences.map((occ: MistakeOccurrence) => (
              <div
                key={occ.id}
                className="p-3 rounded-xl bg-study-surface-muted/30 border border-study-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-study-text block">{occ.sessionTitle}</span>
                  <span className="text-study-text-muted font-mono text-[11px]">{occ.occurredAt}</span>
                </div>
                {occ.speakingSessionId && (
                  <Link
                    to={`/speaking/history/${occ.speakingSessionId}`}
                    className="text-study-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Xem bài nói</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA to Speaking */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-display font-semibold text-study-text">
            Sẵn sàng áp dụng vào bài nói thực tế?
          </h3>
          <p className="text-xs text-study-text-muted mt-0.5">
            Phòng luyện nói sẽ lưu ý điểm này khi cung cấp phản hồi cho bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.SPEAKING)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <Mic2 size={15} />
          <span>Vào phòng luyện nói</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
