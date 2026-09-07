import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AcousticWaveVisualizer } from '../AcousticWaveVisualizer'

interface HeroSectionProps {
  heroRef: (node?: HTMLElement | null) => void
  heroVisible: boolean
}

export function HeroSection({ heroRef, heroVisible }: HeroSectionProps) {
  return (
    <section
      ref={heroRef}
      className={`max-w-5xl mx-auto px-6 pt-16 sm:pt-24 text-center space-y-8 scroll-reveal ${heroVisible ? 'visible' : ''}`}
    >
      {/* Eyebrow & Active Learners Beacon */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-study-primary bg-study-primary-soft px-3.5 py-1.5 rounded-full border border-study-primary-border/50">
          <span className="w-1.5 h-1.5 rounded-full bg-study-primary animate-pulse" />
          <span>Phòng luyện nói tiếng Anh cá nhân hóa bằng AI</span>
        </div>

        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-study-surface border border-study-border shadow-2xs text-xs">
          <div className="flex -space-x-1.5 overflow-hidden">
            <span className="inline-flex h-4.5 w-4.5 rounded-full ring-2 ring-study-surface bg-study-primary text-white text-[8px] font-bold items-center justify-center">HN</span>
            <span className="inline-flex h-4.5 w-4.5 rounded-full ring-2 ring-study-surface bg-sky-500 text-white text-[8px] font-bold items-center justify-center">MT</span>
            <span className="inline-flex h-4.5 w-4.5 rounded-full ring-2 ring-study-surface bg-study-primary text-white text-[8px] font-bold items-center justify-center">TA</span>
          </div>
          <span className="text-study-text-muted text-[11px]">
            <strong className="text-study-text font-semibold">1,428 bạn</strong> đang mở mic hôm nay
          </span>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-study-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-study-primary" />
          </span>
        </div>
      </div>

      {/* Clean Headline */}
      <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-study-text max-w-4xl mx-auto leading-[1.15] text-balance">
        Nói tiếng Anh tự nhiên. <br className="hidden sm:inline" />
        <span className="text-study-primary font-serif font-normal italic">
          Bằng phản xạ của chính bạn.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-study-text-muted max-w-2xl mx-auto leading-relaxed font-normal">
        Xóa bỏ cảm giác ngập ngừng khi giao tiếp. Mỗi ngày 60–90 giây mở mic nói cùng AI trong không gian riêng tư, nhận gợi ý chuẩn bản xứ để biến từ vựng thành thói quen thật.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-study-primary text-white font-semibold text-sm hover:bg-study-primary-hover shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Bắt đầu luyện nói</span>
          <ArrowRight size={15} />
        </Link>

        <Link
          to="/speaking-method"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-sm font-medium text-study-text transition-colors"
        >
          <span>Khám phá phương pháp Shadowing</span>
          <ArrowUpRight size={14} className="text-study-text-muted" />
        </Link>
      </div>

      {/* Trust Points */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-study-text-muted">
        <span className="flex items-center gap-1.5">
          <Check size={14} className="text-study-primary" strokeWidth={2.5} />
          Không phán xét hay chấm điểm áp lực
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={14} className="text-study-primary" strokeWidth={2.5} />
          Chỉ 10–15 phút mỗi ngày
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={14} className="text-study-primary" strokeWidth={2.5} />
          100% riêng tư
        </span>
      </div>

      {/* Acoustic Wave Visualizer */}
      <AcousticWaveVisualizer />
    </section>
  )
}
