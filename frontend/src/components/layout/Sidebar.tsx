import { BookOpen, ChartNoAxesCombined, Globe2, LayoutDashboard, Mic2, Moon, MoreHorizontal, Sun } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Streak } from '../shared/UI'
import { BrandLogo } from '../shared/BrandLogo'

const navItems = [
  { to: '/dashboard', label: 'Hôm nay', icon: LayoutDashboard },
  { to: '/vocab', label: 'Từ vựng', icon: BookOpen },
  { to: '/speaking', label: 'Luyện nói', icon: Mic2 },
  { to: '/progress', label: 'Tiến độ', icon: ChartNoAxesCombined },
]

export function Sidebar({ isLight, onToggleTheme }: { isLight: boolean; onToggleTheme: () => void }) {
  const location = useLocation()

  const handleNavClick = (to: string) => {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-study-surface border-r border-study-border p-5 flex flex-col justify-between select-none">
      <div>
        {/* Brand */}
        <div className="mb-8">
          <BrandLogo
            size="md"
            to="/dashboard"
            onClick={() => handleNavClick('/dashboard')}
          />
        </div>

        {/* Section Label */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-study-text-muted px-3 mb-2">
          Phòng luyện tập
        </div>

        {/* Navigation */}
        <nav className="space-y-1" aria-label="Điều hướng chính">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => handleNavClick(to)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-study-primary bg-study-primary-soft font-semibold shadow-xs'
                    : 'text-study-text-muted hover:text-study-text hover:bg-study-surface-hover'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} className="shrink-0" />
              <span>{label}</span>
              {label === 'Luyện nói' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-study-primary shadow-xs" />
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Bottom */}
      <div className="space-y-3 pt-6 border-t border-study-border">
        {/* Warm daily quote */}
        <div className="bg-study-surface-muted/60 border border-study-border/60 rounded-xl p-3 text-xs text-study-text-muted leading-relaxed">
          <span className="text-study-primary font-serif font-bold text-sm block mb-0.5">“</span>
          <p className="italic">Mỗi ngày một câu. Giữ nhịp, đừng vội.</p>
        </div>

        {/* Streak summary */}
        <div className="flex items-center justify-between px-3 py-2 bg-study-accent-soft/40 border border-study-accent/20 rounded-xl">
          <Streak compact />
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
            {isLight ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-teal-400" />}
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

        {/* User Profile */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-study-primary-soft text-study-primary font-bold text-xs flex items-center justify-center border border-study-primary-border/40 shrink-0">
            TN
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-xs font-semibold text-study-text truncate">Tuna</strong>
            <span className="block text-[10px] text-study-text-muted truncate">Explorer · A2/B1</span>
          </div>
          <button
            type="button"
            className="text-study-text-muted hover:text-study-text p-1 rounded-md transition-colors"
            aria-label="Tùy chọn tài khoản"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
