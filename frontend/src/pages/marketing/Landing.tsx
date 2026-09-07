import { AcousticCadenceBanner } from '../../components/marketing/AcousticCadenceBanner'
import { InteractivePreFooterBanner } from '../../components/marketing/InteractivePreFooterBanner'
import { HeroSection } from '../../components/marketing/landing/HeroSection'
import { StatsCounterSection } from '../../components/marketing/landing/StatsCounterSection'
import { SpeakingArenaDemo } from '../../components/marketing/landing/SpeakingArenaDemo'
import { MethodAndComparisonSection } from '../../components/marketing/landing/MethodAndComparisonSection'
import { ProofAndFaqSection } from '../../components/marketing/landing/ProofAndFaqSection'
import { faqs } from '../../components/marketing/landing/landingData'
import { usePageMeta } from '../../hook/usePageMeta'
import { useScrollReveal } from '../../hook/useScrollReveal'

export function Landing() {
  // SEO & GEO Configuration
  usePageMeta({
    title: 'HeyMimic — Phòng Luyện Nói Tiếng Anh Cá Nhân Hóa Bằng AI',
    description:
      'Nói tiếng Anh tự nhiên theo cách của bạn. Luyện phản xạ 60–90 giây mỗi ngày cùng AI trong không gian riêng tư, không áp lực. Bóc tách từ vựng từ ngữ cảnh thật.',
    keywords:
      'luyện nói tiếng anh ai, phương pháp shadowing, tự học speaking phản xạ, phát âm chuẩn ngữ điệu, heymimic',
    canonicalPath: '/',
    schemaJson: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    },
  })

  // Scroll reveal refs for each section
  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.1, rootMargin: '0px' })
  const [statsRef, statsVisible] = useScrollReveal({ threshold: 0.3 })
  const [arenaRef, arenaVisible] = useScrollReveal<HTMLElement>()
  const [cadenceRef, cadenceVisible] = useScrollReveal<HTMLElement>()
  const [pillarsRef, pillarsVisible] = useScrollReveal<HTMLElement>()
  const [pillar1Ref, pillar1Visible] = useScrollReveal({ delay: 0 })
  const [pillar2Ref, pillar2Visible] = useScrollReveal({ delay: 120 })
  const [pillar3Ref, pillar3Visible] = useScrollReveal({ delay: 240 })
  const [loopRef, loopVisible] = useScrollReveal<HTMLElement>()
  const [step1Ref, step1Visible] = useScrollReveal({ delay: 0 })
  const [step2Ref, step2Visible] = useScrollReveal({ delay: 80 })
  const [step3Ref, step3Visible] = useScrollReveal({ delay: 160 })
  const [step4Ref, step4Visible] = useScrollReveal({ delay: 240 })
  const [compareRef, compareVisible] = useScrollReveal<HTMLElement>()
  const [testimonialRef, testimonialVisible] = useScrollReveal<HTMLElement>()
  const [test1Ref, test1Visible] = useScrollReveal({ delay: 0 })
  const [test2Ref, test2Visible] = useScrollReveal({ delay: 120 })
  const [test3Ref, test3Visible] = useScrollReveal({ delay: 240 })
  const [faqRef, faqVisible] = useScrollReveal<HTMLElement>()

  return (
    <div className="space-y-24 sm:space-y-36 pb-20">
      {/* 1. Hero Section */}
      <HeroSection heroRef={heroRef} heroVisible={heroVisible} />

      {/* 1.5 Animated Stats Counter */}
      <StatsCounterSection statsRef={statsRef} statsVisible={statsVisible} />

      <div className="section-divider" />

      {/* 2. Speaking Arena & Interactive Demo */}
      <SpeakingArenaDemo arenaRef={arenaRef} arenaVisible={arenaVisible} />

      {/* 2.5 Acoustic Cadence Banner */}
      <section
        ref={cadenceRef}
        className={`max-w-5xl mx-auto px-6 scroll-reveal-scale ${cadenceVisible ? 'visible' : ''}`}
      >
        <AcousticCadenceBanner />
      </section>

      <div className="section-divider" />

      {/* 3, 4, 5. Core Pillars, Practice Loop & Comparison Table */}
      <MethodAndComparisonSection
        pillarsRef={pillarsRef}
        pillarsVisible={pillarsVisible}
        pillar1Ref={pillar1Ref}
        pillar1Visible={pillar1Visible}
        pillar2Ref={pillar2Ref}
        pillar2Visible={pillar2Visible}
        pillar3Ref={pillar3Ref}
        pillar3Visible={pillar3Visible}
        loopRef={loopRef}
        loopVisible={loopVisible}
        step1Ref={step1Ref}
        step1Visible={step1Visible}
        step2Ref={step2Ref}
        step2Visible={step2Visible}
        step3Ref={step3Ref}
        step3Visible={step3Visible}
        step4Ref={step4Ref}
        step4Visible={step4Visible}
        compareRef={compareRef}
        compareVisible={compareVisible}
      />

      <div className="section-divider" />

      {/* 6 & 7. Testimonials & FAQ */}
      <ProofAndFaqSection
        testimonialRef={testimonialRef}
        testimonialVisible={testimonialVisible}
        test1Ref={test1Ref}
        test1Visible={test1Visible}
        test2Ref={test2Ref}
        test2Visible={test2Visible}
        test3Ref={test3Ref}
        test3Visible={test3Visible}
        faqRef={faqRef}
        faqVisible={faqVisible}
      />

      {/* 8. Interactive PreFooter Banner */}
      <InteractivePreFooterBanner />
    </div>
  )
}
