import { useEffect, useRef, useState } from 'react'

interface ScrollRevealOptions {
  /** Intersection threshold (0–1). Default 0.15 */
  threshold?: number
  /** Delay in ms before the reveal animation starts */
  delay?: number
  /** Only trigger once (default true) */
  once?: boolean
  /** Root margin for earlier/later triggering */
  rootMargin?: string
}

/**
 * Custom hook that uses Intersection Observer to detect when an element
 * enters the viewport, enabling smooth scroll-triggered reveal animations.
 *
 * Returns a ref to attach to the target element, and a boolean `isVisible`.
 *
 * Usage:
 * ```tsx
 * const [ref, isVisible] = useScrollReveal({ delay: 100 })
 * <div ref={ref} className={`scroll-reveal ${isVisible ? 'visible' : ''}`}>
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.15, delay = 0, once = true, rootMargin = '0px 0px -40px 0px' } = options
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay)
          } else {
            setIsVisible(true)
          }
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, delay, once, rootMargin])

  return [ref, isVisible]
}

/**
 * Hook for animated number counting.
 * Counts from 0 to `target` over `duration` ms when `shouldStart` is true.
 */
export function useCountUp(target: number, shouldStart: boolean, duration = 1800): number {
  const [count, setCount] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!shouldStart || hasStarted.current) return
    hasStarted.current = true

    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }
    requestAnimationFrame(step)
  }, [shouldStart, target, duration])

  return count
}
