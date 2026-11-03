import { asset } from './asset'

/** Case studies in menu order, matching the homepage case study order. */
export const caseStudies = [
  { name: 'Maximo Pricing Estimator', slug: 'mas-pricing' },
  { name: 'CarDoctor', slug: 'cardoctor' },
  { name: 'Unblok', slug: 'unblok' },
  { name: 'CarDS', slug: 'cardoctor-ds' },
  { name: 'Breadslice', slug: 'breadslice' },
] as const

export const homeHref = asset('')
export const workHref = (slug: string) => asset(`work/${slug}`)

/** Current path relative to the deploy base, without `.html`, `/index.html` or a trailing slash. */
export function currentRoute() {
  return routeOf(window.location.pathname)
}

/** A pathname relative to the deploy base, normalised the same way as `currentRoute`. */
export function routeOf(pathname: string) {
  const base = import.meta.env.BASE_URL
  let path = pathname
  if (path.startsWith(base)) path = `/${path.slice(base.length)}`
  return path.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/'
}
