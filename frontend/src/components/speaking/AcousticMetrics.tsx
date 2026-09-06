import { Award, Gauge, Sparkles, Waves } from 'lucide-react'

interface AcousticMetricsProps {
  score: number
  fluencyScore: number
  wpm: number
  cadenceScore: number
  vocabScore: number
}

export function AcousticMetrics({
  score,
  fluencyScore,
  wpm,
  cadenceScore,
  vocabScore,
}: AcousticMetricsProps) {
  const metrics = [
    {
      label: 'Độ tự nhiên (Fluency)',
      score: fluencyScore,
      unit: '%',
      icon: <Sparkles size={16} className="text-study-primary" />,
      evaluation: fluencyScore >= 85 ? 'Rất tự nhiên' : 'Cần bớt ngập ngừng',
      barColor: 'bg-teal-500',
    },
    {
      label: 'Tốc độ nói (WPM)',
      score: wpm,
      unit: 'wpm',
      icon: <Gauge size={16} className="text-amber-500" />,
      evaluation: wpm >= 110 && wpm <= 140 ? 'Vùng tốc độ chuẩn' : wpm < 110 ? 'Hơi chậm' : 'Hơi nhanh',
      barColor: 'bg-amber-500',
      percent: Math.min(100, Math.round((wpm / 150) * 100)),
    },
    {
      label: 'Ngữ điệu & Nhịp (Cadence)',
      score: cadenceScore,
      unit: '%',
      icon: <Waves size={16} className="text-emerald-500" />,
      evaluation: cadenceScore >= 80 ? 'Nhấn đúng trọng âm' : 'Cần chú ý ngắt nhịp',
      barColor: 'bg-emerald-500',
    },
    {
      label: 'Từ vựng ngữ cảnh (Vocab)',
      score: vocabScore,
      unit: '%',
      icon: <Award size={16} className="text-indigo-500" />,
      evaluation: vocabScore >= 80 ? 'Sử dụng cụm từ tốt' : 'Từ vựng hơi lặp lại',
      barColor: 'bg-indigo-500',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-study-primary font-mono">
          CHỈ SỐ PHÂN TÍCH AI (ACOUSTIC METRICS)
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-study-primary-soft text-study-primary text-xs font-bold font-display">
          <span>{score}</span>
          <span className="text-[10px] font-normal opacity-80">/100 TỔNG ĐIỂM</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((item, idx) => {
          const percent = item.percent ?? item.score

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-study-surface border border-study-border shadow-xs space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-lg bg-study-surface-muted">
                  {item.icon}
                </span>
                <span className="text-xs font-bold font-mono text-study-text">
                  {item.score} <span className="text-[10px] text-study-text-muted font-normal">{item.unit}</span>
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-study-text truncate">
                  {item.label}
                </span>
                <span className="block text-[10px] text-study-text-muted">
                  {item.evaluation}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-study-border/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
