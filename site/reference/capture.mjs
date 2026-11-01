// Reference capture for the Designed by Kyle homepage.
// Serves output/kyletran locally, blocks every external request, and records
// screenshots, DOM metrics, interaction states and appear-animation timelines
// at three breakpoints. Read-only with respect to output/kyletran.
//
// Usage: node reference/capture.mjs [--bp=desktop,tablet,mobile] [--steps=shots,dump,states,appear]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../output/kyletran');
const SHOTS = path.join(HERE, 'screenshots');

const BPS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};
const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')),
);
const ONLY_BPS = (args.bp ?? 'desktop,tablet,mobile').split(',');
const STEPS = (args.steps ?? 'shots,dump,states,appear').split(',');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const writeJson = (file, data) => fs.writeFileSync(path.join(HERE, file), JSON.stringify(data, null, 1));
const ensure = (dir) => fs.mkdirSync(dir, { recursive: true });

// ---------------------------------------------------------------- server
const netlog = { external: [], substituted: [], notFound: [], served: 0 };
const ASSET_MAP = JSON.parse(fs.readFileSync(path.join(ROOT, 'asset-map.json'), 'utf8'));
const stripQuery = (u) => u.split('?')[0];
const ASSET_BASE = new Map(Object.entries(ASSET_MAP).map(([k, v]) => [stripQuery(k), v]));
function lookupAsset(url) {
  const rel = ASSET_MAP[url] ?? ASSET_BASE.get(stripQuery(url));
  return rel && fs.existsSync(path.join(ROOT, rel)) ? rel : null;
}
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    netlog.notFound.push(req.url);
    res.writeHead(404);
    return res.end();
  }
  netlog.served++;
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// ---------------------------------------------------------------- in-page helpers
function initScript() {
  const r2 = (v) => Math.round(v * 100) / 100;
  const main = () => document.querySelector('main[data-framer-name="Cards"]');
  const scroller = () => document.querySelector('.framer-1k4toyc');
  const isTrack = () => matchMedia('(min-width: 1200px)').matches;
  const rel = (el) => {
    const m = main().getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return { x: r2(b.left - m.left), y: r2(b.top - m.top), w: r2(b.width), h: r2(b.height) };
  };
  const frames2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const slug = (s) => String(s).replace(/^\.\//, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

  const targets = () => {
    if (window.__targetCache) return window.__targetCache;
    const out = [];
    const seen = {};
    const add = (el, kind, base) => {
      seen[base] = (seen[base] ?? 0) + 1;
      out.push({ el, kind, key: seen[base] > 1 ? `${base}-${seen[base]}` : base });
    };
    main().querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      const name = a.getAttribute('data-framer-name');
      add(a, 'link', 'link-' + slug(href.startsWith('http') || href.startsWith('mailto') ? href : href + (name ? '-' + name : '')));
    });
    main().querySelectorAll('[data-framer-name="Showcase grid"] [data-framer-name="Variant 1"]').forEach((el, i) => add(el, 'playground-tile', 'playground-tile-' + (i + 1)));
    window.__targetCache = out;
    return out;
  };

  const bring = async (el) => {
    if (isTrack()) {
      const sc = scroller();
      const c = rel(el);
      const target = Math.max(0, Math.min(sc.scrollWidth - sc.clientWidth, c.x + c.w / 2 - sc.clientWidth / 2));
      sc.scrollLeft = target;
    } else {
      const b = el.getBoundingClientRect();
      window.scrollTo(0, Math.max(0, window.scrollY + b.top + b.height / 2 - innerHeight / 2));
    }
    await frames2();
    await new Promise((r) => setTimeout(r, 120));
    const b = el.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height, scrollLeft: scroller().scrollLeft, scrollY: window.scrollY };
  };

  const TRACK_PROPS = ['transform', 'opacity', 'boxShadow', 'backgroundColor', 'color', 'borderColor', 'borderRadius', 'filter', 'width', 'height', 'display', 'visibility', 'translate', 'scale', 'rotate', 'objectPosition', 'clipPath', 'zIndex', 'transition'];
  const snap = (el) => {
    const nodes = [];
    const walk = (e, p) => {
      const cs = getComputedStyle(e);
      const props = {};
      TRACK_PROPS.forEach((k) => (props[k] = cs[k]));
      nodes.push({ key: p, tag: e.tagName.toLowerCase(), name: e.getAttribute('data-framer-name'), rect: rel(e), props });
      if (e.tagName.toLowerCase() === 'svg' && !e.querySelector('foreignObject')) return;
      [...e.children].forEach((c, i) => nodes.length < 400 && walk(c, p + '.' + i));
    };
    walk(el, '0');
    return nodes;
  };

  // Generic recorder for the character and the wavy line.
  window.__rec = { marks: [] };
  const mark = (label) => window.__rec.marks.push([label, performance.now()]);
  ['pointerdown', 'pointerup', 'click'].forEach((t) => addEventListener(t, (e) => window.__rec.marks.push(['event:' + t, e.timeStamp]), true));

  const startChar = (ms) => new Promise((resolve) => {
    const btn = document.querySelector('button[aria-label^="Character"]');
    const gs = [...btn.querySelectorAll('svg g')];
    const labels = gs.length === 13
      ? ['pop', 'look', 'left', 'left.open', 'left.closed', 'left.happy', 'right', 'right.open', 'right.closed', 'right.happy', 'maskedGroup', 'stretch', 'spin']
      : gs.map((_, i) => 'g' + i);
    const frames = [];
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      frames.push([r2(t), gs.map((g) => [g.getAttribute('transform'), g.getAttribute('opacity')])]);
      if (t < ms) requestAnimationFrame(tick);
      else resolve({ t0, labels, frames, marks: window.__rec.marks });
    };
    requestAnimationFrame(tick);
  });

  const pathMetrics = (d) => {
    const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i + 1 < n.length; i += 2) {
      minX = Math.min(minX, n[i]); maxX = Math.max(maxX, n[i]);
      minY = Math.min(minY, n[i + 1]); maxY = Math.max(maxY, n[i + 1]);
    }
    return { points: n.length / 2, minX, maxX, minY, maxY };
  };
  const wavySvgs = () => [...main().querySelectorAll('svg[aria-label="Elastic wavy line"]')];
  const startWavy = (index, ms) => new Promise((resolve) => {
    const svg = wavySvgs()[index];
    const pathEl = svg.querySelector('path');
    const frames = [];
    const t0 = performance.now();
    let i = 0;
    const tick = () => {
      const t = performance.now() - t0;
      const d = pathEl.getAttribute('d') ?? '';
      const m = pathMetrics(d);
      frames.push({ t: r2(t), minX: r2(m.minX), maxX: r2(m.maxX), minY: r2(m.minY), maxY: r2(m.maxY), d: i % 10 === 0 ? d : undefined });
      i++;
      if (t < ms) requestAnimationFrame(tick);
      else resolve({ t0, frames, marks: window.__rec.marks });
    };
    requestAnimationFrame(tick);
  });
  const wavyState = (index) => {
    const svg = wavySvgs()[index];
    const d = svg.querySelector('path').getAttribute('d') ?? '';
    return { d, ...pathMetrics(d), paths: svg.querySelectorAll('path').length, viewBox: svg.getAttribute('viewBox') };
  };

  window.__ref = { r2, main, scroller, isTrack, rel, targets, bring, snap, mark, startChar, startWavy, wavyState, frames2 };
}

