import { comparisonData, loopSteps } from './landingData'

interface MethodAndComparisonSectionProps {
  pillarsRef: (node?: HTMLElement | null) => void
  pillarsVisible: boolean
  pillar1Ref: (node?: HTMLElement | null) => void
  pillar1Visible: boolean
  pillar2Ref: (node?: HTMLElement | null) => void
  pillar2Visible: boolean
  pillar3Ref: (node?: HTMLElement | null) => void
  pillar3Visible: boolean
  loopRef: (node?: HTMLElement | null) => void
  loopVisible: boolean
  step1Ref: (node?: HTMLElement | null) => void
  step1Visible: boolean
  step2Ref: (node?: HTMLElement | null) => void
  step2Visible: boolean
  step3Ref: (node?: HTMLElement | null) => void
  step3Visible: boolean
  step4Ref: (node?: HTMLElement | null) => void
  step4Visible: boolean
  compareRef: (node?: HTMLElement | null) => void
  compareVisible: boolean
}

export function MethodAndComparisonSection({
  pillarsRef,
  pillarsVisible,
  pillar1Ref,
  pillar1Visible,
  pillar2Ref,
  pillar2Visible,
  pillar3Ref,
  pillar3Visible,
  loopRef,
  loopVisible,
  step1Ref,
  step1Visible,
  step2Ref,
  step2Visible,
  step3Ref,
  step3Visible,
  step4Ref,
  step4Visible,
  compareRef,
  compareVisible,
}: MethodAndComparisonSectionProps) {
  const stepRefs = [step1Ref, step2Ref, step3Ref, step4Ref]
  const stepVisibles = [step1Visible, step2Visible, step3Visible, step4Visible]

  return (
    <div className="space-y-24 sm:space-y-36">
      {/* Three Core Pillars */}
      <section
        ref={pillarsRef}
        className={`max-w-5xl mx-auto px-6 space-y-12 scroll-reveal ${pillarsVisible ? 'visible' : ''}`}
      >
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
            PHƯƠNG PHÁP HỌC
          </span>
          <h2 className="text-3xl font-display font-bold text-study-text tracking-tight">
            Xây dựng phản xạ từ những gì bạn thực sự cần nói.
          </h2>
          <p className="text-sm text-study-text-muted leading-relaxed">
            Không học vẹt danh sách 1.000 từ xa lạ. HeyMimic kết nối 3 yếu tố cốt lõi để bạn tự tin hơn mỗi tuần.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div ref={pillar1Ref} className={`clean-card clean-card-hover p-8 rounded-2xl space-y-4 scroll-reveal ${pillar1Visible ? 'visible' : ''}`}>
            <span className="text-xs font-mono font-bold text-study-primary">
              01 · TỪ VỰNG CỦA BẠN
            </span>
            <h3 className="text-lg font-display font-semibold text-study-text">
              Bóc tách từ ngữ cảnh thật
            </h3>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Dán đoạn văn bạn vừa đọc, email bạn vừa viết hay tài liệu chuyên môn. HeyMimic tự động trích xuất các cụm từ đắt giá để bạn áp dụng ngay vào bài nói.
            </p>
          </div>

          <div ref={pillar2Ref} className={`clean-card clean-card-hover p-8 rounded-2xl space-y-4 scroll-reveal ${pillar2Visible ? 'visible' : ''}`}>
            <span className="text-xs font-mono font-bold text-study-accent">
              02 · PHÒNG NÓI 60 GIÂY
            </span>
            <h3 className="text-lg font-display font-semibold text-study-text">
              Mở mic nói không áp lực
            </h3>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Tập trung vào cảm giác rung của thanh quản và hơi thở. Không ai chấm điểm khắt khe, AI chỉ đóng vai trò người lắng nghe riêng tư và gợi ý cách nói tự nhiên hơn.
            </p>
          </div>

          <div ref={pillar3Ref} className={`clean-card clean-card-hover p-8 rounded-2xl space-y-4 scroll-reveal ${pillar3Visible ? 'visible' : ''}`}>
            <span className="text-xs font-mono font-bold text-study-primary">
              03 · MẪU LỖI LẶP LẠI
            </span>
            <h3 className="text-lg font-display font-semibold text-study-text">
              Gỡ dần các điểm vấp quen thuộc
            </h3>
            <p className="text-xs sm:text-sm text-study-text-muted leading-relaxed">
              Theo dõi những điểm hay ngập ngừng như nuốt âm /s/, /t/ hay quên mạo từ để bạn nhận biết và điều chỉnh tự nhiên qua từng buổi luyện tập.
            </p>
          </div>
        </div>
      </section>

      {/* The Practice Loop */}
      <section
        ref={loopRef}
        className={`max-w-5xl mx-auto px-6 space-y-12 scroll-reveal ${loopVisible ? 'visible' : ''}`}
      >
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
            VÒNG LẶP HÀNG NGÀY
          </span>
          <h2 className="text-3xl font-display font-bold text-study-text tracking-tight">
            10–15 phút mỗi ngày, đều đặn và bền bỉ.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loopSteps.map((step, idx) => (
            <div
              key={step.num}
              ref={stepRefs[idx]}
              className={`clean-card p-6 rounded-2xl space-y-3 scroll-reveal ${stepVisibles[idx] ? 'visible' : ''}`}
            >
              <span className="text-xs font-mono font-bold text-study-primary">
                BƯỚC {step.num}
              </span>
              <h3 className="text-base font-semibold text-study-text">
                {step.title}
              </h3>
              <p className="text-xs text-study-text-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Comparison Table */}
      <section
        ref={compareRef}
        className={`max-w-5xl mx-auto px-6 space-y-10 scroll-reveal-left ${compareVisible ? 'visible' : ''}`}
      >
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
            SO SÁNH
          </span>
          <h2 className="text-3xl font-display font-bold text-study-text tracking-tight">
            Vì sao chọn HeyMimic?
          </h2>
        </div>

        <div className="clean-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-study-border bg-study-surface-muted/60">
                  <th className="p-4 font-semibold text-study-text-muted w-1/4">Tiêu chí</th>
                  <th className="p-4 font-bold text-study-primary w-1/3 bg-study-primary-soft/40">
                    HeyMimic
                  </th>
                  <th className="p-4 font-medium text-study-text-muted w-1/5">App trắc nghiệm</th>
                  <th className="p-4 font-medium text-study-text-muted w-1/5">Gia sư kèm 1-1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-study-border">
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="hover:bg-study-surface-muted/30 transition-colors">
                    <td className="p-4 font-medium text-study-text">{row.feature}</td>
                    <td className="p-4 font-medium text-study-text bg-study-primary-soft/20">
                      ✓ {row.heymimic}
                    </td>
                    <td className="p-4 text-study-text-muted">{row.traditional}</td>
                    <td className="p-4 text-study-text-muted">{row.tutor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
