import { ArrowUpRight, BookOpen, Clock3, Mic2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SpeakingTopic, VocabWord } from '../../type'

interface DailyPriorityGatewaysProps {
  vocabWords: VocabWord[]
  targetTopic?: SpeakingTopic
}

export function DailyPriorityGateways({
  vocabWords,
  targetTopic,
}: DailyPriorityGatewaysProps) {
  const wordsDueCount = vocabWords.filter(
    (w) => w.status === 'reviewing' || w.status === 'new'
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Vocab Teaser Card */}
      <section className="bg-study-surface border border-study-border hover:border-study-primary-border/70 rounded-2xl p-6  flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-study-text-muted">
              Kho từ vựng cá nhân
            </span>
            <span className="w-9 h-9 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center">
              <BookOpen size={18} />
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="max-w-xs">
              <h3 className="text-lg font-display font-semibold text-study-text group-hover:text-study-primary transition-colors">
                Ôn từ vựng đến hạn
              </h3>
              <p className="text-sm text-study-text-muted mt-1.5 leading-relaxed">
                {wordsDueCount > 0
                  ? wordsDueCount + ' từ đang chờ bạn ôn lại.'
                  : 'Thêm từ từ ngữ cảnh của bạn để bắt đầu xây dựng kho từ cá nhân.'}
              </p>
            </div>

            {/* Word preview stack */}
            <div className="flex flex-wrap sm:flex-col gap-1.5 sm:w-28 shrink-0">
              {vocabWords.slice(0, 2).map((w) => (
                <span
                  key={w.id}
                  className="px-2.5 py-1 rounded-lg text-sm font-mono font-medium bg-study-surface-muted text-study-text-soft border border-study-border/60 truncate"
                >
                  {w.word}
                </span>
              ))}
              {vocabWords.length > 2 && (
                <span className="px-2.5 py-1 rounded-lg text-sm font-mono font-semibold bg-study-primary-soft text-study-primary border border-study-primary-border/60">
                  +{vocabWords.length - 2} từ khác
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle text-sm text-study-text-muted">
          <span className="flex items-center gap-1.5">
            <Clock3 size={14} /> ~4–6 phút
          </span>
          <Link
            to="/vocab"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-surface-muted text-study-text font-medium text-sm hover:bg-study-surface-hover"
          >
            <span>Vào kho từ</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* Speaking Teaser Card */}
      <section className="bg-study-surface border border-study-border hover:border-study-accent/40 rounded-2xl p-6  flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-study-text-muted">
              Phòng luyện phản xạ nói
            </span>
            <span className="w-9 h-9 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center">
              <Mic2 size={18} />
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-study-text group-hover:text-study-primary transition-colors leading-snug">
                {targetTopic?.title ?? 'Chọn một chủ đề để bắt đầu'}
              </h3>
              <p className="text-sm text-study-text-muted mt-1.5 leading-relaxed max-w-sm">
                {targetTopic?.prompt ??
                  'Mở phòng luyện nói để chọn tình huống phù hợp và thực hành theo nhịp của bạn.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-study-surface-muted border border-study-border text-[11px] font-medium text-study-text-soft shrink-0">
              <Play
                size={10}
                fill="currentColor"
                className="text-study-primary"
              />
              <span>60–90 giây</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-study-border-subtle text-sm text-study-text-muted">
          <span className="flex items-center gap-1.5">
            <Clock3 size={14} /> Nói & xem phản hồi
          </span>
          <Link
            to="/speaking"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-study-text font-semibold text-sm transition-colors"
          >
            <span>Mở bài nói</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