// ---------------------------------------------------------------- page helpers
async function openPage(browser, bp, { trace = false } = {}) {
  const ctx = await browser.newContext({ viewport: BPS[bp], deviceScaleFactor: 1, reducedMotion: 'no-preference', colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(ORIGIN)) return route.continue();
    if (url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    // The export's srcset attributes still list framerusercontent.com candidates. Nothing leaves the machine:
    // answer those with the local file that asset-map.json maps the URL to, so the reference shows the intended image.
    const local = lookupAsset(url);
    if (local) {
      netlog.substituted.push({ bp, url: url.slice(0, 200), local });
      return route.fulfill({ status: 200, contentType: MIME[path.extname(local)] ?? 'application/octet-stream', body: fs.readFileSync(path.join(ROOT, local)) });
    }
    netlog.external.push({ bp, url: url.slice(0, 200) });
    return route.abort();
  });
  await page.addInitScript(initScript);
  if (trace) await page.addInitScript(traceInit);
  return page;
}

function traceInit() {
  const frames = [];
  const state = { frames, loadT: null, dclT: null, done: false };
  window.__trace = state;
  addEventListener('load', () => (state.loadT = performance.now()));
  document.addEventListener('DOMContentLoaded', () => (state.dclT = performance.now()));
  const sel = '[data-framer-appear-id], .two-discs-rim-spin';
  const tick = () => {
    const t = performance.now();
    const count = {};
    const items = [...document.querySelectorAll(sel)].map((e) => {
      const id = e.getAttribute('data-framer-appear-id') ?? 'disc';
      count[id] = (count[id] ?? 0) + 1;
      const cs = getComputedStyle(e);
      return [`${id}#${count[id] - 1}`, e.getAttribute('data-framer-name'), cs.transform, cs.opacity];
    });
    frames.push({ t, items });
    if (state.loadT === null || t < state.loadT + 2600) requestAnimationFrame(tick);
    else state.done = true;
  };
  requestAnimationFrame(tick);
}

