import { ArrowRight, Sparkles, Volume2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function AcousticAnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('heymimic_banner_dismissed') === 'true'
    } catch {
      return false
    }
  })

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem('heymimic_banner_dismissed', 'true')
    } catch {
      // ignore
    }
  }

  return (
    <aside aria-label="Thông báo cập nhật" className="relative bg-study-primary-soft/60 border-b border-study-primary-border/60 text-xs py-2 px-4 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Animated Acoustic Dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-study-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-study-primary" />
          </span>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-study-primary text-white shrink-0">
            NEW v2.4
          </span>

          <p className="text-study-text font-medium truncate text-xs">
            <span className="font-semibold">HeyMimic Acoustic Engine:</span>{' '}
            <span className="text-study-text-muted hidden sm:inline">
              Trực quan hóa đồ thị cao độ (Pitch Contour) & nhịp điệu ngắt hơi câu nói theo thời gian thực.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/speaking-method"
            className="inline-flex items-center gap-1 font-semibold text-study-primary hover:text-study-primary-hover hover:underline transition-colors"
          >
            <span>Khám phá phương pháp</span>
            <ArrowRight size={12} />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-md text-study-text-muted hover:text-study-text hover:bg-study-surface-muted transition-colors cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
