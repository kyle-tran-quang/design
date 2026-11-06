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
      (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4),
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
