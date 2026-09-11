import {
  BookOpen,
  LayoutDashboard,
  Menu,
  Mic2,
  PanelLeftClose,
  PanelLeftOpen,
  Tv,
  Users2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMimicStore } from '../../store/useMimicStore'
import { Sidebar } from './Sidebar'
import { BrandLogo } from '../shared/BrandLogo'
import { BackToTop } from '../shared/BackToTop'
import '../../styles/app.css'
import { learningFadeUp } from '../shared/learningMotion'

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/vocab/review')) return 'Phiên ôn tập từ vựng'
  if (pathname.startsWith('/speaking/history/')) return 'Chi tiết bài nói'
  if (pathname.startsWith('/speaking/history')) return 'Lịch sử luyện nói'
  if (pathname.startsWith('/speaking/dialogue')) return 'Hội thoại AI 2 chiều'
  if (pathname.startsWith('/session/') && pathname.endsWith('/summary'))
    return 'Tổng kết buổi học'
  if (pathname.startsWith('/progress/mistakes/')) return 'Chi tiết lỗi'
  if (pathname.startsWith('/peer-practice/room')) return 'Phòng nói 1-kèm-1'
  if (pathname.startsWith('/peer-practice/join')) return 'Tham gia phiên peer'
  if (pathname.startsWith('/peer-practice')) return 'Luyện nói 1-kèm-1 (Peer)'
  if (pathname.startsWith('/speaking/solo')) return 'Phòng luyện nói solo'
  if (pathname.startsWith('/video-learning/')) return 'Video Shadowing Studio'
  if (pathname.startsWith('/video-learning')) return 'Học qua Video'
  if (pathname === '/settings') return 'Hồ sơ & Cài đặt'
  if (pathname === '/vocab') return 'Kho từ vựng & Cụm từ'
  if (pathname === '/listening') return 'Phòng luyện nghe & Shadowing'
  if (pathname === '/speaking') return 'Phòng luyện & kết nối'
  if (pathname === '/writing') return 'Luyện viết & Phản xạ câu'
  if (pathname === '/progress') return 'Tiến độ & Sổ tay lỗi'
  if (pathname === '/dashboard' || pathname === '/app') return 'Hôm nay'
  return 'Phòng luyện tập'
}

const mobileNavItems = [
  { to: '/dashboard', label: 'Hôm nay', icon: LayoutDashboard },
  { to: '/peer-practice', label: '1-kèm-1', icon: Users2 },
  { to: '/video-learning', label: 'Video', icon: Tv },
  { to: '/speaking', label: 'Nói', icon: Mic2 },
  { to: '/vocab', label: 'Từ vựng', icon: BookOpen },
]

export function AppShell() {
  const theme = useMimicStore((state) => state.theme)
  const toggleTheme = useMimicStore((state) => state.toggleTheme)
  const sidebarCollapsed = useMimicStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useMimicStore((state) => state.toggleSidebar)
  const isLight = theme === 'light'
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = getPageTitle(location.pathname)
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    []
  )

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if (isInput) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  return (
    <MotionConfig reducedMotion="user">
      <div className="learning-app min-h-dvh flex bg-study-bg text-study-text selection:bg-study-primary/20">
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
                className="p-1.5 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-hover cursor-pointer"
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                isLight={isLight}
                onToggleTheme={toggleTheme}
                isMobileDrawer={true}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Sticky, anchored in place while page scrolls) */}
      <div
        className={`hidden md:block sticky top-0 h-dvh self-start shrink-0 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-60'
        }`}
      >
        <Sidebar
          isLight={isLight}
          onToggleTheme={toggleTheme}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col pb-20 md:pb-8">
        {/* Topbar */}
        <header className="h-16 border-b border-study-border bg-study-surface px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-hover cursor-pointer"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>

            {/* Desktop collapse/expand sidebar button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:inline-flex p-2 rounded-xl text-study-text-muted hover:text-study-text hover:bg-study-surface-hover transition-colors cursor-pointer items-center justify-center"
              title={
                sidebarCollapsed
                  ? 'Mở rộng thanh điều hướng (Ctrl+B)'
                  : 'Thu gọn thanh điều hướng (Ctrl+B)'
              }
              aria-label={
                sidebarCollapsed
                  ? 'Mở rộng thanh điều hướng'
                  : 'Thu gọn thanh điều hướng'
              }
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>

            <span className="text-sm font-medium text-study-text">{title}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-study-text-muted capitalize hidden sm:inline-block">
              {today}
            </span>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <div className="workspace-content flex-1 mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} {...learningFadeUp}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Task A06) */}
      <nav
        aria-label="Điều hướng nhanh di động"
        className="mobile-navigation md:hidden fixed bottom-0 left-0 right-0 z-30 bg-study-surface border-t border-study-border px-2 py-2 flex items-center justify-around"
      >
        {mobileNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-study-primary font-semibold'
                  : 'text-study-text-muted hover:text-study-text'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="mt-0.5 text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>

      <BackToTop />
      </div>
    </MotionConfig>
  )
}
