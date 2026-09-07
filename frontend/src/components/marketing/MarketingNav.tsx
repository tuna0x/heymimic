import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useMimicStore } from '../../store/useMimicStore'
import { BrandLogo } from '../shared/BrandLogo'

const navLinks = [
  { to: '/speaking-method', label: 'Luyện nói AI' },
  { to: '/about', label: 'Vì sao HeyMimic' },
  { to: '/blog', label: 'Ghi chú học' },
  { to: '/contact', label: 'Liên hệ' },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const theme = useMimicStore((state) => state.theme)
  const toggleTheme = useMimicStore((state) => state.toggleTheme)
  const isLight = theme === 'light'

  const close = () => setOpen(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const handleNavClick = (to: string) => {
    close()
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-study-surface/80 backdrop-blur-md border-b border-study-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <BrandLogo
          size="md"
          onClick={() => {
            close()
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Điều hướng">
          {navLinks.map((item) => {
            if (item.to.includes('#')) {
              return (
                <a
                  key={item.label}
                  href={item.to}
                  onClick={close}
                  className="text-sm font-medium text-study-text-muted hover:text-study-text transition-colors"
                >
                  {item.label}
                </a>
              )
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => handleNavClick(item.to)}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-study-primary font-semibold' : 'text-study-text-muted hover:text-study-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-muted transition-colors cursor-pointer"
            aria-label={isLight ? 'Giao diện tối' : 'Giao diện sáng'}
          >
            {isLight ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            to="/login"
            onClick={() => handleNavClick('/login')}
            className="text-sm font-medium text-study-text-muted hover:text-study-text transition-colors"
          >
            Đăng nhập
          </Link>

          <Link
            to="/dashboard"
            onClick={() => handleNavClick('/dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Vào phòng học</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-study-text-muted hover:text-study-text"
            aria-label="Đổi giao diện"
          >
            {isLight ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 text-study-text-muted hover:text-study-text transition-colors"
            aria-label={open ? 'Đóng' : 'Mở'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-b border-study-border bg-study-surface px-6 py-5 space-y-4">
          <nav className="space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => handleNavClick(item.to)}
                className="block text-sm font-medium text-study-text hover:text-study-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-study-border flex items-center justify-between">
            <Link
              to="/login"
              onClick={() => handleNavClick('/login')}
              className="text-xs font-medium text-study-text-muted"
            >
              Đăng nhập
            </Link>
            <Link
              to="/dashboard"
              onClick={() => handleNavClick('/dashboard')}
              className="px-4 py-2 rounded-lg bg-study-primary text-white text-xs font-semibold"
            >
              Vào phòng học
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
