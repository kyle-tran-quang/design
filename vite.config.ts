import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

import siteConfiguration from './.figma/make/site.json'


// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

  return {
    base: process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
react(),
      tailwindcss(),
      reactRouteHtml(),
      caseStudyMediaImport(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
      figmaLinkedPackageSourcemaps(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Standalone Framer code components import `framer`; see src/lib/framer-shim.ts.
        framer: path.resolve(__dirname, './src/lib/framer-shim.ts'),
      },
    },
    server: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
      watch: {
        ignored: [
          '**/.figma/**',
],
      },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  }
})

/**
 * Gives every client-side route its own HTML entry: the dev server answers deep links such as
 * /work/unblok with the app shell, and the build writes `<route>.html` and `<route>/index.html`
 * copies of index.html so static hosting serves them directly.
 */
function reactRouteHtml(): Plugin {
  /** Client-side routes rendered by src/App.tsx (keep in sync with `loaders` in src/lib/pages.ts). */
  const reactRoutes = ['/work/mas-pricing', '/work/m-goat', '/work/cardoctor', '/work/unblok', '/work/breadslice', '/work/cardoctor-ds']

  function routeForPath(pathname: string) {
    return pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/'
  }

  return {
    name: 'react-route-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()

        let pathname: string
        try {
          pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
        } catch {
          return next()
        }

        if (reactRoutes.includes(routeForPath(pathname))) {
          // Hand the request to Vite's index.html handler; the browser URL is unchanged.
          req.url = '/'
        }
        next()
      })
    },
    writeBundle(options) {
      const outDir = options.dir ?? path.resolve(__dirname, 'dist')
      const appHtml = fs.readFileSync(path.join(outDir, 'index.html'))
      for (const route of reactRoutes) {
        for (const target of [`${route.slice(1)}.html`, `${route.slice(1)}/index.html`]) {
          const outputFile = path.join(outDir, target)
          fs.mkdirSync(path.dirname(outputFile), { recursive: true })
          fs.writeFileSync(outputFile, appHtml)
        }
      }
    },
  }
}

/**
 * Dev-only helper for self-hosting the CarDoctor case study media. The sandbox can't reach Framer's CDN, but the
 * browser showing the preview can: open /__media-import in the preview and the page downloads every file listed in
 * src/components/case-study/{cardoctor,cardoctor-ds}/media.json, then posts each one back here. Files are staged
 * outside public/ and moved into public/assets/images/<study>/ once a study is complete, which also sets
 * `selfHosted` in its media.json. Same result as scripts/fetch-cardoctor-media.mjs.
 */
function caseStudyMediaImport(): Plugin {
  const studies = ['cardoctor', 'cardoctor-ds'] as const
  const route = '/__media-import'
  const maxBytes = 60 * 1024 * 1024
  const stagingRoot = path.join(process.env.TMPDIR || '/tmp', 'case-study-media-import')

  type Manifest = { selfHosted: boolean; files: Record<string, { file: string; url: string }> }
  const manifestPath = (study: string) => path.resolve(__dirname, `src/components/case-study/${study}/media.json`)
  const readManifest = (study: string): Manifest => JSON.parse(fs.readFileSync(manifestPath(study), 'utf8'))

  const page = `<!doctype html><meta charset="utf-8"><title>Media import</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:32px;max-width:900px}li{margin:2px 0}.ok{color:#18794e}.fail{color:#c4320a}</style>
<h1>Case study media import</h1><p id="status">Starting…</p><ul id="log"></ul>
<script type="module">
const log = (text, cls) => { const li = document.createElement('li'); li.textContent = text; if (cls) li.className = cls; document.getElementById('log').append(li) }
const status = document.getElementById('status')
const manifests = await (await fetch('${route}/manifests')).json()
let failed = 0
for (const [study, manifest] of Object.entries(manifests)) {
  if (manifest.selfHosted) { log(study + ': already self-hosted, skipped', 'ok'); continue }
  let studyFailed = 0
  for (const [key, { file, url }] of Object.entries(manifest.files)) {
    status.textContent = 'Downloading ' + study + ' / ' + file + '…'
    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const save = await fetch('${route}/save?study=' + encodeURIComponent(study) + '&key=' + encodeURIComponent(key), { method: 'POST', body: await res.blob() })
      if (!save.ok) throw new Error(await save.text())
      log(study + ' / ' + file, 'ok')
    } catch (error) {
      studyFailed++
      log(study + ' / ' + file + ': ' + (error.message || error) + (error instanceof TypeError ? ' (the browser blocked the download)' : ''), 'fail')
    }
  }
  if (studyFailed) { failed += studyFailed; log(study + ': ' + studyFailed + ' file(s) failed, nothing was moved. Reload this page to retry.', 'fail'); continue }
  const done = await fetch('${route}/done?study=' + encodeURIComponent(study), { method: 'POST' })
  log(study + ': ' + (done.ok ? 'all files saved, now served from the project.' : 'could not finish: ' + await done.text()), done.ok ? 'ok' : 'fail')
  if (!done.ok) failed++
}
status.textContent = failed ? 'Finished with errors (see below).' : 'Done. You can close this page.'
</script>`

  return {
    name: 'case-study-media-import',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (!url.pathname.startsWith(route)) return next()
        const send = (status: number, body: string, type = 'text/plain; charset=utf-8') => {
          res.statusCode = status
          res.setHeader('Content-Type', type)
          res.end(body)
        }
        try {
          if (req.method === 'GET' && url.pathname === route) return send(200, page, 'text/html; charset=utf-8')
          if (req.method === 'GET' && url.pathname === `${route}/manifests`) {
            return send(200, JSON.stringify(Object.fromEntries(studies.map((s) => [s, readManifest(s)]))), 'application/json')
          }

          const study = url.searchParams.get('study') ?? ''
          if (req.method !== 'POST' || !(studies as readonly string[]).includes(study)) return send(400, 'Bad request')
          const manifest = readManifest(study)
          const staging = path.join(stagingRoot, study)

          if (url.pathname === `${route}/save`) {
            const entry = manifest.files[url.searchParams.get('key') ?? '']
            if (!entry) return send(400, 'Unknown file')
            const chunks: Buffer[] = []
            let size = 0
            for await (const chunk of req) {
              size += chunk.length
              if (size > maxBytes) return send(413, 'File too large')
              chunks.push(chunk as Buffer)
            }
            if (!size) return send(400, 'Empty file')
            fs.mkdirSync(staging, { recursive: true })
            fs.writeFileSync(path.join(staging, entry.file), Buffer.concat(chunks))
            return send(200, 'saved')
          }

          if (url.pathname === `${route}/done`) {
            const files = Object.values(manifest.files).map((f) => f.file)
            const missing = files.filter((f) => !fs.existsSync(path.join(staging, f)))
            if (missing.length) return send(409, `Missing: ${missing.join(', ')}`)
            const outDir = path.resolve(__dirname, `public/assets/images/${study}`)
            fs.mkdirSync(outDir, { recursive: true })
            for (const f of files) fs.copyFileSync(path.join(staging, f), path.join(outDir, f))
            fs.rmSync(staging, { recursive: true, force: true })
            manifest.selfHosted = true
            fs.writeFileSync(manifestPath(study), `${JSON.stringify(manifest, null, 2)}\n`)
            return send(200, 'done')
          }
          return send(404, 'Not found')
        } catch (error) {
          return send(500, error instanceof Error ? error.message : String(error))
        }
      })
    },
  }
}

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Figma Make App"
  const description = config.description ?? ''
  // Imported HTML keeps its own favicon; new Makes default to the Make product icon.
  const favicon = config.icons?.icon ?? '/favicon.svg'
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  type ModuleNode = import('vite').ModuleNode
  const hadRefreshBoundary = new Map<string, boolean>()
  const lostRefreshBoundaries = new Set<string>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    handleHotUpdate({ modules, server, timestamp }) {
      if (lostRefreshBoundaries.size === 0) return

      const visited = new Set<ModuleNode>()
      const pending = [...modules]
      while (pending.length > 0) {
        const current = pending.pop()
        if (!current || visited.has(current)) continue
        visited.add(current)

        const moduleId = current.id?.split('?')[0]
        if (moduleId && lostRefreshBoundaries.has(moduleId)) {
          const invalidated = new Set<ModuleNode>()
          for (const updatedModule of modules) {
            server.moduleGraph.invalidateModule(updatedModule, invalidated, timestamp, true)
          }
          sendFullReload?.()
          return []
        }

        pending.push(...current.importers)
      }
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (hasRefreshBoundary) lostRefreshBoundaries.delete(moduleId)
      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        lostRefreshBoundaries.add(moduleId)
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}

