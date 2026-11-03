// Shared by the card-page curtain and the case-page cinematic (Cinematic.tsx), in the Make app
// and in the Framer exports. Host-agnostic: plain DOM, no React, no CSS imports.

export const CINEMATIC = {
  storageKey: 'cinematic:handoff',
  curtainId: 'cinematic-curtain',
  /** A handoff older than this is ignored (a stale tab, a slow network). */
  flagMaxAge: 5000,
  /** The curtain removes itself this long after it lands if no cinematic took it over. */
  curtainSafety: 2500,
  zIndex: 2147483000,
  dark: '#0E1116',
  /** The design frame's own background (#ECECEC), so the finished cards sit on it exactly as in Figma. */
  light: '#ECECEC',
  /** Fill behind the mockup, fading in with the zoom. Transparent by default: the three cards carry their own fills,
   * and a solid slab would show in the gaps between them. Set it in Framer (Fill) to frame the row. */
  fill: 'rgba(255, 255, 255, 0)',
  slideEase: 'cubic-bezier(0.76, 0, 0.24, 1)',
  morphEase: 'cubic-bezier(0.65, 0, 0.35, 1)',
  // Timeline (ms). Total from click to readable content is about 3.2s:
  // curtain 500 + beat 150 + morph ~1.6s (3 regions 260ms apart, 950ms each) + hold 150 + slide out 700.
  // The zoom holds while the blueprint draws and runs quickly at the end, landing as the last region turns hi-fi.
  curtainIn: 500,
  beat: 150,
  regionDuration: 950,
  regionStagger: 260,
  regions: 3,
  hold: 150,
  slideOut: 700,
  /** The runtime's reveal (hi-fi) phase starts at this fraction of a region's duration (ui-generation.js PH.reveal). */
  revealAt: 0.74,
  /** The zoom starts this long before the last region's reveal, and takes zoomDuration. */
  zoomLead: 250,
  zoomDuration: 600,
  /**
   * Screen width as a share of the curtain: while the blueprint draws, and once zoomed in (capped by the container).
   * Below the tablet breakpoint the zoomed-in screen fills the padded width instead, keeping this start:end ratio.
   */
  startWidth: 0.5,
  endWidth: 0.7,
  /** The background starts turning light this far into the morph, as the hi-fi screen starts to land. */
  lightFrom: 0.35,
  // Mockup container
  maxWidth: 1920,
  pad: { desktop: 120, tablet: 64, mobile: 16 },
  /** Framer's default breakpoints: desktop from 1200px, tablet from 810px, mobile below. */
  breakpoints: { desktop: 1200, tablet: 810 },
}

/** The runtime's whole skeleton run is about duration x 1.09; regions start regionStagger apart. */
export function morphDuration(
  regionDuration: number,
  regions: number = CINEMATIC.regions,
  stagger: number = CINEMATIC.regionStagger,
) {
  return (regions - 1) * stagger + regionDuration * 1.09
}

/** When the zoom starts, measured from the first region's start: just before the last region's reveal. */
export function zoomStart(
  regionDuration: number,
  regions: number = CINEMATIC.regions,
  stagger: number = CINEMATIC.regionStagger,
) {
  const lastReveal =
    (regions - 1) * stagger + regionDuration * CINEMATIC.revealAt
  return Math.max(0, lastReveal - CINEMATIC.zoomLead)
}

