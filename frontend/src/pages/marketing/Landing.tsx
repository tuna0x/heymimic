import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Flame,
  Headphones,
  LoaderCircle,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AcousticCadenceBanner } from '../../components/marketing/AcousticCadenceBanner'
import { AcousticWaveVisualizer } from '../../components/marketing/AcousticWaveVisualizer'
import { InteractivePreFooterBanner } from '../../components/marketing/InteractivePreFooterBanner'
import { usePageMeta } from '../../hook/usePageMeta'
import { useCountUp, useScrollReveal } from '../../hook/useScrollReveal'

interface Scenario {
  id: string
  titleVi: string
  titleEn: string
  prompt: string
  hesitantText: string
  nativeWords: Array<{ word: string; stress?: boolean; pauseAfter?: boolean }>
  diffExplanation: string
  aiFeedback: string
  scoreBefore: number
  scoreAfter: number
}

const scenarios: Scenario[] = [
  {
    id: 'standup',
    titleVi: 'Cập nhật tiến độ họp Daily',
    titleEn: 'Daily Standup Sync',
    prompt: 'Chia sẻ ngắn về tính năng bạn hoàn thành hôm qua và việc sẽ làm hôm nay.',
    hesitantText: 'Yesterday I finished the auth API and I was more clear about the contract. Today I tackle dashboard.',
    nativeWords: [
      { word: 'Yesterday' },
      { word: 'I' },
      { word: 'wrapped up', stress: true },
      { word: 'the auth API,', pauseAfter: true },
      { word: 'and gained' },
      { word: 'complete clarity', stress: true },
      { word: 'on the contract.', pauseAfter: true },
      { word: 'Today' },
      { word: 'I’m diving into', stress: true },
      { word: 'the dashboard widgets.' },
    ],
    diffExplanation: 'Dùng “wrapped up” và “gained complete clarity” giúp câu nói dứt khoát và tự nhiên hơn “more clear”.',
    aiFeedback: 'Tập trung nhấn vào trọng âm của “clarity” và giữ nhịp nói đều giữa hai câu.',
    scoreBefore: 68,
    scoreAfter: 94,
  },
  {
    id: 'meeting',
    titleVi: 'Bày tỏ quan điểm trong cuộc họp',
    titleEn: 'Constructive Feedback',
    prompt: 'Nêu góc nhìn thận trọng về lịch ra mắt sản phẩm mà không làm mất hòa khí.',
    hesitantText: 'In my opinion, launching next week is not a good idea because QA is not ready.',
    nativeWords: [
      { word: 'From where I sit,', stress: true, pauseAfter: true },
      { word: 'launching' },
      { word: 'next week' },
      { word: 'might be', stress: true },
      { word: 'counterproductive', stress: true, pauseAfter: true },
      { word: 'until QA' },
      { word: 'signs off on', stress: true },
      { word: 'the core flows.' },
    ],
    diffExplanation: 'Thay vì nói trực diện “not a good idea”, dùng “might be counterproductive” giúp giữ không khí thảo luận cởi mở.',
    aiFeedback: 'Cách dùng “from where I sit” tạo cảm giác khiêm tốn và tôn trọng góc nhìn của đồng nghiệp.',
    scoreBefore: 72,
    scoreAfter: 96,
  },
  {
    id: 'smalltalk',
    titleVi: 'Trò chuyện đầu tuần thư giãn',
    titleEn: 'Casual Monday Smalltalk',
    prompt: 'Kể lại hoạt động cuối tuần giúp bạn nạp năng lượng và hỏi thăm đồng nghiệp.',
    hesitantText: 'I just stayed at home and took rest. It was very good for me.',
    nativeWords: [
      { word: 'I' },
      { word: 'laid low', stress: true },
      { word: 'over the weekend' },
      { word: 'to recharge—', stress: true, pauseAfter: true },
      { word: 'honestly' },
      { word: 'just what I needed', stress: true },
      { word: 'before a busy sprint.', pauseAfter: true },
      { word: 'How did yours go?', stress: true },
    ],
    diffExplanation: '“Laid low to recharge” và “just what I needed” tự nhiên và ấm áp hơn hẳn câu miêu tả chung chung.',
    aiFeedback: 'Nâng nhẹ ngữ điệu ở câu hỏi cuối “How did yours go?” để mở lời thân mật.',
    scoreBefore: 65,
    scoreAfter: 92,
  },
]

