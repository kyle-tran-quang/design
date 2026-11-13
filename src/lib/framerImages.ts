import { asset } from '@/lib/asset'

/*
 * Case study images that used to load from Framer's CDN, saved into public/assets/images/framer/.
 *
 * Framer's CDN resizes each image (`scale-down-to`) and sends AVIF or WebP to browsers that accept them, which is far
 * lighter than the PNG it holds. These copies are saved in the lighter of the two formats for each size, so the
 * extension varies per file. The key is `<id>|<original extension>|<size>`; size is empty for the full-size file.
 */
const FILES: Record<string, string> = {
  '1XIO9cO6aFmBWUda0u4LMLMY|png|': '1XIO9cO6aFmBWUda0u4LMLMY-full.avif',
  '3wEBSjJAO8KCGZK6i25APSUm8s|png|2048': '3wEBSjJAO8KCGZK6i25APSUm8s-2048.avif',
  '4LtD3SH4g6G29K284O3ACJsSVsw|png|1024': '4LtD3SH4g6G29K284O3ACJsSVsw-1024.avif',
  '67fBhZluRKWHeM3y4nCDOx0C8fQ|png|1024': '67fBhZluRKWHeM3y4nCDOx0C8fQ-1024.avif',
  '75arC3L3SCsHoOehSk2GDa32Dic|png|1024': '75arC3L3SCsHoOehSk2GDa32Dic-1024.avif',
  '75arC3L3SCsHoOehSk2GDa32Dic|png|2048': '75arC3L3SCsHoOehSk2GDa32Dic-2048.webp',
  '8dPf8mz75Fw5O3PkmjpXFckbjGM|png|2048': '8dPf8mz75Fw5O3PkmjpXFckbjGM-2048.avif',
  '8qKcy1iCX3GaoMGyjEfoOzEqoxk|png|1024': '8qKcy1iCX3GaoMGyjEfoOzEqoxk-1024.avif',
  'CqViqNphA2rLKwftcHnzUmXnMKM|png|1024': 'CqViqNphA2rLKwftcHnzUmXnMKM-1024.avif',
  'FyTAU8HLKGXezWkUv8Ikc7YQoLY|png|1024': 'FyTAU8HLKGXezWkUv8Ikc7YQoLY-1024.avif',
  'ItSBROmOrrfRZjtU0OX0cfR0wA|png|1024': 'ItSBROmOrrfRZjtU0OX0cfR0wA-1024.avif',
  'JftjgYlQvDvGKYlfckwTPE6lS8|gif|900': 'JftjgYlQvDvGKYlfckwTPE6lS8-900.gif',
  'Ji3vIgrEXsgnWdqwTdCxSlC7g8|png|1024': 'Ji3vIgrEXsgnWdqwTdCxSlC7g8-1024.avif',
  'JyqbsF8B8vEHsG3O86VEkljlPI|png|1024': 'JyqbsF8B8vEHsG3O86VEkljlPI-1024.png',
  'JyqbsF8B8vEHsG3O86VEkljlPI|png|2048': 'JyqbsF8B8vEHsG3O86VEkljlPI-2048.png',
  'LJWDkjjWUbJAb8jM5Z9TNV1c|png|1024': 'LJWDkjjWUbJAb8jM5Z9TNV1c-1024.avif',
  'LT9uZaHPoTvePf3dqntMdGxdQoE|png|2048': 'LT9uZaHPoTvePf3dqntMdGxdQoE-2048.avif',
  'RPhC4DN7RtxEGI6MdYNXBp7aeCY|png|': 'RPhC4DN7RtxEGI6MdYNXBp7aeCY-full.avif',
  'SzsX7XW9RxffMXb5EYrTx8JS9w|png|1024': 'SzsX7XW9RxffMXb5EYrTx8JS9w-1024.avif',
  'WGR2kkVaUV1UUS0xBp4y9jvw|png|1024': 'WGR2kkVaUV1UUS0xBp4y9jvw-1024.avif',
  'Wd9ZTnxswmLwZx9uzCO4y2pOQ|png|': 'Wd9ZTnxswmLwZx9uzCO4y2pOQ-full.avif',
  'ZZ9rqR9HtAug7JSa5ZF6yD978|png|1024': 'ZZ9rqR9HtAug7JSa5ZF6yD978-1024.avif',
  'ZZ9rqR9HtAug7JSa5ZF6yD978|png|2048': 'ZZ9rqR9HtAug7JSa5ZF6yD978-2048.png',
  'cZt5YEBAbiMIRhXvLH9EnXy0k|jpg|1024': 'cZt5YEBAbiMIRhXvLH9EnXy0k-1024.avif',
  'dsDx00IyRIEs5vJQjpTxxDnVLok|png|1024': 'dsDx00IyRIEs5vJQjpTxxDnVLok-1024.avif',
  'dsDx00IyRIEs5vJQjpTxxDnVLok|png|2048': 'dsDx00IyRIEs5vJQjpTxxDnVLok-2048.png',
  'ea3QpYJ6J7Gig84MA6rYrVqlSr4|png|1024': 'ea3QpYJ6J7Gig84MA6rYrVqlSr4-1024.png',
  'ea3QpYJ6J7Gig84MA6rYrVqlSr4|png|2048': 'ea3QpYJ6J7Gig84MA6rYrVqlSr4-2048.png',
  'evkLeXcIXBNvpP1eLK5sTRdu3Y|png|1024': 'evkLeXcIXBNvpP1eLK5sTRdu3Y-1024.avif',
  'gmVX9nwElg9L2E7EzBgM2Aj4NU|png|1024': 'gmVX9nwElg9L2E7EzBgM2Aj4NU-1024.avif',
  'hi2qXUMp0SDAi6xF5g7BCgcT3Y|png|1024': 'hi2qXUMp0SDAi6xF5g7BCgcT3Y-1024.avif',
  'iHMRRTuCcV220myYTChSRTHpyA|gif|1000': 'iHMRRTuCcV220myYTChSRTHpyA-1000.webp',
  'k7eSnPJnLGrXLzKCRRA8Gbf1O8|png|2048': 'k7eSnPJnLGrXLzKCRRA8Gbf1O8-2048.png',
  'kc5w2OtgfNpGLlHHNFk874SdfXE|gif|': 'kc5w2OtgfNpGLlHHNFk874SdfXE-full.webp',
  'n5LtkajIeCvoTHxPv6mnu6zKUY|png|2048': 'n5LtkajIeCvoTHxPv6mnu6zKUY-2048.avif',
  'nJpIDaLr8uHdUE1K3c5tprCGpTU|jpeg|1024': 'nJpIDaLr8uHdUE1K3c5tprCGpTU-1024.avif',
  'oq0rQm2GpFEbSXXDTNurReiXX8|png|1024': 'oq0rQm2GpFEbSXXDTNurReiXX8-1024.avif',
  'oq0rQm2GpFEbSXXDTNurReiXX8|png|2048': 'oq0rQm2GpFEbSXXDTNurReiXX8-2048.png',
  'q4L0TEapZn7OO2PefHIs25WZ0|png|2048': 'q4L0TEapZn7OO2PefHIs25WZ0-2048.avif',
  'qOfao4HoXBuaYJoZkCx8bYQgI|png|512': 'qOfao4HoXBuaYJoZkCx8bYQgI-512.avif',
  'qYJqF7BWlQxsxFesM8A2ww|png|1024': 'qYJqF7BWlQxsxFesM8A2ww-1024.avif',
  'rIJQFibPf73QvwkFU7MBEQIijo|png|1024': 'rIJQFibPf73QvwkFU7MBEQIijo-1024.avif',
  'tGFWTkIyIFUO7W0wZAvIZh04HM4|png|1024': 'tGFWTkIyIFUO7W0wZAvIZh04HM4-1024.avif',
  'tGFWTkIyIFUO7W0wZAvIZh04HM4|png|2048': 'tGFWTkIyIFUO7W0wZAvIZh04HM4-2048.webp',
  'uQQKGZS4cJoOMYkIdkqo656zxs|png|1024': 'uQQKGZS4cJoOMYkIdkqo656zxs-1024.avif',
  'uQQKGZS4cJoOMYkIdkqo656zxs|png|2048': 'uQQKGZS4cJoOMYkIdkqo656zxs-2048.png',
  'wdYHX8wcNUNR6FOmRfhkkcA3kDo|png|1024': 'wdYHX8wcNUNR6FOmRfhkkcA3kDo-1024.avif',
}

/** The local URL of a case study image. Throws on an unknown one, so a missing file can't quietly fall back to Framer. */
export function framerImage(id: string, ext = 'png', size?: number) {
  const file = FILES[`${id}|${ext}|${size ?? ''}`]
  if (!file) throw new Error(`No local copy of image ${id}.${ext} at size ${size ?? 'full'}`)
  return asset(`assets/images/framer/${file}`)
}
