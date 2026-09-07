import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { faqs, testimonials } from './landingData'

interface ProofAndFaqSectionProps {
  testimonialRef: (node?: HTMLElement | null) => void
  testimonialVisible: boolean
  test1Ref: (node?: HTMLElement | null) => void
  test1Visible: boolean
  test2Ref: (node?: HTMLElement | null) => void
  test2Visible: boolean
  test3Ref: (node?: HTMLElement | null) => void
  test3Visible: boolean
  faqRef: (node?: HTMLElement | null) => void
  faqVisible: boolean
}

export function ProofAndFaqSection({
  testimonialRef,
  testimonialVisible,
  test1Ref,
  test1Visible,
  test2Ref,
  test2Visible,
  test3Ref,
  test3Visible,
  faqRef,
  faqVisible,
}: ProofAndFaqSectionProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const testRefs = [test1Ref, test2Ref, test3Ref]
  const testVisibles = [test1Visible, test2Visible, test3Visible]

  return (
    <div className="space-y-24 sm:space-y-36">
      {/* Testimonials */}
      <section
        ref={testimonialRef}
        className={`max-w-5xl mx-auto px-6 space-y-10 scroll-reveal ${testimonialVisible ? 'visible' : ''}`}
      >
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
            CÂU CHUYỆN THỰC TẾ
          </span>
          <h2 className="text-3xl font-display font-bold text-study-text tracking-tight">
            Từ những người đang luyện tập mỗi ngày.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={t.name}
              ref={testRefs[idx]}
              className={`clean-card p-6 rounded-2xl flex flex-col justify-between space-y-5 scroll-reveal ${testVisibles[idx] ? 'visible' : ''}`}
            >
              <p className="text-xs sm:text-sm text-study-text-soft leading-relaxed italic">
                “{t.quote}”
              </p>

              <div className="pt-4 border-t border-study-border flex items-center justify-between text-xs">
                <div>
                  <strong className="block font-semibold text-study-text">{t.name}</strong>
                  <span className="text-[11px] text-study-text-muted">{t.role}</span>
                </div>
                <span className="text-[11px] font-mono text-study-primary font-medium">
                  {t.streak}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section
        ref={faqRef}
        className={`max-w-3xl mx-auto px-6 space-y-8 scroll-reveal ${faqVisible ? 'visible' : ''}`}
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
            HỎI ĐÁP
          </span>
          <h2 className="text-3xl font-display font-bold text-study-text tracking-tight">
            Những băn khoăn thường gặp
          </h2>
        </div>

        <div className="divide-y divide-study-border clean-card rounded-2xl overflow-hidden px-6">
          {faqs.map((item, index) => {
            const isOpen = activeFaq === index
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <strong className="text-sm font-semibold text-study-text">
                    {item.q}
                  </strong>
                  <ChevronDown
                    size={16}
                    className={`text-study-text-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-study-primary' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p className="pt-3 text-xs sm:text-sm text-study-text-muted leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
