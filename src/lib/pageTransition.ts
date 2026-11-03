import { flushSync } from 'react-dom'
import { navigate, showCurrentUrl, shownRoute } from './navigation'
import { isWorkPage, preloadWorkPage } from './pages'
import { caseStudies, currentRoute, routeOf } from './routes'

/*
 * Page transitions between the homepage and the case studies, and between case studies (keyframes in index.css):
 * - home-to-work: the homepage zooms out and slides up, then the case study slides in from below.
 * - work-to-home: the reverse. The case study slides down and away, then the homepage slides down into
 *   place and zooms back in.
 * - work-next / work-prev: the case study zooms out and slides away sideways, and the other one slides in from
 *   the opposite side. Direction follows the case study order: later studies come in from the right, earlier
 *   ones from the left, so the back button naturally plays it in reverse. The logo stays fixed throughout.
 * A View Transition animates snapshots of the whole screen, so the case pages' cinematics, which mount on
 * <body>, travel with their page. Without View Transition support, or with reduced motion, pages simply swap.
 */
export type Transition = 'home-to-work' | 'work-to-home' | 'work-next' | 'work-prev'

const orderOf = (route: string) => caseStudies.findIndex((study) => route === `/work/${study.slug}`)

function transitionBetween(from: string, to: string): Transition | null {
  if (from === '/' && isWorkPage(to)) return 'home-to-work'
  if (isWorkPage(from) && to === '/') return 'work-to-home'
  if (isWorkPage(from) && isWorkPage(to) && from !== to) return orderOf(to) < orderOf(from) ? 'work-prev' : 'work-next'
  return null
}

let arrival: Transition | null = null

/** How the page on screen was reached; null after a full page load. */
export function arrivalTransition() {
  return arrival
}

const swapListeners = new Set<() => void>()

/** Calls `listener` just before the page on screen is swapped out, while it can still be measured. */
export function beforeSwap(listener: () => void) {
  swapListeners.add(listener)
  return () => {
    swapListeners.delete(listener)
  }
}

/** Swaps to `to` (with `update`), animated when it is a home <-> case study move. */
async function swapTo(to: string, update: () => void, animate = true) {
  const kind = transitionBetween(shownRoute(), to)
  // The incoming page must render in one go, or the transition would capture an empty Suspense fallback.
  if (isWorkPage(to)) await preloadWorkPage(to)

  const swap = () => {
    swapListeners.forEach((listener) => listener())
    arrival = kind
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    flushSync(update)
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!kind || !animate || reduced || typeof document.startViewTransition !== 'function') {
    swap()
    return
  }

  const html = document.documentElement
  html.dataset.pageTransition = kind
  const transition = document.startViewTransition(swap)
  // An interrupted transition (Back pressed mid-way, a new one started, the tab hidden) rejects `ready` with an
  // AbortError even though the page still swaps. Left unhandled, it surfaced as an uncaught runtime error.
  transition.ready.catch(() => {})
  try {
    // Rejects only if the swap itself failed, so the callers can fall back to a full page load.
    await transition.updateCallbackDone
    await transition.finished.catch(() => {})
  } finally {
    if (html.dataset.pageTransition === kind) delete html.dataset.pageTransition
  }
}

/** The in-app route a link points to, if the link would open in this tab. */
function appLink(target: EventTarget | null) {
  const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null
  if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return null
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return null
  return { route: routeOf(url.pathname), href: `${url.pathname}${url.search}${url.hash}` }
}

/**
 * Handles links between the homepage and the case studies, and between case studies, in-app, along with the
 * back/forward buttons between them. Every other link keeps its normal full page load. Returns the cleanup.
 */
export function installPageTransitions() {
  let busy = false

  // Fetch a case study's code on intent so the click can start the transition straight away.
  const preload = (event: Event) => {
    const link = appLink(event.target)
    if (link && isWorkPage(link.route) && transitionBetween(shownRoute(), link.route))
      preloadWorkPage(link.route).catch(() => {})
  }

  // Bubble phase, so components that cancel a click (the case page logo's first tap on touch) are respected.
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    const link = appLink(event.target)
    if (!link || !transitionBetween(shownRoute(), link.route)) return
    event.preventDefault()
    if (busy) return
    busy = true
    swapTo(link.route, () => navigate(link.href))
      .catch(() => window.location.assign(link.href))
      .finally(() => {
        busy = false
      })
  }

  const onPopState = (event: PopStateEvent) => {
    const to = currentRoute()
    if (to === shownRoute()) return
    // Browsers that already animate the back-swipe gesture themselves flag it; don't animate twice.
    const animate = !(event as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition
    swapTo(to, showCurrentUrl, animate).catch(() => window.location.reload())
  }

  // Scroll positions are restored by hand (the homepage remembers its own), not mid-transition by the browser.
  const restoration = window.history.scrollRestoration
  window.history.scrollRestoration = 'manual'
  document.addEventListener('pointerover', preload)
  document.addEventListener('focusin', preload)
  document.addEventListener('click', onClick)
  window.addEventListener('popstate', onPopState)
  return () => {
    window.history.scrollRestoration = restoration
    document.removeEventListener('pointerover', preload)
    document.removeEventListener('focusin', preload)
    document.removeEventListener('click', onClick)
    window.removeEventListener('popstate', onPopState)
  }
}
