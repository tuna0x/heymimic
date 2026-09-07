import { ArrowRight, Bot, Headphones, PenTool, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PersonalSkillPillarsGrid() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-study-primary uppercase tracking-wider block">
            Bổ trợ kỹ năng cá nhân
          </span>
          <h3 className="text-lg font-display font-semibold text-study-text mt-0.5">
            Các phòng luyện tập tự học
          </h3>
        </div>
        <span className="text-xs text-study-text-muted hidden sm:inline">Nghe · Viết · Cụm từ</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Listening Lab */}
        <Link
          to="/listening"
          className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-study-primary-border/80 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Headphones size={18} />
            </div>
            <h4 className="text-sm font-semibold text-study-text group-hover:text-study-primary transition-colors">
              Luyện nghe & Shadowing
            </h4>
            <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
              Tách câu từng đoạn, chỉnh tốc độ 0.8x–1.2x và nhại âm theo ngữ điệu bản xứ.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-study-primary font-medium">
            <span>Bắt đầu nghe</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {/* 2. Dialogue Roleplay */}
        <Link
          to="/speaking/dialogue"
          className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-study-accent/50 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bot size={18} />
            </div>
            <h4 className="text-sm font-semibold text-study-text group-hover:text-study-accent transition-colors">
              Hội thoại AI 2 chiều
            </h4>
            <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
              Đàm phán lùi deadline, phỏng vấn thử thách với phản hồi độ lịch sự và rõ ràng.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-study-accent font-medium">
            <span>Thực hành roleplay</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {/* 3. Collocations & Chunks */}
        <Link
          to="/vocab"
          className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-emerald-500/50 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles size={18} />
            </div>
            <h4 className="text-sm font-semibold text-study-text group-hover:text-emerald-500 transition-colors">
              Cụm từ & Collocations
            </h4>
            <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
              Thẻ tương phản "Đừng nói X, hãy nói Y" giúp chuyển hóa thói quen dịch từng từ.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-emerald-500 font-medium">
            <span>Học cụm từ</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {/* 4. Writing & Reflex */}
        <Link
          to="/writing"
          className="p-5 rounded-2xl bg-study-surface border border-study-border hover:border-indigo-500/50 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PenTool size={18} />
            </div>
            <h4 className="text-sm font-semibold text-study-text group-hover:text-indigo-500 transition-colors">
              Luyện viết & Phản xạ
            </h4>
            <p className="text-[11px] text-study-text-muted mt-1.5 leading-relaxed">
              Chuốt email/Slack chuyên nghiệp và dịch phản xạ Việt - Anh tự nhiên.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-study-border-subtle flex items-center justify-between text-[11px] text-indigo-500 font-medium">
            <span>Luyện viết ngay</span>
            <ArrowRight size={12} />
          </div>
        </Link>
      </div>
    </div>
  )
}