export function normalizePath(path: string) {
  const trimmed = path.trim().replace(/[?#].*$/, '')
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
}

export function parsePaths(list: string) {
  return list
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map(normalizePath)
}

export type Handoff = { path: string; t: number }

export function writeHandoff(path: string) {
  try {
    sessionStorage.setItem(
      CINEMATIC.storageKey,
      JSON.stringify({ path: normalizePath(path), t: Date.now() }),
    )
  } catch {
    // Storage blocked (private mode, sandboxed iframe): the case page simply shows without the cinematic.
  }
}

/** Reads and clears the handoff. Returns it only if it is fresh and for `path`. */
export function takeHandoff(path: string): Handoff | null {
  let flag: Handoff | null = null
  try {
    const raw = sessionStorage.getItem(CINEMATIC.storageKey)
    sessionStorage.removeItem(CINEMATIC.storageKey)
    flag = raw ? JSON.parse(raw) as Handoff : null
  } catch {
    return null
  }
  if (!flag || typeof flag.path !== 'string' || typeof flag.t !== 'number')
    return null
  if (Date.now() - flag.t > CINEMATIC.flagMaxAge) return null
  return flag.path === normalizePath(path) ? flag : null
}

export function prefersReducedMotion() {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function removeCurtain() {
  if (typeof document === 'undefined') return
  document.getElementById(CINEMATIC.curtainId)?.remove()
}

/**
 * The dark panel that slides up over the card's page. A plain DOM node on <body>, not React-managed, so it
 * survives the page change; the case page's cinematic removes it once its own identical frame is on screen.
 */
export function showCurtain(color: string, duration: number) {
  removeCurtain()
  const el = document.createElement('div')
  el.id = CINEMATIC.curtainId
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: String(CINEMATIC.zIndex),
    background: color,
    transform: 'translate3d(0, 100%, 0)',
    willChange: 'transform',
  })
  document.body.appendChild(el)
  el.getBoundingClientRect() // commit the start position before transitioning
  el.style.transition = `transform ${duration}ms ${CINEMATIC.slideEase}`
  el.style.transform = 'translate3d(0, 0, 0)'
  window.setTimeout(() => el.remove(), duration + CINEMATIC.curtainSafety)
  return el
}

export type InterceptOptions = {
  paths: string[]
  color: string
  duration: number
  /** Continues the navigation once the curtain has landed. Default: re-click the link so the host router handles it. */
  navigate?: (anchor: HTMLAnchorElement, path: string) => void
}

const reclick = (anchor: HTMLAnchorElement) => {
  anchor.dataset.cinematicBypass = '1'
  anchor.click()
  window.setTimeout(() => delete anchor.dataset.cinematicBypass, 0)
}

/**
 * Catches plain left clicks on links to `paths` (capture phase, before the host router), plays the curtain,
 * writes the handoff, then lets the navigation continue. Modified clicks and new-tab links pass straight through.
 * Returns the cleanup.
 */
export function interceptCardClicks({
  paths,
  color,
  duration,
  navigate = reclick,
}: InterceptOptions) {
  const targets = new Set(paths.map(normalizePath))
  let busy = false

  const onClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const anchor = (event.target as Element | null)?.closest?.(
      'a[href]',
    ) as HTMLAnchorElement | null
    if (!anchor || anchor.dataset.cinematicBypass) return
    if (anchor.target && anchor.target !== '_self') return
    if (anchor.hasAttribute('download')) return
    const url = new URL(anchor.href, location.href)
    if (url.origin !== location.origin) return
    const path = normalizePath(url.pathname)
    if (!targets.has(path)) return

    event.preventDefault()
    event.stopPropagation()
    if (busy) return
    busy = true
    writeHandoff(path)

    const go = () => {
      busy = false
      navigate(anchor, path)
    }
    if (prefersReducedMotion()) return go()
    showCurtain(color, duration)
    window.setTimeout(go, duration)
  }

  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export function containerCss(
  scope: string,
  pad: { desktop: number; tablet: number; mobile: number },
) {
  const { desktop, tablet } = CINEMATIC.breakpoints
  return [
    `${scope}{--cin-pad:${pad.mobile}px}`,
    `@media (min-width:${tablet}px){${scope}{--cin-pad:${pad.tablet}px}}`,
    `@media (min-width:${desktop}px){${scope}{--cin-pad:${pad.desktop}px}}`,
  ].join("\n")
}
