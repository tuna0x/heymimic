import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Mic,
  Mic2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  Volume2,
} from 'lucide-react'
import { useMimicStore } from '../store/useMimicStore'
import { usePageMeta } from '../hook/usePageMeta'
import { ROUTES } from '../route/routePaths'
import type { DialogueScenario, DialogueTurn } from '../type'

export function SpeakingDialogue() {
  usePageMeta(
    'Hội Thoại 2 Chiều Với AI (Roleplay) — HeyMimic',
    'Thực hành giao tiếp tương tác qua lại theo lượt (turn-taking) với các tình huống công sở, họp nhóm và phỏng vấn.'
  )

  const navigate = useNavigate()
  const { dialogueScenarios } = useMimicStore()

  const [selectedScenarioId, setSelectedScenarioId] = useState(dialogueScenarios[0]?.id ?? '')
  const [currentTurnIndex, setCurrentTurnIndex] = useState(2) // Start with initial exchange visible
  const [isRecording, setIsRecording] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)

  const scenario: DialogueScenario | undefined =
    dialogueScenarios.find((s) => s.id === selectedScenarioId) ?? dialogueScenarios[0]

  const totalTurns = scenario?.turns.length ?? 0
  const visibleTurns = scenario?.turns.slice(0, currentTurnIndex) ?? []
  const isFinished = currentTurnIndex >= totalTurns

  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.95
      utterance.onstart = () => setIsAiSpeaking(true)
      utterance.onend = () => setIsAiSpeaking(false)
      utterance.onerror = () => setIsAiSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } catch {
      setIsAiSpeaking(false)
    }
  }

  const handleSimulateUserTurn = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      // Advance by 1 or 2 turns to reveal next AI reply
      setCurrentTurnIndex((prev) => Math.min(totalTurns, prev + 2))
    }, 1800)
  }

  const handleRestart = () => {
    setCurrentTurnIndex(1)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary mb-1">
            <Bot size={14} />
            <span>AI ROLEPLAY DIALOGUE · TƯƠNG TÁC 2 CHIỀU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Hội thoại thực tế theo lượt
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1 leading-relaxed">
            Rèn luyện phản xạ nghe - phản hồi tức thì với các tình huống tranh luận, lùi deadline và phỏng vấn.
          </p>
        </div>

        {/* Scenario Switcher */}
        <select
          value={selectedScenarioId}
          onChange={(e) => {
            setSelectedScenarioId(e.target.value)
            setCurrentTurnIndex(2)
          }}
          className="px-3.5 py-2 rounded-xl bg-study-surface border border-study-border text-xs font-semibold text-study-text focus:outline-none focus:border-study-primary transition-colors cursor-pointer shrink-0"
        >
          {dialogueScenarios.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.title}
            </option>
          ))}
        </select>
      </div>

      {/* Scenario Briefing Card */}
      {scenario && (
        <div className="p-5 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-md bg-study-primary-soft/60 text-xs font-semibold text-study-primary border border-study-primary-border/60">
              Bối cảnh: {scenario.role} ↔ {scenario.aiRole}
            </span>

            <div className="flex items-center gap-2 text-xs text-study-text-muted font-mono">
              <span>Tiến trình:</span>
              <strong className="text-study-text">
                Lượt {Math.min(currentTurnIndex, totalTurns)} / {totalTurns}
              </strong>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-display font-bold text-study-text">
              {scenario.title}
            </h2>
            <p className="text-xs sm:text-sm text-study-text-muted mt-1 leading-relaxed">
              {scenario.contextDesc}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-study-surface-muted/60 border border-study-border text-xs text-study-text flex items-start gap-2">
            <Lightbulb size={15} className="text-study-accent shrink-0 mt-0.5" />
            <div>
              <strong className="block text-study-accent">Mục tiêu của bạn:</strong>
              <span>{scenario.objective}</span>
            </div>
          </div>
        </div>
      )}

      {/* Turns Timeline Stream */}
      <div className="space-y-4">
        {visibleTurns.map((turn, idx) => {
          const isAi = turn.speaker === 'ai'
          return (
            <div
              key={turn.id}
              className={`p-5 rounded-2xl border space-y-3 transition-all animate-fade-in ${
                isAi
                  ? 'bg-study-surface border-study-border'
                  : 'bg-study-primary-soft/30 border-study-primary-border/60 ml-0 sm:ml-6'
              }`}
            >
              {/* Speaker Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isAi
                        ? 'bg-study-primary text-white'
                        : 'bg-study-accent text-white'
                    }`}
                  >
                    {isAi ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <span className="text-xs font-semibold text-study-text">
                    {turn.speakerName}
                  </span>
                </div>

                {isAi && (
                  <button
                    type="button"
                    onClick={() => handleSpeakText(turn.text)}
                    disabled={isAiSpeaking}
                    className="p-1.5 rounded-lg text-study-primary hover:bg-study-primary-soft/60 transition-colors cursor-pointer"
                    title="Nghe giọng đọc của đối tác"
                  >
                    <Volume2 size={15} />
                  </button>
                )}
              </div>

              {/* Message Content */}
              <p className="text-sm text-study-text leading-relaxed font-mono">
                “{turn.text}”
              </p>

              {/* Suggested Rephrase for User Turn */}
              {!isAi && turn.suggestedRephrase && (
                <div className="p-3.5 rounded-xl bg-study-surface border border-study-border space-y-1 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">
                    ✓ Cách diễn đạt bản xứ tự nhiên hơn:
                  </span>
                  <p className="font-mono text-study-text">“{turn.suggestedRephrase}”</p>
                </div>
              )}

              {/* Feedback Note */}
              {turn.feedbackNote && (
                <p className="text-[11px] text-study-text-muted italic leading-relaxed pt-1 border-t border-study-border/60">
                  💡 {turn.feedbackNote}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Active User Turn Controller or Completion Summary */}
      {!isFinished ? (
        <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-study-primary uppercase tracking-wider flex items-center gap-1.5">
              <Mic2 size={14} />
              <span>Lượt nói của bạn (Phản hồi lại đối tác)</span>
            </span>
            <span className="text-[11px] font-mono text-study-text-muted">
              Gợi ý thời lượng: 15–20 giây
            </span>
          </div>

          <p className="text-xs text-study-text-muted leading-relaxed">
            Hãy trả lời ngắn gọn, nêu rõ lý do và đưa ra giải pháp thay thế có tính xây dựng.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSimulateUserTurn}
              disabled={isRecording}
              className={`px-6 py-3 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-2 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-study-accent text-white hover:bg-study-accent-hover'
              }`}
            >
              <Mic size={16} />
              <span>{isRecording ? 'Đang thu âm phản hồi...' : 'Bấm để trả lời lượt này'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTurnIndex((prev) => Math.min(totalTurns, prev + 2))}
              className="px-4 py-3 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors cursor-pointer"
            >
              Xem trước câu mẫu
            </button>
          </div>
        </div>
      ) : (
        /* Dialogue Evaluation Dashboard */
        <div className="p-6 rounded-3xl bg-study-surface border border-emerald-500/20 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-study-text">
                  Cuộc trao đổi đã hoàn tất thành công!
                </h3>
                <p className="text-xs text-study-text-muted">
                  Bạn đã đạt được mục tiêu thương lượng mà không gây xung đột với đối tác.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-lg border border-study-border text-xs font-semibold text-study-text hover:bg-study-surface-hover transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Luyện lại</span>
            </button>
          </div>

          {/* 3 Metric Scores */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-study-surface-muted/50 border border-study-border">
              <span className="text-xl font-display font-bold text-study-primary">
                {scenario?.metricsSummary?.politenessScore ?? 90}/100
              </span>
              <span className="text-[11px] text-study-text-muted block mt-0.5">
                Tính lịch sự & ngoại giao
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-study-surface-muted/50 border border-study-border">
              <span className="text-xl font-display font-bold text-study-accent">
                {scenario?.metricsSummary?.clarityScore ?? 88}/100
              </span>
              <span className="text-[11px] text-study-text-muted block mt-0.5">
                Độ rõ ràng & mạch lạc
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-study-surface-muted/50 border border-study-border">
              <span className="text-xl font-display font-bold text-study-success">
                {scenario?.metricsSummary?.naturalnessScore ?? 92}/100
              </span>
              <span className="text-[11px] text-study-text-muted block mt-0.5">
                Từ vựng bản xứ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Switch to Monologue Speaking Link */}
      <div className="pt-2 flex items-center justify-between text-xs text-study-text-muted">
        <Link
          to={ROUTES.SPEAKING}
          className="inline-flex items-center gap-1.5 hover:text-study-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Về phòng luyện nói độc thoại 60–90 giây</span>
        </Link>
        <Link
          to={ROUTES.SPEAKING_HISTORY}
          className="text-study-primary hover:underline font-medium"
        >
          Xem lịch sử bài nói →
        </Link>
      </div>
    </div>
  )
}
