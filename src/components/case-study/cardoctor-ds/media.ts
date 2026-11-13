import { asset } from '@/lib/asset'
import manifest from './media.json'

export type MediaKey = keyof typeof manifest.files

/** CarDoctor DS case study images, self-hosted in public/assets/images/cardoctor-ds/. */
export function media(key: MediaKey) {
  return asset(`assets/images/cardoctor-ds/${manifest.files[key].file}`)
}
