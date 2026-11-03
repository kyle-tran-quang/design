import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

/** Matches Tailwind's `lg` breakpoint, where the homepage switches to a sideways track. */
export const HORIZONTAL_QUERY = '(min-width: 64rem)'
/** The horizontal layout is drawn for a 900px tall viewport and zoomed to fit others. */
const DESIGN_HEIGHT = 900
const MIN_ZOOM = 0.6
const MAX_ZOOM = 1.35
const LINE_HEIGHT_PX = 16
const ARROW_STEP_PX = 140

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable="true"]')
}

/**
 * Turns a scroll container into a horizontal track on large screens:
 * vertical wheel and keyboard input move it sideways, and `--z` holds the zoom
 * that fits the 900px-tall layout to the current viewport height.
 */
export function useHorizontalScroll(ref: RefObject<HTMLElement | null>) {
  const [horizontal, setHorizontal] = useState(() => window.matchMedia(HORIZONTAL_QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(HORIZONTAL_QUERY)
    const update = () => setHorizontal(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // A layout effect, so the page scroll lock below is released while the homepage unmounts, before the next
  // page's layout effects run. The case study cinematics save `html`'s overflow on mount and put it back when
  // they finish; released any later, they would save this lock and leave the case study unscrollable.
  useLayoutEffect(() => {
    const track = ref.current
    if (!track || !horizontal) return

    const fit = () => {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, window.innerHeight / DESIGN_HEIGHT))
      track.style.setProperty('--z', zoom.toFixed(4))
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return // pinch-to-zoom
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX
      if (!delta) return
      const unit = event.deltaMode === 1 ? LINE_HEIGHT_PX : event.deltaMode === 2 ? track.clientWidth : 1
      event.preventDefault()
      track.scrollLeft += delta * unit
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || isEditable(event.target)) return
      const page = track.clientWidth * 0.85
      let left: number
      switch (event.key) {
        case 'ArrowDown':
          left = track.scrollLeft + ARROW_STEP_PX
          break
        case 'ArrowUp':
          left = track.scrollLeft - ARROW_STEP_PX
          break
        case 'PageDown':
          left = track.scrollLeft + page
          break
        case 'PageUp':
          left = track.scrollLeft - page
          break
        case ' ':
          if (event.target instanceof HTMLElement && event.target.closest('a, button')) return
          left = track.scrollLeft + (event.shiftKey ? -page : page)
          break
        case 'Home':
          left = 0
          break
        case 'End':
          left = track.scrollWidth
          break
        default:
          return
      }
      event.preventDefault()
      track.scrollTo({ left, behavior: 'smooth' })
    }

    fit()
    // The page itself must not scroll while the track does.
    const root = document.documentElement
    root.style.overflow = 'hidden'
    root.style.overscrollBehavior = 'none'
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', fit)
    window.addEventListener('keydown', onKeyDown)
    track.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      root.style.overflow = ''
      root.style.overscrollBehavior = ''
      document.body.style.overflow = ''
      window.removeEventListener('resize', fit)
      window.removeEventListener('keydown', onKeyDown)
      track.removeEventListener('wheel', onWheel)
      track.style.removeProperty('--z')
    }
  }, [horizontal, ref])

  return horizontal
}

/** Smoothly brings a section into view on either axis. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start', inline: 'start' })
}
