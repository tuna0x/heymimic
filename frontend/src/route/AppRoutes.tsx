import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Dashboard } from '../pages/Dashboard'
import { Vocab } from '../pages/Vocab'
import { VocabReview } from '../pages/VocabReview'
import { Speaking } from '../pages/Speaking'
import { SpeakingHistory } from '../pages/SpeakingHistory'
import { SpeakingSessionDetail } from '../pages/SpeakingSessionDetail'
import { SessionSummary } from '../pages/SessionSummary'
import { Progress } from '../pages/Progress'
import { MistakeDetail } from '../pages/MistakeDetail'
import { Settings } from '../pages/Settings'
import { Listening } from '../pages/Listening'
import { SpeakingDialogue } from '../pages/SpeakingDialogue'
import { Writing } from '../pages/Writing'
import { PeerPractice } from '../pages/PeerPractice'
import { PeerRoom } from '../pages/PeerRoom'
import { VideoLearning } from '../pages/VideoLearning'
import { VideoShadowingLab } from '../pages/VideoShadowingLab'
import { NotFound } from '../pages/NotFound'

import { MarketingLayout } from '../pages/marketing/MarketingLayout'
import { Landing } from '../pages/marketing/Landing'
import { Login } from '../pages/marketing/Login'
import { Signup } from '../pages/marketing/Signup'
import { Onboarding } from '../pages/marketing/Onboarding'
import { ForgotPassword } from '../pages/marketing/ForgotPassword'
import { ResetPassword } from '../pages/marketing/ResetPassword'
import { Terms } from '../pages/marketing/Terms'
import { Privacy } from '../pages/marketing/Privacy'
import { About } from '../pages/marketing/About'
import { SpeakingMethod } from '../pages/marketing/SpeakingMethod'
import { Contact } from '../pages/marketing/Contact'
import { BlogIndex } from '../pages/marketing/BlogIndex'
import { BlogPost } from '../pages/marketing/BlogPost'
import { ROUTES } from './routePaths'

export function AppRoutes() {
  return (
    <Routes>
      {/* Standalone Onboarding Flow */}
      <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />

      {/* Marketing Website Layout */}
      <Route element={<MarketingLayout />}>
        <Route path={ROUTES.HOME} element={<Landing />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={ROUTES.TERMS} element={<Terms />} />
        <Route path={ROUTES.PRIVACY} element={<Privacy />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.SPEAKING_METHOD} element={<SpeakingMethod />} />
        <Route path="/luyen-noi" element={<Navigate to={ROUTES.SPEAKING_METHOD} replace />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.BLOG} element={<BlogIndex />} />
        <Route path={ROUTES.BLOG_POST} element={<BlogPost />} />
      </Route>

      {/* Authenticated Learning App Layout */}
      <Route element={<AppShell />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.APP} element={<Dashboard />} />
        <Route path={ROUTES.VOCAB} element={<Vocab />} />
        <Route path={ROUTES.VOCAB_REVIEW} element={<VocabReview />} />
        <Route path={ROUTES.SPEAKING} element={<Speaking />} />
        <Route path={ROUTES.SPEAKING_HISTORY} element={<SpeakingHistory />} />
        <Route path={ROUTES.SPEAKING_SESSION_DETAIL} element={<SpeakingSessionDetail />} />
        <Route path={ROUTES.SPEAKING_DIALOGUE} element={<SpeakingDialogue />} />
        <Route path={ROUTES.SESSION_SUMMARY} element={<SessionSummary />} />
        <Route path={ROUTES.LISTENING} element={<Listening />} />
        <Route path={ROUTES.WRITING} element={<Writing />} />
        <Route path={ROUTES.PEER_PRACTICE} element={<PeerPractice />} />
        <Route path={ROUTES.PEER_ROOM} element={<PeerRoom />} />
        <Route path={ROUTES.VIDEO_LEARNING} element={<VideoLearning />} />
        <Route path={ROUTES.VIDEO_LAB} element={<VideoShadowingLab />} />
        <Route path={ROUTES.PROGRESS} element={<Progress />} />
        <Route path={ROUTES.MISTAKE_DETAIL} element={<MistakeDetail />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
