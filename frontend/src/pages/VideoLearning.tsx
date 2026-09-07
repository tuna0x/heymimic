import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Clock,
  Flame,
  Gauge,
  Headphones,
  Mic2,
  Play,
  Repeat,
  Sparkles,
  Tv,
  Video,
  Volume2,
} from 'lucide-react'
import { SectionLabel } from '../components/shared/UI'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'
import { videoClips } from '../mocks/videos'
import type { VideoClip } from '../type'

export function VideoLearning() {
  usePageMeta(
    'Học Phản Xạ Theo Video (Video Shadowing) — HeyMimic',
    'Xem video thực tế, nghe phát âm chuẩn ngữ điệu và nhại âm theo từng câu với phụ đề tương tác.'
  )

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredClips = videoClips.filter((clip) => {
    if (selectedCategory === 'all') return true
    return clip.category === selectedCategory
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-left animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary mb-1">
            <Tv size={14} />
            <span>VIDEO SHADOWING STUDIO · HỌC QUA VIDEO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-study-text tracking-tight">
            Xem, nghe & nhại âm theo Video<span className="text-study-primary">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1.5 max-w-xl leading-relaxed">
            Xem các đoạn trích chân thực từ TED Talks, đàm phán công sở và phỏng vấn. Bấm vào bất kỳ dòng phụ đề nào để tua và thu âm nói theo khẩu hình người bản xứ.
          </p>
        </div>

        {/* Info Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-study-surface border border-study-border text-xs font-medium text-study-text shadow-xs">
            <Sparkles size={14} className="text-study-primary" />
            <span>Phụ đề song ngữ tương tác</span>
          </div>
        </div>
      </div>

      {/* 4-Step Shadowing Methodology Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs">
        {[
          { step: '01', title: 'Xem & Ngấm', desc: 'Quan sát khẩu hình và ngữ cảnh' },
          { step: '02', title: 'Tách Câu & Lặp', desc: 'Bấm phụ đề để tua đúng giây' },
          { step: '03', title: 'Thu Âm Nhại Lại', desc: 'Nói theo nhịp và cao độ mẫu' },
          { step: '04', title: 'Nghe Đối Chiếu', desc: 'So sánh giọng bạn vs bản xứ' },
        ].map((item) => (
          <div key={item.step} className="p-3 rounded-xl bg-study-surface-muted/40 border border-study-border/50">
            <span className="text-xs font-mono font-bold text-study-primary block">
              BƯỚC {item.step}
            </span>
            <strong className="text-xs font-semibold text-study-text block mt-0.5">
              {item.title}
            </strong>
            <p className="text-[11px] text-study-text-muted mt-0.5 leading-snug">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'all', label: 'Tất cả video' },
          { id: 'ted', label: 'TED & Kỹ năng nói' },
          { id: 'work', label: 'Đàm phán & Công sở' },
          { id: 'interview', label: 'Phỏng vấn xin việc' },
          { id: 'movies', label: 'Giao tiếp đời thường' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-study-primary text-white shadow-xs'
                : 'bg-study-surface border border-study-border text-study-text-muted hover:text-study-text hover:bg-study-surface-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Video Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClips.map((clip) => (
          <div
            key={clip.id}
            className="group rounded-2xl bg-study-surface border border-study-border hover:border-study-primary-border/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <img
                  src={clip.posterUrl}
                  alt={clip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Level and Category Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                    {clip.categoryLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-study-primary/90 text-white text-[11px] font-mono font-bold">
                    {clip.level}
                  </span>
                </div>

                {/* Duration & Speed WPM */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg font-mono">
                    <Clock size={12} />
                    {clip.durationSeconds} giây
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg font-mono">
                    <Gauge size={12} />
                    {clip.wpm} từ/phút
                  </span>
                </div>

                {/* Center Play Icon Hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-study-primary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-study-primary">
                    {clip.speaker} • <span className="text-study-text-muted font-normal">{clip.speakerRole}</span>
                  </div>
                  <h3 className="text-base font-display font-semibold text-study-text group-hover:text-study-primary transition-colors mt-1 leading-snug">
                    {clip.title}
                  </h3>
                  <p className="text-xs text-study-text-muted mt-1 leading-relaxed line-clamp-2">
                    {clip.description}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="p-3 rounded-xl bg-study-surface-muted/40 border border-study-border space-y-1">
                  <span className="text-[10px] font-bold text-study-text uppercase tracking-wider block">
                    ĐIỂM NHẤN NGỮ ĐIỆU CẦN HỌC
                  </span>
                  <ul className="text-xs text-study-text-muted space-y-0.5 list-disc list-inside">
                    {clip.keyTakeaways.slice(0, 2).map((point, idx) => (
                      <li key={idx} className="truncate">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Card Footer CTA */}
            <div className="px-5 pb-5 pt-2">
              <Link
                to={`/video-learning/${clip.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-study-primary-soft hover:bg-study-primary text-study-primary hover:text-white border border-study-primary-border/60 text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Vào phòng Shadowing Video</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
