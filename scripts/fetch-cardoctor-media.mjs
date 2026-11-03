// Downloads a CarDoctor case study's media from Framer's CDN into public/assets/images/<study>/
// and switches src/components/case-study/<study>/media.json to the local copies.
// Usage: node scripts/fetch-cardoctor-media.mjs [cardoctor|cardoctor-ds]   (default: cardoctor)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const studies = ['cardoctor', 'cardoctor-ds']
const study = process.argv[2] ?? 'cardoctor'
if (!studies.includes(study)) {
  console.error(`Unknown case study "${study}". Use one of: ${studies.join(', ')}`)
  process.exit(1)
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(
  root,
  `src/components/case-study/${study}/media.json`,
)
const outDir = path.join(root, `public/assets/images/${study}`)
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

fs.mkdirSync(outDir, { recursive: true })
let failed = 0
for (const [key, { file, url }] of Object.entries(manifest.files)) {
  const target = path.join(outDir, file)
  if (fs.existsSync(target) && fs.statSync(target).size > 0) {
    console.log(`skip  ${file}`)
    continue
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()))
    console.log(`saved ${file}`)
  } catch (error) {
    failed++
    console.error(`FAIL  ${key} (${url}): ${error.message}`)
  }
}

if (failed) {
  console.error(`${failed} file(s) failed; media.json still points at the CDN.`)
  process.exit(1)
}
manifest.selfHosted = true
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log('All files saved; media.json now uses the local copies.')
