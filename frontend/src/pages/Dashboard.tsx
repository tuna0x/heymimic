import { Flame } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionLabel, Streak } from '../components/shared/UI'
import { TodaySessionFocus } from '../components/dashboard/TodaySessionFocus'
import { DailyPriorityGateways } from '../components/dashboard/DailyPriorityGateways'
import { FlagshipFeaturesBanner } from '../components/dashboard/FlagshipFeaturesBanner'
import { PersonalSkillPillarsGrid } from '../components/dashboard/PersonalSkillPillarsGrid'
import { WeeklyProgressWidget } from '../components/dashboard/WeeklyProgressWidget'
import { usePageMeta } from '../hook/usePageMeta'
import { useMimicStore } from '../store/useMimicStore'
import { ApiErrorNotice } from '../components/shared/ApiErrorNotice'
import { describeApiError, type ApiFailure } from '../service/api'
import { progressService, type ProgressOverview } from '../service/progressService'
import { speakingService, toSpeakingTopic } from '../service/speakingService'
import { studyService } from '../service/studyService'
import { vocabService } from '../service/vocabService'
import type { DailyRecommendation, ProgressDay, SpeakingTopic, VocabWord } from '../type'

export function Dashboard() {
  usePageMeta('Hôm nay — Phòng Luyện Tập HeyMimic', 'Phòng học cá nhân hóa hôm nay: từ vựng và bài luyện phản xạ nói 60–90 giây.')

  const navigate = useNavigate()
  const profile = useMimicStore((state) => state.profile)
  const activeStudySession = useMimicStore((state) => state.activeStudySession)
  const setActiveStudySession = useMimicStore((state) => state.setActiveStudySession)
  const getDailyRecommendation = useMimicStore((state) => state.getDailyRecommendation)
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([])
  const [speakingTopics, setSpeakingTopics] = useState<SpeakingTopic[]>([])
  const [overview, setOverview] = useState<ProgressOverview | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<ProgressDay[]>([])
  const [failure, setFailure] = useState<ApiFailure | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setFailure(null)
    Promise.all([
      progressService.getOverview(controller.signal),
      progressService.getDailyProgress(7, controller.signal),
      studyService.getActive(controller.signal),
      vocabService.getVocabWords({}, controller.signal),
      speakingService.getTopics(controller.signal),
    ])
      .then(([nextOverview, nextProgress, activeSession, words, topicDtos]) => {
        setOverview(nextOverview)
        setWeeklyProgress(nextProgress)
        setActiveStudySession(activeSession)
        setVocabWords(words)
        setSpeakingTopics(topicDtos.map(toSpeakingTopic))
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailure(describeApiError(error))
      })
    return () => controller.abort()
  }, [reloadKey, setActiveStudySession])

  const recommendation = useMemo<DailyRecommendation>(() => {
    if (!overview?.recommendation) return getDailyRecommendation()
    const kind = overview.recommendation.kind
    return {
      activityType:
        kind === 'vocabularyReview' ? 'vocab' : kind === 'mistake' ? 'mistake' : 'speaking',
      targetId: overview.recommendation.targetId ?? '',
      title: overview.recommendation.title,
      reason: 'Được đề xuất từ tiến độ học gần nhất của bạn.',
      estimatedMinutes: overview.dailyGoalMinutes,
    }
  }, [getDailyRecommendation, overview])
  const displayedProfile = useMemo(
    () => ({
      ...profile,
      streakDays: overview?.streakDays ?? profile.streakDays,
      totalMinutes: overview?.totalMinutes ?? profile.totalMinutes,
      dailyMinutesGoal: (overview?.dailyGoalMinutes ?? profile.dailyMinutesGoal) as
        | 5
        | 10
        | 15,
    }),
    [overview, profile]
  )
  const targetTopic = useMemo(
    () => speakingTopics.find((topic) => topic.id === recommendation.targetId) ?? speakingTopics[0],
    [recommendation.targetId, speakingTopics]
  )

  const todayStr = useMemo(() => {
    const now = new Date()
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(now)
  }, [])

  const handleStartTodaySession = async () => {
    setFailure(null)
    try {
      const topicId = targetTopic?.id
      const plannedSteps = [
        { kind: 'vocabulary' },
        ...(topicId ? [{ kind: 'speaking', topicId }] : []),
      ]
      const session = await studyService.start(plannedSteps)
      setActiveStudySession(session)
      navigate('/vocab/review')
    } catch (error) {
      setFailure(describeApiError(error))
    }
  }

  const handleResumeSession = () => {
    if (!activeStudySession) return
    if (activeStudySession.currentStep === 'speaking') {
      navigate('/speaking')
    } else {
      navigate('/vocab/review')
    }
  }

  return (
    <div className="space-y-8 text-left">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <SectionLabel>{todayStr}</SectionLabel>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-study-text tracking-tight mt-1">
            Chào {profile.name || 'bạn'}<span className="text-study-primary">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-study-text-muted mt-1.5 max-w-md leading-relaxed">
            {displayedProfile.streakDays > 0
              ? 'Một chút đều đặn hôm nay sẽ tạo nên sự tự tin tự nhiên khi trò chuyện sau này.'
              : 'Chào mừng bạn đến với Mimic. Hãy bắt đầu buổi học đầu tiên để tạo đà tự tin!'}
          </p>
        </div>

        {/* Dynamic Streak Card */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-study-surface border border-study-border shadow-xs">
          <div className="p-2.5 rounded-xl bg-study-accent-soft text-study-accent">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <Streak count={displayedProfile.streakDays} compact={false} />
            <span className="block text-[11px] text-study-text-muted mt-0.5">
              {displayedProfile.streakDays > 0 ? 'Đang duy trì nhịp học đều đặn' : 'Bắt đầu chuỗi học hôm nay'}
            </span>
          </div>
        </div>
      </div>

      {failure && (
        <ApiErrorNotice failure={failure} onRetry={() => setReloadKey((value) => value + 1)} />
      )}

      {/* Main Focus: Today's Study Session (4 States) */}
      <TodaySessionFocus
        activeStudySession={activeStudySession}
        targetTopic={targetTopic}
        recommendation={recommendation}
        profile={displayedProfile}
        onStartTodaySession={handleStartTodaySession}
        onResumeSession={handleResumeSession}
      />

      {/* Daily Priority Gateways: Vocab & Speaking */}
      <DailyPriorityGateways vocabWords={vocabWords} targetTopic={targetTopic} />

      {/* Flagship Interactive Features: Peer Practice & Video Shadowing */}
      <FlagshipFeaturesBanner />

      {/* 4 Pillars Ecosystem Grid: Listening, Dialogue, Collocations, Writing */}
      <PersonalSkillPillarsGrid />

      {/* Secondary Grid: Weekly Practice Rhythm & Insight */}
      <WeeklyProgressWidget progress={weeklyProgress} />
    </div>
  )
}
