import { asset } from '@/lib/asset'
import manifest from './media.json'

export type MediaKey = keyof typeof manifest.files

/**
 * CarDoctor DS images still on Framer's CDN. `node scripts/fetch-cardoctor-media.mjs cardoctor-ds` downloads every
 * file into public/assets/images/cardoctor-ds/ and sets `selfHosted`, after which these resolve to the local copies.
 */
export function media(key: MediaKey) {
  const { file, url } = manifest.files[key]
  return manifest.selfHosted ? asset(`assets/images/cardoctor-ds/${file}`) : url
}