async function settle(page, bp, { sweep = true } = {}) {
  await page.goto(ORIGIN + '/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('svg[aria-label="Elastic wavy line"]', { state: 'attached', timeout: 15000 });
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading]').forEach((i) => (i.loading = 'eager'));
    await Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
  });
  const read = () => page.evaluate(() => [...document.querySelectorAll('[data-framer-appear-id]')].map((e) => { const c = getComputedStyle(e); return c.transform + c.opacity; }).join('|'));
  const start = Date.now();
  let prev = '';
  let stable = 0;
  while (Date.now() - start < 9000) {
    await sleep(200);
    const cur = await read();
    stable = cur === prev ? stable + 1 : 0;
    prev = cur;
    if (Date.now() - start > 2200 && stable >= 4) break;
  }
  if (sweep) await revealSweep(page, bp);
  if (bp === 'desktop') {
    await page.evaluate(() => { __ref.scroller().scrollLeft = 0; });
  }
}

// Cards in Works/Extras (appear id w7diy9) fade in the first time they enter the viewport and then stay.
// Sweep the whole page once so every reveal has fired, then return to the start.
async function revealSweep(page, bp) {
  const step = bp === 'desktop' ? 300 : 300;
  const total = await page.evaluate((d) => (d === 'desktop' ? __ref.scroller().scrollWidth : document.documentElement.scrollHeight), bp);
  for (let x = 0; x <= total; x += step) {
    await page.evaluate(([d, v]) => { if (d === 'desktop') __ref.scroller().scrollLeft = v; else scrollTo(0, v); }, [bp, x]);
    await sleep(120);
  }
  await sleep(1500);
  await page.evaluate((d) => { if (d === 'desktop') __ref.scroller().scrollLeft = 0; else scrollTo(0, 0); }, bp);
  await sleep(800);
}

async function imagesReady(page) {
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))));
}

const SECTION_DEFS = [
  ['hero', '#hero'],
  ['projects', '#projects [data-framer-name="PROJECTS"]'],
  ['projects-heading', '[data-framer-name="PROJECTS"] > [data-framer-name="Frame 2"]'],
  ['works', '[data-framer-name="Works"]'],
  ['extras', '[data-framer-name="Extras"]'],
  ['playground', '#playground'],
  ['playground-heading', '#playground > [data-framer-name="Frame 2"]'],
  ['playground-grid', '[data-framer-name="Showcase grid"]'],
  ['about-me', '#aboutme'],
  ['contact', '[data-framer-name="Contact"]'],
  ['footer', '[data-framer-name="Footer"]'],
];

async function sectionBoxes(page) {
  return page.evaluate((defs) => {
    const out = {};
    for (const [key, sel] of defs) {
      const el = __ref.main().querySelector(sel);
      out[key] = el ? __ref.rel(el) : null;
    }
    return out;
  }, SECTION_DEFS);
}

// ---------------------------------------------------------------- step: screenshots
async function stepShots(browser, bp) {
  const dir = path.join(SHOTS, bp);
  ensure(dir);
  const page = await openPage(browser, bp);
  await settle(page, bp);
  await imagesReady(page);
  const { width, height } = BPS[bp];
  const shotOpts = { animations: 'disabled' };
  const boxes = await sectionBoxes(page);

  if (bp === 'desktop') {
    const dims = await page.evaluate(() => ({ sw: __ref.scroller().scrollWidth, cw: __ref.scroller().clientWidth }));
    const max = dims.sw - dims.cw;
    const positions = [...new Set([0, 1440, 2880, 4320, 5760, 7200, max])];
    for (const x of positions) {
      await page.evaluate((v) => { __ref.scroller().scrollLeft = v; }, x);
      await sleep(900);
      await page.screenshot({ path: path.join(dir, `scroll-${String(x).padStart(4, '0')}.png`), ...shotOpts });
    }
    for (const [key, b] of Object.entries(boxes)) {
      if (!b) continue;
      let x0 = b.x;
      const end = b.x + b.w;
      let i = 0;
      const tiles = Math.ceil(b.w / width);
      while (x0 < end - 0.5) {
        const target = Math.max(0, Math.min(max, x0));
        await page.evaluate((v) => { __ref.scroller().scrollLeft = v; }, target);
        await sleep(700);
        const actual = await page.evaluate(() => __ref.scroller().scrollLeft);
        const cx = x0 - actual;
        const cw = Math.min(end - x0, width - cx);
        const ch = Math.min(b.h, height - b.y);
        await page.screenshot({
          path: path.join(dir, `section-${key}${tiles > 1 ? '-' + (i + 1) : ''}.png`),
          clip: { x: cx, y: b.y, width: cw, height: ch },
          ...shotOpts,
        });
        x0 += cw;
        i++;
      }
    }
  } else {
    await page.evaluate(() => scrollTo(0, 0));
    await sleep(200);
    await page.screenshot({ path: path.join(dir, 'viewport-0000.png'), ...shotOpts });
    await page.screenshot({ path: path.join(dir, 'full-page.png'), fullPage: true, ...shotOpts });
    for (const [key, b] of Object.entries(boxes)) {
      if (!b || b.w < 1 || b.h < 1) continue;
      await page.screenshot({ path: path.join(dir, `section-${key}.png`), fullPage: true, clip: { x: b.x, y: b.y, width: b.w, height: b.h }, ...shotOpts });
    }
  }
  await page.context().close();
  console.log(`[shots] ${bp} done`);
}

