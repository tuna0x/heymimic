import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Briefcase, Check, Clock, MessageSquare, Sparkles, UserCheck } from 'lucide-react'
import { BrandLogo } from '../../components/shared/BrandLogo'
import { usePageMeta } from '../../hook/usePageMeta'
import { useMimicStore } from '../../store/useMimicStore'
import type { LearnerProfile } from '../../type'

const GOAL_OPTIONS: Array<{
  id: LearnerProfile['goal']
  title: string
  desc: string
  icon: typeof Briefcase
}> = [
  {
    id: 'work',
    title: 'Công sở & Họp nhóm',
    desc: 'Báo cáo sprint, sync công việc, trao đổi với đồng nghiệp và sếp quốc tế.',
    icon: Briefcase,
  },
  {
    id: 'interview',
    title: 'Phỏng vấn xin việc',
    desc: 'Giới thiệu bản thân, trả lời câu hỏi tình huống và thể hiện thế mạnh.',
    icon: UserCheck,
  },
  {
    id: 'casual',
    title: 'Giao tiếp hằng ngày',
    desc: 'Trò chuyện tự nhiên, chia sẻ trải nghiệm, diễn đạt suy nghĩ lưu loát.',
    icon: MessageSquare,
  },
]

const LEVEL_OPTIONS: Array<{
  id: LearnerProfile['selfAssessedLevel']
  title: string
  desc: string
}> = [
  {
    id: 'beginner',
    title: 'Mới bắt đầu',
    desc: 'Biết từ vựng đơn giản nhưng khó ghép thành câu hoàn chỉnh để nói.',
  },
  {
    id: 'elementary',
    title: 'Nói được câu ngắn',
    desc: 'Giao tiếp cơ bản nhưng thường xuyên phải dừng lại để dịch trong đầu.',
  },
  {
    id: 'intermediate',
    title: 'Trao đổi được nhưng thiếu tự nhiên',
    desc: 'Hiểu tốt nhưng câu cú còn cứng, thiếu cụm từ nối và ngữ điệu tự nhiên.',
  },
  {
    id: 'unspecified',
    title: 'Chưa chắc chắn',
    desc: 'Để Mimic gợi ý từ mức độ dễ và dần thích ứng theo phản hồi của bạn.',
  },
]

const TIME_OPTIONS: Array<{
  id: LearnerProfile['dailyMinutesGoal']
  title: string
  desc: string
}> = [
  {
    id: 5,
    title: '5 phút / ngày',
    desc: '1 bài nói ngắn hoặc 1 lượt ôn từ nhanh khi bận rộn.',
  },
  {
    id: 10,
    title: '10 phút / ngày',
    desc: 'Ôn 4–6 từ và hoàn thành 1 bài luyện nói hoàn chỉnh. (Khuyên dùng)',
  },
  {
    id: 15,
    title: '15 phút / ngày',
    desc: 'Luyện sâu: học từ mới, nói 1–2 lần và thực hành sửa lỗi.',
  },
]

