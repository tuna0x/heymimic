import { Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useMimicStore } from '../../store/useMimicStore'

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const theme = useMimicStore((state) => state.theme)
  const toggleTheme = useMimicStore((state) => state.toggleTheme)
  const isLight = theme === 'light'

  return (
    <header className="sticky top-0 z-50 bg-study-surface/85 backdrop-blur-md border-b border-study-border">
      <nav className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link className="flex items-center gap-2.5 text-study-text font-display font-bold text-xl tracking-tight group" to="/" onClick={close}>
          <span className="w-8 h-8 rounded-xl bg-study-primary text-white font-bold flex items-center justify-center text-base shadow-xs group-hover:scale-105 transition-transform">
            m
          </span>
          <span className="font-display">mimic</span>
          <span className="w-1.5 h-1.5 rounded-full bg-study-primary self-end mb-1" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          <NavLink
            to="/"
            end
            onClick={close}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-study-primary font-semibold' : 'text-study-text-muted hover:text-study-text'}`
            }
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/about"
            onClick={close}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-study-primary font-semibold' : 'text-study-text-muted hover:text-study-text'}`
            }
          >
            Vì sao Mimic
          </NavLink>
          <NavLink
            to="/blog"
            onClick={close}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-study-primary font-semibold' : 'text-study-text-muted hover:text-study-text'}`
            }
          >
            Ghi chú
          </NavLink>

          <span className="h-4 w-px bg-study-border" />

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-study-text-muted hover:text-study-text hover:bg-study-surface-hover transition-colors"
            aria-label="Đổi giao diện sáng/tối"
          >
            {isLight ? <Sun size={17} className="text-amber-500" /> : <Moon size={17} className="text-teal-400" />}
          </button>

          <NavLink
            to="/login"
            onClick={close}
            className="text-sm font-medium text-study-text-soft hover:text-study-text transition-colors"
          >
            Đăng nhập
          </NavLink>
          <Link
            to="/signup"
            onClick={close}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-study-primary text-white font-semibold text-xs hover:bg-study-primary-hover shadow-xs transition-all"
          >
            Bắt đầu học
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-study-text-muted hover:text-study-text"
            aria-label="Đổi giao diện sáng/tối"
          >
            {isLight ? <Sun size={17} className="text-amber-500" /> : <Moon size={17} className="text-teal-400" />}
          </button>
          <button
            type="button"
            className="p-2 text-study-text-muted hover:text-study-text"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-b border-study-border bg-study-surface px-6 py-6 space-y-4">
          <NavLink
            to="/"
            end
            onClick={close}
            className="block text-sm font-medium text-study-text"
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/about"
            onClick={close}
            className="block text-sm font-medium text-study-text"
          >
            Vì sao Mimic
          </NavLink>
          <NavLink
            to="/blog"
            onClick={close}
            className="block text-sm font-medium text-study-text"
          >
            Ghi chú
          </NavLink>
          <div className="pt-4 border-t border-study-border flex flex-col gap-3">
            <Link
              to="/login"
              onClick={close}
              className="w-full py-2.5 text-center text-sm font-medium text-study-text rounded-xl border border-study-border"
            >
              Đăng nhập
            </Link>
            <Link
              to="/signup"
              onClick={close}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-study-primary rounded-xl"
            >
              Bắt đầu học
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