// ---------------------------------------------------------------- step: DOM dump
const STYLE_PROPS = [
  'display', 'position', 'top', 'right', 'bottom', 'left', 'zIndex',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'aspectRatio', 'objectFit', 'objectPosition',
  'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent', 'alignSelf', 'flexGrow', 'flexShrink', 'flexBasis', 'gap',
  'gridTemplateColumns', 'gridTemplateRows',
  'padding', 'margin',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textAlign', 'textTransform', 'textDecorationLine', 'whiteSpace', 'color',
  'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
  'borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow', 'outline',
  'transform', 'transformOrigin', 'translate', 'scale', 'rotate', 'opacity', 'filter', 'mixBlendMode', 'clipPath',
  'overflowX', 'overflowY', 'cursor', 'pointerEvents', 'transition', 'animationName', 'animationDuration', 'willChange',
];

async function stepDump(browser, bp) {
  const page = await openPage(browser, bp);
  await settle(page, bp);
  await imagesReady(page);
  const data = await page.evaluate((styleProps) => {
    const { r2, main, rel, scroller } = __ref;
    const OMIT = new Set(['', 'none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)', 'visible', 'static', '0px 0px', 'start']);
    const m = main();
    const elements = [];
    const indexOf = new Map();
    const skipChildrenOf = (e) => e instanceof SVGSVGElement && !e.querySelector('foreignObject');
    const visible = (e) => {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const b = e.getBoundingClientRect();
      return b.width > 0 && b.height > 0;
    };
    const walk = (e, parentIdx, depth) => {
      let myIdx = parentIdx;
      const tag = e.tagName.toLowerCase();
      if (!['script', 'style', 'source', 'defs', 'mask', 'lineargradient', 'stop', 'use'].includes(tag) && visible(e)) {
        const cs = getComputedStyle(e);
        const styles = {};
        styleProps.forEach((k) => {
          const v = cs[k];
          if (v === undefined || OMIT.has(v)) return;
          if (k === 'opacity' && v === '1') return;
          styles[k] = v;
        });
        const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
        const item = {
          i: elements.length, parent: parentIdx, depth, tag,
          name: e.getAttribute('data-framer-name'), id: e.id || undefined,
          class: String(e.getAttribute('class') ?? '') || undefined,
          appearId: e.getAttribute('data-framer-appear-id') || undefined,
          role: e.getAttribute('role') || undefined, ariaLabel: e.getAttribute('aria-label') || undefined,
          text: own || undefined,
          href: tag === 'a' ? e.getAttribute('href') : undefined,
          box: rel(e),
          styles,
        };
        if (tag === 'img') {
          item.src = e.getAttribute('src');
          item.srcset = e.getAttribute('srcset') || undefined;
          item.alt = e.getAttribute('alt');
          item.natural = [e.naturalWidth, e.naturalHeight];
          item.loading = e.getAttribute('loading') || undefined;
        }
        if (e instanceof SVGSVGElement) {
          item.svg = { viewBox: e.getAttribute('viewBox'), children: e.children.length, text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) || undefined };
        }
        if (cs.backgroundImage && cs.backgroundImage !== 'none') item.backgroundImage = cs.backgroundImage.replace(location.origin, '');
        elements.push(item);
        myIdx = item.i;
      }
      if (skipChildrenOf(e)) return;
      [...e.children].forEach((c) => walk(c, myIdx, depth + (myIdx === parentIdx ? 0 : 1)));
    };
    [...m.children].forEach((c) => walk(c, -1, 0));

    const outline = (e, d) => ({
      tag: e.tagName.toLowerCase(),
      class: String(e.getAttribute('class') ?? '').split(' ').filter((c) => /^framer-[a-z0-9]+$/i.test(c)).join(' ') || undefined,
      name: e.getAttribute('data-framer-name') || undefined,
      id: e.id || undefined,
      href: e.tagName === 'A' ? e.getAttribute('href') : undefined,
      display: getComputedStyle(e).display,
      box: rel(e),
      children: d > 0 ? [...e.children].filter((c) => { const b = c.getBoundingClientRect(); return b.width > 0 && b.height > 0; }).map((c) => outline(c, d - 1)) : undefined,
    });

    const sc = scroller();
    const mainCs = getComputedStyle(m);
    return {
      scroller: { scrollWidth: sc.scrollWidth, scrollHeight: sc.scrollHeight, clientWidth: sc.clientWidth, clientHeight: sc.clientHeight, overflowX: getComputedStyle(sc).overflowX, overflowY: getComputedStyle(sc).overflowY },
      document: { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight },
      main: { box: rel(m), display: mainCs.display, width: mainCs.width, height: mainCs.height, gap: mainCs.gap, flexDirection: mainCs.flexDirection, padding: mainCs.padding },
      outline: outline(m, 3),
      elements,
    };
  }, STYLE_PROPS);
  const sections = await sectionBoxes(page);
  const body = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    return { backgroundColor: cs.backgroundColor, fontFamily: cs.fontFamily, tokens: Object.fromEntries([...document.body.style].filter((k) => k.startsWith('--token')).map((k) => [k, document.body.style.getPropertyValue(k)])) };
  });
  const out = {
    breakpoint: bp,
    viewport: BPS[bp],
    note: 'Boxes are relative to main[data-framer-name="Cards"] (the scroll track on desktop). Style properties equal to CSS initial/zero values (none, normal, auto, 0px, transparent, visible, static, opacity 1) are omitted.',
    ...data,
    sections,
    body,
  };
  writeJson(`${bp}.json`, out);
  await page.context().close();
  console.log(`[dump] ${bp}: ${data.elements.length} elements`);
}

