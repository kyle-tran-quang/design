import { useSyncExternalStore } from 'react'
import { currentRoute } from './routes'

let route = currentRoute()
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

/** The route on screen. */
export function shownRoute() {
  return route
}

/**
 * The route on screen, for rendering. It changes only through `navigate` and `showCurrentUrl`, so a page
 * transition decides exactly when the page swaps, even after the address bar has already changed.
 */
export function useRoute() {
  return useSyncExternalStore(subscribe, shownRoute)
}

/** Moves to `href` without reloading the document. */
export function navigate(href: string) {
  window.history.pushState(null, '', href)
  showCurrentUrl()
}

/** Renders the page for the address bar's URL, e.g. after the back/forward buttons. */
export function showCurrentUrl() {
  route = currentRoute()
  listeners.forEach((listener) => listener())
}
