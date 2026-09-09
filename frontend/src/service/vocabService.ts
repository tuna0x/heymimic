import type { ContextSuggestion, VocabStatus, VocabWord } from '../type'
import { ApiError, apiClient } from './api'
import type { components } from './generated/api-schema'

type VocabularyWordDto = components['schemas']['VocabularyWordResponse']
type VocabularyWordPage = components['schemas']['VocabularyWordPageResponse']
type StartedContextAnalysis = components['schemas']['StartedContextAnalysisResponse']
export type VocabularySuggestion = components['schemas']['VocabularySuggestionResponse']
export type ContextAnalysis = components['schemas']['ContextAnalysisResponse']

function statusOf(value: string): VocabStatus {
  const normalized = value.toLowerCase()
  if (normalized === 'reviewing' || normalized === 'mastered') return normalized
  return 'new'
}

function toVocabWord(dto: VocabularyWordDto): VocabWord {
  return {
    id: dto.id ?? '',
    word: dto.word ?? '',
    pronunciation: dto.pronunciation ?? '',
    meaning: dto.meaning ?? '',
    partOfSpeech: dto.partOfSpeech ?? '',
    example: dto.example ?? '',
    translation: dto.translation ?? '',
    status: statusOf(dto.status ?? 'new'),
    mastery: dto.mastery,
    sourceContext: dto.sourceContext,
    nextReviewAt: dto.nextReviewAt,
    version: dto.version,
  }
}

export function toContextSuggestions(analysis: ContextAnalysis): ContextSuggestion[] {
  return (analysis.suggestions ?? []).map((item) => ({
    id: item.id ?? '',
    word: item.word ?? '',
    meaning: item.meaning ?? '',
    sourceSentence: item.sourceSentence ?? '',
    existingWordId: item.existingWordId,
    selected: !item.existingWordId,
  }))
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, milliseconds)
    if (signal?.aborted) onAbort()
    else signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function contextAnalysisFor(
  analysisId: string,
  signal?: AbortSignal
): Promise<ContextAnalysis> {
  return apiClient<ContextAnalysis>(`/vocabulary/context-analyses/${analysisId}`, { signal })
}

export const vocabService = {
  async getVocabWords(params: {
    status?: VocabStatus
    dueBefore?: string
    page?: number
    size?: number
  } = {}, signal?: AbortSignal): Promise<VocabWord[]> {
    const response = await apiClient<VocabularyWordPage>('/vocabulary/words', {
      params: { page: 0, size: 100, ...params },
      signal,
    })
    return (response.items ?? []).map(toVocabWord)
  },

  async getVocabWordCount(signal?: AbortSignal): Promise<number> {
    const response = await apiClient<VocabularyWordPage>('/vocabulary/words', {
      params: { page: 0, size: 1 },
      signal,
    })
    return response.totalItems ?? 0
  },

  async startContextAnalysis(
    text: string,
    targetLanguage = 'en',
    idempotencyKey = crypto.randomUUID(),
    signal?: AbortSignal
  ): Promise<StartedContextAnalysis> {
    return apiClient<StartedContextAnalysis>('/vocabulary/context-analysis', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage }),
      idempotencyKey,
      signal,
    })
  },

  async getContextAnalysis(analysisId: string, signal?: AbortSignal): Promise<ContextAnalysis> {
    return contextAnalysisFor(analysisId, signal)
  },

  async waitForContextAnalysis(
    analysisId: string,
    signal?: AbortSignal,
    timeoutMs = 90_000
  ): Promise<ContextAnalysis> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const analysis = await contextAnalysisFor(analysisId, signal)
      if (analysis.status === 'completed') return analysis
      if (analysis.status === 'failed') {
        throw new ApiError(422, analysis.errorCode ?? 'Context analysis failed', {
          code: analysis.errorCode,
        })
      }
      await wait(1_500, signal)
    }
    throw new ApiError(408, 'Context analysis timed out', { code: 'REQUEST_TIMEOUT' })
  },

  async saveSuggestions(
    analysisId: string,
    suggestionIds: string[],
    idempotencyKey = crypto.randomUUID()
  ): Promise<VocabWord[]> {
    const response = await apiClient<{ items: VocabularyWordDto[] }>('/vocabulary/words', {
      method: 'POST',
      body: JSON.stringify({ analysisId, suggestionIds }),
      idempotencyKey,
    })
    return (response.items ?? []).map(toVocabWord)
  },

  async updateWord(
    wordId: string,
    changes: {
      meaning?: string
      example?: string
      sourceContext?: string
      expectedVersion: number
    }
  ): Promise<VocabWord> {
    const response = await apiClient<VocabularyWordDto>(`/vocabulary/words/${wordId}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
    return toVocabWord(response)
  },
}
