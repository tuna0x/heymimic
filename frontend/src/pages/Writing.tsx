import { useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Lightbulb,
  MessageSquare,
  PenTool,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react'
import { useMimicStore } from '../store/useMimicStore'
import { usePageMeta } from '../hook/usePageMeta'
import type { ReflexTranslationPrompt, WritingTemplate } from '../type'

export function Writing() {
  usePageMeta(
    'Viết Công Sở & Dịch Phản Xạ — HeyMimic',
    'Mài giũa văn phong Email, tin nhắn Slack/Teams sang bản Professional hoặc Casual, và rèn phản xạ tư duy trực tiếp sang tiếng Anh.'
  )

  const { writingTemplates, reflexPrompts } = useMimicStore()

  // Tabs: 'polisher' | 'reflex'
  const [activeTab, setActiveTab] = useState<'polisher' | 'reflex'>('polisher')

  // Polisher State
  const [selectedTemplateId, setSelectedTemplateId] = useState(writingTemplates[0]?.id ?? '')
  const [copiedType, setCopiedType] = useState<'pro' | 'cas' | null>(null)

  const currentTemplate: WritingTemplate | undefined =
    writingTemplates.find((t) => t.id === selectedTemplateId) ?? writingTemplates[0]

  // Reflex Translation State
  const [selectedReflexIndex, setSelectedReflexIndex] = useState(0)
  const [userDraftAnswer, setUserDraftAnswer] = useState('')
  const [showReflexExplanation, setShowReflexExplanation] = useState(false)

  const currentReflex: ReflexTranslationPrompt | undefined =
    reflexPrompts[selectedReflexIndex] ?? reflexPrompts[0]

  const handleCopy = (text: string, type: 'pro' | 'cas') => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    } catch {
      // Ignore audio synthesis errors
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-study-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-study-primary mb-1">
            <PenTool size={14} />
            <span>WORKPLACE WRITING & REFLEX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-study-text">
            Viết công sở & Dịch phản xạ câu
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1 leading-relaxed">
            Chuyển hóa văn phong Email/Slack sang lối viết tự nhiên chuẩn mực và rèn phản xạ tư duy trực tiếp bằng tiếng Anh.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-study-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('polisher')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-1 flex items-center gap-2 ${
            activeTab === 'polisher'
              ? 'border-study-primary text-study-primary bg-study-surface-muted/40'
              : 'border-transparent text-study-text-muted hover:text-study-text'
          }`}
        >
          <FileText size={15} />
          <span>Mài giũa Email & Slack</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reflex')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-1 flex items-center gap-2 ${
            activeTab === 'reflex'
              ? 'border-study-primary text-study-primary bg-study-surface-muted/40'
              : 'border-transparent text-study-text-muted hover:text-study-text'
          }`}
        >
          <Sparkles size={15} />
          <span>Dịch phản xạ câu công sở</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-study-accent-soft text-study-accent">
            {reflexPrompts.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Email & Slack Polisher */}
      {activeTab === 'polisher' && currentTemplate && (
        <div className="space-y-6 animate-fade-in">
          {/* Situation Chooser */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-study-surface border border-study-border shadow-xs">
            <span className="text-xs text-study-text-muted font-semibold">Chọn tình huống công sở mẫu:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-study-surface-muted border border-study-border text-xs font-semibold text-study-text focus:outline-none focus:border-study-primary transition-colors cursor-pointer"
            >
              {writingTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          {/* User Draft Card */}
          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-600 flex items-center gap-1.5">
                <XCircle size={14} />
                <span>Bản nháp thường gặp (còn cứng hoặc dịch word-by-word)</span>
              </span>
            </div>
            <p className="font-mono text-study-text bg-study-surface p-3.5 rounded-xl border border-rose-500/20 leading-relaxed">
              “{currentTemplate.sampleDraft}”
            </p>
          </div>

          {/* 2 Rewritten Versions: Professional vs Casual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version 1: Professional */}
            <div className="p-5 rounded-2xl bg-study-surface border border-study-primary-border/70 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-study-primary-soft text-study-primary font-semibold text-xs border border-study-primary-border/60">
                    Bản Trang Trọng (Professional)
                  </span>
                  <span className="text-[11px] text-study-text-muted">Gửi khách hàng / Ban giám đốc</span>
                </div>

                <div className="p-4 rounded-xl bg-study-surface-muted/30 border border-study-border text-xs font-mono text-study-text leading-relaxed whitespace-pre-line min-h-[160px]">
                  {currentTemplate.professionalVersion}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-study-border">
                <button
                  type="button"
                  onClick={() => handleSpeak(currentTemplate.professionalVersion)}
                  className="inline-flex items-center gap-1 text-xs text-study-primary hover:underline cursor-pointer"
                >
                  <Volume2 size={14} />
                  <span>Nghe đọc mẫu</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(currentTemplate.professionalVersion, 'pro')}
                  className="px-3 py-1.5 rounded-lg border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedType === 'pro' ? <Check size={13} className="text-study-success" /> : <Copy size={13} />}
                  <span>{copiedType === 'pro' ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
                </button>
              </div>
            </div>

            {/* Version 2: Casual */}
            <div className="p-5 rounded-2xl bg-study-surface border border-study-accent/40 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-study-accent-soft text-study-accent font-semibold text-xs border border-study-accent/30">
                    Bản Thân Thiện (Casual / Team Friendly)
                  </span>
                  <span className="text-[11px] text-study-text-muted">Gửi đồng nghiệp trên Slack</span>
                </div>

                <div className="p-4 rounded-xl bg-study-surface-muted/30 border border-study-border text-xs font-mono text-study-text leading-relaxed whitespace-pre-line min-h-[160px]">
                  {currentTemplate.casualVersion}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-study-border">
                <button
                  type="button"
                  onClick={() => handleSpeak(currentTemplate.casualVersion)}
                  className="inline-flex items-center gap-1 text-xs text-study-accent hover:underline cursor-pointer"
                >
                  <Volume2 size={14} />
                  <span>Nghe đọc mẫu</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(currentTemplate.casualVersion, 'cas')}
                  className="px-3 py-1.5 rounded-lg border border-study-border bg-study-surface hover:bg-study-surface-hover text-xs font-semibold text-study-text transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedType === 'cas' ? <Check size={13} className="text-study-success" /> : <Copy size={13} />}
                  <span>{copiedType === 'cas' ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Improvements Breakdown */}
          <div className="p-6 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-study-primary">
              <Lightbulb size={16} />
              <span>Tại sao bản viết lại chuyên nghiệp hơn?</span>
            </div>
            <ul className="space-y-2 text-xs text-study-text leading-relaxed">
              {currentTemplate.keyImprovements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-study-primary mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Reflex Translation Drills */}
      {activeTab === 'reflex' && currentReflex && (
        <div className="space-y-6 animate-fade-in">
          {/* Header card with Vietnamese thought */}
          <div className="p-6 rounded-3xl bg-study-surface border border-study-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-study-accent uppercase tracking-wider">
                THỬ THÁCH PHẢN XẠ #{selectedReflexIndex + 1} / {reflexPrompts.length}
              </span>
              <span className="text-[11px] text-study-text-muted">{currentReflex.context}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-study-text-muted">Ý nghĩ trong đầu bằng tiếng Việt:</span>
              <p className="text-xl sm:text-2xl font-display font-medium text-study-text leading-relaxed">
                “{currentReflex.vietnameseThought}”
              </p>
            </div>

            {/* Input area */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-study-text">
                Bạn sẽ diễn đạt câu này sang tiếng Anh thế nào?
              </label>
              <textarea
                value={userDraftAnswer}
                onChange={(e) => setUserDraftAnswer(e.target.value)}
                placeholder="Gõ thử câu tiếng Anh của bạn ở đây trước khi xem đáp án mẫu..."
                rows={2}
                className="w-full p-3.5 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs sm:text-sm text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors resize-none font-mono"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowReflexExplanation(!showReflexExplanation)}
                className="px-5 py-2.5 rounded-xl bg-study-accent text-white text-xs font-semibold hover:bg-study-accent-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={14} />
                <span>{showReflexExplanation ? 'Ẩn phân tích bản xứ' : 'Xem cách người bản xứ diễn đạt'}</span>
              </button>
            </div>
          </div>

          {/* Reveal Natural English & Breakdown */}
          {showReflexExplanation && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Literal Trap */}
                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                    <XCircle size={14} />
                    <span>Bẫy dịch từng từ (Literal Translation)</span>
                  </span>
                  <p className="font-mono text-xs text-study-text">“{currentReflex.literalTrap}”</p>
                </div>

                {/* Natural English */}
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>Cách nói tự nhiên của người bản xứ</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentReflex.naturalEnglish)}
                      className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded cursor-pointer"
                      title="Nghe đọc mẫu"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p className="font-mono text-xs font-semibold text-study-text">“{currentReflex.naturalEnglish}”</p>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="p-5 rounded-2xl bg-study-surface border border-study-border shadow-xs space-y-2 text-xs">
                <span className="font-semibold text-study-primary block">
                  💡 Phân tích vì sao nên dùng lối nói này:
                </span>
                <p className="text-study-text leading-relaxed">{currentReflex.explanation}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {currentReflex.targetChunks.map((chunk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-study-primary-soft text-study-primary font-mono text-[11px] font-semibold border border-study-primary-border/60"
                    >
                      {chunk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Next Reflex Drill Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReflexIndex((prev) => (prev + 1) % reflexPrompts.length)
                    setUserDraftAnswer('')
                    setShowReflexExplanation(false)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <span>Câu phản xạ tiếp theo</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
