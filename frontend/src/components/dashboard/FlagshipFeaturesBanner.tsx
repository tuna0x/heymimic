import { ArrowRight, Tv, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FlagshipFeaturesBanner() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-study-accent uppercase tracking-wider block">
            Tâm điểm rèn luyện tương tác
          </span>
          <h3 className="text-lg font-display font-semibold text-study-text mt-0.5">
            Nói trực tiếp 1-kèm-1 & Học phản xạ qua Video
          </h3>
        </div>
        <span className="text-xs text-study-text-muted hidden sm:inline">Phản xạ thực chiến</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 1-on-1 Peer Practice */}
        <Link
          to="/peer-practice"
          className="p-6 rounded-2xl bg-gradient-to-br from-study-surface via-study-surface to-study-accent-soft/30 border border-study-accent/40 hover:border-study-accent shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-study-accent text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Users2 size={22} />
              </div>
              <span className="px-3 py-1 rounded-full bg-study-accent/15 text-study-accent text-[11px] font-bold">
                KẾT NỐI NGƯỜI DÙNG 1-KÈM-1
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-display font-bold text-study-text group-hover:text-study-accent transition-colors">
              Luyện nói 1-kèm-1 theo chủ đề
            </h4>
            <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed">
              Ghép đôi với bạn học cùng trình độ. Đàm thoại theo kịch bản 4 vòng có gợi ý câu hỏi và đồng hồ luân phiên, không sợ im lặng ngượng ngùng.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-study-border-subtle flex items-center justify-between text-xs text-study-accent font-semibold">
            <span>Tìm bạn học & Vào phòng đàm thoại</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Video Shadowing Studio */}
        <Link
          to="/video-learning"
          className="p-6 rounded-2xl bg-gradient-to-br from-study-surface via-study-surface to-study-primary-soft/30 border border-study-primary-border/70 hover:border-study-primary shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-study-primary text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Tv size={22} />
              </div>
              <span className="px-3 py-1 rounded-full bg-study-primary/15 text-study-primary text-[11px] font-bold">
                HỌC QUA VIDEO
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-display font-bold text-study-text group-hover:text-study-primary transition-colors">
              Xem video, nghe & nhại âm theo
            </h4>
            <p className="text-xs text-study-text-muted mt-1.5 leading-relaxed">
              Các đoạn trích TED, đàm phán công sở và phỏng vấn. Bấm vào bất kỳ dòng phụ đề nào để tua và thu âm nói theo khẩu hình người bản xứ.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-study-border-subtle flex items-center justify-between text-xs text-study-primary font-semibold">
            <span>Khám phá thư viện video & Shadowing</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  )
}
