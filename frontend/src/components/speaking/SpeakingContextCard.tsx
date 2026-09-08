import { ChevronDown, ChevronUp, Headphones, Sparkles, VolumeX } from 'lucide-react'
import { SecretMissionCard } from './SecretMissionCard'
import type { SpeakingTopic, VocabWord } from '../../type'

interface SpeakingContextCardProps {
  activeTopic: SpeakingTopic
  carriedWords: VocabWord[]
  isPlayingModel: boolean
  showOutline: boolean
  secretMissionTarget: string
  secretMissionDetected: boolean
  onSelectSecretMission: (missionWord: string) => void
  onToggleModelSpeech: () => void
  onToggleOutline: () => void
}

export function SpeakingContextCard({
  activeTopic,
  carriedWords,
  isPlayingModel,
  showOutline,
  secretMissionTarget,
  secretMissionDetected,
  onSelectSecretMission,
  onToggleModelSpeech,
  onToggleOutline,
}: SpeakingContextCardProps) {
  return (
    <div className="bg-study-surface border border-study-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-study-primary">
              {activeTopic.categoryLabel} · {activeTopic.level}
            </span>
            <span className="text-study-text-muted">·</span>
            <span className="text-xs text-study-text-muted">Gợi ý thời lượng: 60–90 giây</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-study-text mt-1">
            {activeTopic.title}
          </h2>
        </div>

        {/* Model Answer Audio Button */}
        <button
          type="button"
          onClick={onToggleModelSpeech}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0 ${
            isPlayingModel
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-study-primary-soft text-study-primary hover:bg-study-primary hover:text-white border border-study-primary-border/60'
          }`}
          title="Nghe câu trả lời mẫu phát âm bằng giọng thiết bị"
        >
          {isPlayingModel ? <VolumeX size={15} /> : <Headphones size={15} />}
          <span>{isPlayingModel ? 'Dừng phát âm' : 'Nghe câu trả lời mẫu'}</span>
        </button>
      </div>

      {/* Prompt description */}
      <p className="text-xs sm:text-sm text-study-text-soft leading-relaxed bg-study-surface-muted/50 p-4 rounded-xl border border-study-border/50">
        <strong>Bối cảnh & Đề bài: </strong>
        {activeTopic.prompt}
      </p>

      {/* Carried Vocab Alert if available */}
      {carriedWords.length > 0 && (
        <div className="p-3.5 rounded-xl bg-study-accent-soft/40 border border-study-accent/25 space-y-1.5">
          <span className="text-xs font-semibold text-study-accent flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Từ bạn vừa ôn tập — hãy thử lồng ghép vào bài nói:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {carriedWords.map((w) => (
              <span
                key={w.id}
                className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-study-surface text-study-accent border border-study-accent/30"
              >
                {w.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Secret Mission Challenge Gamification */}
      <SecretMissionCard
        targetPhrase={secretMissionTarget}
        detected={secretMissionDetected}
        onSelectMission={onSelectSecretMission}
      />

      {/* Outline & Key Ideas Collapsible */}
      <div>
        <button
          type="button"
          onClick={onToggleOutline}
          className="flex items-center gap-2 text-xs font-semibold text-study-text-muted hover:text-study-text cursor-pointer transition-colors"
        >
          {showOutline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{showOutline ? 'Thu gọn gợi ý dàn bài' : 'Xem gợi ý dàn bài 3 bước'}</span>
        </button>

        {showOutline && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {activeTopic.outline.map((point, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-study-surface-muted/40 border border-study-border/60 text-xs text-study-text-soft leading-relaxed"
              >
                <span className="font-bold text-study-primary mr-1.5">{index + 1}.</span>
                {point}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