// ---------------------------------------------------------------- step: states
function diffSnaps(before, after) {
  const bm = new Map(before.map((n) => [n.key, n]));
  const am = new Map(after.map((n) => [n.key, n]));
  const changed = [];
  for (const [key, b] of bm) {
    const a = am.get(key);
    if (!a) continue;
    const props = {};
    for (const k of Object.keys(b.props)) if (b.props[k] !== a.props[k]) props[k] = [b.props[k], a.props[k]];
    const rect = {};
    for (const k of ['x', 'y', 'w', 'h']) if (Math.abs(b.rect[k] - a.rect[k]) > 0.5) rect[k] = [b.rect[k], a.rect[k]];
    if (Object.keys(props).length || Object.keys(rect).length) changed.push({ key, tag: b.tag, name: b.name, props, rect });
  }
  const removed = before.filter((n) => !am.has(n.key)).map((n) => ({ key: n.key, tag: n.tag, name: n.name }));
  const added = after.filter((n) => !bm.has(n.key)).map((n) => ({ key: n.key, tag: n.tag, name: n.name, rect: n.rect }));
  return { changed, removed, added };
}

const pad = (b, vp, p = 32) => {
  const x = Math.max(0, b.x - p), y = Math.max(0, b.y - p);
  return { x, y, width: Math.min(vp.width - x, b.w + 2 * p), height: Math.min(vp.height - y, b.h + 2 * p) };
};

