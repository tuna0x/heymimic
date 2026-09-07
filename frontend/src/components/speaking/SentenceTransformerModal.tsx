import { useState } from 'react'
import {
  Briefcase,
  Coffee,
  Copy,
  Check,
  Lightbulb,
  Sparkles,
  Volume2,
  Wand2,
  X,
} from 'lucide-react'

interface SentenceTransformerModalProps {
  sentence: string
  isOpen: boolean
  onClose: () => void
}

export function SentenceTransformerModal({
  sentence,
  isOpen,
  onClose,
}: SentenceTransformerModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [playingKey, setPlayingKey] = useState<string | null>(null)

  if (!isOpen) return null

  // Transform styles based on input
  const variations = [
    {
      key: 'executive',
      icon: Briefcase,
      title: 'Văn phong Sếp lớn (Executive Polish)',
      subtitle: 'Súc tích, có trọng lượng và thể hiện năng lực lãnh đạo',
      text: `From a strategic standpoint, we prioritized high-impact deliverables to ensure seamless execution.`,
      explanation: 'Sử dụng "strategic standpoint" và "high-impact deliverables" để tạo phong thái chuyên nghiệp.',
    },
    {
      key: 'casual',
      icon: Coffee,
      title: 'Trò chuyện thân mật (Casual Coffee Chat)',
      subtitle: 'Tự nhiên, gần gũi, dùng khi tán gẫu với đồng nghiệp',
      text: `Honestly, we just focused on knocking out the most urgent stuff first so nothing slipped through the cracks.`,
      explanation: 'Sử dụng các cụm từ đàm thoại bản xứ như "knocking out" và "slip through the cracks".',
    },
    {
      key: 'idiomatic',
      icon: Lightbulb,
      title: 'Chèn thành ngữ đắt giá (Idiomatic Booster)',
      subtitle: 'Nói mượt mà, thoát ly hoàn toàn tư duy dịch từng từ',
      text: `We hit the ground running and tackled the bottleneck head-on before it could snowball into a bigger issue.`,
      explanation: 'Dùng thành ngữ "hit the ground running" (bắt tay vào việc ngay) và "tackled head-on" (xử lý trực diện).',
    },
  ]

  const speakText = (key: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.95
      utterance.onstart = () => setPlayingKey(key)
      utterance.onend = () => setPlayingKey(null)
      utterance.onerror = () => setPlayingKey(null)
      window.speechSynthesis.speak(utterance)
    } catch {
      setPlayingKey(null)
    }
  }

  const copyText = (key: string, text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-study-surface border border-study-border rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-up text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-study-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-study-primary-soft text-study-primary flex items-center justify-center font-bold">
              <Wand2 size={16} />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-study-text">
                Studio Biến Hóa Câu Nói (3 Sắc Thái)
              </h3>
              <p className="text-xs text-study-text-muted">
                Quan sát cách câu nói được biến hóa theo các tình huống giao tiếp khác nhau.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-study-text-muted hover:text-study-text hover:bg-study-surface-hover cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Original Sentence */}
        <div className="p-3.5 rounded-xl bg-study-surface-muted/60 border border-study-border space-y-1">
          <span className="text-[10px] font-bold text-study-text-muted uppercase tracking-wider block">
            CÂU NGUYÊN BẢN CỦA BẠN
          </span>
          <p className="text-xs sm:text-sm font-medium text-study-text italic leading-relaxed">
            “{sentence || 'I worked very hard on the project and we finished it on time.'}”
          </p>
        </div>

        {/* 3 Transformed Versions */}
        <div className="space-y-3">
          {variations.map((v) => {
            const Icon = v.icon
            return (
              <div
                key={v.key}
                className="p-4 rounded-xl bg-study-surface border border-study-border hover:border-study-primary-border/60 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={15} className="text-study-primary" />
                    <span className="text-xs font-semibold text-study-text">{v.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => speakText(v.key, v.text)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        playingKey === v.key
                          ? 'bg-study-primary text-white border-study-primary animate-pulse'
                          : 'bg-study-surface border-study-border text-study-primary hover:bg-study-primary-soft'
                      }`}
                      title="Nghe phát âm phiên bản này"
                    >
                      <Volume2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(v.key, v.text)}
                      className="p-1.5 rounded-lg border border-study-border bg-study-surface text-study-text-muted hover:text-study-text transition-colors cursor-pointer"
                      title="Sao chép câu này"
                    >
                      {copiedKey === v.key ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-study-primary leading-relaxed bg-study-primary-soft/30 p-2.5 rounded-lg border border-study-primary-border/30 font-sans">
                  “{v.text}”
                </p>

                <p className="text-[11px] text-study-text-muted leading-relaxed">
                  💡 {v.explanation}
                </p>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-study-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors cursor-pointer"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  )
}
