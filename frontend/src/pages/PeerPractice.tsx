import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Globe2,
  HeartHandshake,
  MessageSquare,
  Play,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users2,
  Zap,
} from 'lucide-react'
import { SectionLabel } from '../components/shared/UI'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'
import { ROUTES } from '../route/routePaths'
import type { PeerPartner, PeerTopic } from '../type'

export function PeerPractice() {
  usePageMeta(
    'Luyện Nói 1-kèm-1 (One-to-One Peer Practice) — HeyMimic',
    'Kết nối trực tiếp với bạn học cùng mục tiêu, luyện phản xạ theo chủ đề và dàn ý dẫn dắt.'
  )

  const navigate = useNavigate()
  const { peerTopics, peerPartners, peerSessions, startPeerSession } = useMimicStore()

  const [selectedTopicId, setSelectedTopicId] = useState<string>(peerTopics[0]?.id ?? '')
  const [selectedDuration, setSelectedDuration] = useState<number>(10)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isMatching, setIsMatching] = useState<boolean>(false)
  const [matchedPartner, setMatchedPartner] = useState<PeerPartner | null>(null)

  const selectedTopic = peerTopics.find((t) => t.id === selectedTopicId) ?? peerTopics[0]

  const filteredTopics = peerTopics.filter((t) => {
    if (selectedCategory === 'all') return true
    return t.category === selectedCategory
  })

  const handleStartMatching = () => {
    setIsMatching(true)
    setMatchedPartner(null)

    // Simulate smart matching radar after 2.2 seconds
    setTimeout(() => {
      const partner = peerPartners[Math.floor(Math.random() * peerPartners.length)]
      setMatchedPartner(partner)
      setIsMatching(false)
    }, 2200)
  }

  const handleEnterRoom = () => {
    if (!matchedPartner || !selectedTopic) return
    const session = startPeerSession(selectedTopic.id, matchedPartner.id)
    navigate(ROUTES.PEER_ROOM)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-left animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-accent mb-1">
            <Users2 size={14} />
            <span>ONE-TO-ONE PEER PRACTICE · KẾT NỐI BẠN HỌC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-study-text tracking-tight">
            Luyện nói 1-kèm-1 theo chủ đề<span className="text-study-accent">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1.5 max-w-xl leading-relaxed">
            Kết nối với bạn học có cùng trình độ. Không lo im lặng ngượng ngùng nhờ dàn ý dẫn dắt, đồng hồ bấm giờ luân phiên và trao đổi nhận xét chân thành.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-study-surface border border-study-border text-xs font-medium text-study-text shadow-xs">
            <Radio size={14} className="text-study-success animate-pulse" />
            <span>Đang có <strong>18</strong> bạn học online</span>
          </div>
        </div>
      </div>

      {/* Safety & Etiquette Banner */}
      <div className="p-4 rounded-2xl bg-study-accent-soft/30 border border-study-accent/25 flex items-start gap-3 text-xs text-study-text">
        <ShieldCheck size={18} className="text-study-accent shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-semibold text-study-text">Môi trường luyện tập văn minh & an toàn</strong>
          <p className="text-study-text-muted text-[11px] leading-relaxed">
            HeyMimic là không gian tập trung hoàn toàn vào việc cải thiện phản xạ tiếng Anh. Hãy tôn trọng lượt nói của bạn học, động viên lẫn nhau và tuân thủ dàn ý để cả hai cùng đạt hiệu quả cao nhất.
          </p>
        </div>
      </div>

      {/* Topic Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'all', label: 'Tất cả chủ đề' },
          { id: 'work', label: 'Công sở & Dự án' },
          { id: 'interview', label: 'Phỏng vấn' },
          { id: 'tech', label: 'Công nghệ & AI' },
          { id: 'debate', label: 'Tranh luận ngoại giao' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-study-accent text-white shadow-xs'
                : 'bg-study-surface border border-study-border text-study-text-muted hover:text-study-text hover:bg-study-surface-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Topic Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const isSelected = selectedTopicId === topic.id
          return (
            <div
              key={topic.id}
              onClick={() => {
                setSelectedTopicId(topic.id)
                setMatchedPartner(null)
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-study-surface border-study-accent ring-2 ring-study-accent/20 shadow-sm'
                  : 'bg-study-surface border-study-border hover:border-study-border-focus'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-study-accent px-2.5 py-0.5 rounded-full bg-study-accent-soft">
                    {topic.categoryLabel}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-study-text-muted">
                    {topic.level} · ~{topic.defaultDurationMinutes} phút
                  </span>
                </div>

                <h3 className="text-base font-display font-semibold text-study-text leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed line-clamp-2">
                  {topic.description}
                </p>

                {/* Agenda pill breakdown */}
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-study-text-muted font-medium">
                  <span className="px-2 py-0.5 rounded bg-study-surface-muted border border-study-border">4 Vòng</span>
                  <span>•</span>
                  <span>Khởi động 1m</span>
                  <span>•</span>
                  <span>Bạn A 2.5m</span>
                  <span>•</span>
                  <span>Bạn B 2.5m</span>
                  <span>•</span>
                  <span>Đánh giá 1m</span>
                </div>
              </div>

              {/* Suggested Vocab Preview */}
              <div className="pt-3 mt-3 border-t border-study-border-subtle">
                <div className="flex flex-wrap gap-1.5">
                  {topic.recommendedVocab.slice(0, 3).map((chunk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-study-surface-muted text-[10px] font-mono text-study-text-soft border border-study-border/50"
                    >
                      {chunk}
                    </span>
                  ))}
                  {topic.recommendedVocab.length > 3 && (
                    <span className="text-[10px] text-study-text-muted self-center">
                      +{topic.recommendedVocab.length - 3} cụm từ
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Matchmaking Control Panel */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-study-primary uppercase tracking-wider block">
              Cấu hình phiên đàm thoại
            </span>
            <h3 className="text-lg font-display font-semibold text-study-text mt-0.5">
              Chủ đề đã chọn: {selectedTopic?.title}
            </h3>
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-study-text-muted">Thời lượng:</span>
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setSelectedDuration(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDuration === mins
                    ? 'bg-study-accent text-white'
                    : 'bg-study-surface-muted text-study-text-muted hover:text-study-text'
                }`}
              >
                {mins} phút
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Action Area: Ready to Match vs Radar Searching vs Match Found */}
        {!isMatching && !matchedPartner && (
          <div className="p-6 rounded-2xl bg-study-surface-muted/50 border border-study-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-study-accent-soft text-study-accent flex items-center justify-center shrink-0">
                <HeartHandshake size={24} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-study-text">
                  Sẵn sàng kết nối với bạn học?
                </h4>
                <p className="text-xs text-study-text-muted mt-0.5">
                  Hệ thống sẽ tự động ghép bạn với học viên có trình độ tương đương đang chờ.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartMatching}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-study-accent text-white font-semibold text-xs hover:bg-study-accent-hover transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Search size={16} />
              <span>Bắt đầu tìm bạn học ngay</span>
            </button>
          </div>
        )}

        {/* Searching Animated Radar */}
        {isMatching && (
          <div className="p-8 rounded-2xl bg-study-surface-muted/40 border border-study-border flex flex-col items-center justify-center space-y-4 text-center animate-fade-in">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-study-accent/20 animate-ping absolute" />
              <div className="w-14 h-14 rounded-full bg-study-accent text-white flex items-center justify-center shadow-lg relative z-10">
                <Radio size={24} className="animate-spin" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-display font-semibold text-study-text">
                Đang tìm bạn học phù hợp...
              </h4>
              <p className="text-xs text-study-text-muted mt-1 max-w-sm">
                Đang đối chiếu trình độ và mục tiêu chủ đề “{selectedTopic?.title}”.
              </p>
            </div>
          </div>
        )}

        {/* Match Found Card */}
        {matchedPartner && (
          <div className="p-6 rounded-2xl bg-study-success-soft/30 border border-study-success/30 flex flex-col sm:flex-row items-center justify-between gap-6 animate-scale-up">
            <div className="flex items-center gap-4">
              <img
                src={matchedPartner.avatar}
                alt={matchedPartner.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-study-success/40 shadow-xs shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-study-text">
                    {matchedPartner.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-study-success/15 text-study-success text-[10px] font-bold">
                    ĐÃ KẾT NỐI
                  </span>
                </div>
                <p className="text-xs text-study-text-muted">
                  {matchedPartner.targetLevel} • {matchedPartner.city}
                </p>
                <p className="text-xs text-study-text-soft italic">
                  “{matchedPartner.goal}”
                </p>
                <div className="flex items-center gap-2 pt-0.5 text-[11px] text-study-text-muted">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star size={12} fill="currentColor" /> {matchedPartner.rating}
                  </span>
                  <span>•</span>
                  <span>{matchedPartner.totalSessions} buổi đã hoàn thành</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleStartMatching}
                className="px-4 py-2.5 rounded-xl border border-study-border bg-study-surface text-xs font-semibold text-study-text-muted hover:text-study-text transition-colors cursor-pointer"
              >
                Đổi bạn học khác
              </button>
              <button
                type="button"
                onClick={handleEnterRoom}
                className="px-6 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Play size={15} fill="currentColor" />
                <span>Vào phòng đàm thoại ngay</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Past Peer Sessions History */}
      {peerSessions.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold text-study-text-muted uppercase tracking-wider block">
            Lịch sử kết nối 1-kèm-1 gần đây
          </span>
          <div className="space-y-2">
            {peerSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl bg-study-surface border border-study-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={session.partner.avatar}
                    alt={session.partner.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <strong className="text-study-text block font-semibold">{session.topicTitle}</strong>
                    <span className="text-study-text-muted text-[11px]">
                      Cùng với {session.partner.name} • {session.durationMinutes} phút
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-study-success/10 text-study-success font-medium text-[11px]">
                    Hoàn thành
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