export function Onboarding() {
  usePageMeta('Khởi tạo lộ trình — HeyMimic', 'Cá nhân hóa trải nghiệm học tiếng Anh theo mục tiêu của bạn.')
  const navigate = useNavigate()
  const profile = useMimicStore((state) => state.profile)
  const completeOnboarding = useMimicStore((state) => state.completeOnboarding)

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [goal, setGoal] = useState<LearnerProfile['goal']>(profile.goal || 'work')
  const [level, setLevel] = useState<LearnerProfile['selfAssessedLevel']>(
    profile.selfAssessedLevel || 'intermediate'
  )
  const [time, setTime] = useState<LearnerProfile['dailyMinutesGoal']>(
    profile.dailyMinutesGoal || 10
  )

  // Keyboard navigation: 1, 2, 3 to select options
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 1) {
        if (e.key === '1') setGoal('work')
        if (e.key === '2') setGoal('interview')
        if (e.key === '3') setGoal('casual')
      } else if (step === 2) {
        if (e.key === '1') setLevel('beginner')
        if (e.key === '2') setLevel('elementary')
        if (e.key === '3') setLevel('intermediate')
        if (e.key === '4') setLevel('unspecified')
      } else if (step === 3) {
        if (e.key === '1') setTime(5)
        if (e.key === '2') setTime(10)
        if (e.key === '3') setTime(15)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step])

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3)
    } else {
      // Save and show completion ready state
      completeOnboarding({
        goal,
        selfAssessedLevel: level,
        dailyMinutesGoal: time,
      })
      setStep(4)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3)
  }

  const handleSkip = () => {
    completeOnboarding({
      goal: 'work',
      selfAssessedLevel: 'unspecified',
      dailyMinutesGoal: 10,
    })
    navigate('/dashboard')
  }

  const handleFinish = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-study-bg text-study-text flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Minimal Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-2">
        <BrandLogo size="sm" to="/" />
        {step < 4 ? (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-study-text-muted">
              Bước {step} / 3
            </span>
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-study-text-muted hover:text-study-text underline cursor-pointer"
            >
              Bỏ qua
            </button>
          </div>
        ) : null}
      </header>

      {/* Main Wizard Content */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <span className="text-xs font-semibold text-study-primary uppercase tracking-wider block mb-1">
                Mục tiêu chính
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text tracking-tight">
                Bạn muốn luyện nói tiếng Anh trong tình huống nào?
              </h1>
              <p className="text-xs text-study-text-muted mt-2 leading-relaxed">
                Mimic sẽ ưu tiên các chủ đề hội thoại và từ vựng sát với ngữ cảnh thực tế của bạn.
              </p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Mục tiêu luyện tập">
              {GOAL_OPTIONS.map((item, idx) => {
                const isSelected = goal === item.id
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-study-surface border-study-primary shadow-sm ring-2 ring-study-primary/20'
                        : 'bg-study-surface/60 hover:bg-study-surface border-study-border hover:border-study-border-subtle'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-study-primary text-white'
                          : 'bg-study-surface-muted text-study-text-muted'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-study-text">
                          {idx + 1}. {item.title}
                        </span>
                        {isSelected && <Check size={16} className="text-study-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-study-text-muted mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <span className="text-xs font-semibold text-study-primary uppercase tracking-wider block mb-1">
                Trình độ hiện tại
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text tracking-tight">
                Mô tả nào gần nhất với khả năng nói của bạn?
              </h1>
              <p className="text-xs text-study-text-muted mt-2 leading-relaxed">
                Đây là đánh giá tham khảo ban đầu. Bạn có thể thay đổi bất kỳ lúc nào trong Cài đặt.
              </p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Trình độ tự đánh giá">
              {LEVEL_OPTIONS.map((item, idx) => {
                const isSelected = level === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLevel(item.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-study-surface border-study-primary shadow-sm ring-2 ring-study-primary/20'
                        : 'bg-study-surface/60 hover:bg-study-surface border-study-border hover:border-study-border-subtle'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono ${
                        isSelected
                          ? 'bg-study-primary text-white'
                          : 'bg-study-surface-muted text-study-text-muted'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-study-text">
                          {item.title}
                        </span>
                        {isSelected && <Check size={16} className="text-study-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-study-text-muted mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <span className="text-xs font-semibold text-study-primary uppercase tracking-wider block mb-1">
                Nhịp độ học tập
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text tracking-tight">
                Thời gian bạn muốn dành mỗi ngày?
              </h1>
              <p className="text-xs text-study-text-muted mt-2 leading-relaxed">
                Quan trọng nhất là sự đều đặn mỗi ngày, không cần học quá dài làm mất nhịp.
              </p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Thời lượng mỗi ngày">
              {TIME_OPTIONS.map((item, idx) => {
                const isSelected = time === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTime(item.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-study-surface border-study-primary shadow-sm ring-2 ring-study-primary/20'
                        : 'bg-study-surface/60 hover:bg-study-surface border-study-border hover:border-study-border-subtle'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-study-primary text-white'
                          : 'bg-study-surface-muted text-study-text-muted'
                      }`}
                    >
                      <Clock size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-study-text">
                          {idx + 1}. {item.title}
                        </span>
                        {isSelected && <Check size={16} className="text-study-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-study-text-muted mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-study-primary-soft text-study-primary flex items-center justify-center mx-auto shadow-sm">
              <Sparkles size={28} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text tracking-tight">
                Lộ trình của {profile.name || 'bạn'} đã sẵn sàng!
              </h1>
              <p className="text-xs text-study-text-muted max-w-md mx-auto leading-relaxed">
                Mimic đã thiết lập bài học đầu tiên phù hợp với mục tiêu{' '}
                <strong className="text-study-text font-semibold">
                  {GOAL_OPTIONS.find((g) => g.id === goal)?.title}
                </strong>
                .
              </p>
            </div>

            {/* Prepared First Lesson Preview */}
            <div className="p-5 rounded-2xl bg-study-surface border border-study-border text-left shadow-xs space-y-3">
              <span className="text-[11px] font-semibold text-study-primary uppercase tracking-wider block">
                Đề xuất cho buổi học đầu
              </span>
              <h2 className="text-base font-display font-semibold text-study-text">
                {goal === 'interview'
                  ? 'Giới thiệu bản thân & Thế mạnh (Tell Me About Yourself)'
                  : 'Cập nhật tiến độ dự án (Sprint Standup)'}
              </h2>
              <p className="text-xs text-study-text-muted leading-relaxed">
                Ôn 3 từ vựng công sở cốt lõi, sau đó thực hành phản xạ nói 60–90 giây và nhận phản hồi tức thì.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-study-text-muted">
                <Clock size={14} />
                <span>Khoảng {time} phút</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 px-6 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Vào phòng học & Bắt đầu buổi đầu</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Bottom Wizard Navigation Buttons */}
        {step < 4 && (
          <div className="flex items-center justify-between pt-6 border-t border-study-border/80 mt-6">
            <button
              type="button"
              disabled={step === 1}
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-text-muted hover:text-study-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Quay lại</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-all shadow-xs cursor-pointer"
            >
              <span>{step === 3 ? 'Hoàn tất khởi tạo' : 'Tiếp tục'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </main>

      {/* Footer Minimal Notice */}
      <footer className="max-w-2xl w-full mx-auto text-center text-[11px] text-study-text-muted/60 py-2">
        HeyMimic Studio · Cá nhân hóa qua thực hành thật
      </footer>
    </div>
  )
}
