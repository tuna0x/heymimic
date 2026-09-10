import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  HandMetal,
  Heart,
  Lightbulb,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  Users2,
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react'
import { SectionLabel } from '../components/shared/UI'
import { PeerLobby } from '../components/peer/PeerLobby'
import { AmbientSoundSelector } from '../components/speaking/AmbientSoundSelector'
import { useAmbientSound } from '../hook/useAmbientSound'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'
import { ROUTES } from '../route/routePaths'
import type { PeerFeedback, PeerPartner, PeerTopic } from '../type'

export function PeerRoom() {
  usePageMeta('Phòng Đàm Thoại 1-kèm-1 — HeyMimic', 'Phòng luyện nói 1-kèm-1 theo chủ đề có đồng hồ luân phiên và dàn ý dẫn dắt.')

  const navigate = useNavigate()
  const { activePeerSession, peerTopics, peerPartners, completePeerSession } = useMimicStore()

  const topic: PeerTopic =
    peerTopics.find((t) => t.id === activePeerSession?.topicId) ?? peerTopics[0]
  const partner: PeerPartner = activePeerSession?.partner ?? peerPartners[0]

  const {
    mode: ambientMode,
    volume: ambientVolume,
    toggleMode: toggleAmbientMode,
    changeVolume: changeAmbientVolume,
  } = useAmbientSound()

  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0)
  const currentRound = topic.rounds[currentRoundIdx] ?? topic.rounds[0]
  const totalRounds = topic.rounds.length

  const [timeLeft, setTimeLeft] = useState<number>(currentRound.durationSeconds)
  const [isMicOn, setIsMicOn] = useState<boolean>(true)
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true)
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false)
  const [roomReady, setRoomReady] = useState(false)

  useEffect(() => {
    if (!activePeerSession) {
      navigate(ROUTES.PEER_PRACTICE)
    }
  }, [activePeerSession, navigate])

  // Review modal state
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([])
  const [encouragementNote, setEncouragementNote] = useState<string>('')
  const [rating, setRating] = useState<number>(5)

  // Countdown timer for each round
  useEffect(() => {
    if (!roomReady) return
    setTimeLeft(currentRound.durationSeconds)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentRoundIdx, currentRound.durationSeconds, roomReady])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleNextRound = () => {
    if (currentRoundIdx < totalRounds - 1) {
      setCurrentRoundIdx((prev) => prev + 1)
    } else {
      setShowReviewModal(true)
    }
  }

  const handleSendReaction = (emoji: string) => {
    setFloatingReaction(emoji)
    setTimeout(() => setFloatingReaction(null), 1800)
  }

  const handleToggleCompliment = (item: string) => {
    if (selectedCompliments.includes(item)) {
      setSelectedCompliments(selectedCompliments.filter((c) => c !== item))
    } else {
      setSelectedCompliments([...selectedCompliments, item])
    }
  }

  const handleSubmitReview = () => {
    if (activePeerSession) {
      const feedback: PeerFeedback = {
        sessionId: activePeerSession.id,
        partnerId: partner.id,
        compliments: selectedCompliments,
        privateNote: encouragementNote,
        clarityRating: rating,
        confidenceRating: rating,
      }
      completePeerSession(activePeerSession.id, feedback)
    }
    navigate(ROUTES.DASHBOARD)
  }

  if (!activePeerSession) {
    return (
      <div role="status" className="mx-auto max-w-5xl py-16 text-center text-sm text-study-text-muted">
        Đang quay về danh sách phiên luyện nói…
      </div>
    )
  }

  if (!roomReady) {
    return <PeerLobby topic={topic} partner={partner} onStart={() => setRoomReady(true)} />
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16 text-left animate-fade-in">
      {/* Room Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-study-accent-soft text-study-accent flex items-center justify-center font-bold">
            <Users2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-study-accent">
                VÒNG {currentRound.roundNumber}/{totalRounds}: {currentRound.title}
              </span>
              <span className="w-2 h-2 rounded-full bg-study-success animate-pulse" />
            </div>
            <h2 className="text-sm sm:text-base font-display font-semibold text-study-text mt-0.5">
              {topic.title}
            </h2>
          </div>
        </div>

        {/* Round Countdown, Ambient Sound, & Leave Button */}
        <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
          <AmbientSoundSelector
            mode={ambientMode}
            volume={ambientVolume}
            onToggleMode={toggleAmbientMode}
            onChangeVolume={changeAmbientVolume}
          />

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-study-surface-muted border border-study-border text-xs font-mono font-bold text-study-text">
            <Clock size={14} className={timeLeft <= 15 ? 'text-rose-500 animate-pulse' : 'text-study-primary'} />
            <span className={timeLeft <= 15 ? 'text-rose-500 font-extrabold' : ''}>
              {formatTimer(timeLeft)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn rời phòng luyện tập?')) {
                navigate(ROUTES.PEER_PRACTICE)
              }
            }}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-colors cursor-pointer"
            title="Rời phòng gọi"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>

      {/* Dual Video / Call Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Self Window (You) */}
        <div className="relative rounded-2xl bg-neutral-900 border border-study-border overflow-hidden h-64 sm:h-72 flex flex-col justify-between p-4 text-white shadow-sm">
          {/* Header Info */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold drop-shadow">Bạn</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[10px] font-mono text-neutral-300">
              {isMicOn ? 'MIC ĐANG BẬT' : 'MIC ĐANG TẮT'}
            </span>
          </div>

          {/* Center Avatar or Video */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full bg-study-primary text-white font-bold text-xl flex items-center justify-center border-2 border-white/20 shadow-md ${isMicOn ? 'ring-4 ring-study-primary/40 animate-pulse' : ''}`}>
                AT
              </div>
              {isMicOn && (
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                  <Mic size={12} />
                </div>
              )}
            </div>
            <span className="text-[11px] text-neutral-300">Sẵn sàng phản hồi</span>
          </div>

          {/* Bottom In-Window Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isMicOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {isMicOn ? <Mic size={15} /> : <MicOff size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isVideoOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {isVideoOn ? <Video size={15} /> : <VideoOff size={15} />}
              </button>
            </div>
            <span className="text-[10px] text-neutral-400">Mic cục bộ · phòng mẫu</span>
          </div>
        </div>

        {/* 2. Partner Window */}
        <div className="relative rounded-2xl bg-neutral-900 border border-study-border overflow-hidden h-64 sm:h-72 flex flex-col justify-between p-4 text-white shadow-sm">
          {/* Floating Reactions overlay */}
          {floatingReaction && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-bounce">
              <span className="text-5xl">{floatingReaction}</span>
            </div>
          )}

          {/* Header Info */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold drop-shadow">{partner.name}</span>
              <span className="text-[10px] text-neutral-400">• {partner.city}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-study-accent/80 backdrop-blur-xs text-[10px] font-semibold text-white">
              PHÒNG MẪU
            </span>
          </div>

          {/* Center Avatar */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-study-accent ring-4 ring-study-accent/40 animate-pulse shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-study-accent text-white shadow-xs">
                <Volume2 size={12} />
              </div>
            </div>
            <span className="text-[11px] text-neutral-300 italic">“{partner.goal}”</span>
          </div>

          {/* Partner Reactions Bar */}
          <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10">
            <span className="text-[10px] text-neutral-400">Gửi lời khen nhanh:</span>
            <div className="flex items-center gap-1.5">
              {[
                { icon: '👍', label: 'Tán thành' },
                { icon: '💡', label: 'Ý hay' },
                { icon: '👏', label: 'Vỗ tay' },
                { icon: '🔥', label: 'Tuyệt vời' },
                { icon: '❤️', label: 'Cảm ơn' },
              ].map((emoji) => (
                <button
                  key={emoji.icon}
                  type="button"
                  onClick={() => handleSendReaction(emoji.icon)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  title={emoji.label}
                >
                  {emoji.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guided Agenda & Interactive Prompt Card */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-study-border">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-study-primary-soft text-study-primary flex items-center justify-center font-bold text-xs">
              {currentRound.roundNumber}
            </span>
            <div>
              <h3 className="text-base font-display font-semibold text-study-text">
                {currentRound.title}
              </h3>
              <span className="text-xs text-study-text-muted">
                Thời lượng đề xuất: {currentRound.durationSeconds} giây
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNextRound}
              className="px-5 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span>{currentRoundIdx === totalRounds - 1 ? 'Hoàn thành buổi nói' : 'Chuyển vòng tiếp theo'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Guided Question Prompts */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-study-surface-muted/50 border border-study-border space-y-1">
            <span className="text-[11px] font-bold text-study-primary uppercase tracking-wider block">
              CÂU HỎI ĐÀO SÂU DẪN DẮT (CONVERSATION PROMPT)
            </span>
            <p className="text-sm sm:text-base font-medium text-study-text leading-relaxed">
              “{currentRound.promptEn}”
            </p>
            <p className="text-xs text-study-text-muted italic">
              ({currentRound.promptVi})
            </p>
          </div>

          {/* Starter Hints */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-study-text-muted block">
              Gợi ý mở đầu câu để không bị ngập ngừng:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentRound.hints.map((hint, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-study-surface border border-study-border text-xs text-study-text font-medium leading-snug flex items-start gap-2"
                >
                  <Sparkles size={13} className="text-study-accent shrink-0 mt-0.5" />
                  <span>“{hint}”</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Vocab Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-study-text-muted font-medium">Cụm từ nên thử dùng:</span>
            {topic.recommendedVocab.map((word, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-study-primary-soft text-study-primary border border-study-primary-border/60 text-xs font-mono font-semibold"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Post-Session Review & Compliment Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-study-surface border border-study-border rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-study-border">
              <div className="w-10 h-10 rounded-xl bg-study-success-soft text-study-success flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-study-text">
                  Chúc mừng bạn đã hoàn thành buổi nói!
                </h3>
                <p className="text-xs text-study-text-muted">
                  Cùng trao đổi nhận xét chân thành để giúp {partner.name} tiến bộ hơn.
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-study-text block">
                Độ rõ ràng & sự phối hợp của bạn học:
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
                <span className="text-xs font-bold text-study-text ml-2">
                  {rating === 5 ? 'Tuyệt vời!' : `${rating}/5 sao`}
                </span>
              </div>
            </div>

            {/* Compliment Badges */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-study-text block">
                Tặng huy hiệu điểm mạnh cho bạn học:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Phát âm rõ ràng, dễ nghe',
                  'Dùng từ vựng phong phú',
                  'Lắng nghe tích cực & cởi mở',
                  'Tự tin, không ngập ngừng',
                ].map((item) => {
                  const isChecked = selectedCompliments.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleCompliment(item)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-2 cursor-pointer ${
                        isChecked
                          ? 'bg-study-accent-soft border-study-accent text-study-accent font-semibold'
                          : 'bg-study-surface-muted/50 border-study-border text-study-text-muted hover:text-study-text'
                      }`}
                    >
                      <Award size={14} className={isChecked ? 'text-study-accent' : 'text-study-text-muted'} />
                      <span>{item}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Private Note */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-study-text block">
                Lời nhắn nhủ động viên (tùy chọn):
              </span>
              <textarea
                value={encouragementNote}
                onChange={(e) => setEncouragementNote(e.target.value)}
                placeholder="Ví dụ: Cảm ơn Linh vì đã chia sẻ kinh nghiệm dự án rất chân thành..."
                rows={3}
                className="w-full p-3 rounded-xl bg-study-surface-muted/40 border border-study-border text-xs text-study-text focus:outline-none focus:border-study-primary leading-relaxed resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-study-border">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl border border-study-border bg-study-surface text-xs font-semibold text-study-text-muted hover:text-study-text cursor-pointer"
              >
                Quay lại phòng
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                className="px-6 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Send size={14} />
                <span>Gửi nhận xét & Kết thúc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
