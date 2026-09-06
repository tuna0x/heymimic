import {
  ArrowRight,
  Check,
  ChevronDown,
  Headphones,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Volume2,
  Zap,
  ShieldCheck,
  Award,
  Layers,
  Repeat,
  Compass,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../../hook/usePageMeta'

interface Scenario {
  id: string
  badge: string
  vietnameseTitle: string
  englishTitle: string
  prompt: string
  score: number
  fluency: number
  pronunciation: number
  originalText: string
  highlightDel: string
  highlightIns: string
  continuation: string
  feedbackCategory: string
  feedbackTitle: string
  feedbackNote: string
  vocabList: Array<{ word: string; ipa: string; meaning: string; tag: string }>
}

const scenarios: Scenario[] = [
  {
    id: 'standup',
    badge: 'CÔNG VIỆC & STANDUP',
    vietnameseTitle: 'Cập nhật tiến độ công việc',
    englishTitle: 'Daily Project Sync & Blockers',
    prompt: 'Talk about what you completed yesterday, what you plan to tackle today, and any blockers.',
    score: 86,
    fluency: 84,
    pronunciation: 90,
    originalText: 'Yesterday I finished the authorization flow and I was ',
    highlightDel: 'more clear',
    highlightIns: 'much clearer',
    continuation: ' about the API contract. Today I am going to tackle the dashboard widgets.',
    feedbackCategory: 'Ngữ pháp & Diễn đạt tự nhiên',
    feedbackTitle: 'Dùng so sánh ngắn “clearer”',
    feedbackNote: '“More clear” không sai nhưng người bản xứ ưu tiên dùng “much clearer” hoặc “gained complete clarity” để câu nói gãy gọn và chuyên nghiệp hơn.',
    vocabList: [
      { word: 'authorization', ipa: '/ˌɔː.θər.aɪˈzeɪ.ʃən/', meaning: 'sự cấp phép, xác thực', tag: 'Tech' },
      { word: 'blocker', ipa: '/ˈblɒk.ər/', meaning: 'vướng mắc, trở ngại', tag: 'Scrum' },
      { word: 'tackle', ipa: '/ˈtæk.əl/', meaning: 'bắt tay giải quyết', tag: 'Action' },
    ],
  },
  {
    id: 'opinion',
    badge: 'THẢO LUẬN & Ý KIẾN',
    vietnameseTitle: 'Bày tỏ quan điểm trong cuộc họp',
    englishTitle: 'Expressing Constructive Disagreement',
    prompt: 'Share your perspective on the new product roadmap timeline and suggest a cautious alternative.',
    score: 89,
    fluency: 88,
    pronunciation: 91,
    originalText: 'From my point of view, pushing the launch to next month ',
    highlightDel: 'is not a good idea',
    highlightIns: 'might be counterproductive',
    continuation: ' given our current customer momentum.',
    feedbackCategory: 'Sắc thái ngoại giao',
    feedbackTitle: 'Diễn đạt mềm mỏng (Diplomatic Tone)',
    feedbackNote: 'Thay vì nói trực diện “not a good idea”, dùng “might be counterproductive” hoặc “raises a few concerns” giúp giữ không khí thảo luận cởi mở.',
    vocabList: [
      { word: 'counterproductive', ipa: '/ˌkaʊn.tə.prəˈdʌk.tɪv/', meaning: 'phản tác dụng', tag: 'Formal' },
      { word: 'momentum', ipa: '/məˈmen.təm/', meaning: 'đà phát triển, xung lượng', tag: 'Business' },
      { word: 'perspective', ipa: '/pəˈspek.tɪv/', meaning: 'góc nhìn, quan điểm', tag: 'Core' },
    ],
  },
  {
    id: 'smalltalk',
    badge: 'KẾT NỐI & ĐỜI SỐNG',
    vietnameseTitle: 'Trò chuyện cuối tuần với đồng nghiệp',
    englishTitle: 'Casual Monday Watercooler Chat',
    prompt: 'Recap a relaxing weekend activity and ask your coworker how they spent their Sunday.',
    score: 92,
    fluency: 94,
    pronunciation: 89,
    originalText: 'I mostly stayed at home and took some rest. ',
    highlightDel: 'It was very good',
    highlightIns: 'It was just what I needed to recharge',
    continuation: ' before another busy sprint. How about your weekend?',
    feedbackCategory: 'Cách nói tự nhiên',
    feedbackTitle: 'Dùng cụm cảm xúc sinh động',
    feedbackNote: '“Just what I needed to recharge” nghe tự nhiên và giàu cảm xúc hơn hẳn câu miêu tả chung chung “It was very good”.',
    vocabList: [
      { word: 'recharge', ipa: '/riːˈtʃɑːdʒ/', meaning: 'nạp lại năng lượng', tag: 'Lifestyle' },
      { word: 'watercooler', ipa: '/ˈwɔː.təˌkuː.lər/', meaning: 'nơi buôn chuyện công sở', tag: 'Idiom' },
      { word: 'sprint', ipa: '/sprɪnt/', meaning: 'chu kỳ làm việc ngắn', tag: 'Work' },
    ],
  },
]

const interactiveSamples = [
  {
    id: 1,
    userText: 'I think we should do this task because it is very important for the project.',
    nativeAlternative: 'In my view, prioritizing this task is critical to keeping the project on track.',
    score: 72,
    improvedScore: 94,
    improvements: ['Thay “I think” bằng “In my view”', 'Thay “very important” bằng “critical”', 'Thêm cụm “on track” chuẩn bản xứ'],
  },
  {
    id: 2,
    userText: 'Sorry for late reply, I was very busy with many meetings yesterday.',
    nativeAlternative: 'Apologies for the delayed response—yesterday was packed with back-to-back syncs.',
    score: 68,
    improvedScore: 92,
    improvements: ['Dùng “delayed response” chuyên nghiệp', 'Thay “many meetings” bằng “back-to-back syncs”'],
  },
  {
    id: 3,
    userText: 'Can you explain more clear about how this feature will work?',
    nativeAlternative: 'Could you elaborate a bit more on the mechanics of this feature?',
    score: 75,
    improvedScore: 96,
    improvements: ['Sửa lỗi “more clear” thành “elaborate”', 'Diễn đạt tự nhiên với “mechanics of this feature”'],
  },
]

const faqs = [
  {
    q: 'Mimic khác gì so với các app học tiếng Anh thông thường?',
    a: 'Phần lớn các ứng dụng hiện nay chỉ tập trung vào việc bấm trắc nghiệm, ghép từ hoặc xem video thụ động. Mimic xây dựng xung quanh phản xạ cốt lõi: bạn phải mở mic nói thành tiếng 60–90 giây mỗi ngày. AI đóng vai trò người lắng nghe riêng tư, ghi nhận điểm ngập ngừng và chỉ ra cách diễn đạt tự nhiên hơn mà không tạo áp lực.',
  },
  {
    q: 'Tôi phát âm chưa tốt và hay ngập ngừng thì có dùng được không?',
    a: 'Chính xác vì bạn hay ngập ngừng nên Mimic sinh ra để dành cho bạn. Bạn đang luyện tập với AI trong không gian 100% riêng tư, không có ai phán xét hay chê cười. Càng nói sai nhiều thì AI càng hiểu các mẫu vấp của bạn để giúp bạn gỡ dần từng nút thắt.',
  },
  {
    q: 'Mỗi ngày tôi cần dành bao nhiêu thời gian?',
    a: 'Chỉ cần từ 10 đến 15 phút mỗi ngày. 1 phút đọc ngữ cảnh, 90 giây nói thành tiếng, 2 phút xem phân tích và 5 phút ôn lại từ vựng. Tính nhất quán (consistency) mỗi ngày quan trọng gấp 10 lần việc học dồn nhiều giờ vào cuối tuần.',
  },
  {
    q: 'Sau bao lâu thì tôi sẽ cảm nhận được phản xạ nói của mình tiến bộ?',
    a: 'Dữ liệu thực tế cho thấy: sau 7 ngày, cảm giác ngại mở miệng nói giảm rõ rệt; sau 14 ngày, thời gian ngập ngừng tìm từ giảm trung bình 35%; và sau 30 ngày, người học bắt đầu tự động vận dụng các mẫu câu tự nhiên mà không cần dịch nhẩm trong đầu.',
  },
  {
    q: 'Có cần thẻ tín dụng để bắt đầu luyện tập không?',
    a: 'Không. Bạn có thể tạo tài khoản và bắt đầu buổi luyện tập đầu tiên hoàn toàn miễn phí mà không cần nhập bất kỳ thông tin thanh toán nào.',
  },
]

export function Landing() {
  usePageMeta(
    'Mimic — Phòng Luyện Nói Tiếng Anh Phản Xạ Bằng AI',
    'Mimic biến ngữ cảnh thật thành từ vựng, phòng luyện nói thành tiếng và phản hồi cá nhân hóa tức thì. Nói tự nhiên hơn mỗi ngày mà không mỏi mắt hay áp lực.'
  )

  const [activeTab, setActiveTab] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeSample, setActiveSample] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const currentScenario = scenarios[activeTab]
  const currentSample = interactiveSamples[activeSample]

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="relative bg-study-bg text-study-text font-sans overflow-x-hidden min-h-screen selection:bg-teal-500/20">
      {/* Ambient Eye-Friendly Glow Blobs */}
      <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] rounded-full bg-study-primary/10 blur-[130px] pointer-events-none -z-0" />
      <div className="absolute top-[400px] right-[-100px] w-[500px] h-[500px] rounded-full bg-study-accent/10 blur-[140px] pointer-events-none -z-0" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Value Proposition */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-study-surface border border-study-border shadow-xs mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-study-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-study-primary" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-study-text-muted">
                Phòng luyện nói AI cá nhân hóa
              </span>
              <span className="text-[11px] font-bold text-study-primary bg-study-primary-soft px-2 py-0.5 rounded-md">
                v2.4 Live
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-study-text tracking-tight leading-[1.1] mb-6">
              Biết tiếng Anh là một chuyện.
              <br />
              <span className="text-study-primary font-semibold">
                Nói tự nhiên
              </span>{' '}
              là chuyện khác.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-study-text-muted leading-relaxed mb-8 max-w-xl">
              Học vẹt danh sách từ không giúp bạn nói được khi vào cuộc đối thoại thực tế.
              Mimic mang đến không gian an toàn: <strong className="text-study-text font-semibold">nói thành tiếng 60–90 giây</strong>,
              nhận phản hồi điểm ngập ngừng và nâng tầm cách diễn đạt như người bản xứ.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-study-primary text-white font-semibold text-base shadow-xs hover:bg-study-primary-hover transition-all duration-200 w-full sm:w-auto cursor-pointer"
              >
                <span>Bắt đầu luyện nói miễn phí</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#simulator"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-study-surface hover:bg-study-surface-hover border border-study-border text-study-text font-medium text-base shadow-xs transition-all duration-200 w-full sm:w-auto"
              >
                <span className="w-7 h-7 rounded-full bg-study-primary-soft text-study-primary border border-study-primary-border/60 flex items-center justify-center">
                  <Play size={12} fill="currentColor" />
                </span>
                <span>Xem Live Simulator</span>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-study-border w-full text-xs sm:text-sm text-study-text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-study-success" />
                <span>Không cần thẻ ngân hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-study-primary" />
                <span>Phản hồi dưới 3 giây</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-study-accent" />
                <span>Chuẩn ngữ điệu bản xứ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Live Speaking Simulator */}
          <div className="lg:col-span-6 relative" id="simulator">
            {/* Floating Metric 1 */}
            <div className="hidden sm:flex absolute -top-5 -right-3 z-20 bg-study-surface border border-study-border px-4 py-3 rounded-2xl items-center gap-3.5 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-study-success-soft border border-study-success/30 flex items-center justify-center text-study-success">
                <TrendingUp size={18} />
              </div>
              <div>
                <strong className="block text-xs font-semibold text-study-text">+28% Độ Trôi Chảy</strong>
                <small className="block text-[11px] text-study-text-muted">Sau 14 ngày thực hành đều đặn</small>
              </div>
            </div>

            {/* Floating Metric 2 */}
            <div className="hidden sm:flex absolute -bottom-5 -left-3 z-20 bg-study-surface border border-study-border px-4 py-3 rounded-2xl items-center gap-3.5 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-study-primary-soft border border-study-primary-border/50 flex items-center justify-center text-study-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <strong className="block text-xs font-semibold text-study-text">3 Điểm Sửa Đắt Giá</strong>
                <small className="block text-[11px] text-study-text-muted">Không ngắt lời khi đang diễn đạt</small>
              </div>
            </div>

            {/* Main Simulator Card */}
            <div className="bg-study-surface border border-study-border rounded-3xl p-6 sm:p-7 shadow-lg">
              {/* Header with Scenario Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-study-border">
                <div className="flex items-center gap-1.5 bg-study-surface-muted p-1 rounded-xl border border-study-border overflow-x-auto">
                  {scenarios.map((sc, index) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setActiveTab(index)
                        setIsPlaying(false)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === index
                          ? 'bg-study-primary-soft text-study-primary border border-study-primary-border/60 shadow-xs'
                          : 'text-study-text-muted hover:text-study-text'
                      }`}
                    >
                      {sc.badge}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-study-success bg-study-success-soft px-3 py-1.5 rounded-lg border border-study-success/20 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-study-success" />
                  <span>MIC READY</span>
                </div>
              </div>

              {/* Scenario Context */}
              <div className="py-5">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-study-primary tracking-wider">TÌNH HUỐNG HÔM NAY</span>
                  <span className="text-study-text-muted">60–90S THỰC HÀNH</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-study-text mb-2">
                  {currentScenario.vietnameseTitle}
                </h3>
                <p className="text-sm text-study-text-muted leading-relaxed">
                  {currentScenario.prompt}
                </p>
              </div>

              {/* Waveform Player Bar */}
              <div className="grid grid-cols-[44px_1fr_64px] items-center gap-4 bg-study-surface-muted p-3.5 rounded-2xl border border-study-border my-2">
                <button
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-study-accent text-white shadow-md'
                      : 'bg-study-primary text-white hover:bg-study-primary-hover shadow-xs'
                  }`}
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? 'Tạm dừng' : 'Nghe giọng mẫu'}
                >
                  {isPlaying ? <Pause size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="h-9 flex items-center overflow-hidden">
                  <div className="flex items-center gap-1 w-full h-full">
                    {[35, 55, 75, 40, 90, 100, 50, 80, 45, 95, 80, 50, 70, 40, 85, 90, 45, 65, 80, 50, 90, 100, 70, 50, 85, 45, 60, 75, 50, 35].map(
                      (h, i) => (
                        <span
                          key={i}
                          className={`flex-1 rounded-sm transition-all duration-200 ${
                            isPlaying
                              ? i % 3 === 0
                                ? 'bg-study-accent animate-waveform'
                                : 'bg-study-primary animate-waveform'
                              : 'bg-study-text-faint/50'
                          }`}
                          style={{
                            height: isPlaying ? `${h}%` : `${Math.max(20, h * 0.35)}%`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-study-text">
                  <span className="font-semibold">{isPlaying ? '00:14' : '00:00'}</span>
                  <small className="block text-[10px] text-study-text-muted">/ 01:15</small>
                </div>
              </div>

              {/* Real-time AI Transcript & Coach Analysis */}
              <div className="bg-study-surface-muted/60 border border-study-border rounded-2xl p-4 sm:p-5 mt-4">
                <div className="flex items-center justify-between text-xs text-study-text-muted mb-3">
                  <span className="flex items-center gap-1.5 text-study-text font-medium">
                    <Mic size={14} className="text-study-primary" />
                    Lượt nói của bạn
                  </span>
                  <div className="flex items-center gap-3">
                    <span>
                      Fluency: <strong className="text-study-primary font-semibold">{currentScenario.fluency}%</strong>
                    </span>
                    <span>
                      Điểm: <strong className="text-study-success font-bold text-sm">{currentScenario.score}</strong>/100
                    </span>
                  </div>
                </div>

                <div className="bg-study-surface rounded-xl p-3.5 mb-3.5 text-sm text-study-text leading-relaxed border border-study-border">
                  “{currentScenario.originalText}
                  <span className="text-rose-600 dark:text-rose-400 line-through bg-rose-500/15 px-1.5 py-0.5 rounded mx-1">
                    {currentScenario.highlightDel}
                  </span>
                  <span className="text-study-success font-semibold bg-study-success-soft px-1.5 py-0.5 rounded mr-1">
                    {currentScenario.highlightIns}
                  </span>
                  {currentScenario.continuation}”
                </div>

                <div className="border-t border-study-border pt-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary mb-1">
                    <Sparkles size={14} />
                    <span>{currentScenario.feedbackTitle}</span>
                  </div>
                  <p className="text-xs text-study-text-muted leading-relaxed">
                    {currentScenario.feedbackNote}
                  </p>
                </div>
              </div>

              {/* Vocab Detected in Context */}
              <div className="mt-4 pt-3.5 border-t border-study-border flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-study-text-muted">Từ vựng đắt giá:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentScenario.vocabList.map((item) => (
                    <span
                      key={item.word}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-study-surface-muted border border-study-border text-xs"
                    >
                      <strong className="text-study-primary font-medium">{item.word}</strong>
                      <small className="text-study-text-muted">{item.meaning}</small>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= METRIC STRIP ================= */}
      <section className="relative z-10 border-y border-study-border bg-study-surface/60 backdrop-blur-md py-12 my-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="block font-display text-4xl sm:text-5xl font-bold text-study-text mb-1">
              15,000+
            </span>
            <span className="text-xs sm:text-sm text-study-text-muted">Phút luyện nói mỗi tuần</span>
          </div>
          <div>
            <span className="block font-display text-4xl sm:text-5xl font-bold text-study-primary mb-1">
              89%
            </span>
            <span className="text-xs sm:text-sm text-study-text-muted">Giảm ngập ngừng sau 14 ngày</span>
          </div>
          <div>
            <span className="block font-display text-4xl sm:text-5xl font-bold text-study-success mb-1">
              4.9 / 5
            </span>
            <span className="text-xs sm:text-sm text-study-text-muted">Điểm hài lòng từ người học</span>
          </div>
          <div>
            <span className="block font-display text-4xl sm:text-5xl font-bold text-study-accent mb-1">
              &lt; 3s
            </span>
            <span className="text-xs sm:text-sm text-study-text-muted">Tốc độ AI phân tích phản xạ</span>
          </div>
        </div>
      </section>

      {/* ================= PROBLEM & SOLUTION ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-study-primary uppercase mb-3 block">
            TẠI SAO BẠN HỌC MÃI NHƯNG KHÔNG NÓI ĐƯỢC?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-study-text tracking-tight leading-tight">
            Vấn đề không nằm ở việc bạn thiếu từ vựng.
            <br />
            Mà là bạn{' '}
            <span className="text-study-primary font-semibold">
              chưa có môi trường phản xạ thành tiếng
            </span>
            .
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Card */}
          <div className="bg-study-surface border border-study-border rounded-3xl p-8 sm:p-10 shadow-xs">
            <span className="text-xs font-bold tracking-wider text-rose-500 uppercase block mb-3">
              CÁCH HỌC TRUYỀN THỐNG
            </span>
            <h3 className="text-2xl font-display font-semibold text-study-text mb-6">
              Học thụ động & Ngại nói
            </h3>
            <ul className="space-y-4 text-sm text-study-text-soft">
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✕
                </span>
                <span>Học thuộc danh sách 3000 từ nhưng khi cần mở miệng thì tâm trí trống rỗng.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✕
                </span>
                <span>Xem video bài giảng nghe rất hiểu, nhưng thiếu cơ hội tự nói thành tiếng.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✕
                </span>
                <span>Sợ bị người khác chê cười, phán xét về ngữ điệu và phát âm ngập ngừng.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✕
                </span>
                <span>Dịch từng từ tiếng Việt sang tiếng Anh trong đầu khiến câu nói bị giật cục.</span>
              </li>
            </ul>
          </div>

          {/* Mimic Method Card */}
          <div className="bg-study-primary-soft/30 border border-study-primary-border/60 rounded-3xl p-8 sm:p-10 shadow-xs">
            <span className="text-xs font-bold tracking-wider text-study-primary uppercase block mb-3">
              PHƯƠNG PHÁP MIMIC
            </span>
            <h3 className="text-2xl font-display font-semibold text-study-text mb-6">
              Vòng lặp Luyện Nói Phản Xạ 1-1
            </h3>
            <ul className="space-y-4 text-sm text-study-text-soft">
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-study-primary text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Học từ vựng trực tiếp từ câu chuyện và bối cảnh bạn muốn kể hôm nay.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-study-primary text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Phòng nói 100% riêng tư với AI — thoải mái nói sai, ngập ngừng không sợ ngại.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-study-primary text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>AI lắng nghe trọn vẹn rồi chỉ ra 2–3 điểm đắt giá để nói tự nhiên như bản xứ.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-study-primary text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Hệ thống Spaced Repetition tự động đưa từ mới quay lại trong các buổi sau.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= BENTO BOX GRID ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-study-primary uppercase mb-3 block">
            3 TRỤ CỘT CỦA MIMIC
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-study-text tracking-tight leading-tight mb-4">
            Không phải tính năng rời rạc.
            <br />
            Đây là một{' '}
            <span className="text-study-primary font-semibold">
              vòng lặp tiến bộ khép kín
            </span>
            .
          </h2>
          <p className="text-base text-study-text-muted">
            Mỗi từ vựng bạn học hôm nay đều sẽ trở thành vũ khí trong câu nói của bạn ngày mai.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Vocab in Context */}
          <div className="bg-study-surface border border-study-border hover:border-study-primary/40 rounded-3xl p-8 shadow-xs transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-study-primary tracking-wider mb-4">
                <Layers size={15} />
                <span>01 / VOCABULARY IN CONTEXT</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-study-text mb-3">
                Học từ có chỗ để dùng, không học vẹt.
              </h3>
              <p className="text-sm text-study-text-muted leading-relaxed mb-6">
                Dán một đoạn email bạn vừa soạn, một câu trong podcast hoặc ý bạn muốn nói.
                Vocab Agent trích xuất ngay những cụm từ giá trị và đặt vào ngữ cảnh sống động.
              </p>
            </div>

            <div className="bg-study-surface-muted/60 border border-study-border rounded-2xl p-4">
              <div className="flex justify-between text-xs text-study-text-muted mb-2">
                <span>Ngữ cảnh phát hiện</span>
                <span className="text-study-primary font-semibold">Captured</span>
              </div>
              <blockquote className="text-xs sm:text-sm text-study-text italic mb-3">
                “A <mark className="bg-study-primary-soft text-study-primary px-1 py-0.5 rounded font-medium">consistent routine</mark> always beats an occasional burst of motivation.”
              </blockquote>
              <div className="space-y-1.5 text-xs">
                <div className="bg-study-surface border-l-2 border-study-primary px-2.5 py-1.5 rounded-r flex justify-between">
                  <span className="text-study-text font-medium">consistent</span>
                  <span className="text-study-text-muted">kiên trì, đều đặn</span>
                </div>
                <div className="bg-study-surface border-l-2 border-study-accent px-2.5 py-1.5 rounded-r flex justify-between">
                  <span className="text-study-text font-medium">burst of</span>
                  <span className="text-study-text-muted">sự bộc phát</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Speaking Room */}
          <div className="bg-study-surface border border-study-border hover:border-study-primary/40 rounded-3xl p-8 shadow-xs transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-study-primary tracking-wider mb-4">
                <Headphones size={15} />
                <span>02 / SPEAKING ROOM</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-study-text mb-3">
                Nói thành tiếng trước. Sửa đúng sau.
              </h3>
              <p className="text-sm text-study-text-muted leading-relaxed mb-6">
                Mimic không ngắt lời khi bạn đang diễn đạt. AI lắng nghe đủ 60–90s,
                ghi nhận điểm vấp và gợi ý phương án thay thế tự nhiên nhất.
              </p>
            </div>

            <div className="bg-study-surface-muted/60 border border-study-border rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="flex items-center gap-1.5 text-study-success font-semibold">
                  <span className="w-2 h-2 rounded-full bg-study-success" />
                  Speaking Coach Active
                </span>
                <span className="text-study-primary font-bold">89/100</span>
              </div>
              <div className="text-xs text-study-text bg-study-surface p-3 rounded-xl mb-3 leading-relaxed border border-study-border">
                “I felt <del className="text-rose-500 line-through mr-1">very happy</del> <ins className="text-study-success no-underline font-semibold">absolutely thrilled</ins> when the presentation went smoothly.”
              </div>
              <div className="text-xs text-study-text-muted flex items-start gap-2">
                <Sparkles size={14} className="text-study-primary flex-shrink-0 mt-0.5" />
                <span><strong>Gợi ý bản xứ:</strong> “Thrilled” diễn đạt cảm xúc phấn khích sống động hơn nhiều.</span>
              </div>
            </div>
          </div>

          {/* Card 3: Pattern Intelligence */}
          <div className="bg-study-surface border border-study-border hover:border-study-primary/40 rounded-3xl p-8 shadow-xs transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-study-primary tracking-wider mb-4">
                <Repeat size={15} />
                <span>03 / PATTERN INTELLIGENCE</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-study-text mb-3">
                Nhìn thấy thói quen lặp lại theo thời gian.
              </h3>
              <p className="text-sm text-study-text-muted leading-relaxed mb-6">
                Không đơn thuần chỉ đếm số ngày streak. Mimic liên kết các lỗi sai thành mẫu hình (pattern)
                để bạn đo lường sự tiến bộ thực sự.
              </p>
            </div>

            <div className="bg-study-surface-muted/60 border border-study-border rounded-2xl p-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-study-text mb-1">
                  <span>Mạo từ “a / the”</span>
                  <span className="text-study-success font-semibold">-18% lỗi lặp</span>
                </div>
                <div className="w-full h-1.5 bg-study-surface rounded-full overflow-hidden border border-study-border">
                  <div className="bg-study-primary h-full rounded-full" style={{ width: '74%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-study-text mb-1">
                  <span>Thì hiện tại hoàn thành</span>
                  <span className="text-study-success font-semibold">-14% lỗi lặp</span>
                </div>
                <div className="w-full h-1.5 bg-study-surface rounded-full overflow-hidden border border-study-border">
                  <div className="bg-study-accent h-full rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-study-text mb-1">
                  <span>Âm cuối /s/, /t/, /d/</span>
                  <span className="text-study-success font-semibold">-26% lỗi lặp</span>
                </div>
                <div className="w-full h-1.5 bg-study-surface rounded-full overflow-hidden border border-study-border">
                  <div className="bg-study-success h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-study-success pt-1 font-medium">
                <Check size={14} />
                <span>Tất cả 3 thói quen ngập ngừng đều giảm mạnh!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE PRACTICE MINI WIDGET ================= */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-study-primary uppercase mb-3 block">
            THỬ NGHIỆM TRỰC TIẾP TRÊN TRANG
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight">
            Xem cách Mimic nâng tầm câu nói của bạn
          </h2>
          <p className="text-sm text-study-text-muted mt-2">
            Chọn một câu tiếng Anh quen thuộc bạn hay dùng và xem gợi ý từ AI:
          </p>
        </div>

        <div className="bg-study-surface border border-study-border rounded-3xl p-6 sm:p-8 shadow-md">
          {/* Sample Selectors */}
          <div className="flex items-center gap-2 pb-5 border-b border-study-border mb-6 overflow-x-auto">
            {interactiveSamples.map((sample, idx) => (
              <button
                key={sample.id}
                onClick={() => setActiveSample(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeSample === idx
                    ? 'bg-study-primary-soft text-study-primary border border-study-primary-border/60 shadow-xs'
                    : 'text-study-text-muted hover:text-study-text bg-study-surface-muted/50 border border-study-border'
                }`}
              >
                Ví dụ 0{idx + 1}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Original Panel */}
            <div className="bg-study-surface-muted/60 border border-study-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-study-text-muted mb-3">
                <Mic size={14} />
                <span>Câu bạn vừa nói</span>
              </div>
              <div className="text-base text-study-text min-h-[50px] leading-relaxed mb-4">
                “{currentSample.userText}”
              </div>
              <div className="border-t border-study-border pt-3">
                <div className="flex justify-between text-xs text-study-text-muted mb-1.5">
                  <span>Mức tự nhiên ban đầu</span>
                  <strong className="text-study-accent">{currentSample.score} / 100</strong>
                </div>
                <div className="w-full h-1.5 bg-study-surface rounded-full overflow-hidden">
                  <div className="bg-study-accent h-full rounded-full" style={{ width: `${currentSample.score}%` }} />
                </div>
              </div>
            </div>

            {/* Improved Panel */}
            <div className="bg-study-primary-soft/30 border border-study-primary-border/60 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-study-primary mb-3">
                <Sparkles size={14} />
                <span>Phiên bản người bản xứ khuyên dùng</span>
              </div>
              <div className="text-base text-study-text font-medium min-h-[50px] leading-relaxed mb-4">
                “{currentSample.nativeAlternative}”
              </div>
              <div className="border-t border-study-border pt-3">
                <div className="flex justify-between text-xs text-study-text-muted mb-1.5">
                  <span>Sau khi tối ưu hóa</span>
                  <strong className="text-study-success">{currentSample.improvedScore} / 100</strong>
                </div>
                <div className="w-full h-1.5 bg-study-surface rounded-full overflow-hidden">
                  <div className="bg-study-success h-full rounded-full" style={{ width: `${currentSample.improvedScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-study-border pt-4">
            <span className="block text-xs font-semibold text-study-text-muted mb-3">Chi tiết phân tích từ Speaking Coach:</span>
            <div className="flex flex-wrap gap-2">
              {currentSample.improvements.map((imp, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-study-primary-soft/60 border border-study-primary-border/40 text-xs text-study-text">
                  <Check size={14} className="text-study-primary" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP TIMELINE ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-study-primary uppercase mb-3 block">
            MỘT PHIÊN HỌC 10 PHÚT DIỄN RA THẾ NÀO?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-study-text tracking-tight">
            Bốn bước tinh gọn. <span className="text-study-primary">Không cần chuẩn bị trước.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-study-surface border border-study-border hover:border-study-primary/30 rounded-2xl p-6 relative transition-all duration-200">
            <span className="font-display text-3xl font-bold text-study-primary block mb-4">01</span>
            <h4 className="text-lg font-semibold text-study-text mb-2">Chọn tình huống thực tế</h4>
            <p className="text-sm text-study-text-muted leading-relaxed">
              Một chủ đề gần gũi trong công việc, sở thích hoặc đời sống hàng ngày — không phải các đề thi máy móc.
            </p>
            <ArrowRight className="hidden lg:block absolute top-6 right-5 text-study-text-faint" size={18} />
          </div>

          <div className="bg-study-surface border border-study-border hover:border-study-primary/30 rounded-2xl p-6 relative transition-all duration-200">
            <span className="font-display text-3xl font-bold text-study-primary block mb-4">02</span>
            <h4 className="text-lg font-semibold text-study-text mb-2">Nói thành tiếng 60–90s</h4>
            <p className="text-sm text-study-text-muted leading-relaxed">
              Bấm mic và nói tự do những gì trong đầu bạn. Ngập ngừng hay nói sai cũng chính là dữ liệu quý giá để học.
            </p>
            <ArrowRight className="hidden lg:block absolute top-6 right-5 text-study-text-faint" size={18} />
          </div>

          <div className="bg-study-surface border border-study-border hover:border-study-primary/30 rounded-2xl p-6 relative transition-all duration-200">
            <span className="font-display text-3xl font-bold text-study-primary block mb-4">03</span>
            <h4 className="text-lg font-semibold text-study-text mb-2">Nhìn đúng 2–3 điểm vấp</h4>
            <p className="text-sm text-study-text-muted leading-relaxed">
              Speaking Coach chọn lọc ra những điểm cải thiện quan trọng nhất kèm phương án nói tự nhiên, thoát ý hơn.
            </p>
            <ArrowRight className="hidden lg:block absolute top-6 right-5 text-study-text-faint" size={18} />
          </div>

          <div className="bg-study-surface border border-study-border hover:border-study-primary/30 rounded-2xl p-6 relative transition-all duration-200">
            <span className="font-display text-3xl font-bold text-study-primary block mb-4">04</span>
            <h4 className="text-lg font-semibold text-study-text mb-2">Ôn ngắt quãng đúng lúc</h4>
            <p className="text-sm text-study-text-muted leading-relaxed">
              Các từ vựng và cấu trúc mới tự động quay lại trong các buổi luyện sau cho đến khi trở thành phản xạ.
            </p>
            <RotateCcw className="hidden lg:block absolute top-6 right-5 text-study-primary" size={18} />
          </div>
        </div>
      </section>

      {/* ================= PRICING SECTION ================= */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-study-primary uppercase mb-3 block">
            MINH BẠCH & RÕ RÀNG
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight">
            Bắt đầu miễn phí. Nâng cấp khi sẵn sàng.
          </h2>
          <p className="text-sm text-study-text-muted mt-2">
            Không chi phí ẩn. Không bắt buộc nhập thẻ ngân hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="bg-study-surface border border-study-border rounded-3xl p-8 sm:p-10 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-wider text-study-text-muted uppercase block mb-3">
                MIỄN PHÍ TRỌN ĐỜI
              </span>
              <h3 className="text-2xl font-display font-semibold text-study-text mb-2">Free Starter</h3>
              <p className="text-sm text-study-text-muted mb-6">Hoàn hảo để làm quen và duy trì thói quen nói tiếng Anh mỗi ngày.</p>
              <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-study-border">
                <span className="font-display text-4xl font-bold text-study-text">0đ</span>
                <span className="text-sm text-study-text-muted">/ mãi mãi</span>
              </div>
              <ul className="space-y-3.5 text-sm text-study-text-soft mb-8">
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> 1 buổi luyện nói Speaking Room mỗi ngày
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> Lưu trữ và ôn tập 20 từ vựng cốt lõi
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> Phân tích phát âm & ngữ pháp cơ bản
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> Báo cáo tiến độ 7 ngày gần nhất
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="block text-center py-3.5 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-study-text font-semibold text-sm transition-all"
            >
              Bắt đầu miễn phí ngay
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-study-surface border-2 border-study-primary rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-study-primary text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-xs tracking-wider uppercase">
              PHỔ BIẾN NHẤT
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-study-primary uppercase block mb-3">
                TIẾN BỘ ĐỘT PHÁ
              </span>
              <h3 className="text-2xl font-display font-semibold text-study-text mb-2">Mimic Pro</h3>
              <p className="text-sm text-study-text-muted mb-6">Dành cho người đi làm và người cần bứt phá phản xạ giao tiếp tự nhiên.</p>
              <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-study-border">
                <span className="font-display text-4xl font-bold text-study-text">149.000đ</span>
                <span className="text-sm text-study-text-muted">/ tháng</span>
              </div>
              <ul className="space-y-3.5 text-sm text-study-text mb-8">
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> <strong>Không giới hạn</strong> buổi luyện nói mỗi ngày
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> Trích xuất từ vựng không giới hạn từ mọi nguồn
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> AI Voice Coach phân tích sâu sắc ngữ điệu & nối âm
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> Bản đồ phân tích thói quen lỗi sai 30 ngày (Pattern Analytics)
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-study-primary" /> Thư viện kịch bản phỏng vấn, đàm phán & thuyết trình
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-study-primary text-white font-semibold text-sm hover:bg-study-primary-hover shadow-xs transition-all"
            >
              <span>Trải nghiệm 7 ngày Pro miễn phí</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-study-primary uppercase mb-3 block">
            CÂU HỎI THƯỜNG GẶP
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight">
            Tất cả những điều bạn băn khoăn
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className={`bg-study-surface border rounded-2xl overflow-hidden transition-all ${
                  isOpen ? 'border-study-primary/40 shadow-xs' : 'border-study-border hover:border-study-border/80'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-study-text cursor-pointer"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`text-study-text-muted transition-transform duration-200 flex-shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-study-primary' : ''
                    }`}
                    size={18}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-study-text-muted leading-relaxed border-t border-study-border">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative z-10 max-w-5xl mx-auto my-16 px-6 py-16 sm:py-20 rounded-3xl bg-study-surface border border-study-border text-center overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-study-primary bg-study-primary-soft px-3.5 py-1.5 rounded-full mb-6 border border-study-primary-border/60">
            <Compass size={14} />
            <span>SẴN SÀNG CHO BƯỚC ĐỘT PHÁ?</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-medium text-study-text tracking-tight mb-4">
            Câu tiếp theo
            <br />
            <span className="text-study-primary font-semibold">
              là của bạn.
            </span>
          </h2>

          <p className="text-base text-study-text-muted mb-8 max-w-lg mx-auto leading-relaxed">
            Đừng để tiếng Anh mãi chỉ nằm trong suy nghĩ.
            Bắt đầu với 1 phút nói thành tiếng ngay hôm nay.
          </p>

          <div className="flex justify-center mb-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-study-primary text-white font-semibold text-base shadow-xs hover:bg-study-primary-hover transition-all"
            >
              <span>Bắt đầu luyện nói ngay — Miễn phí</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-study-text-muted">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-study-success" /> Khởi tạo chỉ mất 30 giây
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-study-primary" /> An toàn & Riêng tư tuyệt đối
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-study-success" /> Không ràng buộc hợp đồng
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
