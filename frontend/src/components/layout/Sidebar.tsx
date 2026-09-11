import {
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  Globe2,
  Headphones,
  LayoutDashboard,
  Mic2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Settings,
  Sun,
  Tv,
  Users2,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { BrandGlyph, BrandLogo } from '../shared/BrandLogo'
import { useMimicStore } from '../../store/useMimicStore'

const groups = [
  {
    label: 'Không gian học',
    items: [
      { to: '/dashboard', label: 'Hôm nay', icon: LayoutDashboard },
      { to: '/speaking', label: 'Luyện nói phản xạ', icon: Mic2 },
      { to: '/vocab', label: 'Từ vựng & Cụm từ', icon: BookOpen },
      { to: '/progress', label: 'Tiến độ & Sổ lỗi', icon: ChartNoAxesCombined },
    ],
  },
  {
    label: 'Thực hành thêm',
    items: [
      { to: '/peer-practice', label: 'Nói cùng bạn học', icon: Users2 },
      { to: '/video-learning', label: 'Học qua Video', icon: Tv },
      { to: '/speaking/dialogue', label: 'Hội thoại AI', icon: Bot },
      { to: '/listening', label: 'Luyện nghe & Nhại', icon: Headphones },
      { to: '/writing', label: 'Luyện viết', icon: PenTool },
    ],
  },
]
export interface SidebarProps {
  isLight: boolean
  onToggleTheme: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  isMobileDrawer?: boolean
  onNavigate?: () => void
}
export function Sidebar({
  isLight,
  onToggleTheme,
  collapsed = false,
  onToggleCollapse,
  isMobileDrawer = false,
  onNavigate,
}: SidebarProps) {
  const profile = useMimicStore((state) => state.profile)
  const compact = collapsed && !isMobileDrawer
  const initials =
    profile.name
      ?.split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  return (
    <aside className="flex h-full w-full flex-col border-r border-study-border bg-study-surface px-3 py-6">
      {!isMobileDrawer && (
        <div className="mb-8 flex h-8 items-center justify-center">
          {compact ? (
            <Link to="/dashboard" aria-label="HeyMimic — Hôm nay">
              <BrandGlyph size={32} />
            </Link>
          ) : (
            <div className="w-full px-3">
              <BrandLogo size="lg" to="/dashboard" />
            </div>
          )}
        </div>
      )}
      <nav
        aria-label="Điều hướng học tập"
        className="min-h-0 flex-1 space-y-7 overflow-y-auto"
      >
        {groups.map((group) => (
          <div key={group.label}>
            {!compact && (
              <p className="mb-2 px-3 text-xs font-medium text-study-text-muted">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/speaking'}
                  onClick={onNavigate}
                  title={compact ? label : undefined}
                  aria-label={compact ? label : undefined}
                  className={({ isActive }) =>
                    [
                      'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm',
                      compact ? 'justify-center' : '',
                      isActive
                        ? 'bg-study-primary-soft font-semibold text-study-primary'
                        : 'text-study-text-soft hover:bg-study-surface-muted hover:text-study-text',
                    ].join(' ')
                  }
                >
                  <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                  {!compact && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-6 space-y-1 border-t border-study-border pt-4">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Đổi giao diện sáng tối"
          title="Đổi giao diện sáng tối"
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-study-text-muted hover:bg-study-surface-muted"
        >
          {isLight ? (
            <Moon size={18} className="shrink-0" />
          ) : (
            <Sun size={18} className="shrink-0" />
          )}
          {!compact && (
            <span>{isLight ? 'Giao diện tối' : 'Giao diện sáng'}</span>
          )}
        </button>
        <Link
          to="/"
          title="Trang giới thiệu"
          aria-label="Trang giới thiệu"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-study-text-muted hover:bg-study-surface-muted"
        >
          <Globe2 size={18} className="shrink-0" />
          {!compact && <span>Trang giới thiệu</span>}
        </Link>
        {!isMobileDrawer && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={
              compact ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'
            }
            title="Ctrl+B"
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-study-text-muted hover:bg-study-surface-muted"
          >
            {compact ? (
              <PanelLeftOpen size={18} className="shrink-0" />
            ) : (
              <PanelLeftClose size={18} className="shrink-0" />
            )}
            {!compact && <span>Thu gọn thanh bên</span>}
          </button>
        )}
        <Link
          to="/settings"
          onClick={onNavigate}
          aria-label="Hồ sơ và cài đặt"
          className="flex items-center gap-3 rounded-lg px-2 pt-4 pb-2 hover:bg-study-surface-muted"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-study-primary-soft text-xs font-semibold text-study-primary">
            {initials}
          </span>
          {!compact && (
            <>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-medium">
                  {profile.name || 'Học viên'}
                </strong>
                <span className="text-xs text-study-text-muted">
                  Hồ sơ cá nhân
                </span>
              </span>
              <Settings size={16} className="shrink-0 text-study-text-muted" />
            </>
          )}
        </Link>
      </div>
    </aside>
  )
}
