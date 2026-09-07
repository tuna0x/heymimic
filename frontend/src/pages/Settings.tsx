import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Briefcase,
  Check,
  Clock,
  KeyRound,
  LogOut,
  MessageSquare,
  Moon,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Sun,
  Laptop,
  User,
  UserCheck,
} from 'lucide-react'
import { useMimicStore, ThemeMode } from '../store/useMimicStore'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../components/shared/FormField'
import { ConfirmModal } from '../components/shared/ConfirmModal'
import { usePageMeta } from '../hook/usePageMeta'
import { ROUTES } from '../route/routePaths'
import type { LearnerProfile } from '../type'

export function Settings() {
  usePageMeta('Hồ Sơ & Cài Đặt — HeyMimic', 'Quản lý thông tin học tập, mục tiêu cá nhân, giao diện và dữ liệu học.')

  const navigate = useNavigate()
  const { logout } = useAuth()
  const { profile, updateProfile, theme, setTheme, resetAllDemoData } = useMimicStore()

  // Profile Form State
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [goal, setGoal] = useState<LearnerProfile['goal']>(profile.goal ?? 'work')
  const [level, setLevel] = useState<LearnerProfile['selfAssessedLevel']>(
    profile.selfAssessedLevel ?? 'intermediate'
  )
  const [dailyMinutes, setDailyMinutes] = useState<LearnerProfile['dailyMinutesGoal']>(
    profile.dailyMinutesGoal ?? 10
  )

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Demo Password Form State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      name,
      email,
      goal,
      selfAssessedLevel: level,
      dailyMinutesGoal: dailyMinutes,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      setPasswordNotice('Vui lòng điền cả mật khẩu hiện tại và mật khẩu mới.')
      return
    }
    setPasswordNotice('Đây là thao tác minh họa cho bản demo. Mật khẩu mẫu đã được xác nhận thành công.')
    setOldPassword('')
    setNewPassword('')
    setTimeout(() => setPasswordNotice(null), 4000)
  }

  const handleConfirmReset = () => {
    resetAllDemoData()
    setShowResetConfirm(false)
    navigate(ROUTES.DASHBOARD)
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16 text-left animate-fade-in">
      {/* Top Header */}
      <div className="pb-2 border-b border-study-border">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
          Hồ sơ & Cài đặt
        </h1>
        <p className="text-xs sm:text-sm text-study-text-muted mt-1 leading-relaxed">
          Tùy chỉnh thông tin tài khoản, mục tiêu luyện nói và quản lý dữ liệu demo trên trình duyệt của bạn.
        </p>
      </div>

      {/* Form: Profile & Learning Goals */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Personal Info */}
        <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-study-primary-soft text-study-primary font-display font-bold text-lg flex items-center justify-center border border-study-primary-border/60">
              {initials || 'U'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-study-text">Thông tin học viên</h2>
              <p className="text-xs text-study-text-muted">
                Tên hiển thị trên Dashboard và lời chào buổi học.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <FormField
              id="settings-name"
              label="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Alex Trần"
              required
            />
            <FormField
              id="settings-email"
              label="Email demo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@demo.heymimic.com"
              required
            />
          </div>
        </div>

        {/* Section 2: Learning Preferences */}
        <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-semibold text-study-text">Mục tiêu & Nhịp độ học</h2>
            <p className="text-xs text-study-text-muted mt-0.5">
              Mimic điều chỉnh đề bài luyện nói và từ gợi ý theo các lựa chọn này.
            </p>
          </div>

          {/* Goal Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-study-text">Mục tiêu ưu tiên</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'work', label: 'Công sở & Họp', icon: Briefcase },
                { id: 'interview', label: 'Phỏng vấn xin việc', icon: UserCheck },
                { id: 'casual', label: 'Giao tiếp hằng ngày', icon: MessageSquare },
              ].map((g) => {
                const Icon = g.icon
                const isSelected = goal === g.id
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as LearnerProfile['goal'])}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-study-primary bg-study-primary-soft/40 text-study-primary font-semibold'
                        : 'border-study-border bg-study-surface-muted/30 text-study-text hover:bg-study-surface-hover'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{g.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Self-Assessed Level */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-study-text">Trình độ tự đánh giá</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'beginner', label: 'Mới bắt đầu (A1)' },
                { id: 'elementary', label: 'Cơ bản (A2)' },
                { id: 'intermediate', label: 'Trung cấp (B1-B2)' },
                { id: 'unspecified', label: 'Chưa rõ' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id as LearnerProfile['selfAssessedLevel'])}
                  className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                    level === l.id
                      ? 'border-study-primary bg-study-primary-soft/40 text-study-primary font-semibold'
                      : 'border-study-border bg-study-surface-muted/30 text-study-text hover:bg-study-surface-hover'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Minutes Goal */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-study-text">Thời lượng luyện mỗi ngày</label>
            <div className="grid grid-cols-3 gap-3">
              {([5, 10, 15] as const).map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`p-3 rounded-xl border text-center text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    dailyMinutes === mins
                      ? 'border-study-primary bg-study-primary-soft/40 text-study-primary font-semibold'
                      : 'border-study-border bg-study-surface-muted/30 text-study-text hover:bg-study-surface-hover'
                  }`}
                >
                  <Clock size={14} />
                  <span>{mins} phút / ngày</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button for Profile Settings */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs">
            {savedSuccess && (
              <span className="text-study-success font-semibold flex items-center gap-1 animate-fade-in">
                <Check size={14} />
                <span>Đã lưu thay đổi thành công!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Save size={14} />
            <span>Lưu thông tin</span>
          </button>
        </div>
      </form>

      {/* Section 3: Interface Theme */}
      <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-study-text">Giao diện hiển thị</h2>
          <p className="text-xs text-study-text-muted mt-0.5">
            Tùy chọn chế độ sáng, tối hoặc tự động chuyển theo thiết bị của bạn.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light' as ThemeMode, label: 'Giao diện sáng', icon: Sun },
            { id: 'dark' as ThemeMode, label: 'Giao diện tối', icon: Moon },
            { id: 'system' as ThemeMode, label: 'Theo thiết bị', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon
            const isSelected = theme === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 ${
                  isSelected
                    ? 'border-study-primary bg-study-primary-soft/40 text-study-primary font-semibold'
                    : 'border-study-border bg-study-surface-muted/30 text-study-text hover:bg-study-surface-hover'
                }`}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section 4: Demo Security & Logout */}
      <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-semibold text-study-text">Tài khoản & Bảo mật (Demo)</h2>
          <p className="text-xs text-study-text-muted mt-0.5">
            Trong phiên bản thử nghiệm, mật khẩu không được lưu trữ lên máy chủ thực tế.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="settings-old-pass"
              label="Mật khẩu hiện tại"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
            />
            <FormField
              id="settings-new-pass"
              label="Mật khẩu mới mẫu"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {passwordNotice && (
            <div className="p-3.5 rounded-xl bg-study-primary-soft/50 border border-study-primary-border/60 text-xs text-study-text leading-relaxed animate-fade-in">
              {passwordNotice}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound size={14} />
              <span>Đổi mật khẩu minh họa</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Đăng xuất phiên demo</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 5: Demo Data Management */}
      <div className="p-6 rounded-3xl bg-study-surface border border-rose-500/20 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-study-text">Xóa toàn bộ dữ liệu demo</h2>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Thao tác này sẽ xóa tất cả dữ liệu phiên học, chuỗi ngày streak, từ vựng tự nhập và lịch sử bài nói đã lưu trên trình duyệt này, khôi phục lại trạng thái ban đầu của ứng dụng.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Xóa và đặt lại toàn bộ dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Xác nhận xóa dữ liệu demo?"
        description="Toàn bộ từ vựng bạn đã bóc tách, các buổi luyện nói đã thu âm và tiến độ học lưu trên máy này sẽ bị xóa. Ứng dụng sẽ trở về dữ liệu mẫu ban đầu."
        confirmLabel="Xác nhận xóa sạch"
        cancelLabel="Hủy bỏ"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
        tone="danger"
      />
    </div>
  )
}
