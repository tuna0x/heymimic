import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Compass, Home, Mic2, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePageMeta } from '../hook/usePageMeta'
import { ROUTES } from '../route/routePaths'

export function NotFound() {
  usePageMeta('Không Tìm Thấy Trang (404) — HeyMimic', 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển hướng.')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const destination = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center animate-fade-in">
      <div className="max-w-md w-full space-y-6">
        {/* Visual Icon */}
        <div className="w-16 h-16 rounded-3xl bg-study-primary-soft text-study-primary flex items-center justify-center mx-auto border border-study-primary-border/60 shadow-xs">
          <Compass size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-study-primary uppercase tracking-wider">
            LỖI 404 · TRANG KHÔNG TỒN TẠI
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Đường dẫn không xác định
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
            Liên kết bạn vừa mở không tồn tại hoặc đã được sắp xếp lại trong hệ thống học tập.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Home size={15} />
            <span>{isAuthenticated ? 'Về phòng học hôm nay' : 'Về trang chủ HeyMimic'}</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-study-border space-y-2">
          <span className="text-xs text-study-text-muted block">Lối tắt học tập nhanh:</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to={ROUTES.VOCAB}
              className="px-3 py-1.5 rounded-lg bg-study-surface border border-study-border text-xs font-medium text-study-text hover:border-study-primary transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen size={13} className="text-study-primary" />
              <span>Kho từ vựng</span>
            </Link>
            <Link
              to={ROUTES.SPEAKING}
              className="px-3 py-1.5 rounded-lg bg-study-surface border border-study-border text-xs font-medium text-study-text hover:border-study-accent transition-colors inline-flex items-center gap-1.5"
            >
              <Mic2 size={13} className="text-study-accent" />
              <span>Phòng luyện nói</span>
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="px-3 py-1.5 rounded-lg bg-study-surface border border-study-border text-xs font-medium text-study-text hover:border-study-primary transition-colors inline-flex items-center gap-1.5"
            >
              <span>Hỗ trợ & Góp ý</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
