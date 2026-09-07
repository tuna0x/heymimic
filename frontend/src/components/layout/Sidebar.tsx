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
  Settings as SettingsIcon,
  Sun,
  Tv,
  Users2,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Streak } from '../shared/UI'
import { BrandGlyph, BrandLogo } from '../shared/BrandLogo'
import { useMimicStore } from '../../store/useMimicStore'

const navItems = [
  { to: '/dashboard', label: 'Hôm nay', icon: LayoutDashboard },
  { to: '/peer-practice', label: 'Nói 1-kèm-1 (Peer)', icon: Users2, highlight: true },
  { to: '/video-learning', label: 'Học qua Video', icon: Tv },
  { to: '/speaking', label: 'Luyện nói phản xạ', icon: Mic2 },
  { to: '/speaking/dialogue', label: 'Hội thoại AI 2 chiều', icon: Bot },
  { to: '/listening', label: 'Luyện nghe & Nhại', icon: Headphones },
  { to: '/vocab', label: 'Từ vựng & Cụm từ', icon: BookOpen },
  { to: '/writing', label: 'Luyện viết phản xạ', icon: PenTool },
  { to: '/progress', label: 'Tiến độ & Sổ lỗi', icon: ChartNoAxesCombined },
]

export interface SidebarProps {
  isLight: boolean
  onToggleTheme: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  isMobileDrawer?: boolean
}

