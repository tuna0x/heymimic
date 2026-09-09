import { AlertCircle, Check, Copy, Plus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { describeApiError, type ApiFailure } from '../../service/api'
import {
  toContextSuggestions,
  vocabService,
} from '../../service/vocabService'
import type { ContextSuggestion, VocabWord } from '../../type'
import { ApiErrorNotice } from '../shared/ApiErrorNotice'

const SAMPLE_TEXT =
  'During the sprint standup, we had to articulate the unexpected nuances of the new payment flow. The team was remarkably resilient and managed to resolve the edge-case errors without any major blockers.'

interface ContextCaptureProps {
  onWordsAdded?: (words: VocabWord[]) => void
}

export function ContextCapture({ onWordsAdded }: ContextCaptureProps) {
  const [text, setText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suggestions, setSuggestions] = useState<ContextSuggestion[]>([])
  const [source, setSource] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [retryOperation, setRetryOperation] = useState<'analyze' | 'save'>('analyze')
  const analysisIdRef = useRef<string | null>(null)
  const idempotencyKeyRef = useRef(crypto.randomUUID())
  const requestControllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => requestControllerRef.current?.abort(), [])

  const resetRequest = () => {
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    analysisIdRef.current = null
    idempotencyKeyRef.current = crypto.randomUUID()
    setSuggestions([])
    setSource(null)
    setFailure(null)
    setAnalyzing(false)
  }

  const handleTextChange = (value: string) => {
    setText(value)
    setValidationError('')
    setSavedSuccess(false)
    resetRequest()
  }

  const handleAnalyze = async () => {
    const normalized = text.trim()
    if (!normalized) {
      setValidationError('Vui lòng dán hoặc nhập một đoạn văn bản tiếng Anh.')
      return
    }
    if (normalized.length > 10_000) {
      setValidationError('Đoạn văn vượt quá giới hạn 10.000 ký tự.')
      return
    }

    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller
    setAnalyzing(true)
    setRetryOperation('analyze')
    setFailure(null)
    setSavedSuccess(false)

    try {
      let analysisId = analysisIdRef.current
      if (!analysisId) {
        const started = await vocabService.startContextAnalysis(
          normalized,
          'en',
          idempotencyKeyRef.current,
          controller.signal
        )
        if (!started.analysisId) throw new Error('Backend không trả về mã context analysis.')
        analysisId = started.analysisId
        analysisIdRef.current = analysisId
      }
      const analysis = await vocabService.waitForContextAnalysis(analysisId, controller.signal)
      setSuggestions(toContextSuggestions(analysis))
      setSource(analysis.source ?? null)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setRetryOperation('analyze')
      setFailure(describeApiError(error))
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null
        setAnalyzing(false)
      }
    }
  }

  const toggleSelect = (id: string) => {
    setSuggestions((current) =>
      current.map((item) =>
        item.id === id && !item.existingWordId
          ? { ...item, selected: !item.selected }
          : item
      )
    )
  }

  const handleSaveSelected = async () => {
    const analysisId = analysisIdRef.current
    const suggestionIds = suggestions
      .filter((item) => item.selected && !item.existingWordId)
      .map((item) => item.id)
    if (!analysisId || suggestionIds.length === 0 || saving) return

    setSaving(true)
    setRetryOperation('save')
    setFailure(null)
    try {
      const saved = await vocabService.saveSuggestions(analysisId, suggestionIds)
      setSavedSuccess(true)
      setSuggestions([])
      setText('')
      analysisIdRef.current = null
      idempotencyKeyRef.current = crypto.randomUUID()
      onWordsAdded?.(saved)
    } catch (error) {
      setRetryOperation('save')
      setFailure(describeApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = suggestions.filter(
    (item) => item.selected && !item.existingWordId
  ).length

  return (
    <div className="rounded-2xl border border-study-border bg-study-surface p-6 shadow-xs space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-study-primary" />
            <h3 className="text-base font-display font-semibold text-study-text">
              Thêm từ từ ngữ cảnh của bạn
            </h3>
          </div>
          <p className="text-xs text-study-text-muted mt-1">
            Dán email, bài báo hoặc đoạn chat để hệ thống gợi ý các từ cốt lõi nên học.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleTextChange(SAMPLE_TEXT)}
          className="text-xs text-study-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Copy size={13} />
          <span>Dùng đoạn văn mẫu</span>
        </button>
      </div>

      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(event) => handleTextChange(event.target.value)}
          placeholder="Dán đoạn văn tiếng Anh vào đây (tối đa 10.000 ký tự)..."
          rows={3}
          maxLength={10_000}
          className="w-full p-3.5 rounded-xl bg-study-surface-muted/50 border border-study-border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none focus:border-study-primary transition-colors resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between text-[11px] text-study-text-muted">
          <span>{text.length} / 10.000 ký tự</span>
          <button
            type="button"
            disabled={analyzing || saving || !text.trim()}
            onClick={() => void handleAnalyze()}
            className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover disabled:opacity-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>{analyzing ? 'Đang trích xuất...' : 'Phân tích ngữ cảnh'}</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{validationError}</span>
        </div>
      )}
      {failure && (
        <ApiErrorNotice
          failure={failure}
          onRetry={() =>
            retryOperation === 'save'
              ? void handleSaveSelected()
              : void handleAnalyze()
          }
        />
      )}
      {savedSuccess && (
        <div className="p-3 rounded-xl bg-study-success-soft border border-study-success/20 text-xs text-study-success flex items-center gap-2 animate-fade-in">
          <Check size={15} />
          <span>Đã lưu từ mới vào kho từ vựng cá nhân.</span>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-study-border/80 animate-fade-in">
          <div className="flex items-center justify-between text-xs gap-3">
            <span className="font-semibold text-study-text">
              Tìm thấy {suggestions.length} từ tiềm năng:
            </span>
            {source && (
              <span className="text-study-text-muted text-[11px]">Nguồn: {source}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestions.map((suggestion) => {
              const existing = Boolean(suggestion.existingWordId)
              return (
                <label
                  key={suggestion.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                    existing
                      ? 'bg-study-surface-muted/40 border-study-border opacity-70 cursor-not-allowed'
                      : suggestion.selected
                        ? 'bg-study-primary-soft/40 border-study-primary/50 cursor-pointer shadow-2xs'
                        : 'bg-study-surface border-study-border hover:bg-study-surface-muted/40 cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={existing}
                    checked={suggestion.selected && !existing}
                    onChange={() => toggleSelect(suggestion.id)}
                    className="mt-0.5 rounded border-study-border text-study-primary accent-study-primary"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <strong className="text-study-text font-semibold font-mono">
                        {suggestion.word}
                      </strong>
                      {existing && (
                        <span className="text-[10px] text-study-text-muted bg-study-surface-muted px-1.5 py-0.5 rounded">
                          Đã có
                        </span>
                      )}
                    </span>
                    <span className="block text-study-text-muted text-[11px] mt-0.5">
                      {suggestion.meaning}
                    </span>
                    <span className="block text-[10px] text-study-text-soft italic mt-1 line-clamp-1">
                      “{suggestion.sourceSentence}”
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetRequest}
              className="px-3 py-1.5 rounded-lg text-xs text-study-text-muted hover:text-study-text"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || saving}
              onClick={() => void handleSaveSelected()}
              className="px-4 py-2 rounded-xl bg-study-primary text-white text-xs font-semibold hover:bg-study-primary-hover disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>{saving ? 'Đang lưu...' : `Thêm ${selectedCount} từ đã chọn vào kho`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
