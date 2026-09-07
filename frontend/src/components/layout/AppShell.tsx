import { Bell, Menu, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useMimicStore } from '../../store/useMimicStore'
import { Sidebar } from './Sidebar'
import { BrandLogo } from '../shared/BrandLogo'
import { BackToTop } from '../shared/BackToTop'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Hôm nay',
  '/app': 'Hôm nay',
  '/vocab': 'Từ vựng',
  '/speaking': 'Phòng luyện nói',
  '/progress': 'Tiến độ của bạn',
}

export function AppShell() {
  const theme = useMimicStore((state) => state.theme)
  const toggleTheme = useMimicStore((state) => state.toggleTheme)
  const isLight = theme === 'light'
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Phòng luyện tập'
  const today = useMemo(() => new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date()), [])

  return (
    <div className="min-h-screen flex bg-study-bg text-study-text selection:bg-teal-500/20">
      {/* Mobile Drawer Backdrop & Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[80vw] bg-study-surface h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-study-border flex items-center justify-between">
              <BrandLogo size="sm" to="/dashboard" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-hover"
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar isLight={isLight} onToggleTheme={toggleTheme} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isLight={isLight} onToggleTheme={toggleTheme} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b border-study-border bg-study-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-hover"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-semibold text-study-text md:hidden">{title}</h2>
            <div className="hidden sm:flex items-center gap-2 text-xs text-study-text-muted">
              <span className="w-2 h-2 rounded-full bg-study-primary shadow-xs" />
              <span>Phòng luyện tập đang sẵn sàng</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-study-text-muted capitalize hidden sm:inline-block">
              {today}
            </span>
            <button
              type="button"
              className="relative p-2 rounded-xl text-study-text-muted hover:text-study-text hover:bg-study-surface-hover transition-colors"
              aria-label="Thông báo"
            >
              <Bell size={17} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-study-accent" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <div key={location.pathname} className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-enter">
          <Outlet />
        </div>
      </main>
      <BackToTop />
    </div>
  )
}
