import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  ExternalLink,
  History,
  Mic2,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useMimicStore } from '../store/useMimicStore'
import { ROUTES } from '../route/routePaths'
import { EmptyState } from '../components/shared/EmptyState'
import { usePageMeta } from '../hook/usePageMeta'

export function SpeakingHistory() {
  usePageMeta('Lịch Sử Bài Luyện Nói — HeyMimic', 'Xem lại các phiên luyện nói, bản ghi và phân tích phản hồi chi tiết.')
  const navigate = useNavigate()
  const { speakingSessions } = useMimicStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSessions = speakingSessions.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return s.title.toLowerCase().includes(q) || s.prompt.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-left animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary mb-1">
            <History size={14} />
            <span>NHẬT KÝ LUYỆN TẬP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Lịch sử luyện nói
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1 leading-relaxed">
            Xem lại các chủ đề đã thực hành, số lần thu âm và nhận xét cải thiện.
          </p>
        </div>

        <Link
          to={ROUTES.SPEAKING}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Mic2 size={15} />
          <span>Luyện bài nói mới</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      {speakingSessions.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-study-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chủ đề hoặc đề bài..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-study-surface border border-study-border text-xs sm:text-sm text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors"
          />
        </div>
      )}

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          icon={Mic2}
          title={searchQuery ? 'Không tìm thấy bài nói phù hợp' : 'Chưa có bài luyện nói nào'}
          description={
            searchQuery
              ? 'Thử thay đổi từ khóa tìm kiếm để xem các phiên học trước.'
              : 'Hãy bắt đầu với một chủ đề quen thuộc trong công việc hoặc giao tiếp hằng ngày.'
          }
          actionLabel={searchQuery ? 'Xóa bộ lọc tìm kiếm' : 'Bắt đầu bài nói đầu tiên'}
          onAction={() => {
            if (searchQuery) setSearchQuery('')
            else navigate(ROUTES.SPEAKING)
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const attemptCount = session.attempts?.length ?? 1
            return (
              <div
                key={session.id}
                onClick={() => navigate(`/speaking/history/${session.id}`)}
                className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-study-primary/40 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-study-surface-muted text-[10px] font-mono text-study-text-muted border border-study-border">
                      {session.date}
                    </span>
                    {attemptCount > 1 && (
                      <span className="px-2 py-0.5 rounded-md bg-study-accent-soft/60 text-[10px] font-semibold text-study-accent border border-study-accent/20 flex items-center gap-1">
                        <RotateCcw size={10} />
                        <span>{attemptCount} lần thử</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-study-text group-hover:text-study-primary transition-colors truncate">
                    {session.title}
                  </h3>

                  <p className="text-xs text-study-text-muted line-clamp-1 leading-relaxed">
                    {session.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-study-border">
                  {/* Duration */}
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-1 text-xs text-study-text-muted">
                      <Clock size={12} />
                      <span className="font-mono">{session.duration}</span>
                    </div>
                    <span className="text-[10px] text-study-text-muted">Thời lượng</span>
                  </div>

                  {/* Score */}
                  <div className="text-left sm:text-right min-w-[70px]">
                    <div className="flex items-center sm:justify-end gap-1 text-sm font-bold font-display text-study-primary">
                      <Trophy size={14} />
                      <span>{session.score > 0 ? `${session.score}/100` : 'Đã nộp'}</span>
                    </div>
                    <span className="text-[10px] text-study-text-muted">Điểm mẫu</span>
                  </div>

                  <ExternalLink size={16} className="text-study-text-muted group-hover:text-study-primary transition-colors hidden sm:block" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Demo Audio Note */}
      <div className="p-4 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs text-study-text-muted space-y-1">
        <span className="font-semibold text-study-text flex items-center gap-1.5">
          <Sparkles size={13} className="text-study-accent" />
          <span>Lưu ý về bản ghi âm:</span>
        </span>
        <p>
          Bản ghi âm từ microphone của bạn chỉ được lưu tạm trong bộ nhớ trình duyệt ở phiên hiện tại để bảo vệ quyền riêng tư. Transcript mẫu và nhận xét cải thiện được lưu cục bộ để bạn theo dõi tiến bộ.
        </p>
      </div>
    </div>
  )
}
