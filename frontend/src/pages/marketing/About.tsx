import { ArrowUpRight, Feather, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from './MarketingLayout'

export function About() {
  usePageMeta('Vì sao Mimic', 'Câu chuyện và triết lý đằng sau Mimic — một practice room cá nhân hóa cho việc học speaking.')

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-20">
      {/* Hero Intro */}
      <section className="space-y-4">
        <span className="text-xs font-semibold tracking-wider uppercase text-study-primary">
          LỜI NHẮN TỪ NGƯỜI XÂY DỰNG
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-medium text-study-text tracking-tight leading-tight">
          Mimic bắt đầu từ <br />
          <em className="italic text-study-primary font-serif">một khoảng trống.</em>
        </h1>
        <p className="text-lg text-study-text-muted leading-relaxed max-w-2xl">
          Một khoảng trống giữa việc biết rất nhiều lý thuyết tiếng Anh và việc có thể tự nhiên mở lời khi bước vào một cuộc trò chuyện thật sự.
        </p>
      </section>

      {/* Story Narrative */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-8 border-t border-study-border">
        <div className="md:col-span-4 space-y-2">
          <span className="inline-block px-3 py-1.5 rounded-xl bg-study-surface-muted border border-study-border font-mono text-xs font-semibold text-study-text">
            2026 · BUILDING
          </span>
          <div className="text-xs text-study-text-muted">
            Một người học. <br />
            Một phòng luyện tập cá nhân hóa.
          </div>
        </div>

        <div className="md:col-span-8 space-y-6 text-sm sm:text-base text-study-text-soft leading-relaxed">
          <p className="text-lg font-medium text-study-text">
            Mình đã từng học rất nhiều ngữ pháp và danh sách từ vựng. Nhưng trong những cuộc trao đổi thực tế, mình vẫn thường mất quá nhiều thời gian để tìm từ trong đầu, nói vòng vo hoặc chọn im lặng.
          </p>
          <p>
            Các công cụ học hiện tại làm tốt việc đưa lượng lớn bài học đến trước mặt người học. Nhưng kỹ năng nói (speaking) không đơn thuần là tiếp nhận thêm nội dung. Nó là một vòng lặp phản xạ: <strong>thử nói thành tiếng → nghe lại → nhận biết chỗ vấp → thử lại lần nữa</strong>.
          </p>
          <p>
            Mimic ra đời để làm cho vòng lặp đó trở nên nhẹ nhàng hơn, an toàn hơn và đủ cá nhân hóa để bạn muốn quay lại luyện tập vào ngày mai.
          </p>
          <div className="p-4 rounded-2xl bg-study-primary-soft/50 border border-study-primary-border/60 text-study-primary font-medium flex items-center gap-3 text-sm">
            <MessageCircle size={18} className="shrink-0" />
            <span>AI đồng hành cá nhân hóa thay thế cho một giáo trình đại trà khô khan.</span>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="space-y-10 pt-8 border-t border-study-border">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-study-primary">
            TRIẾT LÝ HỌC TẬP
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-study-text mt-2">
            Ít hơn, nhưng chạm đúng chỗ hơn.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
            <span className="font-mono font-bold text-sm text-study-primary">01</span>
            <h3 className="text-base font-semibold text-study-text">Ngữ cảnh trước số lượng</h3>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Một từ bạn thật sự muốn dùng và có ngữ cảnh nói đáng nhớ gấp mười lần danh sách từ học vẹt không có chỗ ứng dụng.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
            <span className="font-mono font-bold text-study-primary">02</span>
            <h3 className="text-base font-semibold text-study-text">Phản hồi để ứng dụng</h3>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Không chấm điểm khắt khe để tạo áp lực. Chỉ ra một điểm cụ thể để lần nói tiếp theo bạn thử cách diễn đạt tự nhiên hơn.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
            <span className="font-mono font-bold text-study-primary">03</span>
            <h3 className="text-base font-semibold text-study-text">Tiến bộ có nhịp riêng</h3>
            <p className="text-xs text-study-text-muted leading-relaxed">
              Streak là tín hiệu vui để giữ nhịp. Những lỗi ngập ngừng lặp lại mới là nơi có nhiều giá trị nhất để bạn hoàn thiện.
            </p>
          </div>
        </div>
      </section>

      {/* About CTA */}
      <section className="p-8 sm:p-10 rounded-3xl bg-study-surface border border-study-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="w-10 h-10 rounded-2xl bg-study-primary-soft text-study-primary flex items-center justify-center shrink-0">
            <Feather size={20} />
          </span>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-study-primary">
              TRẢI NGHIỆM THỰC TẾ
            </span>
            <h2 className="text-xl font-display font-semibold text-study-text mt-1">
              Bắt đầu buổi luyện tập đầu tiên
            </h2>
            <p className="text-xs text-study-text-muted mt-1 leading-relaxed max-w-md">
              Dành 5 phút hôm nay để thử nói thành tiếng với Speaking Agent.
            </p>
          </div>
        </div>

        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-study-primary text-white font-semibold text-sm hover:bg-study-primary-hover transition-colors shadow-xs shrink-0"
        >
          <span>Vào phòng luyện tập</span>
          <ArrowUpRight size={16} />
        </Link>
      </section>
    </div>
  )
}
