import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { MarketingFooter } from '../../components/marketing/MarketingFooter'
import { MarketingNav } from '../../components/marketing/MarketingNav'

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} — Mimic`
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }, [title, description])
}

export function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-study-bg text-study-text selection:bg-teal-500/20">
      <MarketingNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  )
}
