/*
 * Device checks shared by the site's always-on effects, so slower devices get a lighter page.
 *
 * Low-power mode: on devices with few cores, little memory or data saving switched on, decorative motion rests on
 * a still frame, shaders render once at a lower resolution, and costly CSS (backdrop blur, lasting GPU layers) is
 * dropped via `html[data-low-power]` (see index.css). Add `?lowpower=1` or `?lowpower=0` to any URL to force it
 * either way for the rest of the session.
 */

type NavigatorHints = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

const OVERRIDE_KEY = 'lowpower'
let lowPower: boolean | undefined

function readOverride(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(OVERRIDE_KEY)
    if (fromUrl === '1' || fromUrl === '0') {
      sessionStorage.setItem(OVERRIDE_KEY, fromUrl)
      return fromUrl
    }
    return sessionStorage.getItem(OVERRIDE_KEY)
  } catch {
    // Storage can be blocked (private modes, sandboxed iframes); the URL still works for this page.
    return null
  }
}

/*
 * Speed probe. Core count and memory say little about how fast a device really is (an old phone with a good core
 * count, a laptop on battery saver, a browser tab fighting a dozen others), so the page also times a short fixed
 * piece of work before it first renders. Fast devices finish it in a few milliseconds; the devices that need the
 * lighter page take many times longer. The result is kept for the session, so only the first load pays for it.
 */
const PROBE_KEY = 'cpuprobe'
/** A run at or over this many milliseconds marks the device as slow. */
export const SLOW_PROBE_MS = 12
const PROBE_RUNS = 3

function probeOnce(): number {
  const start = performance.now()
  let sum = 0
  for (let i = 0; i < 200000; i++) sum += Math.sqrt(i) * Math.sin(i)
  const rows: { a: number; b: string }[] = []
  for (let i = 0; i < 10000; i++) rows.push({ a: i, b: String(i) })
  rows.sort((p, q) => (p.b < q.b ? -1 : 1))
  // Read the results so the work can't be optimised away.
  return sum + rows.length < 0 ? Infinity : performance.now() - start
}

/** The fastest of a few timed runs, in ms. It stops at the first fast run, so quick devices pay for one. */
function probeCpuMs(): number {
  try {
    const cached = sessionStorage.getItem(PROBE_KEY)
    if (cached !== null && Number.isFinite(+cached)) return +cached
  } catch {
    // Storage can be blocked; the probe just runs again on the next load.
  }
  let best = Infinity
  for (let run = 0; run < PROBE_RUNS && best >= SLOW_PROBE_MS; run++) best = Math.min(best, probeOnce())
  try {
    sessionStorage.setItem(PROBE_KEY, best.toFixed(1))
  } catch {
    // See above.
  }
  return best
}

/** True on devices that should get the lighter version of the site. Decided once per page load. */
export function isLowPower(): boolean {
  if (lowPower !== undefined) return lowPower
  if (typeof window === 'undefined') return false
  const override = readOverride()
  if (override === '1' || override === '0') {
    lowPower = override === '1'
    return lowPower
  }
  const nav = navigator as NavigatorHints
  lowPower = Boolean(
    nav.connection?.saveData ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
      (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) ||
      probeCpuMs() >= SLOW_PROBE_MS,
  )
  return lowPower
}

/** Flags `<html>` so CSS can drop costly effects in low-power mode. Call once before the first render. */
export function applyLowPowerFlag() {
  if (isLowPower()) document.documentElement.dataset.lowPower = ''
}

/** True when the primary pointer is a mouse or trackpad. Touch screens have no cursor for anything to follow. */
export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * Calls `onChange(true)` while `el` is near the screen and its tab is showing, and `onChange(false)` when it
 * leaves or the tab is hidden, so animation loops can stop while nobody can see them. Returns a cleanup function.
 */
export function watchVisibility(el: Element, onChange: (visible: boolean) => void, rootMargin = '100px') {
  let onScreen = false
  let visible = false
  const update = () => {
    const next = onScreen && document.visibilityState === 'visible'
    if (next === visible) return
    visible = next
    onChange(next)
  }
  // root: document keeps the margin working when the page runs inside an iframe (as WorkCard does).
  const observer = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting
      update()
    },
    { root: document, rootMargin },
  )
  observer.observe(el)
  document.addEventListener('visibilitychange', update)
  return () => {
    observer.disconnect()
    document.removeEventListener('visibilitychange', update)
  }
}
