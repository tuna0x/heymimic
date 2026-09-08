import { Bot, History, Mic, Sparkles, Volume2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AmbientSoundSelector } from '../components/speaking/AmbientSoundSelector'
import { SentenceTransformerModal } from '../components/speaking/SentenceTransformerModal'
import { SpeakingAnalysisSection } from '../components/speaking/SpeakingAnalysisSection'
import { SpeakingContextCard } from '../components/speaking/SpeakingContextCard'
import { SpeakingStudioRecorder } from '../components/speaking/SpeakingStudioRecorder'
import { TopicSelector } from '../components/speaking/TopicSelector'
import { ApiErrorNotice } from '../components/shared/ApiErrorNotice'
import { SectionLabel, StatusPill } from '../components/shared/UI'
import { useAmbientSound } from '../hook/useAmbientSound'
import { useAudioRecorder } from '../hook/useAudioRecorder'
import { useLiveSpeechRecognition } from '../hook/useLiveSpeechRecognition'
import { usePageMeta } from '../hook/usePageMeta'
import { describeApiError, type ApiFailure } from '../service/api'
import {
  speakingService,
  toSpeakingResult,
  toSpeakingTopic,
  type SpeakingSessionDto,
} from '../service/speakingService'
import { studyService } from '../service/studyService'
import { reviewService } from '../service/reviewService'
import { useMimicStore } from '../store/useMimicStore'
import type { SpeakingResult, SpeakingTopic, VocabWord } from '../type'