async function stepStates(browser, bp) {
  const dir = path.join(SHOTS, bp, 'states');
  ensure(dir);
  const vp = BPS[bp];
  const page = await openPage(browser, bp);
  await settle(page, bp);
  await imagesReady(page);
  const states = { breakpoint: bp, hover: [], character: null, wavy: [] };
  const shot = async (name, box, opts = {}) => {
    const file = `${name}.png`;
    await page.screenshot({ path: path.join(dir, file), clip: pad(box, vp, opts.pad ?? 32), animations: 'allow' });
    return `screenshots/${bp}/states/${file}`;
  };

  // ---- hover on each link / tile (touch devices have no hover; mobile is skipped)
  if (bp !== 'mobile') {
    const list = await page.evaluate(() => __ref.targets().map((t, i) => ({ i, key: t.key, kind: t.kind })));
    for (const t of list) {
      console.log('  hover', bp, t.key);
      await page.mouse.move(1, 1);
      const box = await page.evaluate((i) => __ref.bring(__ref.targets()[i].el), t.i);
      await sleep(250);
      const before = await page.evaluate((i) => __ref.snap(__ref.targets()[i].el), t.i);
      const idle = await shot(`hover-${t.key}-idle`, box);
      await page.mouse.move(box.x + box.w / 2, box.y + box.h / 2, { steps: 10 });
      await sleep(900);
      const after = await page.evaluate((i) => __ref.snap(__ref.targets()[i].el), t.i);
      const hovered = await shot(`hover-${t.key}-hover`, box);
      const cursor = await page.evaluate((i) => getComputedStyle(__ref.targets()[i].el).cursor, t.i);
      states.hover.push({ key: t.key, kind: t.kind, cursor, viewportBox: box, screenshots: { idle, hover: hovered }, diff: diffSnaps(before, after) });
      await page.mouse.move(1, 1);
      await sleep(300);
    }
  }

  // ---- character (footer): idle spin, blink, eye tracking, happy after click
  console.log('  character', bp);
  const hasChar = await page.evaluate(() => !!document.querySelector('button[aria-label^="Character"]'));
  if (hasChar) {
    const charBox = await page.evaluate(() => __ref.bring(document.querySelector('button[aria-label^="Character"]')));
    await page.mouse.move(1, 1);
    await sleep(200);
    const ch = { viewportBox: charBox, screenshots: {}, idle: null, tracking: [], happy: null, blink: null };
    console.log('   char: idle shot');
    ch.screenshots.idle = await shot('character-idle', charBox, { pad: 24 });
    // idle trace long enough to include several blinks (gap 1.6-2.6 s)
    console.log('   char: idle trace');
    ch.idle = await page.evaluate(() => __ref.startChar(6000));
    // blink: poll until open eyes start closing, then screenshot immediately (best effort, ~1 frame of latency)
    ch.blink = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.evaluate(() => new Promise((resolve) => {
        const open = document.querySelector('button[aria-label^="Character"]').querySelectorAll('svg g')[3];
        const tick = () => (parseFloat(open.getAttribute('opacity') ?? '1') < 0.5 ? resolve() : requestAnimationFrame(tick));
        tick();
      }));
      console.log('   char: blink', attempt);
      const file = `character-blink-${attempt + 1}`;
      const rel = await shot(file, charBox, { pad: 24 });
      const gs = await page.evaluate(() => [...document.querySelector('button[aria-label^="Character"]').querySelectorAll('svg g')].map((g) => [g.getAttribute('transform'), g.getAttribute('opacity')]));
      ch.blink.push({ screenshot: rel, groupsAfterShot: gs });
      await sleep(900);
    }
    // eye tracking: pointer at several directions/distances
    const cx = charBox.x + charBox.w / 2, cy = charBox.y + charBox.h / 2;
    const probes = [['right-near', 120, 0], ['right-far', 600, 0], ['left-far', -Math.min(cx - 5, 600), 0], ['up-far', 0, -Math.min(cy - 5, 400)], ['down-far', 0, Math.min(vp.height - cy - 5, 300)]];
    console.log('   char: tracking');
    for (const [label, dx, dy] of probes) {
      await page.mouse.move(cx + dx, cy + dy, { steps: 6 });
      await sleep(700);
      const look = await page.evaluate(() => document.querySelector('button[aria-label^="Character"]').querySelectorAll('svg g')[1].getAttribute('transform'));
      const shotRel = await shot(`character-look-${label}`, charBox, { pad: 24 });
      ch.tracking.push({ label, pointerOffset: [dx, dy], lookTransform: look, screenshot: shotRel });
    }
    // happy: click, trace 1.4 s
    await page.mouse.move(1, 1);
    await sleep(900);
    console.log('   char: happy');
    const traceP = page.evaluate(() => __ref.startChar(1400));
    await sleep(50);
    await page.mouse.click(cx, cy);
    ch.happy = { trace: await traceP };
    await sleep(800);
    // happy screenshots at ~120/420/700 ms after click (separate click; actual offsets recorded)
    ch.happy.screenshots = [];
    await page.mouse.move(1, 1);
    await sleep(500);
    const t0 = await page.evaluate(() => performance.now());
    await page.mouse.click(cx, cy);
    for (const target of [120, 420, 700]) {
      const now = await page.evaluate(() => performance.now());
      const wait = target - (now - t0);
      if (wait > 0) await sleep(wait);
      const actual = (await page.evaluate(() => performance.now())) - t0;
      ch.happy.screenshots.push({ targetMs: target, actualMs: Math.round(actual), screenshot: await shot(`character-happy-${target}ms`, charBox, { pad: 24 }) });
    }
    states.character = ch;
  } else {
    states.character = { present: false, note: 'No CharacterCutout button in the DOM at this breakpoint.' };
  }

  // ---- wavy lines: idle, hover, drag, release
  console.log('  wavy', bp);
  const wavyCount = await page.evaluate(() => document.querySelectorAll('svg[aria-label="Elastic wavy line"]').length);
  for (let wi = 0; wi < wavyCount; wi++) {
    await page.mouse.move(1, 1);
    const box = await page.evaluate((i) => __ref.bring(document.querySelectorAll('svg[aria-label="Elastic wavy line"]')[i]), wi);
    await sleep(300);
    const vertical = box.h >= box.w;
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    const along = (d) => (vertical ? [cx + d, cy] : [cx, cy + d]);
    const w = { index: wi, viewportBox: box, orientation: vertical ? 'vertical' : 'horizontal', states: {}, screenshots: {}, marks: [] };
    const rec = page.evaluate(([i, ms]) => __ref.startWavy(i, ms), [wi, 8000]);
    const mark = (label) => page.evaluate((l) => __ref.mark(l), label);
    await sleep(1200);
    w.states.idle = await page.evaluate((i) => __ref.wavyState(i), wi);
    w.screenshots.idle = await shot(`wavy-${wi + 1}-idle`, box, { pad: 20 });
    await mark('hover-approach');
    const [sx, sy] = along(-70);
    await page.mouse.move(sx, sy);
    await page.mouse.move(cx, cy, { steps: 12 });
    await sleep(700);
    await mark('hover-settled');
    w.states.hover = await page.evaluate((i) => __ref.wavyState(i), wi);
    w.screenshots.hover = await shot(`wavy-${wi + 1}-hover`, box, { pad: 20 });
    await mark('drag-down');
    await page.mouse.down();
    const [ex, ey] = along(35);
    await page.mouse.move(ex, ey, { steps: 12 });
    await sleep(500);
    await mark('drag-held');
    w.states.drag = await page.evaluate((i) => __ref.wavyState(i), wi);
    w.screenshots.drag = await shot(`wavy-${wi + 1}-drag`, box, { pad: 20 });
    await page.mouse.up();
    await mark('release');
    await sleep(120);
    w.states.release120ms = await page.evaluate((i) => __ref.wavyState(i), wi);
    await sleep(2200);
    await mark('settled');
    w.states.afterRelease = await page.evaluate((i) => __ref.wavyState(i), wi);
    w.screenshots.afterRelease = await shot(`wavy-${wi + 1}-after-release`, box, { pad: 20 });
    await page.mouse.move(1, 1);
    w.trace = await rec;
    states.wavy.push(w);
  }

  writeJson(`states-${bp}.json`, states);
  await page.context().close();
  console.log(`[states] ${bp}: ${states.hover.length} hover targets, ${wavyCount} wavy lines, character=${!!hasChar}`);
}

