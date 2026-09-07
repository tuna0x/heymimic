import { ArrowRight, Info, Wand2 } from 'lucide-react'
import { AcousticMetrics } from './AcousticMetrics'
import { AudioPlayerBar } from './AudioPlayerBar'
import { FeedbackCard } from './FeedbackCard'
import { SentenceDiffCard } from './SentenceDiffCard'
import type { SpeakingResult } from '../../type'

interface SpeakingAnalysisSectionProps {
  result: SpeakingResult
  audioUrl: string | null
  recordingTime: number
  liveTranscript: string
  onReRecord: () => void
  onTransformSentence: (sentence: string) => void
  onSpeakSentence: (text: string) => void
  onPracticeSentence: (sentence: string) => void
  onFinishSpeaking: () => void
}

export function SpeakingAnalysisSection({
  result,
  audioUrl,
  recordingTime,
  liveTranscript,
  onReRecord,
  onTransformSentence,
  onSpeakSentence,
  onPracticeSentence,
  onFinishSpeaking,
}: SpeakingAnalysisSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Honest Demo Notice Banner */}
      <div className="p-4 rounded-2xl bg-study-primary-soft/50 border border-study-primary-border/60 text-xs text-study-text flex items-start gap-3">
        <Info size={18} className="text-study-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-semibold text-study-text">
            Kết quả minh họa mẫu (Demo Mode)
          </strong>
          <p className="text-study-text-muted leading-relaxed text-[11px]">
            Bản ghi âm giọng nói của bạn đã được ghi nhận trên trình duyệt. Transcript, điểm số và gợi ý dưới đây là dữ liệu minh họa để bạn trải nghiệm cách Speaking Agent sẽ phản hồi khi kết nối API thật.
          </p>
        </div>
      </div>

      {/* Audio Playback Bar */}
      <AudioPlayerBar
        audioUrl={audioUrl}
        recordingDurationSeconds={recordingTime || 78}
        onReRecord={onReRecord}
      />

      {/* User's Original Transcript */}
      <div className="p-5 rounded-2xl bg-study-surface border border-study-border space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-study-primary">
            Bản ghi lời của bạn (Transcript)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTransformSentence(liveTranscript || result.userTranscript)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-study-primary-soft hover:bg-study-primary hover:text-white border border-study-primary-border/60 text-xs font-semibold text-study-primary transition-all cursor-pointer shadow-xs"
            >
              <Wand2 size={13} />
              <span>Biến hóa câu 3 sắc thái ✨</span>
            </button>
            <span className="text-[11px] text-study-text-muted">
              {recordingTime || 78} giây thực tế
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-study-text italic leading-relaxed bg-study-surface-muted/50 p-4 rounded-xl border border-study-border/50">
          “{liveTranscript || result.userTranscript}”
        </p>
      </div>

      {/* Multi-metric Breakdown */}
      <AcousticMetrics
        score={result.score}
        fluencyScore={result.fluencyScore}
        wpm={result.wpm}
        cadenceScore={result.cadenceScore}
        vocabScore={result.vocabScore}
      />

      {/* Sentence Diff & Native Rephrasing with Sentence Practice Option */}
      <SentenceDiffCard
        rephrases={result.rephrases}
        onSpeak={onSpeakSentence}
        onPracticeSentence={onPracticeSentence}
      />

      {/* Detailed Grammar & Accent Feedback */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-study-primary block">
          Gợi ý cải thiện chi tiết
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.feedback.map((item) => (
            <FeedbackCard feedback={item} key={item.id} />
          ))}
        </div>
      </div>

      {/* Final CTA: End Study Session */}
      <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-display font-semibold text-study-text">
            Bạn đã hoàn thành bài nói!
          </h3>
          <p className="text-xs text-study-text-muted mt-0.5">
            Chuyển sang trang tổng kết để lưu kết quả và cập nhật chuỗi học hôm nay.
          </p>
        </div>

        <button
          type="button"
          onClick={onFinishSpeaking}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <span>Xem tổng kết buổi học</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
