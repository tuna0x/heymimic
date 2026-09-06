import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Dashboard } from '../pages/Dashboard'
import { Vocab } from '../pages/Vocab'
import { Speaking } from '../pages/Speaking'
import { Progress } from '../pages/Progress'
import { MarketingLayout } from '../pages/marketing/MarketingLayout'
import { Landing } from '../pages/marketing/Landing'
import { Login } from '../pages/marketing/Login'
import { Signup } from '../pages/marketing/Signup'
import { About } from '../pages/marketing/About'
import { Contact } from '../pages/marketing/Contact'
import { BlogIndex } from '../pages/marketing/BlogIndex'
import { BlogPost } from '../pages/marketing/BlogPost'
import { ROUTES } from './routePaths'

export function AppRoutes() {
  return (
    <Routes>
      {/* Marketing Website Layout */}
      <Route element={<MarketingLayout />}>
        <Route path={ROUTES.HOME} element={<Landing />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.BLOG} element={<BlogIndex />} />
        <Route path={ROUTES.BLOG_POST} element={<BlogPost />} />
      </Route>

      {/* Authenticated Learning App Layout */}
      <Route element={<AppShell />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.APP} element={<Dashboard />} />
        <Route path={ROUTES.VOCAB} element={<Vocab />} />
        <Route path={ROUTES.SPEAKING} element={<Speaking />} />
        <Route path={ROUTES.PROGRESS} element={<Progress />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
