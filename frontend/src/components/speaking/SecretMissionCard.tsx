import { Award, RefreshCw, Target } from 'lucide-react'

interface SecretMissionCardProps {
  targetPhrase: string
  detected: boolean
  onSelectMission: (missionWord: string) => void
}

const secretMissions = [
  {
    chunk: 'At the end of the day',
    meaning: 'Suy cho cùng / Điều cốt lõi là',
    example: 'At the end of the day, user satisfaction is what truly matters.',
    tip: 'Dùng ở câu kết luận để chốt lại quan điểm chính.',
  },
  {
    chunk: 'From my perspective',
    meaning: 'Theo góc nhìn của tôi',
    example: 'From my perspective, we should simplify the user journey first.',
    tip: 'Dùng khi đưa ra ý kiến cá nhân thay cho "I think".',
  },
  {
    chunk: 'Touch base with',
    meaning: 'Liên lạc / Trao đổi nhanh với ai đó',
    example: "Let me touch base with the team and get back to you shortly.",
    tip: 'Cụm từ công sở đắt giá thay cho "contact" hoặc "talk to".',
  },
  {
    chunk: 'Keep you in the loop',
    meaning: 'Cập nhật tình hình liên tục cho bạn',
    example: "I will definitely keep you in the loop as soon as we make progress.",
    tip: 'Thể hiện sự chủ động và chuyên nghiệp trong giao tiếp.',
  },
  {
    chunk: 'Push back the deadline',
    meaning: 'Thương lượng dời thời hạn bàn giao',
    example: 'Could we push back the deadline by two business days?',
    tip: 'Cách diễn đạt tự nhiên thay vì "delay the deadline".',
  },
]

export function SecretMissionCard({
  targetPhrase,
  detected,
  onSelectMission,
}: SecretMissionCardProps) {
  const missionIndex = Math.max(
    secretMissions.findIndex((mission) => mission.chunk === targetPhrase),
    0
  )
  const currentMission = secretMissions[missionIndex]

  const handleNextMission = () => {
    const nextIdx = (missionIndex + 1) % secretMissions.length
    onSelectMission(secretMissions[nextIdx].chunk)
  }

  return (
    <div className={`p-4 rounded-2xl border transition-all text-left ${
      detected
        ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20 shadow-sm'
        : 'bg-gradient-to-r from-study-accent-soft/40 via-study-surface to-study-surface border-study-accent/30 shadow-xs'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-study-accent text-white flex items-center justify-center shadow-xs">
            <Target size={13} />
          </div>
          <span className="text-xs font-bold text-study-accent uppercase tracking-wider">
            THỬ THÁCH BÍ MẬT (SECRET MISSION)
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextMission}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-study-text-muted hover:text-study-text transition-colors cursor-pointer"
          title="Đổi thử thách khác"
        >
          <RefreshCw size={12} />
          <span>Đổi cụm khác</span>
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold font-mono text-study-text">
            “{currentMission.chunk}”
          </span>
          <span className="text-xs text-study-text-muted">
            ({currentMission.meaning})
          </span>
        </div>

        <p className="text-xs text-study-text-muted leading-relaxed">
          <strong>Nhiệm vụ:</strong> Hãy tìm cách lồng ghép tự nhiên cụm từ này vào bài nói của bạn. {currentMission.tip}
        </p>
      </div>

      {detected && (
        <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-500 font-semibold animate-scale-up">
          <Award size={16} />
          <span>XUẤT SẮC! Hệ thống đã nhận diện bạn sử dụng cụm từ này thành công!</span>
        </div>
      )}
    </div>
  )
}