const loopSteps = [
  {
    num: '01',
    title: 'Chọn điều muốn nói',
    desc: 'Một chủ đề gắn liền với hôm nay của bạn: một tình huống công việc, một bài báo vừa đọc, hoặc cảm xúc đời thường.',
  },
  {
    num: '02',
    title: 'Nói 60–90 giây thành tiếng',
    desc: 'Mở micro và nói tự nhiên. Bạn có thể ngập ngừng hay dừng lại suy nghĩ, mọi điểm vấp đều là dữ liệu để tiến bộ.',
  },
  {
    num: '03',
    title: 'Nhận phản hồi tức thì',
    desc: 'AI chỉ ra các lỗi ngữ pháp nhỏ và đưa ra phiên bản diễn đạt tự nhiên chuẩn bản xứ hơn, không phán xét.',
  },
  {
    num: '04',
    title: 'Ôn lại đúng điểm vấp',
    desc: 'Từ vựng và các lỗi phát âm lặp lại sẽ quay lại đúng lúc qua thuật toán lặp lại ngắt quãng (SRS).',
  },
]

const comparisonData = [
  {
    feature: 'Cách tiếp cận phản xạ',
    heymimic: 'Mở mic nói 60–90 giây mỗi ngày trong ngữ cảnh thật',
    traditional: 'Bấm chọn trắc nghiệm, ghép chữ trên màn hình',
    tutor: 'Nói 45–60 phút/buổi, dễ mệt mỏi và áp lực',
  },
  {
    feature: 'Áp lực tâm lý & Sợ sai',
    heymimic: '100% riêng tư với AI, không ai phán xét hay chê cười',
    traditional: 'Không có áp lực nhưng không rèn luyện được cơ miệng',
    tutor: 'Dễ ngại ngùng nếu phát âm chưa chuẩn',
  },
  {
    feature: 'Nguồn gốc từ vựng',
    heymimic: 'Bóc tách từ email, bài báo, tài liệu bạn thật sự đọc',
    traditional: 'Danh sách từ học vẹt cố định theo giáo trình',
    tutor: 'Phụ thuộc vào giáo án của từng giáo viên',
  },
  {
    feature: 'Theo dõi điểm vấp quen thuộc',
    heymimic: 'Thống kê xu hướng nuốt âm /s/, /t/ hay quên mạo từ',
    traditional: 'Chỉ chấm Đúng/Sai từng câu riêng lẻ',
    tutor: 'Sửa lỗi ngẫu nhiên, khó đo lường tiến bộ dài hạn',
  },
  {
    feature: 'Thời gian & Sự tiện lợi',
    heymimic: '10–15 phút mỗi ngày, tự chủ hoàn toàn thời gian',
    traditional: 'Tiện lợi nhưng tỷ lệ bỏ dở cao vì không nói được',
    tutor: 'Cần đặt lịch cố định, chi phí đắt đỏ',
  },
]

const testimonials = [
  {
    name: 'Hoàng Nam',
    role: 'Senior Software Engineer',
    quote:
      'Trước các buổi họp Scrum với đội ngũ nước ngoài, mình hay bị khựng lại để dịch từng câu. Dùng HeyMimic luyện thử 2 phút mỗi sáng giúp mình quen với nhịp điệu và nói trôi chảy hơn hẳn.',
    streak: 'Streak 28 ngày',
  },
  {
    name: 'Minh Thảo',
    role: 'Product Designer',
    quote:
      'Mình thích nhất sự êm dịu của HeyMimic. Không có bảng xếp hạng ồn ào, chỉ có AI lắng nghe riêng tư và gợi ý cách người bản xứ hay diễn đạt. Thiết kế rất thanh lịch, không gây mỏi mắt.',
    streak: '44 buổi luyện nói',
  },
  {
    name: 'Tuấn Anh',
    role: 'Marketing Lead',
    quote:
      'Tính năng dán một đoạn văn tiếng Anh để AI bóc tách cụm từ đắt giá giúp mình tiết kiệm rất nhiều thời gian. Học đúng từ mình cần dùng trong công việc chiều hôm đó.',
    streak: '120 từ ngữ cảnh',
  },
]