export function Sidebar({
  isLight,
  onToggleTheme,
  collapsed = false,
  onToggleCollapse,
  isMobileDrawer = false,
}: SidebarProps) {
  const location = useLocation()
  const profile = useMimicStore((state) => state.profile)
  const isCollapsed = isMobileDrawer ? false : collapsed

  const handleNavClick = (to: string) => {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const levelLabel = {
    beginner: 'Mới bắt đầu',
    elementary: 'Cơ bản',
    intermediate: 'Trung cấp · B1',
    unspecified: 'Đang làm quen',
  }[profile.selfAssessedLevel] ?? 'Học viên'

  return (
    <aside
      className={`w-full h-full bg-study-surface border-r border-study-border ${
        isCollapsed ? 'p-2.5 overflow-visible' : 'p-4 sm:p-5 overflow-y-auto overflow-x-hidden'
      } flex flex-col justify-between select-none transition-all duration-300`}
    >
      <div>
        {/* Brand & Top Collapse Button */}
        {isCollapsed ? (
          <div className="mb-5 flex flex-col items-center gap-2">
            <Link
              to="/dashboard"
              onClick={() => handleNavClick('/dashboard')}
              className="group relative p-1.5 rounded-xl hover:bg-study-surface-hover transition-colors flex items-center justify-center"
              title="HeyMimic - Hôm nay"
            >
              <BrandGlyph size={28} />
              <div className="absolute left-full ml-3.5 px-2.5 py-1 bg-study-surface border border-study-border text-study-text text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                hey<span className="text-study-primary font-bold">mimic</span>
              </div>
            </Link>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="group relative p-2 rounded-xl text-study-text-muted hover:text-study-primary hover:bg-study-primary-soft transition-colors cursor-pointer"
                title="Mở rộng thanh điều hướng (Ctrl+B)"
                aria-label="Mở rộng thanh điều hướng"
              >
                <PanelLeftOpen size={18} />
                <div className="absolute left-full ml-3.5 px-2.5 py-1 bg-study-surface border border-study-border text-study-text text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                  Mở rộng thanh bên <span className="text-[10px] text-study-text-muted">(Ctrl+B)</span>
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between gap-2">
            <BrandLogo
              size="md"
              to="/dashboard"
              onClick={() => handleNavClick('/dashboard')}
            />
            {!isMobileDrawer && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-xl text-study-text-muted hover:text-study-text hover:bg-study-surface-hover transition-colors cursor-pointer"
                title="Thu gọn thanh điều hướng (Ctrl+B)"
                aria-label="Thu gọn thanh điều hướng"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </div>
        )}

        {/* Section Label or Divider */}
        {isCollapsed ? (
          <div className="w-8 h-px bg-study-border/80 mx-auto mb-2" />
        ) : (
          <div className="text-xs font-medium text-study-text-muted px-3 mb-2">
            Phòng luyện tập
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1" aria-label="Điều hướng chính">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={isCollapsed ? label : undefined}
              onClick={() => handleNavClick(to)}
              className={({ isActive }) =>
                isCollapsed
                  ? `group relative flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-study-primary bg-study-primary-soft font-semibold shadow-xs'
                        : 'text-study-text-muted hover:text-study-text hover:bg-study-surface-hover'
                    }`
                  : `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-study-primary bg-study-primary-soft font-semibold shadow-xs'
                        : 'text-study-text-muted hover:text-study-text hover:bg-study-surface-hover'
                    }`
              }
            >
              <Icon size={18} strokeWidth={2} className="shrink-0" />

              {!isCollapsed && <span className="truncate">{label}</span>}

              {/* Speaking indicator dot */}
              {label.includes('nói') && (
                isCollapsed ? (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-study-primary shadow-xs ring-2 ring-study-surface" />
                ) : (
                  <span className="ml-auto w-2 h-2 rounded-full bg-study-primary shadow-xs" />
                )
              )}

              {/* Tooltip on hover when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-study-surface border border-study-border text-study-text text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 -translate-x-1.5 group-hover:translate-x-0 z-50 flex items-center gap-1.5">
                  <span>{label}</span>
                  {label.includes('nói') && <span className="w-1.5 h-1.5 rounded-full bg-study-primary" />}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Bottom */}
      {isCollapsed ? (
        <div className="space-y-2.5 pt-4 border-t border-study-border">
          {/* Compact streak */}
          <div className="group relative flex items-center justify-center p-2 bg-study-accent-soft/40 border border-study-accent/20 rounded-xl">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold text-study-accent ml-1">{profile.streakDays}</span>
            <div className="absolute left-full ml-3.5 px-2.5 py-1 bg-study-surface border border-study-border text-study-text text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
              Chuỗi {profile.streakDays} ngày học tập
            </div>
          </div>

          {/* Compact theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="group relative flex items-center justify-center w-full p-2.5 rounded-xl text-study-text-muted hover:text-study-text hover:bg-study-surface-hover border border-study-border/60 transition-colors cursor-pointer"
            aria-label="Đổi giao diện sáng tối"
          >
            {isLight ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-study-primary" />}
            <div className="absolute left-full ml-3.5 px-2.5 py-1 bg-study-surface border border-study-border text-study-text text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
              {isLight ? 'Giao diện tối' : 'Giao diện sáng'}
            </div>
          </button>

          {/* Compact public landing link */}
          <Link
            to="/"
            className="group relative flex items-center justify-center w-full p-2 rounded-xl text-study-text-muted hover:text-study-text hover:bg-study-surface-hover transition-colors"
            title="Về trang giới thiệu"
          >
            <Globe2 size={16} />
            <div className="absolute left-full ml-3.5 px-2.5 py-1 bg-study-surface border border-study-border text-study-text text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
              Về trang giới thiệu
            </div>
          </Link>

          {/* Compact user avatar / settings */}
          <Link
            to="/settings"
            className="group relative flex items-center justify-center p-1 rounded-xl hover:bg-study-surface-hover transition-colors"
            title={`${profile.name} · ${levelLabel}`}
          >
            <div className="w-8 h-8 rounded-full bg-study-primary-soft text-study-primary font-bold text-xs flex items-center justify-center border border-study-primary-border/40 shrink-0">
              {initials}
            </div>
            <div className="absolute left-full ml-3.5 px-3 py-2 bg-study-surface border border-study-border text-study-text text-xs rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 text-left">
              <p className="font-semibold text-study-text">{profile.name}</p>
              <p className="text-[10px] text-study-text-muted">{levelLabel}</p>
            </div>
          </Link>

          {/* Expand button at bottom */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="group relative flex items-center justify-center w-full p-2 rounded-xl text-study-text-muted hover:text-study-primary hover:bg-study-primary-soft border border-study-border/60 transition-colors cursor-pointer"
              title="Mở rộng thanh điều hướng (Ctrl+B)"
              aria-label="Mở rộng thanh điều hướng"
            >
              <PanelLeftOpen size={16} />
              <div className="absolute left-full ml-3.5 px-2.5 py-1 bg-study-surface border border-study-border text-study-text text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                Mở rộng thanh bên <span className="text-[10px] text-study-text-muted">(Ctrl+B)</span>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-6 border-t border-study-border">
          {/* Warm daily quote */}
          <div className="bg-study-surface-muted/60 border border-study-border/60 rounded-xl p-3 text-xs text-study-text-muted leading-relaxed">
            <span className="text-study-primary font-serif font-bold text-sm block mb-0.5">“</span>
            <p className="italic">Mỗi ngày một câu. Giữ nhịp, đừng vội.</p>
          </div>

          {/* Streak summary */}
          <div className="flex items-center justify-between px-3 py-2 bg-study-accent-soft/40 border border-study-accent/20 rounded-xl">
            <Streak count={profile.streakDays} compact />
            <span className="text-[11px] font-medium text-study-accent/90">Đang giữ nhịp</span>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-study-text-muted hover:text-study-text hover:bg-study-surface-hover border border-study-border/60 transition-colors cursor-pointer"
            aria-label="Đổi giao diện sáng tối"
          >
            <div className="flex items-center gap-2">
              {isLight ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-study-primary" />}
              <span>{isLight ? 'Giao diện sáng' : 'Giao diện tối'}</span>
            </div>
            <div className="w-8 h-4 rounded-full bg-study-border p-0.5 flex items-center transition-colors">
              <div
                className={`w-3 h-3 rounded-full bg-study-primary transition-transform duration-200 ${
                  isLight ? 'translate-x-0' : 'translate-x-4'
                }`}
              />
            </div>
          </button>

          {/* Public landing link */}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-study-text-muted hover:text-study-text transition-colors"
          >
            <Globe2 size={14} />
            <span>Về trang giới thiệu</span>
          </Link>

          {/* User Profile / Settings Link */}
          <Link
            to="/settings"
            className="flex items-center gap-3 pt-1 p-1.5 rounded-xl hover:bg-study-surface-hover transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-study-primary-soft text-study-primary font-bold text-xs flex items-center justify-center border border-study-primary-border/40 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <strong className="block text-xs font-semibold text-study-text truncate group-hover:text-study-primary transition-colors">
                {profile.name}
              </strong>
              <span className="block text-[10px] text-study-text-muted truncate">
                {levelLabel}
              </span>
            </div>
            <span className="text-study-text-muted group-hover:text-study-text p-1 rounded-md transition-colors">
              <SettingsIcon size={16} />
            </span>
          </Link>

          {/* Bottom collapse button */}
          {!isMobileDrawer && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-study-text-muted hover:text-study-text hover:bg-study-surface-hover border border-study-border/60 transition-colors cursor-pointer"
              title="Thu gọn thanh điều hướng (Ctrl+B)"
            >
              <span className="flex items-center gap-2">
                <PanelLeftClose size={15} />
                <span>Thu gọn thanh bên</span>
              </span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-study-surface-muted border border-study-border font-mono text-study-text-muted">
                Ctrl+B
              </kbd>
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
