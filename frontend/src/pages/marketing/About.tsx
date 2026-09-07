import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Feather,
  Flame,
  Heart,
  Lightbulb,
  MessageCircle,
  Mic2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandGlyph, BrandLogo } from '../../components/shared/BrandLogo'
import { usePageMeta } from '../../hook/usePageMeta'

export function About() {
  usePageMeta({
    title: 'Vì sao HeyMimic — Câu chuyện & Triết lý',
    description:
      'Tìm hiểu lý do HeyMimic ra đời từ trải nghiệm một người học tiếng Anh cần một practice room cá nhân hóa và không áp lực.',
    canonicalPath: '/about',
    keywords: 'về heymimic, triết lý học tiếng anh, tự học speaking, heymimic studio',
    schemaJson: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Về HeyMimic Studio',
      description:
        'Câu chuyện ra đời và triết lý học tập của HeyMimic: luyện nói tiếng Anh cá nhân hóa bằng AI trong không gian riêng tư.',
      mainEntity: {
        '@type': 'EducationalOrganization',
        name: 'HeyMimic Studio',
        url: 'https://heymimic.com',
        knowsAbout: [
          'English Pronunciation',
          'Shadowing Method',
          'AI Language Learning',
          'Spoken English Cadence',
        ],
      },
    },
  })

  const principles = [
    {
      num: '01',
      title: 'Ngữ cảnh trước số lượng',
      en: 'Context over Rote Lists',
      desc: 'Một từ vựng xuất hiện trong tài liệu bạn đang đọc, email bạn đang viết hay tình huống bạn vừa trải qua có giá trị ghi nhớ gấp mười lần một danh sách 1.000 từ học vẹt xa lạ.',
      icon: Compass,
    },
    {
      num: '02',
      title: 'Phản hồi để nói tự nhiên, không phải để chấm điểm',
      en: 'Actionable Nuance, Zero Stress',
      desc: 'HeyMimic không tạo ra các kỳ thi sát hạch căng thẳng. AI chỉ đóng vai trò một người đồng hành tinh tế, chỉ ra một điểm vấp nhỏ và gợi ý câu nói mềm mại, tự nhiên hơn.',
      icon: Lightbulb,
    },
    {
      num: '03',
      title: 'Nhịp điệu bền bỉ đánh bại sự dồn ép',
      en: 'Consistency beats Intensity',
      desc: 'Nói 60–90 giây mỗi ngày trong 30 ngày sẽ tạo ra biến chuyển cơ miệng và sự tự tin phản xạ mạnh mẽ hơn việc học dồn 5 tiếng đồng hồ vào cuối tuần.',
      icon: Flame,
    },
  ]

  const milestones = [
    {
      period: 'KHOẢNG TRỐNG',
      year: '2024',
      title: 'Khoảnh khắc nhận ra nút thắt',
      detail:
        'Học rất nhiều ngữ pháp và từ vựng qua sách vở, nhưng khi bước vào các buổi họp kỹ thuật với đồng nghiệp quốc tế, miệng vẫn bị khóa chặt và mất quá nhiều thời gian để dịch từng từ trong đầu.',
    },
    {
      period: 'THỰC NGHIỆM',
      year: '2025',
      title: 'Thử nghiệm vòng lặp Micro-Speaking 60s',
      detail:
        'Tự ghi âm 60 giây mỗi sáng về những gì mình chuẩn bị làm. Nghe lại, nhận ra những chỗ nuốt âm /s/, /t/ và câu nói bị gượng gạo. Thói quen này tạo ra bước nhảy vọt về sự tự tin.',
    },
    {
      period: 'HOÀN THIỆN',
      year: '2026',
      title: 'Ra mắt HeyMimic Studio v2.4',
      detail:
        'Đóng gói toàn bộ phương pháp thành một phòng luyện tập AI riêng tư: bóc tách ngữ cảnh từ văn bản, mô phỏng phản hồi chuyên nghiệp và theo dõi các điểm vấp định kỳ.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-24">
      {/* =========================================================================
          1. HERO MANIFESTO: The Core Gap
         ========================================================================= */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-study-primary-soft text-study-primary border border-study-primary-border/60">
          <Feather size={13} />
          <span>BẢN TUYÊN NGÔN HỌC TẬP · THE HEYMIMIC MANIFESTO</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-bold text-study-text tracking-tight leading-[1.15]">
          HeyMimic bắt đầu từ <br />
          <span className="italic font-serif font-normal text-study-primary">
            một khoảng trống quen thuộc.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-study-text-muted leading-relaxed font-light">
          Khoảng trống giữa việc <strong className="font-semibold text-study-text">biết rất nhiều lý thuyết tiếng Anh</strong> và việc <strong className="font-semibold text-study-text">có thể tự nhiên mở lời</strong> khi bước vào một cuộc trò chuyện thật sự.
        </p>
      </section>

      {/* =========================================================================
          2. THE STORY NARRATIVE: Written by a Real Learner
         ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 border-t border-study-border items-start">
        <div className="md:col-span-4 space-y-3">
          <span className="inline-block px-3 py-1.5 rounded-xl bg-study-surface-muted border border-study-border font-mono text-xs font-semibold text-study-text">
            NHẬT KÝ SÁNG LẬP
          </span>
          <div className="text-xs text-study-text-muted leading-relaxed">
            Một người học. <br />
            Một trăn trở về phản xạ. <br />
            Một phòng luyện tập riêng tư.
          </div>
        </div>

        <div className="md:col-span-8 space-y-5 text-sm sm:text-base text-study-text-soft leading-relaxed">
          <p className="text-lg font-medium text-study-text">
            Chúng mình từng dành nhiều năm làm các bài tập trắc nghiệm, đánh dấu flashcard và nghe vô số podcast. Nhưng khi sếp hoặc đồng nghiệp hỏi một câu bất ngờ, não bộ vẫn bị nghẽn lại vì cố ghép các từ đơn lẻ thành câu chuẩn ngữ pháp.
          </p>
          <p>
            Các công cụ học ngoại ngữ truyền thống làm rất tốt việc đưa thêm nội dung đến trước mắt bạn. Nhưng kỹ năng nói (Speaking) không thể phát triển bằng cách tiếp nhận thụ động. Nó đòi hỏi một vòng lặp xúc giác: <strong className="text-study-text">Mở miệng nói thành tiếng → Nghe lại âm lượng & ngữ điệu → Nhận biết chỗ ngập ngừng → Thử lại phiên bản tự nhiên hơn</strong>.
          </p>
          <p>
            HeyMimic ra đời để biến vòng lặp đó trở nên nhẹ nhàng, êm dịu và an toàn đến mức bạn hào hứng muốn quay lại mỗi sáng.
          </p>

          <div className="p-5 rounded-2xl bg-study-primary-soft/50 border border-study-primary-border/60 text-study-primary font-medium flex items-center gap-3.5 text-xs sm:text-sm">
            <MessageCircle size={20} className="shrink-0" />
            <span>AI đồng hành lắng nghe riêng tư thay thế cho áp lực bị người khác đánh giá hay chê cười.</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. GUIDING PRINCIPLES: 3 Pillars of Agency
         ========================================================================= */}
      <section className="space-y-10 pt-8 border-t border-study-border">
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-study-primary">
            TRIẾT LÝ THIẾT KẾ
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-study-text tracking-tight">
            Ít hơn, nhưng chạm đúng điểm vấp hơn.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.num}
                className="clean-card clean-card-hover p-6 sm:p-7 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-study-primary">
                      {item.num}
                    </span>
                    <span className="p-2 rounded-xl bg-study-surface-muted text-study-text-muted">
                      <Icon size={16} />
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-study-text">
                    {item.title}
                  </h3>
                  <p className="text-xs text-study-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-study-border-subtle text-[11px] font-mono text-study-text-faint">
                  {item.en}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          4. MILESTONE TIMELINE
         ========================================================================= */}
      <section className="space-y-8 pt-8 border-t border-study-border">
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-study-primary">
            CHẶNG ĐƯỜNG PHÁT TRIỂN
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-study-text tracking-tight">
            Hành trình xây dựng HeyMimic
          </h2>
        </div>

        <div className="space-y-4">
          {milestones.map((m) => (
            <div
              key={m.period}
              className="clean-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="sm:w-36 shrink-0">
                <span className="block font-mono text-sm font-bold text-study-primary">
                  {m.year}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-study-text-muted">
                  {m.period}
                </span>
              </div>

              <div className="flex-1 space-y-1">
                <strong className="block text-sm font-semibold text-study-text">
                  {m.title}
                </strong>
                <p className="text-xs text-study-text-muted leading-relaxed">
                  {m.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. FOUNDER'S NOTE & CTA
         ========================================================================= */}
      <section className="clean-card p-8 sm:p-10 rounded-2xl space-y-6">
        <div className="flex items-start gap-4">
          <BrandGlyph size={44} />
          <div className="space-y-1">
            <strong className="block text-base font-semibold text-study-text">
              Lời nhắn từ HeyMimic Studio
            </strong>
            <span className="block text-xs text-study-text-muted">
              Được kiến tạo cho sự tự tin dài hạn của người học tiếng Anh.
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-study-text-soft leading-relaxed italic">
          “Chúng mình không hứa hẹn biến bạn thành người bản xứ sau một đêm. Nhưng HeyMimic cam kết trao cho bạn một góc nhỏ an tâm mỗi ngày để cất tiếng nói, nhìn thấy sự tiến bộ và không còn ngập ngừng khi cơ hội giao tiếp gõ cửa.”
        </p>

        <div className="pt-4 border-t border-study-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-study-text-muted font-medium">
            Sẵn sàng trải nghiệm buổi nói đầu tiên?
          </span>

          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs"
          >
            <span>Vào phòng học ngay</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}
