import { ArrowLeft, ArrowRight, Headphones, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { latestSession, recentSessions, todayPrompt } from '../mocks/speaking'
import { RecordButton } from '../components/speaking/RecordButton'
import { Waveform } from '../components/speaking/Waveform'
import { FeedbackCard } from '../components/speaking/FeedbackCard'
import { SectionLabel, StatusPill } from '../components/shared/UI'
import { useMimicStore } from '../store/useMimicStore'

export function Speaking() {
  const [selectedSession, setSelectedSession] = useState(latestSession)
  const [showPrompt, setShowPrompt] = useState(true)
  const state = useMimicStore((store) => store.recorderState)
  const hasResult = state === 'complete' || selectedSession.id !== latestSession.id

  return (
    <div className="space-y-8">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <SectionLabel>{todayPrompt.eyebrow}</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight mt-1">
            Đến lượt bạn<span className="text-study-primary">.</span>
          </h1>
          <p className="text-sm text-study-text-muted mt-1.5 max-w-md leading-relaxed">
            Không cần nói hoàn hảo. Cứ bắt đầu bằng những câu đơn giản nhất.
          </p>
        </div>
        <StatusPill tone={state === 'recording' ? 'signal' : 'calm'}>
          {state === 'recording' ? 'ĐANG GHI ÂM...' : 'MIC SẴN SÀNG'}
        </StatusPill>
      </div>

      {/* Main Speaking Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recording Studio */}
        <main className="lg:col-span-8 bg-study-surface border border-study-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            {/* Prompt Heading */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <SectionLabel>ĐỀ BÀI HÔM NAY</SectionLabel>
                <h2 className="text-xl sm:text-2xl font-display font-semibold text-study-text mt-1 leading-snug">
                  {todayPrompt.title}
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-study-surface-muted hover:bg-study-surface-hover border border-study-border text-xs font-semibold text-study-text transition-colors shrink-0"
              >
                <Headphones size={15} />
                <span>Nghe đề bài</span>
              </button>
            </div>

            {/* Prompt Note */}
            {showPrompt && (
              <div className="p-4 rounded-xl bg-study-primary-soft/40 border border-study-primary-border/50 text-xs text-study-text-soft flex items-start justify-between gap-3 mb-6">
                <p className="leading-relaxed">{todayPrompt.description}</p>
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="text-study-text-muted hover:text-study-text font-bold text-sm leading-none"
                  aria-label="Ẩn hướng dẫn"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Recording Stage Zone */}
            <div className="flex flex-col items-center justify-center py-6">
              <Waveform active={state === 'recording'} />
              <RecordButton />
              <div className="flex items-center gap-4 text-[11px] text-study-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-study-primary" />
                  <span>Micro đã kết nối</span>
                </span>
                <span>·</span>
                <span>Mục tiêu: {todayPrompt.time}</span>
              </div>
            </div>
          </div>

          {/* Transcript Result Box */}
          {hasResult && (
            <div className="mt-8 pt-6 border-t border-study-border">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>BẢN GHI ÂM CỦA BẠN · TRANSCRIPT</SectionLabel>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-study-primary hover:underline"
                >
                  <RotateCcw size={13} />
                  <span>Nghe lại bài nói</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-study-surface-muted/60 border border-study-border text-sm text-study-text italic leading-relaxed">
                “{selectedSession.transcript}”
              </div>

              <div className="flex items-center gap-2 text-[11px] text-study-text-muted mt-2">
                <span>01:18</span>
                <span>·</span>
                <span>Speaking Agent đã hoàn tất phân tích ngữ điệu</span>
              </div>
            </div>
          )}
        </main>

        {/* Right: Recent Takes List & Quick Tip */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-study-surface border border-study-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>CÁC LẦN NÓI GẦN ĐÂY</SectionLabel>
              <span className="text-[10px] font-semibold text-study-text-muted">3 PHIÊN</span>
            </div>

            <div className="space-y-2">
              {recentSessions.map((session) => {
                const isActive = session.id === selectedSession.id
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSession(session)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left border cursor-pointer ${
                      isActive
                        ? 'bg-study-primary-soft/50 border-study-primary-border shadow-xs'
                        : 'bg-study-surface-muted/40 border-transparent hover:bg-study-surface-hover hover:border-study-border'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-study-surface flex items-center justify-center text-study-primary text-xs border border-study-border">
                        <Play size={10} fill="currentColor" />
                      </span>
                      <div>
                        <strong className="block text-xs font-semibold text-study-text">
                          {session.title}
                        </strong>
                        <span className="block text-[10px] text-study-text-muted">
                          {session.date} · {session.duration}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-display text-study-primary">
                        {session.score}
                      </span>
                      <small className="text-[10px] text-study-text-muted">/100</small>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-study-border-subtle text-xs text-study-text-muted">
              <button type="button" className="p-1 rounded hover:bg-study-surface-hover">
                <ArrowLeft size={14} />
              </button>
              <span className="font-mono text-[11px]">1 / 3</span>
              <button type="button" className="p-1 rounded hover:bg-study-surface-hover">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Practical Tip Card */}
          <div className="bg-study-surface border border-study-border rounded-2xl p-5 shadow-xs">
            <SectionLabel className="mb-2">GỢI Ý HỮU ÍCH</SectionLabel>
            <p className="text-xs text-study-text leading-relaxed">
              Hãy để một khoảng ngắt ngắn 1 giây giữa hai mệnh đề. Người nghe sẽ kịp nắm bắt ý chính và bạn có thêm thời gian lựa chọn từ nối phù hợp.
            </p>
          </div>
        </aside>
      </div>

      {/* Speaking Feedback Section */}
      {hasResult && (
        <section className="bg-study-surface border border-study-border rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-study-border">
            <div>
              <SectionLabel>SPEAKING AGENT · NHẬN XÉT CHI TIẾT</SectionLabel>
              <h2 className="text-xl font-display font-semibold text-study-text mt-0.5">
                Điểm nổi bật & gợi ý cải thiện
              </h2>
            </div>
            <div className="flex items-baseline gap-2 bg-study-primary-soft px-4 py-2 rounded-xl border border-study-primary-border/60">
              <span className="text-2xl font-bold font-display text-study-primary">
                {selectedSession.score}
              </span>
              <span className="text-[10px] uppercase font-semibold text-study-primary/80">
                / 100 Điểm tổng quan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedSession.feedback.map((item) => (
              <FeedbackCard feedback={item} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
