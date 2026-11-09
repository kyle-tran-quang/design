import { lazy, type ComponentType } from 'react'

type PageModule = { default: ComponentType }

// Case studies, loaded on demand. Routes not listed here fall back to the homepage. The `react-route-html`
// Vite plugin gives each route its own HTML entry (keep its `reactRoutes` list in sync).
const loaders: Record<string, () => Promise<PageModule>> = {
  '/work/mas-pricing': () => import('@/pages/work/MasPricing'),
  '/work/m-goat': () => import('@/pages/work/MGoat'),
  '/work/cardoctor': () => import('@/pages/work/CarDoctor'),
  '/work/unblok': () => import('@/pages/work/Unblok'),
  '/work/breadslice': () => import('@/pages/work/Breadslice'),
  '/work/cardoctor-ds': () => import('@/pages/work/CarDoctorDS'),
}

const lazyPages = Object.fromEntries(Object.entries(loaders).map(([route, load]) => [route, lazy(load)]))
const loaded = new Map<string, ComponentType>()
const pending = new Map<string, Promise<void>>()

export function isWorkPage(route: string) {
  return route in loaders
}

/** The page for `route`. Preloaded pages render straight away, without a Suspense fallback. */
export function workPage(route: string): ComponentType | undefined {
  return loaded.get(route) ?? lazyPages[route]
}

/** Fetches a case study's code ahead of time. Safe to call repeatedly. */
export function preloadWorkPage(route: string) {
  const load = loaders[route]
  if (!load) return Promise.resolve()
  let promise = pending.get(route)
  if (!promise) {
    promise = load().then((module) => {
      loaded.set(route, module.default)
    })
    promise.catch(() => pending.delete(route))
    pending.set(route, promise)
  }
  return promise
}