// ---------------------------------------------------------------- step: appear animation timeline
async function stepAppear(browser, bp) {
  const dir = path.join(SHOTS, bp, 'appear');
  ensure(dir);
  // (a) dense per-frame trace from navigation start
  const page = await openPage(browser, bp, { trace: true });
  await page.goto(ORIGIN + '/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__trace?.done, null, { timeout: 15000 });
  const trace = await page.evaluate(() => window.__trace);
  await page.context().close();

  const loadT = trace.loadT;
  const frames = trace.frames.map((f) => ({ t: Math.round((f.t - loadT) * 10) / 10, items: f.items }));
  const keys = [...new Set(frames.flatMap((f) => f.items.map((i) => i[0])))];
  const series = {};
  for (const k of keys) {
    series[k] = frames.map((f) => { const it = f.items.find((i) => i[0] === k); return it ? { t: f.t, name: it[1], transform: it[2], opacity: it[3] } : null; }).filter(Boolean);
  }
  const at = (k, ms) => { const s = series[k]; let best = s[0]; for (const p of s) if (p.t <= ms) best = p; return best; };
  const snapshots = {};
  const events = {};
  for (const k of keys) {
    snapshots[k] = {};
    for (const ms of [0, 500, 1000, 2000]) { const p = at(k, ms); snapshots[k][ms] = p && { t: p.t, transform: p.transform, opacity: p.opacity }; }
    const s = series[k];
    const first = s[0];
    const changes = s.filter((p, i) => i > 0 && (p.transform !== s[i - 1].transform || p.opacity !== s[i - 1].opacity));
    events[k] = {
      name: first.name,
      firstSeenMs: first.t,
      initial: { transform: first.transform, opacity: first.opacity },
      firstChangeMs: changes[0]?.t ?? null,
      lastChangeMs: changes.at(-1)?.t ?? null,
      final: { transform: s.at(-1).transform, opacity: s.at(-1).opacity },
      animates: changes.length > 0,
    };
  }

  // (b) viewport screenshots at ~0 / 0.5 / 1 / 2 s after the load event (actual offsets recorded)
  const shots = [];
  const p2 = await openPage(browser, bp);
  await p2.addInitScript(() => addEventListener('load', () => (window.__loadT = performance.now())));
  await p2.goto(ORIGIN + '/', { waitUntil: 'load' });
  for (const target of [0, 500, 1000, 2000]) {
    const elapsed = await p2.evaluate(() => performance.now() - window.__loadT);
    if (target - elapsed > 0) await sleep(target - elapsed);
    const before = await p2.evaluate(() => performance.now() - window.__loadT);
    const file = `appear-${String(target).padStart(4, '0')}ms.png`;
    await p2.screenshot({ path: path.join(dir, file), animations: 'allow' });
    shots.push({ targetMs: target, requestedAtMs: Math.round(before), screenshot: `screenshots/${bp}/appear/${file}` });
  }
  await p2.context().close();

  // (c) scroll-reveal timeline: fresh page, no sweep, bring each w7diy9 card into view and sample the opacity of
  // the first ancestor that is not fully opaque (the reveal wrapper), per frame for 1.6 s.
  const reveal = [];
  const p3 = await openPage(browser, bp);
  await settle(p3, bp, { sweep: false });
  const nCards = await p3.evaluate(() => document.querySelectorAll('[data-framer-appear-id="w7diy9"]').length);
  for (let i = 0; i < nCards; i++) {
    const info = await p3.evaluate(async (idx) => {
      const el = document.querySelectorAll('[data-framer-appear-id="w7diy9"]')[idx];
      const wrapperOf = (e) => { let n = e; const chain = []; while (n && n !== __ref.main()) { chain.push(n); n = n.parentElement; } return chain; };
      const chain = wrapperOf(el);
      const sample = () => {
        const out = [];
        chain.forEach((n) => { const c = getComputedStyle(n); if (c.opacity !== '1' || c.transform !== 'none' || c.filter !== 'none') out.push([String(n.className).split(' ')[0], c.opacity, c.transform, c.filter]); });
        return out;
      };
      const before = sample();
      await __ref.bring(el);
      const t0 = performance.now();
      const frames = [];
      await new Promise((resolve) => { const tick = () => { const t = performance.now() - t0; frames.push([Math.round(t), sample()]); t < 1600 ? requestAnimationFrame(tick) : resolve(); }; tick(); });
      const label = el.getAttribute('data-framer-name');
      const parentName = el.closest('[data-framer-name="Works"],[data-framer-name="Extras"]')?.getAttribute('data-framer-name');
      return { idx, parent: parentName, label, startedHiddenBeforeScroll: before.length > 0, before, frames };
    }, i);
    const first = info.frames.findIndex((f) => f[1].length === 0);
    reveal.push({ ...info, fullyVisibleAtMs: first >= 0 ? info.frames[first][0] : null, frames: info.frames.filter((_, k) => k % 3 === 0 || k === first) });
  }
  await p3.context().close();

  const framerAppear = await (async () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const m = html.match(/<script type="framer\/appear" id="__framer__appearAnimationsContent">([\s\S]*?)<\/script>/);
    try { return m ? JSON.parse(m[1]) : null; } catch { return null; }
  })();

  writeJson(`appear-${bp}.json`, {
    breakpoint: bp,
    t0: 'load event; negative values are before load',
    domContentLoadedMs: Math.round((trace.dclT - loadT) * 10) / 10,
    frameCount: frames.length,
    events,
    snapshots,
    screenshots: shots,
    scrollReveal: reveal,
    declaredAppearAnimations: framerAppear,
    series,
  });
  console.log(`[appear] ${bp}: ${keys.length} tracked ids, ${frames.length} frames`);
}

// ---------------------------------------------------------------- main
const browser = await chromium.launch();
try {
  for (const bp of ONLY_BPS) {
    if (STEPS.includes('shots')) await stepShots(browser, bp);
    if (STEPS.includes('dump')) await stepDump(browser, bp);
    if (STEPS.includes('states')) await stepStates(browser, bp);
    if (STEPS.includes('appear')) await stepAppear(browser, bp);
  }
} finally {
  await browser.close();
  server.close();
  const uniq = (list) => [...new Map(list.map((e) => [e.url, e])).values()];
  const external = uniq(netlog.external);
  const substituted = uniq(netlog.substituted);
  writeJson('network-log.json', {
    note: 'external = requests to other origins that were aborted (no local equivalent). substituted = requests to framerusercontent.com that the export still makes (srcset candidates) and that were answered from the local file named in asset-map.json. notFound = local paths that returned 404.',
    external,
    substituted,
    notFound: [...new Set(netlog.notFound)],
    run: { bps: ONLY_BPS, steps: STEPS },
  });
  console.log('external aborted:', external.length, '| substituted from asset-map:', substituted.length, '| 404s:', new Set(netlog.notFound).size);
}
