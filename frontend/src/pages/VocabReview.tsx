import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Mic2, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'
import { ProgressBar } from '../components/shared/UI'

export function VocabReview() {
  usePageMeta('Phiên Ôn Tập Từ Vựng — HeyMimic', 'Luyện phản xạ và ghi nhớ từ vựng qua lặp lại ngắt quãng.')
  const navigate = useNavigate()

  const vocabWords = useMimicStore((state) => state.vocabWords)
  const activeReviewSession = useMimicStore((state) => state.activeReviewSession)
  const activeStudySession = useMimicStore((state) => state.activeStudySession)
  const startReviewSession = useMimicStore((state) => state.startReviewSession)
  const rateCurrentWord = useMimicStore((state) => state.rateCurrentWord)
  const undoLastReview = useMimicStore((state) => state.undoLastReview)
  const finishReviewSession = useMimicStore((state) => state.finishReviewSession)

  const [flipped, setFlipped] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [speakError, setSpeakError] = useState(false)

  // Initialize or resume review session
  useEffect(() => {
    if (!activeReviewSession || activeReviewSession.status !== 'inProgress') {
      // Pick words due for review or first 6 words
      const wordsToReview = vocabWords.slice(0, 6).map((w) => w.id)
      startReviewSession(wordsToReview)
    }
  }, [])

  const currentWordId = useMemo(() => {
    if (!activeReviewSession) return null
    return activeReviewSession.wordIds[activeReviewSession.currentIndex] ?? null
  }, [activeReviewSession])

  const currentWord = useMemo(() => {
    if (!currentWordId) return null
    return vocabWords.find((w) => w.id === currentWordId) ?? null
  }, [currentWordId, vocabWords])

  const isCompleted = activeReviewSession?.status === 'completed' || !currentWord

  const totalWords = activeReviewSession?.wordIds.length ?? 0
  const currentIndex = activeReviewSession?.currentIndex ?? 0
  const progressPercent = totalWords > 0 ? (currentIndex / totalWords) * 100 : 0

  const reviews = activeReviewSession?.reviews ?? []
  const rememberedCount = reviews.filter((r) => r.rating === 'remembered').length
  const needsReviewCount = reviews.filter((r) => r.rating === 'needsReview').length

  const needsReviewWords = useMemo(() => {
    const ids = reviews.filter((r) => r.rating === 'needsReview').map((r) => r.wordId)
    return vocabWords.filter((w) => ids.includes(w.id))
  }, [reviews, vocabWords])

  const speak = () => {
    if (!currentWord) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeakError(true)
      setTimeout(() => setSpeakError(false), 2000)
      return
    }

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
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

  const handleRate = (rating: 'remembered' | 'needsReview') => {
    if (!flipped) return
    rateCurrentWord(rating)
    setFlipped(false)
  }

  const handleUndo = () => {
    undoLastReview()
    setFlipped(true)
  }

  const handleProceedToSpeaking = () => {
    navigate('/speaking')
  }

  const handleFinishStudySession = () => {
    if (activeStudySession) {
      navigate(`/session/${activeStudySession.id}/summary`)
    } else {
      navigate('/dashboard')
    }
  }

  if (isCompleted) {
    /* V03: Vocab Review Summary */
    return (
      <div className="max-w-xl mx-auto py-8 text-left space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-study-success-soft text-study-success flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Đã hoàn thành lượt ôn tập!
          </h1>
          <p className="text-xs text-study-text-muted max-w-sm mx-auto leading-relaxed">
            Bạn đã duyệt qua toàn bộ {totalWords} từ trong phiên hôm nay.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs text-center">
          <div>
            <span className="text-2xl font-bold font-display text-study-text tabular-nums block">
              {totalWords}
            </span>
            <span className="text-[11px] text-study-text-muted">Tổng từ</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-study-success tabular-nums block">
              {rememberedCount}
            </span>
            <span className="text-[11px] text-study-text-muted">Đã nhớ</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-study-accent tabular-nums block">
              {needsReviewCount}
            </span>
            <span className="text-[11px] text-study-text-muted">Cần gặp lại</span>
          </div>
        </div>

        {/* Needs Review Words List */}
        {needsReviewWords.length > 0 && (
          <div className="p-4 rounded-2xl bg-study-surface-muted/50 border border-study-border space-y-3">
            <span className="text-xs font-semibold text-study-text block">
              Các từ cần chú ý luyện thêm:
            </span>
            <div className="space-y-2">
              {needsReviewWords.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-study-surface border border-study-border flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-study-text font-semibold mr-2 font-mono">
                      {w.word}
                    </strong>
                    <span className="text-study-text-muted">{w.meaning}</span>
                  </div>
                  <span className="text-[10px] text-study-accent font-medium px-2 py-0.5 rounded-md bg-study-accent-soft">
                    Ưu tiên ôn lại
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Choice Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleProceedToSpeaking}
            className="w-full py-3 px-4 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Mic2 size={16} />
            <span>Dùng các từ này để luyện nói ngay</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={handleFinishStudySession}
            className="w-full py-2.5 px-4 rounded-xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text transition-colors cursor-pointer"
          >
            Hoàn thành buổi học hôm nay
          </button>

          <div className="text-center pt-2">
            <Link
              to="/vocab"
              className="text-xs text-study-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Quay về kho từ vựng</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* V02: Active Card Review Mode */
  return (
    <div className="max-w-xl mx-auto py-4 text-left space-y-6 animate-fade-in">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/vocab')}
          className="inline-flex items-center gap-1.5 text-xs text-study-text-muted hover:text-study-text cursor-pointer"
        >
          <X size={15} />
          <span>Thoát phiên</span>
        </button>

        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between text-xs text-study-text-muted mb-1 font-mono">
            <span>Tiến độ</span>
            <span>
              {currentIndex + 1} / {totalWords}
            </span>
          </div>
          <ProgressBar value={progressPercent} tone="calm" />
        </div>

        {reviews.length > 0 ? (
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-1 text-xs text-study-primary hover:underline cursor-pointer"
            title="Hoàn tác lượt trước"
          >
            <RotateCcw size={13} />
            <span>Hoàn tác</span>
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* Main Flashcard Frame */}
      {currentWord && (
        <div className="bg-study-surface border border-study-border rounded-3xl p-6 sm:p-8 shadow-sm min-h-[340px] flex flex-col justify-between transition-all">
          {!flipped ? (
            /* Front of the card: Word & Pronunciation */
            <div className="space-y-6 my-auto text-center py-4">
              <span className="text-[11px] font-semibold text-study-primary uppercase tracking-wider block">
                Từ thứ {currentIndex + 1}
              </span>

              <div className="space-y-2">
                <h2 className="text-4xl font-display font-bold text-study-text tracking-tight">
                  {currentWord.word}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-study-primary-soft/80 border border-study-primary-border/60 text-xs font-mono font-medium text-study-primary">
                  <span>{currentWord.pronunciation}</span>
                  <button
                    type="button"
                    onClick={speak}
                    className={`hover:scale-110 transition-transform cursor-pointer p-0.5 ${
                      speaking ? 'text-study-accent animate-pulse' : ''
                    }`}
                    aria-label="Nghe phát âm chuẩn"
                  >
                    {speakError ? <VolumeX size={14} className="text-rose-500" /> : <Volume2 size={14} />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-study-text-muted max-w-xs mx-auto">
                Nhấn lật thẻ để xem định nghĩa tiếng Việt, ví dụ câu và cách dùng.
              </p>
            </div>
          ) : (
            /* Back of the card: Meaning & Example */
            <div className="space-y-5 my-auto py-2 text-left animate-fade-in">
              <div className="flex items-center justify-between text-xs text-study-text-muted">
                <span className="font-mono text-study-primary font-semibold">
                  {currentWord.word}
                </span>
                <span>{currentWord.partOfSpeech || 'Từ loại'}</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-display font-semibold text-study-text">
                  {currentWord.meaning}
                </h3>
                <div className="p-3.5 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text-soft italic leading-relaxed">
                  “{currentWord.example}”
                </div>
                <p className="text-xs text-study-text-muted">
                  {currentWord.translation}
                </p>
              </div>
            </div>
          )}

          {/* Flip Card Button */}
          <button
            type="button"
            onClick={() => setFlipped(!flipped)}
            className="w-full mt-4 py-2.5 rounded-xl border border-study-border hover:border-study-primary/40 bg-study-surface-muted/40 hover:bg-study-surface-hover text-xs font-semibold text-study-text flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw size={13} className="text-study-text-muted" />
            <span>{flipped ? 'Xem lại mặt trước' : 'Lật thẻ xem đáp án'}</span>
          </button>
        </div>
      )}

      {/* Memory Assessment Buttons (Task V02: Only enabled after flipped) */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!flipped}
            onClick={() => handleRate('needsReview')}
            className={`py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !flipped
                ? 'opacity-40 cursor-not-allowed bg-study-surface border border-study-border text-study-text-muted'
                : 'bg-study-accent-soft hover:bg-study-accent/20 border border-study-accent/30 text-study-accent shadow-xs active:scale-[0.99]'
            }`}
          >
            <span>Cần ôn lại</span>
          </button>

          <button
            type="button"
            disabled={!flipped}
            onClick={() => handleRate('remembered')}
            className={`py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !flipped
                ? 'opacity-40 cursor-not-allowed bg-study-surface border border-study-border text-study-text-muted'
                : 'bg-study-success text-white hover:opacity-90 shadow-xs active:scale-[0.99]'
            }`}
          >
            <span>Đã nhớ rồi</span>
          </button>
        </div>
        {!flipped && (
          <p className="text-center text-[11px] text-study-text-muted">
            Vui lòng lật thẻ xem đáp án trước khi đánh giá mức độ ghi nhớ.
          </p>
        )}
      </div>
    </div>
  )
}
