import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'

type LazyWhenNearProps = {
  /** Loads the component's module, e.g. `() => import('./Card')`. Called once, when the placeholder nears the screen. */
  load: () => Promise<{ default: ComponentType }>
  /** Reserved space until the component arrives. Match its rough height so the page doesn't jump. */
  fallback?: ReactNode
  /** How far from the viewport the placeholder starts loading. Wide enough that the code is usually in before the
   * reader gets there, so the placeholder is rarely seen. */
  rootMargin?: string
  className?: string
}

/**
 * Renders a component whose code is fetched only when this spot is near the viewport.
 *
 * For heavy pieces far down a page (the MAS case study's two Framer exports are about 500 kB of source between
 * them) that would otherwise be downloaded, parsed and run on load, before anyone has scrolled to them.
 */
export default function LazyWhenNear({ load, fallback = null, rootMargin = '1200px 0px', className }: LazyWhenNearProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [Component, setComponent] = useState<ComponentType | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || Component) return
    let cancelled = false
    const start = () => {
      // Not React.lazy: that fetches when first rendered, and this spot has to start the fetch before it is on screen.
      load().then((module) => {
        if (!cancelled) setComponent(() => module.default)
      })
    }
    if (!('IntersectionObserver' in window)) {
      start()
      return () => {
        cancelled = true
      }
    }
    // root: document keeps the margin working when the page runs inside an iframe.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        start()
      },
      { root: document, rootMargin },
    )
    observer.observe(el)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [Component, load, rootMargin])

  return (
    <div ref={ref} className={className}>
      {Component ? <Component /> : fallback}
    </div>
  )
}
