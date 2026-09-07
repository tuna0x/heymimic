import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { MarketingLayout } from '../pages/marketing/MarketingLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { RouteLoadingSpinner } from '../components/shared/RouteLoadingSpinner'
import { ROUTES } from './routePaths'

// Standalone Pages
const Onboarding = lazy(() => import('../pages/marketing/Onboarding').then((m) => ({ default: m.Onboarding })))
const NotFound = lazy(() => import('../pages/NotFound').then((m) => ({ default: m.NotFound })))

// Marketing Website Pages
const Landing = lazy(() => import('../pages/marketing/Landing').then((m) => ({ default: m.Landing })))
const Login = lazy(() => import('../pages/marketing/Login').then((m) => ({ default: m.Login })))
const Signup = lazy(() => import('../pages/marketing/Signup').then((m) => ({ default: m.Signup })))
const ForgotPassword = lazy(() => import('../pages/marketing/ForgotPassword').then((m) => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('../pages/marketing/ResetPassword').then((m) => ({ default: m.ResetPassword })))
const Terms = lazy(() => import('../pages/marketing/Terms').then((m) => ({ default: m.Terms })))
const Privacy = lazy(() => import('../pages/marketing/Privacy').then((m) => ({ default: m.Privacy })))
const About = lazy(() => import('../pages/marketing/About').then((m) => ({ default: m.About })))
const SpeakingMethod = lazy(() => import('../pages/marketing/SpeakingMethod').then((m) => ({ default: m.SpeakingMethod })))
const Contact = lazy(() => import('../pages/marketing/Contact').then((m) => ({ default: m.Contact })))
const BlogIndex = lazy(() => import('../pages/marketing/BlogIndex').then((m) => ({ default: m.BlogIndex })))
const BlogPost = lazy(() => import('../pages/marketing/BlogPost').then((m) => ({ default: m.BlogPost })))

// Authenticated Learning Pages
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Vocab = lazy(() => import('../pages/Vocab').then((m) => ({ default: m.Vocab })))
const VocabReview = lazy(() => import('../pages/VocabReview').then((m) => ({ default: m.VocabReview })))
const Speaking = lazy(() => import('../pages/Speaking').then((m) => ({ default: m.Speaking })))
const SpeakingHistory = lazy(() => import('../pages/SpeakingHistory').then((m) => ({ default: m.SpeakingHistory })))
const SpeakingSessionDetail = lazy(() => import('../pages/SpeakingSessionDetail').then((m) => ({ default: m.SpeakingSessionDetail })))
const SpeakingDialogue = lazy(() => import('../pages/SpeakingDialogue').then((m) => ({ default: m.SpeakingDialogue })))
const SessionSummary = lazy(() => import('../pages/SessionSummary').then((m) => ({ default: m.SessionSummary })))
const Listening = lazy(() => import('../pages/Listening').then((m) => ({ default: m.Listening })))
const Writing = lazy(() => import('../pages/Writing').then((m) => ({ default: m.Writing })))
const PeerPractice = lazy(() => import('../pages/PeerPractice').then((m) => ({ default: m.PeerPractice })))
const PeerRoom = lazy(() => import('../pages/PeerRoom').then((m) => ({ default: m.PeerRoom })))
const VideoLearning = lazy(() => import('../pages/VideoLearning').then((m) => ({ default: m.VideoLearning })))
const VideoShadowingLab = lazy(() => import('../pages/VideoShadowingLab').then((m) => ({ default: m.VideoShadowingLab })))
const Progress = lazy(() => import('../pages/Progress').then((m) => ({ default: m.Progress })))
const MistakeDetail = lazy(() => import('../pages/MistakeDetail').then((m) => ({ default: m.MistakeDetail })))
const Settings = lazy(() => import('../pages/Settings').then((m) => ({ default: m.Settings })))

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingSpinner />}>
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

        {/* Authenticated Learning App Layout guarded by ProtectedRoute */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
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
    </Suspense>
  )
}
