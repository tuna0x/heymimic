import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Check,
  ChevronDown,
  Clock3,
  Headphones,
  Lightbulb,
  Mic2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../../hook/usePageMeta'

export function SpeakingMethod() {
  const [selectedDemo, setSelectedDemo] = useState<'flat' | 'cadence'>('cadence')

  // SEO & GEO Configuration
  usePageMeta({
    title: 'Phương Pháp Luyện Nói Tiếng Anh & Shadowing Cùng AI',
    description:
      'Tìm hiểu phương pháp Shadowing và luyện phản xạ nói tiếng Anh 60–90 giây mỗi ngày cùng HeyMimic. Biến từ vựng ngữ cảnh thành phản xạ tự nhiên không áp lực.',
    keywords:
      'luyện nói tiếng anh ai, phương pháp shadowing, tự học speaking phản xạ, phát âm chuẩn ngữ điệu, heymimic',
    canonicalPath: '/speaking-method',
    schemaJson: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Cách Luyện Nói Tiếng Anh 60 Giây Bằng Phương Pháp Shadowing Cùng AI',
      description:
        'Hướng dẫn 4 bước rèn luyện phản xạ nói tiếng Anh tự nhiên mỗi ngày cùng AI không gây mệt mỏi hay áp lực.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Bước 1: Chọn ngữ cảnh gần gũi',
          text: 'Chọn một chủ đề thực tế từ công việc hoặc đời sống hàng ngày của bạn.',
        },
        {
          '@type': 'HowToStep',
          name: 'Bước 2: Mở mic nói 60–90 giây',
          text: 'Nói thành tiếng trong không gian riêng tư, chấp nhận ngập ngừng như dữ liệu để cải thiện.',
        },
        {
          '@type': 'HowToStep',
          name: 'Bước 3: Nhận gợi ý phiên bản tự nhiên',
          text: 'AI chỉ ra điểm gãy và cung cấp cách người bản xứ diễn đạt mềm mại hơn.',
        },
        {
          '@type': 'HowToStep',
          name: 'Bước 4: Bắt nhịp ngữ điệu và ôn lại',
          text: 'Luyện lại theo đường lượn sóng ngữ điệu để tạo thành trí nhớ cơ bắp.',
        },
      ],
    },
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-24">
      {/* =========================================================================
          1. HERO: Core Speaking Methodology
         ========================================================================= */}
      <section className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-study-primary bg-study-primary-soft px-3.5 py-1.5 rounded-full">
          <Mic2 size={13} />
          <span>PHƯƠNG PHÁP LUYỆN NÓI ĐỘT PHÁ · THE PRACTICE ROOM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-study-text leading-[1.15] text-balance">
          Biến từ vựng ngữ cảnh <br />
          <span className="text-study-primary font-serif font-normal italic">
            thành phản xạ tự nhiên.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-study-text-muted leading-relaxed font-normal">
          Kỹ năng nói (Speaking) không thể rèn luyện bằng cách làm bài tập trắc nghiệm trên giấy. Bạn cần sự vận động thực tế của thanh quản, hơi thở và phản hồi tức thì để não bộ giải phóng phản xạ tự nhiên.
        </p>
      </section>

      {/* =========================================================================
          2. THE NEUROSCIENCE: Why 60 Seconds Beats 5 Hours
         ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="clean-card p-8 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-study-primary">
              KHOA HỌC NÃO BỘ · COGNITIVE LOAD
            </span>
            <h2 className="text-2xl font-display font-bold text-study-text">
              Vì sao các buổi học 60 phút thường làm bạn kiệt sức?
            </h2>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Khi phải nói liên tục 45–60 phút với người lạ, não bộ của người học trung cấp rơi vào trạng thái quá tải nhận thức (Cognitive Overload). Bạn vừa phải nghĩ ý tưởng, vừa dịch từ vựng, vừa lo sợ bị đối phương đánh giá. Kết quả là buổi học kết thúc trong mệt mỏi mà không tạo thành thói quen bền vững.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-study-surface-muted text-xs text-study-text-soft leading-relaxed">
            Học dồn nhiều giờ vào cuối tuần chỉ tạo hưng phấn ngắn hạn, không hình thành trí nhớ cơ bắp (Muscle memory).
          </div>
        </div>

        <div className="clean-card p-8 rounded-2xl space-y-4 flex flex-col justify-between bg-study-primary-soft/30 border-study-primary-border/60">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-study-primary">
              GIẢI PHÁP HEYMIMIC · MICRO-SPEAKING
            </span>
            <h2 className="text-2xl font-display font-bold text-study-text">
              Sức mạnh của 60–90 giây mỗi ngày
            </h2>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              HeyMimic thu nhỏ buổi luyện tập thành một cú hích 60–90 giây tập trung cao độ. Bạn chọn 1 tình huống hôm nay, nói 1 lượt thành tiếng, AI phân tích ngay 1 điểm vấp cụ thể và đưa ra gợi ý mềm mại hơn. Không gian 100% riêng tư giúp bạn hoàn toàn thả lỏng.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-study-surface text-xs text-study-primary font-medium border border-study-primary-border/40">
            ✓ 15 phút mỗi sáng · 30 ngày liên tục = 30 lần cất tiếng nói tự tin.
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INTERACTIVE PITCH & CADENCE SIMULATOR
         ========================================================================= */}
      <section className="clean-card rounded-2xl p-8 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-study-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
              TRỰC QUAN HÓA NGỮ ĐIỆU
            </span>
            <h2 className="text-2xl font-display font-bold text-study-text mt-1">
              Đường lượn sóng ngữ điệu (Pitch Contour)
            </h2>
          </div>

          {/* Toggle Switch */}
          <div className="flex rounded-xl bg-study-surface-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDemo('flat')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDemo === 'flat'
                  ? 'bg-study-surface text-study-text font-semibold shadow-xs'
                  : 'text-study-text-muted'
              }`}
            >
              Cách nói ngang bằng (Monotone)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDemo('cadence')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDemo === 'cadence'
                  ? 'bg-study-primary text-white font-semibold shadow-xs'
                  : 'text-study-text-muted'
              }`}
            >
              Ngữ điệu tự nhiên (Cadence)
            </button>
          </div>
        </div>

        {/* Dynamic Pitch Visualizer */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-study-surface-muted/40 border border-study-border space-y-4">
            <span className="text-xs font-mono text-study-text-muted uppercase">
              CÂU THÍ NGHIỆM:
            </span>
            <p className="text-lg sm:text-xl font-medium text-study-text">
              “Yesterday I <strong className={selectedDemo === 'cadence' ? 'text-study-primary' : ''}>wrapped up</strong> the auth API, and gained <strong className={selectedDemo === 'cadence' ? 'text-study-primary' : ''}>complete clarity</strong> on the contract.”
            </p>

            {/* SVG Pitch Curve Simulation */}
            <div className="h-20 w-full relative flex items-center justify-center">
              <svg viewBox="0 0 600 80" className="w-full h-full overflow-visible">
                {selectedDemo === 'flat' ? (
                  // Flat monotone line
                  <path
                    d="M10,40 L590,40"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                ) : (
                  // Dynamic modulated cadence wave
                  <path
                    d="M10,50 Q100,55 180,25 T320,45 Q420,15 500,30 T590,55"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="3.5"
                    className="transition-all duration-500"
                  />
                )}
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-study-text-muted">
              <span>{selectedDemo === 'flat' ? '⚠️ Ngữ điệu phẳng đều, người nghe khó bắt được ý chính' : '✓ Nhấn trọng âm ở "wrapped up" và "clarity", thả lỏng ở từ nối'}</span>
              <span className="font-mono text-study-primary font-bold">{selectedDemo === 'flat' ? '65/100' : '94/100 Tự nhiên'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. STEP-BY-STEP FRAMEWORK
         ========================================================================= */}
      <section className="space-y-12">
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
            QUY TRÌNH LUYỆN TẬP
          </span>
          <h2 className="text-3xl font-display font-bold text-study-text tracking-tight">
            4 bước thực hành hàng ngày tại HeyMimic
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="clean-card p-6 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-study-primary">
              BƯỚC 01
            </span>
            <h3 className="text-lg font-semibold text-study-text">
              Bóc tách ngữ cảnh (Context Capture)
            </h3>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Bạn dán một câu tiếng Anh từ email công việc, tài liệu vừa đọc hoặc chủ đề bạn quan tâm. HeyMimic bóc tách 3 từ vựng cốt lõi đáng nhớ nhất.
            </p>
          </div>

          <div className="clean-card p-6 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-study-primary">
              BƯỚC 02
            </span>
            <h3 className="text-lg font-semibold text-study-text">
              Mở micro nói 60–90 giây
            </h3>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Không cần chuẩn bị kịch bản hoàn hảo. Bấm thu âm và nói thành tiếng những suy nghĩ của bạn. Cứ để bản thân ngập ngừng tự nhiên.
            </p>
          </div>

          <div className="clean-card p-6 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-study-primary">
              BƯỚC 03
            </span>
            <h3 className="text-lg font-semibold text-study-text">
              Nhận gợi ý tự nhiên từ AI
            </h3>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Speaking Agent phân tích transcript, chỉ ra 1 lỗi ngữ pháp nhỏ và đưa ra phiên bản diễn đạt mềm mại hơn chuẩn người bản xứ.
            </p>
          </div>

          <div className="clean-card p-6 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-study-primary">
              BƯỚC 04
            </span>
            <h3 className="text-lg font-semibold text-study-text">
              Ôn lại theo chu kỳ ngắt quãng (SRS)
            </h3>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Các từ ngữ cảnh và lỗi ngập ngừng sẽ được hệ thống nhắc lại đúng lúc để củng cố trí nhớ dài hạn vào các ngày tiếp theo.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CTA TO ENTER PRACTICE ROOM
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-study-surface to-study-primary-soft/40 border border-study-primary-border/60 p-8 sm:p-14 text-center space-y-6 shadow-sm">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-study-primary-soft text-study-primary text-[11px] font-mono font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            <span>TRẢI NGHIỆM MIỄN PHÍ</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-study-text tracking-tight">
            Sẵn sàng mở mic luyện phản xạ 60 giây?
          </h2>
          <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
            Chỉ cần 60 giây và một góc yên tĩnh để bắt đầu phiên luyện tập đầu tiên của bạn cùng HeyMimic.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Vào phòng luyện nói ngay</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text transition-colors"
          >
            <span>Trở về Trang chủ</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 text-[11px] text-study-text-muted">
          <span>✓ 100% riêng tư</span>
          <span>·</span>
          <span>✓ Không áp lực chấm điểm</span>
          <span>·</span>
          <span>✓ Không cần cài đặt phần mềm</span>
        </div>
      </section>
    </div>
  )
}