const faqs = [
  {
    q: 'HeyMimic khác gì so với các ứng dụng học tiếng Anh thông thường?',
    a: 'Phần lớn các app hiện nay chỉ tập trung vào việc bấm trắc nghiệm hoặc xem video thụ động. HeyMimic xây dựng xung quanh phản xạ cốt lõi: bạn bắt buộc phải mở mic nói thành tiếng 60–90 giây mỗi ngày. AI đóng vai trò người lắng nghe riêng tư, ghi nhận điểm ngập ngừng và gợi ý cách diễn đạt tự nhiên hơn mà không tạo áp lực.',
  },
  {
    q: 'Tôi phát âm chưa tốt và hay ngập ngừng thì có dùng được không?',
    a: 'Chính xác vì bạn hay ngập ngừng nên HeyMimic sinh ra để dành cho bạn! Bạn đang luyện tập với AI trong không gian 100% riêng tư, không có ai phán xét hay chê cười. Càng nói sai nhiều thì AI càng hiểu các mẫu vấp của bạn để giúp bạn gỡ dần từng nút thắt.',
  },
  {
    q: 'Mỗi ngày tôi cần dành bao nhiêu thời gian?',
    a: 'Chỉ cần từ 10 đến 15 phút mỗi ngày. 1 phút đọc ngữ cảnh, 90 giây nói thành tiếng, 2 phút xem phân tích và 5 phút ôn lại từ vựng. Tính nhất quán mỗi ngày quan trọng gấp 10 lần việc học dồn nhiều giờ vào cuối tuần.',
  },
  {
    q: 'Dữ liệu giọng nói của tôi có được bảo mật không?',
    a: 'Hoàn toàn bảo mật. Các đoạn ghi âm chỉ phục vụ cho việc phiên âm và phân tích ngữ pháp trong phiên học của bạn. HeyMimic không bao giờ chia sẻ hay thương mại hóa bản ghi âm của bạn cho bên thứ ba.',
  },
]

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

  // Scenario state
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highlightWordIdx, setHighlightWordIdx] = useState<number>(-1)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  // Interactive Live Recording Sandbox State
  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'evaluating' | 'done'>('idle')
  const [recordCountdown, setRecordCountdown] = useState(5)
  const timerRef = useRef<number | null>(null)

  const activeScenario = scenarios[activeScenarioIdx]

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

  // Animated counters for stats banner
  const sessionsCount = useCountUp(12847, statsVisible, 2000)
  const streakCount = useCountUp(28, statsVisible, 1400)
  const scoreCount = useCountUp(94, statsVisible, 1600)
  const usersCount = useCountUp(3200, statsVisible, 1800)

  // Karaoke rhythm word-by-word animation
  useEffect(() => {
    if (!isPlaying) {
      setHighlightWordIdx(-1)
      return
    }

    let current = 0
    setHighlightWordIdx(0)
    const interval = setInterval(() => {
      current++
      if (current >= activeScenario.nativeWords.length) {
        setIsPlaying(false)
        setHighlightWordIdx(-1)
        clearInterval(interval)
      } else {
        setHighlightWordIdx(current)
      }
    }, 450)

    return () => clearInterval(interval)
  }, [isPlaying, activeScenarioIdx])

  // Sandbox Live Recording simulation
  const handleStartRecord = () => {
    setRecordState('recording')
    setRecordCountdown(5)

    let count = 5
    timerRef.current = window.setInterval(() => {
      count--
      setRecordCountdown(count)
      if (count <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        setRecordState('evaluating')
        setTimeout(() => {
          setRecordState('done')
        }, 1200)
      }
    }, 1000)
  }

  const handleResetRecord = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRecordState('idle')
    setRecordCountdown(5)
  }

  return (
    <div className="space-y-24 sm:space-y-36 pb-20">
      {/* =========================================================================
          1. HERO SECTION: Clean, Expansive, Human-designed
         ========================================================================= */}
      <section
        ref={heroRef}
        className={`max-w-5xl mx-auto px-6 pt-16 sm:pt-24 text-center space-y-8 scroll-reveal ${heroVisible ? 'visible' : ''}`}
      >
        {/* Subtle Eyebrow & Live Active Learners Beacon */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-study-primary bg-study-primary-soft px-3.5 py-1.5 rounded-full border border-study-primary-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-study-primary animate-pulse" />
            <span>Phòng luyện nói tiếng Anh cá nhân hóa bằng AI</span>
          </div>

          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-study-surface border border-study-border shadow-2xs text-xs">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-flex h-4.5 w-4.5 rounded-full ring-2 ring-study-surface bg-study-primary text-white text-[8px] font-bold items-center justify-center">HN</span>
              <span className="inline-flex h-4.5 w-4.5 rounded-full ring-2 ring-study-surface bg-sky-500 text-white text-[8px] font-bold items-center justify-center">MT</span>
              <span className="inline-flex h-4.5 w-4.5 rounded-full ring-2 ring-study-surface bg-study-primary text-white text-[8px] font-bold items-center justify-center">TA</span>
            </div>
            <span className="text-study-text-muted text-[11px]">
              <strong className="text-study-text font-semibold">1,428 bạn</strong> đang mở mic hôm nay
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-study-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-study-primary" />
            </span>
          </div>
        </div>

        {/* Clean Headline */}
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-study-text max-w-4xl mx-auto leading-[1.15] text-balance">
          Nói tiếng Anh tự nhiên. <br className="hidden sm:inline" />
          <span className="text-study-primary font-serif font-normal italic">
            Bằng phản xạ của chính bạn.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-study-text-muted max-w-2xl mx-auto leading-relaxed font-normal">
          Xóa bỏ cảm giác ngập ngừng khi giao tiếp. Mỗi ngày 60–90 giây mở mic nói cùng AI trong không gian riêng tư, nhận gợi ý chuẩn bản xứ để biến từ vựng thành thói quen thật.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-study-primary text-white font-semibold text-sm hover:bg-study-primary-hover shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Bắt đầu luyện nói</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/speaking-method"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-sm font-medium text-study-text transition-colors"
          >
            <span>Khám phá phương pháp Shadowing</span>
            <ArrowUpRight size={14} className="text-study-text-muted" />
          </Link>
        </div>

        {/* Trust Points */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-study-text-muted">
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-study-primary" strokeWidth={2.5} />
            Không phán xét hay chấm điểm áp lực
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-study-primary" strokeWidth={2.5} />
            Chỉ 10–15 phút mỗi ngày
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-study-primary" strokeWidth={2.5} />
            100% riêng tư
          </span>
        </div>

        {/* Fluid Acoustic Wave Visualizer Banner */}
        <AcousticWaveVisualizer />
      </section>

      {/* =========================================================================
          1.5 ANIMATED STATS COUNTER BANNER
         ========================================================================= */}
      <section ref={statsRef} className={`max-w-4xl mx-auto px-6 scroll-reveal-scale ${statsVisible ? 'visible' : ''}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-study-primary-soft via-study-surface to-study-primary-soft/50 border border-study-primary-border/40 shadow-sm">
          <div className="text-center space-y-1">
            <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
              {sessionsCount.toLocaleString()}+
            </span>
            <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">buổi luyện nói</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
              {streakCount} ngày
            </span>
            <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">streak trung bình</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
              {scoreCount}/100
            </span>
            <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">điểm phản xạ TB</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-2xl sm:text-3xl font-display font-extrabold text-study-primary">
              {usersCount.toLocaleString()}+
            </span>
            <span className="text-[11px] sm:text-xs text-study-text-muted font-medium">học viên đang dùng</span>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="section-divider" />

      {/* =========================================================================
          2. SPECIAL SPEAKING ARENA & CADENCE VISUALIZER
         ========================================================================= */}
      <section
        id="demo"
        ref={arenaRef}
        className={`max-w-5xl mx-auto px-6 scroll-reveal ${arenaVisible ? 'visible' : ''}`}
      >
        <div className="clean-card rounded-2xl p-6 sm:p-10 space-y-8">
          {/* Header & Scenario Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-study-border">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-study-primary">
                SPEAKING ARENA · TRẢI NGHIỆM TRỰC TIẾP
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-study-text mt-1">
                Lắng nghe nhịp điệu & bắt nhịp tự nhiên
              </h2>
            </div>

            {/* Scenario Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-study-surface-muted p-1 rounded-xl">
              {scenarios.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioIdx(idx)
                    setIsPlaying(false)
                    setHighlightWordIdx(-1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeScenarioIdx === idx
                      ? 'bg-study-surface text-study-text font-semibold shadow-xs'
                      : 'text-study-text-muted hover:text-study-text'
                  }`}
                >
                  {item.titleVi}
                </button>
              ))}
            </div>
          </div>

          {/* Context Prompt */}
          <div className="bg-study-surface-muted/50 p-4 rounded-xl text-xs text-study-text-soft flex items-start gap-2.5">
            <span className="font-semibold text-study-text shrink-0">Đề bài gợi ý:</span>
            <span>{activeScenario.prompt}</span>
          </div>

          {/* Side-by-Side Comparison with Word-by-Word Karaoke Rhythm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Before: Hesitant */}
            <div className="p-6 rounded-xl bg-study-surface-muted/30 border border-study-border space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Cách nói thường gặp khi ấp úng
                  </span>
                  <span className="text-xs font-mono font-medium text-study-text-muted">
                    {activeScenario.scoreBefore}/100
                  </span>
                </div>
                <p className="text-sm sm:text-base text-study-text-soft leading-relaxed">
                  “{activeScenario.hesitantText}”
                </p>
              </div>

              <div className="text-xs text-study-text-muted pt-3 border-t border-study-border">
                Câu nói đúng ngữ pháp cơ bản nhưng nghe gượng và thiếu tự nhiên.
              </div>
            </div>

            {/* After: HeyMimic Native with Karaoke Rhythm Cadence */}
            <div className="p-6 rounded-xl bg-study-primary-soft/40 border border-study-primary-border/60 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-study-primary flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>HeyMimic gợi ý cách nói tự nhiên</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-study-primary">
                    {activeScenario.scoreAfter}/100
                  </span>
                </div>

                {/* Word-by-word Cadence Highlight Box */}
                <div className="text-sm sm:text-base text-study-text font-medium leading-loose flex flex-wrap items-center gap-1.5 pt-1">
                  “
                  {activeScenario.nativeWords.map((w, idx) => {
                    const isCurrent = highlightWordIdx === idx
                    return (
                      <span
                        key={idx}
                        className={`transition-all duration-200 px-1 py-0.5 rounded-md ${
                          isCurrent
                            ? 'bg-study-primary text-white scale-105 shadow-xs font-bold'
                            : w.stress
                            ? 'text-study-primary font-bold'
                            : 'text-study-text'
                        }`}
                      >
                        {w.word}
                        {w.pauseAfter && (
                          <span className="ml-1 text-[10px] text-study-text-muted opacity-60 font-mono">
                            |
                          </span>
                        )}
                      </span>
                    )
                  })}
                  ”
                </div>
              </div>

              <div className="text-xs text-study-text-soft pt-3 border-t border-study-primary-border/40">
                <strong>Điểm cải thiện:</strong> {activeScenario.diffExplanation}
              </div>
            </div>
          </div>

          {/* Audio Waveform & Player */}
          <div className="p-4 sm:p-5 rounded-xl bg-study-surface-muted/50 border border-study-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-study-primary text-white flex items-center justify-center hover:bg-study-primary-hover active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
                aria-label={isPlaying ? 'Tạm dừng' : 'Nghe câu mẫu'}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>

              <div>
                <strong className="block text-xs font-semibold text-study-text">
                  {isPlaying ? 'Đang phát & bắt nhịp ngữ điệu...' : 'Nghe thử ngữ điệu câu nói này'}
                </strong>
                <span className="block text-[11px] text-study-text-muted">
                  Bấm để xem từng từ bắt nhịp theo thời gian thực
                </span>
              </div>
            </div>

            {/* Dynamic Waveform Bars */}
            <div className="flex items-center gap-1 h-7">
              {[20, 55, 75, 40, 90, 60, 75, 45, 95, 65, 48, 80, 52, 70, 40, 85, 50].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: `${isPlaying ? h : 25}%`,
                    animationDuration: isPlaying ? `${0.45 + (i % 6) * 0.08}s` : undefined,
                    animationDelay: isPlaying ? `${i * 0.04}s` : undefined,
                  }}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying ? 'bg-study-primary animate-waveform shadow-[0_0_8px_rgba(15,168,184,0.35)]' : 'bg-study-text-faint/40'
                  }`}
                />
              ))}
            </div>

            <span className="text-xs text-study-text-muted hidden sm:inline-block">
              {activeScenario.aiFeedback}
            </span>
          </div>

          {/* =========================================================================
              SPECIAL: Interactive Live Recording Sandbox (Thu âm 5s thử ngay tại chỗ)
             ========================================================================= */}
          <div className="p-6 rounded-xl bg-study-surface border border-study-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-study-text">
                THỬ MỞ MIC LUYỆN NÓI NGAY TẠI ĐÂY (5 GIÂY)
              </span>
              <span className="text-[11px] text-study-text-muted">
                100% riêng tư · Không cần tài khoản
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-study-surface-muted/40 border border-study-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={
                    recordState === 'idle'
                      ? handleStartRecord
                      : recordState === 'done'
                      ? handleResetRecord
                      : undefined
                  }
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                    recordState === 'recording'
                      ? 'bg-study-accent text-white animate-record-ring scale-105'
                      : recordState === 'evaluating'
                      ? 'bg-study-surface-muted text-study-text-muted cursor-wait'
                      : recordState === 'done'
                      ? 'bg-study-success text-white'
                      : 'bg-study-primary text-white hover:scale-105'
                  }`}
                  aria-label="Thu âm thử"
                >
                  {recordState === 'recording' ? (
                    <Square size={16} fill="currentColor" />
                  ) : recordState === 'evaluating' ? (
                    <LoaderCircle size={18} className="animate-spin text-study-primary" />
                  ) : recordState === 'done' ? (
                    <Check size={20} strokeWidth={2.5} />
                  ) : (
                    <Mic2 size={20} />
                  )}
                </button>

                <div>
                  <strong className="block text-xs font-semibold text-study-text">
                    {recordState === 'recording'
                      ? `Đang lắng nghe... còn ${recordCountdown}s`
                      : recordState === 'evaluating'
                      ? 'AI đang phân tích độ trôi chảy...'
                      : recordState === 'done'
                      ? 'Tuyệt vời! AI đã nhận diện bài nói.'
                      : 'Bấm micro và nói thử một câu tiếng Anh'}
                  </strong>
                  <span className="block text-[11px] text-study-text-muted">
                    {recordState === 'done'
                      ? 'Điểm phản xạ: 92/100 · Nhịp điệu dứt khoát'
                      : 'Ví dụ: "I am ready to improve my speaking today"'}
                  </span>
                </div>
              </div>

              {recordState === 'done' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetRecord}
                    className="px-3 py-1.5 rounded-lg border border-study-border bg-study-surface text-xs font-medium text-study-text hover:bg-study-surface-hover"
                  >
                    Thử lại
                  </button>
                  <Link
                    to="/speaking"
                    className="px-4 py-1.5 rounded-lg bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover shadow-xs"
                  >
                    Vào phòng nói đầy đủ
                  </Link>
                </div>
              ) : (
                <div className="text-xs font-mono text-study-primary font-medium">
                  {recordState === 'recording' ? '● REC' : 'SẴN SÀNG'}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2.5 INTERACTIVE ACOUSTIC CADENCE BANNER
         ========================================================================= */}
      <section
        ref={cadenceRef}
        className={`max-w-5xl mx-auto px-6 scroll-reveal-scale ${cadenceVisible ? 'visible' : ''}`}
      >
        <AcousticCadenceBanner />
      </section>

      {/* Gradient Divider */}
      <div className="section-divider" />

      {/* =========================================================================
          3. THREE CORE PILLARS: Spacious 3-Column Layout
         ========================================================================= */}
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
          {/* Pillar 1 */}
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

          {/* Pillar 2 */}
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

          {/* Pillar 3 */}
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

      {/* =========================================================================
          4. THE PRACTICE LOOP: 4 Clear Steps
         ========================================================================= */}
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
          {loopSteps.map((step, idx) => {
            const stepRefs = [step1Ref, step2Ref, step3Ref, step4Ref]
            const stepVisibles = [step1Visible, step2Visible, step3Visible, step4Visible]
            return (
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
            )
          })}
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="section-divider" />

      {/* =========================================================================
          5. COMPARISON TABLE: Clean & Airy
         ========================================================================= */}
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

      {/* Gradient Divider */}
      <div className="section-divider" />

      {/* =========================================================================
          6. TESTIMONIALS: Authentic & Relaxed
         ========================================================================= */}
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
          {testimonials.map((t, idx) => {
            const testRefs = [test1Ref, test2Ref, test3Ref]
            const testVisibles = [test1Visible, test2Visible, test3Visible]
            return (
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
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          7. FAQ ACCORDION: Minimal & Clean
         ========================================================================= */}
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

      {/* =========================================================================
          8. CINEMATIC ACOUSTIC PRE-FOOTER BANNER
         ========================================================================= */}
      <InteractivePreFooterBanner />
    </div>
  )
}
