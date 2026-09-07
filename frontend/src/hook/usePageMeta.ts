import { useEffect } from 'react'

export interface PageMetaProps {
  title: string
  description: string
  keywords?: string
  canonicalPath?: string
  ogType?: 'website' | 'article'
  schemaJson?: Record<string, unknown>
}

export function usePageMeta(
  titleOrProps: string | PageMetaProps,
  fallbackDescription?: string
) {
  const props: PageMetaProps =
    typeof titleOrProps === 'string'
      ? { title: titleOrProps, description: fallbackDescription ?? '' }
      : titleOrProps

  useEffect(() => {
    // 1. Page Title
    const fullTitle = props.title.includes('HeyMimic')
      ? props.title
      : `${props.title} — HeyMimic`
    document.title = fullTitle

    // Helper to set or update meta tag
    const setMeta = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${nameAttr}="${attrValue}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(nameAttr, attrValue)
        document.head.appendChild(el)
      }
      el.content = content
    }

    // 2. Core SEO & GEO Description
    if (props.description) {
      setMeta('name', 'description', props.description)
      setMeta('property', 'og:description', props.description)
      setMeta('name', 'twitter:description', props.description)
    }

    // 3. OpenGraph Title
    setMeta('property', 'og:title', fullTitle)
    setMeta('name', 'twitter:title', fullTitle)

    // 4. OpenGraph Type
    if (props.ogType) {
      setMeta('property', 'og:type', props.ogType)
    }

    // 5. Keywords
    if (props.keywords) {
      setMeta('name', 'keywords', props.keywords)
    }

    // 6. Canonical URL
    const canonicalPath = props.canonicalPath ?? window.location.pathname
    const canonicalUrl = `https://heymimic.com${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('name', 'twitter:url', canonicalUrl)

    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.rel = 'canonical'
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.href = canonicalUrl

    // 7. Page Specific JSON-LD Schema (for AI Search Engines / GEO)
    if (props.schemaJson) {
      let scriptTag = document.getElementById('page-jsonld') as HTMLScriptElement | null
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.id = 'page-jsonld'
        scriptTag.type = 'application/ld+json'
        document.head.appendChild(scriptTag)
      }
      scriptTag.text = JSON.stringify(props.schemaJson)
    }

    return () => {
      // Clean up page-specific JSON-LD on unmount
      const scriptTag = document.getElementById('page-jsonld')
      if (scriptTag) scriptTag.remove()
    }
  }, [props.title, props.description, props.keywords, props.canonicalPath, props.ogType, props.schemaJson])
}
