import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'

export function Privacy() {
  usePageMeta('Chính Sách Bảo Mật (Demo) — HeyMimic', 'Chính sách bảo vệ quyền riêng tư và dữ liệu cục bộ của HeyMimic.')

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-left space-y-8 animate-fade-in">
      {/* Back Link */}
      <div>
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs text-study-text-muted hover:text-study-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-study-border">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-study-success-soft text-study-success border border-study-success/30 text-xs font-semibold">
          <ShieldCheck size={13} />
          <span>BẢO VỆ DỮ LIỆU CỤC BỘ</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-study-text">
          Chính sách quyền riêng tư
        </h1>
        <p className="text-xs text-study-text-muted">
          Cập nhật lần cuối: Tháng 9, 2026 · Phiên bản thử nghiệm giao diện (Mock UI Phase)
        </p>
      </div>

      {/* Content Body */}
      <div className="space-y-6 text-xs sm:text-sm text-study-text leading-relaxed">
        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">1. Dữ liệu lưu trữ trên trình duyệt của bạn</h2>
          <p className="text-study-text-muted">
            Tất cả tiến độ học tập, chuỗi ngày streak, từ vựng lưu trữ và các thiết lập tài khoản hiện tại được lưu trong bộ nhớ cục bộ (<code className="font-mono text-study-primary font-semibold">localStorage</code>) của trình duyệt. Không có dữ liệu cá nhân nào được gửi về máy chủ từ xa trong phiên bản này.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">2. Thu âm và Quyền Microphone</h2>
          <p className="text-study-text-muted">
            Quyền truy cập microphone chỉ được kích hoạt khi bạn chủ động nhấn nút Bắt đầu thu âm. Bản thu chỉ được lưu dưới dạng Object URL trong phiên làm việc hiện tại để bạn có thể nghe lại. Khi bạn làm mới trang hoặc đóng tab, bản ghi âm sẽ được giải phóng hoàn toàn khỏi bộ nhớ RAM.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">3. Phát âm qua Web Speech API</h2>
          <p className="text-study-text-muted">
            Các tính năng phát âm câu mẫu và từ vựng sử dụng Web Speech Synthesis API có sẵn của trình duyệt. Quá trình phát âm diễn ra cục bộ trên thiết bị của bạn.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">4. Toàn quyền xóa dữ liệu</h2>
          <p className="text-study-text-muted">
            Bạn có thể xóa toàn bộ dữ liệu học tập bất kỳ lúc nào tại mục Cài đặt (nút "Xóa toàn bộ dữ liệu demo") hoặc thông qua tính năng xóa dữ liệu trang web của trình duyệt.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-study-border flex items-center justify-between text-xs text-study-text-muted">
        <Link to={ROUTES.TERMS} className="text-study-primary hover:underline font-medium">
          Xem Điều khoản sử dụng →
        </Link>
        <Link to={ROUTES.CONTACT} className="hover:underline">
          Liên hệ đóng góp ý kiến
        </Link>
      </div>
    </div>
  )
}
