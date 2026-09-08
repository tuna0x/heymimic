import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Mic2, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'
import { ProgressBar } from '../components/shared/UI'
import { ApiErrorNotice } from '../components/shared/ApiErrorNotice'
import { describeApiError, type ApiFailure } from '../service/api'
import {
  reviewService,
  type ReviewSessionModel,
} from '../service/reviewService'
import { studyService } from '../service/studyService'

export function VocabReview() {
  usePageMeta('Phiên Ôn Tập Từ Vựng — HeyMimic', 'Luyện phản xạ và ghi nhớ từ vựng qua lặp lại ngắt quãng.')
  const navigate = useNavigate()

  const activeStudySession = useMimicStore((state) => state.activeStudySession)
  const setActiveStudySession = useMimicStore((state) => state.setActiveStudySession)

  const [session, setSession] = useState<ReviewSessionModel | null>(null)
  const [decisions, setDecisions] = useState<
    Array<{ eventId: string; wordId: string; rating: 'remembered' | 'needsReview' }>
  >([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [busy, setBusy] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const startKey = useRef(crypto.randomUUID())
  const [flipped, setFlipped] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [speakError, setSpeakError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoadState('loading')
    setFailure(null)
    Promise.all([
      reviewService.getActive(controller.signal),
      studyService.getActive(controller.signal),
    ])
      .then(async ([activeReview, study]) => {
        const nextReview =
          activeReview ?? (await reviewService.start([], startKey.current))
        setSession(nextReview)
        setActiveStudySession(study)
        setLoadState('ready')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
        setLoadState('error')
      })
    return () => controller.abort()
  }, [reloadKey, setActiveStudySession])

  const vocabWords = useMemo(
    () => session?.items.map((item) => item.word) ?? [],
    [session]
  )

  const currentWordId = useMemo(() => {
    if (!session) return null
    return session.items[session.currentIndex]?.word.id ?? null
  }, [session])

  const currentWord = useMemo(() => {
    if (!currentWordId) return null
    return vocabWords.find((w) => w.id === currentWordId) ?? null
  }, [currentWordId, vocabWords])

  const isCompleted = Boolean(session && session.currentIndex >= session.items.length)

  const totalWords = session?.items.length ?? 0
  const currentIndex = session?.currentIndex ?? 0
  const progressPercent = totalWords > 0 ? (currentIndex / totalWords) * 100 : 0

  const rememberedCount = decisions.filter((item) => item.rating === 'remembered').length
  const needsReviewCount = decisions.filter((item) => item.rating === 'needsReview').length

  const needsReviewWords = useMemo(() => {
    const ids = decisions.filter((item) => item.rating === 'needsReview').map((item) => item.wordId)
    return vocabWords.filter((w) => ids.includes(w.id))
  }, [decisions, vocabWords])

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

  const handleRate = async (rating: 'remembered' | 'needsReview') => {
    if (!flipped || !session || !currentWord) return
    setBusy(true)
    setFailure(null)
    try {
      const rated = await reviewService.rate(session, rating)
      setSession(rated.session)
      setDecisions((items) => [
        ...items,
        { eventId: rated.eventId, wordId: currentWord.id, rating },
      ])
      setFlipped(false)
    } catch (error) {
      setFailure(describeApiError(error))
    } finally {
      setBusy(false)
    }
  }

  const handleUndo = async () => {
    if (!session) return
    const lastDecision = decisions[decisions.length - 1]
    const eventId =
      lastDecision?.eventId ??
      [...session.items]
        .slice(0, session.currentIndex)
        .reverse()
        .find((item) => item.activeRatingEventId)?.activeRatingEventId
    if (!eventId) return
    setBusy(true)
    setFailure(null)
    try {
      setSession(await reviewService.undo(session, eventId))
      setDecisions((items) => items.filter((item) => item.eventId !== eventId))
      setFlipped(true)
    } catch (error) {
      setFailure(describeApiError(error))
    } finally {
      setBusy(false)
    }
  }

  const completeReviewAndStudyStep = async () => {
    if (!session) return null
    await reviewService.complete(session)
    const study = activeStudySession ?? (await studyService.getActive())
    if (!study) return null
    const currentPosition =
      study.currentStep === 'summary'
        ? -1
        : study.plannedSteps.indexOf(study.currentStep)
    if (currentPosition >= 0 && currentPosition < study.plannedSteps.length - 1) {
      const advanced = await studyService.advance(study, currentPosition + 1)
      setActiveStudySession(advanced)
      return advanced
    }
    const completed = await studyService.complete(study)
    setActiveStudySession(completed)
    return completed
  }

  const handleProceed = async () => {
    setBusy(true)
    setFailure(null)
    try {
      const study = await completeReviewAndStudyStep()
      if (study?.currentStep === 'speaking') navigate('/speaking')
      else if (study) navigate(`/session/${study.id}/summary`)
      else navigate('/dashboard')
    } catch (error) {
      setFailure(describeApiError(error))
    } finally {
      setBusy(false)
    }
  }

  const handleExit = async () => {
    if (!session) return navigate('/vocab')
    setBusy(true)
    try {
      if (activeStudySession) {
        await studyService.abandon(activeStudySession)
        setActiveStudySession(null)
      } else {
        await reviewService.abandon(session)
      }
      navigate('/vocab')
    } catch (error) {
      setFailure(describeApiError(error))
      setBusy(false)
    }
  }

  if (loadState === 'loading') {
    return (
      <div role="status" className="mx-auto max-w-xl py-16 text-center text-sm text-study-text-muted">
        Đang chuẩn bị phiên ôn tập…
      </div>
    )
  }

  if (loadState === 'error' && failure) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <ApiErrorNotice failure={failure} onRetry={() => setReloadKey((value) => value + 1)} />
      </div>
    )
  }

  if (isCompleted) {
    /* V03: Vocab Review Summary */
    return (
      <div className="max-w-xl mx-auto py-8 text-left space-y-6 animate-fade-in">
        {failure && <ApiErrorNotice failure={failure} />}
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
            disabled={busy}
            onClick={() => void handleProceed()}
            className="w-full py-3 px-4 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Mic2 size={16} />
            <span>Dùng các từ này để luyện nói ngay</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleUndo()}
            className="w-full py-2.5 px-4 rounded-xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text transition-colors cursor-pointer"
          >
            Hoàn tác lượt đánh giá cuối
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => void handleExit()}
              className="text-xs text-study-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Quay về kho từ vựng</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* V02: Active Card Review Mode */
  return (
    <div className="max-w-xl mx-auto py-4 text-left space-y-6 animate-fade-in">
      {failure && <ApiErrorNotice failure={failure} />}
      {/* Top Session Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleExit()}
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

        {decisions.length > 0 ||
        session?.items.slice(0, session.currentIndex).some((item) => item.activeRatingEventId) ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleUndo()}
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
            disabled={!flipped || busy}
            onClick={() => void handleRate('needsReview')}
            className={`py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !flipped || busy
                ? 'opacity-40 cursor-not-allowed bg-study-surface border border-study-border text-study-text-muted'
                : 'bg-study-accent-soft hover:bg-study-accent/20 border border-study-accent/30 text-study-accent shadow-xs active:scale-[0.99]'
            }`}
          >
            <span>Cần ôn lại</span>
          </button>

          <button
            type="button"
            disabled={!flipped || busy}
            onClick={() => void handleRate('remembered')}
            className={`py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !flipped || busy
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
