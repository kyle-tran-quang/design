import { asset } from '@/lib/asset'
import manifest from './media.json'

export type MediaKey = keyof typeof manifest.files

/**
 * CarDoctor media still on Framer's CDN. `node scripts/fetch-cardoctor-media.mjs` downloads every file into
 * public/assets/images/cardoctor/ and sets `selfHosted`, after which these resolve to the local copies.
 */
export function media(key: MediaKey) {
  const { file, url } = manifest.files[key]
  return manifest.selfHosted ? asset(`assets/images/cardoctor/${file}`) : url
}

/** Media already in public/: the four images the static export localised, and the cinematic's SVGs. */
export const local = {
  /** The header mockup extended to the hero band's 1392:476 on its own #E3E2DC background. */
  hero: asset('assets/images/cardoctor-hero.webp'),
  introduction: asset('assets/images/cardoctor-challenge-solution.webp'),
  research: asset('assets/images/cardoctor-research.webp'),
  cardsCarousel: asset('assets/images/shared-cards-carousel-anim.mp4'),
  cardsCarouselPoster: asset('assets/images/shared-cards-carousel-anim-poster.webp'),
  upNextUnblok: asset('assets/images/shared-card-unblok-1024w.avif'),
}

export const cinematicAsset = (name: string) =>
  asset(`assets/images/cardoctor/cinematic/${name}`)
