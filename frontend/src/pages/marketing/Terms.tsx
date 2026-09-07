import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Shield } from 'lucide-react'
import { usePageMeta } from '../../hook/usePageMeta'
import { ROUTES } from '../../route/routePaths'

export function Terms() {
  usePageMeta('Điều Khoản Sử Dụng (Demo) — HeyMimic', 'Điều khoản sử dụng cho phiên bản thử nghiệm ứng dụng học tiếng Anh HeyMimic.')

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-study-primary-soft/60 border border-study-primary-border/60 text-xs font-semibold text-study-primary">
          <FileText size={13} />
          <span>TÀI LIỆU MINH HỌA DEMO</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-study-text">
          Điều khoản sử dụng
        </h1>
        <p className="text-xs text-study-text-muted">
          Cập nhật lần cuối: Tháng 9, 2026 · Phiên bản thử nghiệm giao diện (Mock UI Phase)
        </p>
      </div>

      {/* Content Body */}
      <div className="space-y-6 text-xs sm:text-sm text-study-text leading-relaxed">
        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">1. Phạm vi của phiên bản thử nghiệm</h2>
          <p className="text-study-text-muted">
            HeyMimic hiện đang trong giai đoạn thử nghiệm giao diện người dùng (frontend prototype). Toàn bộ dữ liệu về bài học, từ vựng bóc tách, transcript và phản hồi ngữ âm được cung cấp dưới dạng mô phỏng (mock data) nhằm kiểm chứng sự phù hợp của trải nghiệm học tập trước khi tích hợp hệ thống backend thực tế.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">2. Sử dụng Microphone và Giọng nói</h2>
          <p className="text-study-text-muted">
            Khi bạn tham gia phòng luyện nói, ứng dụng yêu cầu quyền truy cập microphone của thiết bị thông qua MediaStreams API của trình duyệt. Dữ liệu âm thanh thu âm chỉ được xử lý tạm thời trong bộ nhớ của trình duyệt để bạn nghe lại và không được tải lên bất kỳ máy chủ lưu trữ âm thanh nào.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">3. Trách nhiệm nội dung và Bản quyền</h2>
          <p className="text-study-text-muted">
            Người dùng chịu trách nhiệm với các đoạn văn bản cá nhân tự dán vào công cụ Bóc tách ngữ cảnh (Context Capture). Không nhập các thông tin nhạy cảm, bí mật thương mại hoặc thông tin cá nhân của bên thứ ba vào ứng dụng.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-2xl bg-study-surface border border-study-border">
          <h2 className="text-base font-semibold text-study-text">4. Thay đổi và Điều chỉnh</h2>
          <p className="text-study-text-muted">
            Chúng tôi có thể cập nhật, sửa đổi giao diện hoặc cấu trúc dữ liệu demo bất kỳ lúc nào để hoàn thiện chất lượng sản phẩm.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-study-border flex items-center justify-between text-xs text-study-text-muted">
        <Link to={ROUTES.PRIVACY} className="text-study-primary hover:underline font-medium">
          Xem Chính sách bảo mật & quyền riêng tư →
        </Link>
        <Link to={ROUTES.CONTACT} className="hover:underline">
          Liên hệ đóng góp ý kiến
        </Link>
      </div>
    </div>
  )
}
