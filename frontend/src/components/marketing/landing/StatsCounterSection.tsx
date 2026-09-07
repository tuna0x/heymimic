import { useCountUp } from '../../../hook/useScrollReveal'

interface StatsCounterSectionProps {
  statsRef: (node?: HTMLElement | null) => void
  statsVisible: boolean
}

export function StatsCounterSection({ statsRef, statsVisible }: StatsCounterSectionProps) {
  const sessionsCount = useCountUp(12847, statsVisible, 2000)
  const streakCount = useCountUp(28, statsVisible, 1400)
  const scoreCount = useCountUp(94, statsVisible, 1600)
  const usersCount = useCountUp(3200, statsVisible, 1800)

  return (
    <section ref={statsRef} className={`max-w-4xl mx-auto px-6 scroll-reveal-scale ${statsVisible ? 'visible' : ''}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-study-primary-soft via-study-surface to-study-primary-soft/50 border border-study-primary-border/40 shadow-sm">
        <div className="text-center space-y-1">
          <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
            {sessionsCount.toLocaleString()}+
          </span>
          <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">buổi luyện nói</span>
        </div>
        <div className="text-center space-y-1">
          <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
            {streakCount} ngày
          </span>
          <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">streak trung bình</span>
        </div>
        <div className="text-center space-y-1">
          <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
            {scoreCount}/100
          </span>
          <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">điểm phản xạ TB</span>
        </div>
        <div className="text-center space-y-1">
          <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
            {usersCount.toLocaleString()}+
          </span>
          <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">học viên đang dùng</span>
        </div>
      </div>
    </section>
  )
}
