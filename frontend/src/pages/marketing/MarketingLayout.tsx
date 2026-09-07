import { Outlet, useLocation } from 'react-router-dom'
import { AcousticAnnouncementBanner } from '../../components/marketing/AcousticAnnouncementBanner'
import { MarketingFooter } from '../../components/marketing/MarketingFooter'
import { MarketingNav } from '../../components/marketing/MarketingNav'
import { BackToTop } from '../../components/shared/BackToTop'

export { usePageMeta } from '../../hook/usePageMeta'

export function MarketingLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-study-bg text-study-text selection:bg-study-primary/20">
      <AcousticAnnouncementBanner />
      <MarketingNav />
      <main className="flex-1">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>
      <MarketingFooter />
      <BackToTop />
    </div>
  )
}
