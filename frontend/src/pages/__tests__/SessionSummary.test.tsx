import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { progressService } from '../../service/progressService'
import { reviewService } from '../../service/reviewService'
import { speakingService } from '../../service/speakingService'
import { studyService } from '../../service/studyService'
import { SessionSummary } from '../SessionSummary'

vi.mock('../../service/studyService', () => ({
  studyService: { get: vi.fn(), complete: vi.fn() },
}))
vi.mock('../../service/reviewService', () => ({
  reviewService: { get: vi.fn() },
}))
vi.mock('../../service/speakingService', () => ({
  speakingService: { getSession: vi.fn() },
}))
vi.mock('../../service/progressService', () => ({
  progressService: { getOverview: vi.fn() },
}))

function renderSummary() {
  return render(
    <MemoryRouter initialEntries={['/session/study-1/summary']}>
      <Routes>
        <Route path="/session/:sessionId/summary" element={<SessionSummary />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SessionSummary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not complete an unfinished study session as a page side effect', async () => {
    vi.mocked(studyService.get).mockResolvedValueOnce({
      id: 'study-1',
      status: 'inProgress',
      currentStep: 'speaking',
      plannedSteps: ['vocab', 'speaking'],
      startedAt: '2026-09-08T08:00:00Z',
      version: 3,
    })

    renderSummary()

    expect(await screen.findByText('Phiên học chưa hoàn tất')).toBeInTheDocument()
    expect(studyService.complete).not.toHaveBeenCalled()
    expect(reviewService.get).not.toHaveBeenCalled()
    expect(speakingService.getSession).not.toHaveBeenCalled()
  })

  it('loads child resources by the IDs linked from a completed study', async () => {
    vi.mocked(studyService.get).mockResolvedValueOnce({
      id: 'study-1',
      status: 'completed',
      currentStep: 'summary',
      plannedSteps: ['vocab', 'speaking'],
      reviewSessionId: 'review-1',
      speakingSessionId: 'speaking-1',
      startedAt: '2026-09-08T08:00:00Z',
      completedAt: '2026-09-08T08:10:00Z',
      version: 4,
    })
    vi.mocked(reviewService.get).mockResolvedValueOnce({
      id: 'review-1',
      status: 'completed',
      currentIndex: 2,
      version: 3,
      items: [
        { id: 'item-1', position: 0, word: { id: 'word-1' } },
        { id: 'item-2', position: 1, word: { id: 'word-2' } },
      ],
    } as Awaited<ReturnType<typeof reviewService.get>>)
    vi.mocked(speakingService.getSession).mockResolvedValueOnce({
      id: 'speaking-1',
      topicId: 'topic-1',
      title: 'Sprint update',
      prompt: 'Share progress',
      duration: '01:05',
      date: '2026-09-08T08:09:00Z',
      score: 84,
      transcript: 'I completed the API.',
      feedback: [],
      status: 'completed',
    })
    vi.mocked(progressService.getOverview).mockResolvedValueOnce({
      totalMinutes: 10,
      streakDays: 2,
      todaySeconds: 600,
      dailyGoalMinutes: 10,
      pendingProjection: false,
      recommendation: {
        kind: 'speaking',
        title: 'Practice another work topic',
        availableCount: 3,
      },
    })

    renderSummary()

    expect(await screen.findByText('Bạn đã hoàn thành buổi học!')).toBeInTheDocument()
    expect(screen.getByText('2 từ')).toBeInTheDocument()
    expect(screen.getByText('84/100')).toBeInTheDocument()
    expect(screen.getByText('Practice another work topic')).toBeInTheDocument()
    expect(reviewService.get).toHaveBeenCalledWith('review-1', expect.any(AbortSignal))
    expect(speakingService.getSession).toHaveBeenCalledWith(
      'speaking-1',
      expect.any(AbortSignal)
    )
  })
})