export function Speaking() {
  usePageMeta(
    'Phòng Luyện Nói 60–90 Giây — HeyMimic',
    'Phòng thu phản xạ nói tiếng Anh cá nhân hóa với transcript và phản hồi từ dịch vụ đánh giá.'
  )

  const navigate = useNavigate()
  const setActiveStudySession = useMimicStore((state) => state.setActiveStudySession)
  const [carriedWords, setCarriedWords] = useState<VocabWord[]>([])
  const [topics, setTopics] = useState<SpeakingTopic[]>([])
  const [activeTopic, setActiveTopic] = useState<SpeakingTopic | null>(null)
  const [serverSession, setServerSession] = useState<SpeakingSessionDto | null>(null)
  const [analysis, setAnalysis] = useState<SpeakingResult | null>(null)
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [evaluationBusy, setEvaluationBusy] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [evaluationKey, setEvaluationKey] = useState(0)
  const [isPlayingModel, setIsPlayingModel] = useState(false)
  const [showOutline, setShowOutline] = useState(true)
  const [practicingSentence, setPracticingSentence] = useState<string | null>(null)
  const [secretMissionTarget, setSecretMissionTarget] = useState('At the end of the day')
  const [secretMissionDetected, setSecretMissionDetected] = useState(false)
  const [transformingSentence, setTransformingSentence] = useState<string | null>(null)
  const processedBlobRef = useRef<Blob | null>(null)

  const {
    isRecording,
    isProcessing,
    isComplete,
    recordingTime,
    liveVolume,
    audioUrl,
    audioBlob,
    usingRealMic,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
    speakNative,
    stopSpeaking,
  } = useAudioRecorder()

  const {
    mode: ambientMode,
    volume: ambientVolume,
    toggleMode: toggleAmbientMode,
    changeVolume: changeAmbientVolume,
  } = useAmbientSound()

  const {
    transcript: liveTranscript,
    interimTranscript,
    wpm: liveWpm,
    startListening,
    stopListening,
    resetTranscript,
  } = useLiveSpeechRecognition({
    samplePhrasesFallback: activeTopic?.outline ?? [],
  })

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setFailure(null)
    Promise.all([
      speakingService.getTopics(controller.signal),
      speakingService.getActiveSession(controller.signal),
      studyService.getActive(controller.signal),
    ])
      .then(async ([topicDtos, active, study]) => {
        const mappedTopics = topicDtos.map(toSpeakingTopic)
        const sessionTopic = active?.topic ? toSpeakingTopic(active.topic) : null
        setTopics(
          sessionTopic && !mappedTopics.some((topic) => topic.id === sessionTopic.id)
            ? [sessionTopic, ...mappedTopics]
            : mappedTopics
        )
        setServerSession(active)
        setActiveTopic(sessionTopic ?? mappedTopics[0] ?? null)
        setActiveStudySession(study)
        if (study?.reviewSessionId) {
          const review = await reviewService.get(study.reviewSessionId, controller.signal)
          setCarriedWords(review.items.map((item) => item.word))
        } else {
          setCarriedWords([])
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [reloadKey, setActiveStudySession])

  useEffect(() => {
    if (!audioBlob || !serverSession?.id || processedBlobRef.current === audioBlob) return
    const controller = new AbortController()
    processedBlobRef.current = audioBlob
    setEvaluationBusy(true)
    setFailure(null)

    speakingService
      .uploadAudioTake(audioBlob, serverSession.id)
      .then(async (attempt) => {
        if (!attempt.id) throw new Error('Backend không trả về mã lượt ghi âm.')
        setSelectedAttemptId(attempt.id)
        await speakingService.startEvaluation(attempt.id)
        return speakingService.waitForEvaluation(attempt.id, controller.signal)
      })
      .then((evaluation) => {
        const result = toSpeakingResult(evaluation)
        setAnalysis(result)
        const spokenText = (result.userTranscript || liveTranscript).toLowerCase()
        setSecretMissionDetected(spokenText.includes(secretMissionTarget.toLowerCase()))
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        processedBlobRef.current = null
        setFailure(describeApiError(error))
      })
      .finally(() => setEvaluationBusy(false))

    return () => controller.abort()
  }, [
    audioBlob,
    evaluationKey,
    liveTranscript,
    secretMissionTarget,
    serverSession?.id,
  ])

  const handleStartRecording = useCallback(async () => {
    if (!activeTopic || evaluationBusy) return
    setFailure(null)
    let session = serverSession
    try {
      if (!session) {
        session = await speakingService.startSession(activeTopic.id)
        setServerSession(session)
      }
      const started = await startRecording()
      if (started) {
        startListening()
        setSecretMissionDetected(false)
      }
    } catch (error) {
      setFailure(describeApiError(error))
    }
  }, [activeTopic, evaluationBusy, serverSession, startListening, startRecording])

  const handleStopRecording = () => {
    stopRecording()
    stopListening()
  }

  const handleResetRecording = () => {
    resetRecording()
    resetTranscript()
    processedBlobRef.current = null
    setAnalysis(null)
    setSelectedAttemptId(null)
    setFailure(null)
    setSecretMissionDetected(false)
  }

  const handleSelectTopic = (topic: SpeakingTopic) => {
    if (isRecording || serverSession || evaluationBusy) return
    setActiveTopic(topic)
    handleResetRecording()
    stopSpeaking()
    setIsPlayingModel(false)
  }

  const handleToggleModelSpeech = () => {
    if (!activeTopic) return
    if (isPlayingModel) {
      stopSpeaking()
      setIsPlayingModel(false)
      return
    }
    setIsPlayingModel(true)
    speakNative(activeTopic.modelAnswer, () => setIsPlayingModel(false))
  }

  const handleFinishSpeaking = async () => {
    if (!serverSession?.id || !selectedAttemptId || finishing) return
    setFinishing(true)
    setFailure(null)
    try {
      const freshSession = await speakingService.getActiveSession()
      if (!freshSession?.id) throw new Error('Không tìm thấy phiên Speaking đang hoạt động.')
      await speakingService.completeSession(
        freshSession.id,
        selectedAttemptId,
        freshSession.version ?? 0
      )

      const study = await studyService.getActive()
      if (study && study.speakingSessionId === freshSession.id) {
        const completedStudy = await studyService.complete(study)
        setActiveStudySession(completedStudy)
        navigate('/session/' + completedStudy.id + '/summary')
        return
      }
      navigate('/speaking/history/' + freshSession.id)
    } catch (error) {
      setFailure(describeApiError(error))
    } finally {
      setFinishing(false)
    }
  }

  if (loading) {
    return (
      <div role="status" className="mx-auto max-w-5xl py-16 text-center text-sm text-study-text-muted">
        Đang tải phòng luyện nói…
      </div>
    )
  }

  if (!activeTopic) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        {failure ? (
          <ApiErrorNotice failure={failure} onRetry={() => setReloadKey((value) => value + 1)} />
        ) : (
          <p className="text-sm text-study-text-muted">Hiện chưa có chủ đề Speaking khả dụng.</p>
        )}
      </div>
    )
  }

  const busy = isProcessing || evaluationBusy || finishing

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <SectionLabel>Phòng thu phản xạ nói</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-study-text tracking-tight mt-1">
            Luyện nói không áp lực<span className="text-study-primary">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1.5 max-w-lg leading-relaxed">
            Ghi âm 60–90 giây, nhận transcript và gợi ý diễn đạt từ dịch vụ đánh giá.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <AmbientSoundSelector
            mode={ambientMode}
            volume={ambientVolume}
            onToggleMode={toggleAmbientMode}
            onChangeVolume={changeAmbientVolume}
          />
          <Link
            to="/speaking/dialogue"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-study-primary-border/60 bg-study-primary-soft text-study-primary hover:bg-study-primary hover:text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Bot size={14} />
            <span>Hội thoại AI 2 chiều</span>
          </Link>
          <Link
            to="/speaking/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text-muted hover:text-study-text transition-colors"
          >
            <History size={14} />
            <span>Lịch sử bài nói</span>
          </Link>
          <StatusPill tone={isRecording ? 'signal' : usingRealMic ? 'calm' : 'muted'}>
            {isRecording
              ? 'ĐANG THU ÂM...'
              : evaluationBusy
                ? 'ĐANG PHÂN TÍCH...'
                : finishing
                  ? 'ĐANG HOÀN TẤT...'
                  : isComplete
                    ? 'ĐÃ HOÀN TẤT'
                    : usingRealMic
                      ? 'MICRO SẴN SÀNG'
                      : 'MIC THIẾT BỊ'}
          </StatusPill>
        </div>
      </div>

      {failure && (
        <ApiErrorNotice
          failure={failure}
          onRetry={
            audioBlob && !analysis
              ? () => setEvaluationKey((value) => value + 1)
              : () => setReloadKey((value) => value + 1)
          }
        />
      )}
      {recorderError && (
        <div role="alert" className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs text-study-text">
          {recorderError}
        </div>
      )}

      <TopicSelector
        topics={topics}
        activeTopicId={activeTopic.id}
        onSelectTopic={handleSelectTopic}
        disabled={isRecording || Boolean(serverSession) || busy}
      />

      <SpeakingContextCard
        activeTopic={activeTopic}
        carriedWords={carriedWords}
        isPlayingModel={isPlayingModel}
        showOutline={showOutline}
        secretMissionTarget={secretMissionTarget}
        secretMissionDetected={secretMissionDetected}
        onSelectSecretMission={(missionWord) => {
          setSecretMissionTarget(missionWord)
          setSecretMissionDetected(false)
        }}
        onToggleModelSpeech={handleToggleModelSpeech}
        onToggleOutline={() => setShowOutline((value) => !value)}
      />

      <SpeakingStudioRecorder
        isRecording={isRecording}
        isProcessing={busy}
        isComplete={isComplete}
        recordingTime={recordingTime}
        liveVolume={liveVolume}
        liveTranscript={liveTranscript}
        interimTranscript={interimTranscript}
        liveWpm={liveWpm}
        usingRealMic={usingRealMic}
        targetOutline={activeTopic.outline}
        onStartRecording={() => void handleStartRecording()}
        onStopRecording={handleStopRecording}
        onResetRecording={handleResetRecording}
      />

      {evaluationBusy && (
        <div role="status" className="rounded-2xl border border-study-border bg-study-surface p-5 text-xs text-study-text-muted">
          Đang tải bản ghi và chờ dịch vụ phân tích. Bạn có thể giữ nguyên trang này…
        </div>
      )}

      {analysis && (
        <SpeakingAnalysisSection
          result={analysis}
          audioUrl={audioUrl}
          recordingTime={recordingTime}
          liveTranscript={liveTranscript}
          onReRecord={handleResetRecording}
          onTransformSentence={setTransformingSentence}
          onSpeakSentence={(text) => speakNative(text)}
          onPracticeSentence={setPracticingSentence}
          onFinishSpeaking={() => void handleFinishSpeaking()}
        />
      )}

      {practicingSentence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={() => setPracticingSentence(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-study-surface border border-study-border rounded-2xl p-6 shadow-xl space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-study-primary flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Luyện lại câu cụ thể</span>
              </span>
              <button
                type="button"
                onClick={() => setPracticingSentence(null)}
                className="p-1 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-hover cursor-pointer"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-study-primary-soft/40 border border-study-primary-border/60 space-y-2">
              <span className="text-[11px] font-semibold text-study-primary uppercase tracking-wider block">
                Câu gợi ý tự nhiên
              </span>
              <p className="text-sm font-medium text-study-text leading-relaxed">
                “{practicingSentence}”
              </p>
              <button
                type="button"
                onClick={() => speakNative(practicingSentence)}
                className="inline-flex items-center gap-1.5 text-xs text-study-primary hover:underline font-semibold cursor-pointer pt-1"
              >
                <Volume2 size={14} />
                <span>Nghe giọng đọc mẫu</span>
              </button>
            </div>
            <p className="text-xs text-study-text-muted">
              Nghe lại, sau đó tự lặp lại câu với nhịp và ngữ điệu tự nhiên.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-study-border">
              <button
                type="button"
                onClick={() => speakNative(practicingSentence)}
                className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Mic size={14} />
                <span>Nghe và lặp lại</span>
              </button>
              <button
                type="button"
                onClick={() => setPracticingSentence(null)}
                className="px-4 py-2 rounded-xl border border-study-border bg-study-surface text-study-text text-xs font-semibold hover:bg-study-surface-hover transition-colors cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      <SentenceTransformerModal
        sentence={transformingSentence || ''}
        isOpen={Boolean(transformingSentence)}
        onClose={() => setTransformingSentence(null)}
      />
    </div>
  )
}