/**
 * Reports the sources of dependencies linked from outside node_modules (pnpm
 * or npm workspaces, `file:`, `link:`) under `node_modules/<name>/`, the way
 * installed packages appear in sourcemaps. Vite otherwise reports their real
 * path, such as `libraries/<name>/`.
 */
function figmaLinkedPackageSourcemaps(): Plugin {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))
  const linkedPackages = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).flatMap((name) => {
    const installedDir = path.resolve(__dirname, 'node_modules', name)
    try {
      const realDir = fs.realpathSync(installedDir)
      return realDir.split(path.sep).includes('node_modules') ? [] : [{ installedDir, realDir }]
    } catch {
      return []
    }
  })
  const sourceMappingUrl = /\/\/# sourceMappingURL=(\S+)\s*$/

  function installedPath(file: string) {
    const linked = linkedPackages.find(({ realDir }) => file.startsWith(realDir + path.sep))
    return linked && path.join(linked.installedDir, path.relative(linked.realDir, file))
  }
  function readSourceMap(file: string, code: string) {
    const url = sourceMappingUrl.exec(code)?.[1]
    try {
      if (url?.startsWith('data:')) {
        return { map: JSON.parse(Buffer.from(url.split(',')[1], 'base64').toString()), mapDir: path.dirname(file) }
      }
      if (url) {
        const mapFile = path.resolve(path.dirname(file), url)
        return { map: JSON.parse(fs.readFileSync(mapFile, 'utf8')), mapDir: path.dirname(mapFile) }
      }
    } catch {}
    // Without a usable input map, map every line to itself.
    const mappings = code.split('\n').map((_, i) => (i ? 'AACA' : 'AAAA'))
    const map = { version: 3, sources: [file], sourcesContent: [code], names: [], mappings: mappings.join(';') }
    return { map, mapDir: path.dirname(file) }
  }

  return {
    name: 'figma-linked-package-sourcemaps',
    enforce: 'pre',
    load(id) {
      // Leave queried imports such as ?raw and ?url to Vite's own loaders.
      if (id.includes('?') || !/\.[cm]?[jt]sx?$/.test(id) || !installedPath(id)) return null

      const code = fs.readFileSync(id, 'utf8')
      const { map, mapDir } = readSourceMap(id, code)
      const sourceRoot = path.resolve(mapDir, map.sourceRoot ?? '')
      map.sources = map.sources.map((source: string) => {
        const original = path.resolve(sourceRoot, source)
        return installedPath(original) ?? original
      })
      delete map.sourceRoot
      return { code: code.replace(sourceMappingUrl, ''), map }
    },
  }
}
