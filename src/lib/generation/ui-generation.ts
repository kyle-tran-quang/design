// @ts-nocheck
// transitions.dev text-image-generation.js + ui-generation.js, vendored verbatim from
// CostEstimatorGenerationStandalone.tsx (generated from the Make app). Do not edit; replace it with a newer copy instead.
// Usage: const run = generate(element, { mode: "skeleton" }); await run.finished; run.cancel();
// ─── text-image-generation.js, unchanged apart from its module wrapper ───
const TIG = (() => {
/*
 * transitions.dev / UI generation: the text and image variants (ui-generation.js passes variant "text",
 * "small-text", "image" and "auto" here; it can also be used on its own)
 *
 * The dotted "agent is generating this" drawing, made for large bold type and images. Every glyph of a headline is
 * traced along its real outline in small flowing dots (each character is drawn in the element's own font on a canvas
 * and traced with marching squares), over typographic guides (cap height, x-height, baseline, descender). Every image
 * is sketched in lines of equal tone, built up as a fine halftone of its own pixels, and turned into a dot matrix of
 * its own colours. Then each glyph fades in, and each photo resolves over its colour dots.
 *
 * Modes
 *   "trace"         the dotted drawing and the ink
 *   "trace-texts"   the same, plus generation texts: an agent log of every glyph and image, and a step line
 *
 * Usage
 *   import { generate } from "./text-image-generation.js";
 *   const run = generate(el, { mode: "trace" });   // el: a headline, an image, or a block holding both
 *   await run.finished;
 *   run.cancel();
 *
 *   <section data-t-trace="trace"> ... </section>   + TextImageGeneration.auto()   (plays when it scrolls into view)
 *
 * No dependencies, any framework. Respects prefers-reduced-motion (a plain fade instead).
 */

const NS = "http://www.w3.org/2000/svg";

const DEFAULTS = {
  // what is generated: "text" (every glyph traced along its outline, the default), "small-text" (a dotted line through
  // each line of text), "image" (images: sketch, halftone, colour dots, photo), or "auto" (all of it, text by size)
  variant: "text",
  mode: "trace",            // "trace" | "trace-texts"
  duration: 3000,           // ms for the build; the whole run is about duration × 1.06
  delay: 0,                 // ms before it starts
  display: 32,              // px, variant "auto": text this size or larger is traced glyph by glyph, smaller as lines
  maxGlyphs: 140,           // most glyphs traced (the rest only ink in)
  fade: 90,                 // ms: how long each character (or word) takes to fade in
  fadeBy: "character",      // "character" | "word" | "gradient": a word once its last character is in, or a soft
                            // gradient mask sweeping left to right along each line behind the tracing
  fadeDelay: 140,           // ms between a character's dotted drawing finishing and its fade starting
  fadeStagger: 90,          // ms between one character's (or word's) fade and the next; null: follow the tracing
  sequenceEase: [0.37, -0.02, 0.73, 0.88], // how the starts spread over the build (a gentle in-out by default):
                               // "linear" | "ease-in" | "ease-out" | "ease-in-out" |
                               // "smooth-out", or your own curve: [x1, y1, x2, y2] or "cubic-bezier(x1, y1, x2, y2)"
  guides: false,            // type guides: cap height, x-height, baseline, descender, font spec
  focus: false,             // the focus bracket on the glyph or image being drawn, with its label
  readout: false,           // the coordinate readout on the moving dot
  particles: true,          // dots flying in to where each glyph starts
  dotScale: 1,              // scales the dots, their spacing and the moving heads (e.g. with the type in a scaled scene)
  steps: ["Setting type", "Tracing glyphs", "Sampling images", "Inking"],
  done: "Ready",
  onDone: null,
};

// phases as fractions of `duration`
const PH = { guides: [0, 0.26], glyphs: [0.06, 0.76], lines: [0.12, 0.78], images: [0.04, 0.16], ink: 0.16, clean: [0.86, 1.04] };
// an image's own timeline, from its start: frame, contour sketch, halftone, colour, photo (fractions of duration)
const IMG = { frame: 0.2, sketch: [0.08, 0.38], screen: [0.2, 0.56], colour: [0.52, 0.68], photo: [0.64, 0.88] };
const END = 1.06;

const clamp = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = (a, b, x) => { const q = clamp((x - a) / (b - a)); return q * q * (3 - 2 * q); };
const f2 = (n) => (+n).toFixed(2);
const hashN = (x) => { const v = Math.sin(x * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
function bezier(x1, y1, x2, y2) {
  const cx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const cy = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, m = 0.5; for (let i = 0; i < 28; i++) { m = (lo + hi) / 2; if (cx(m) < x) lo = m; else hi = m; } return cy(m); };
}
const OUT = bezier(0.16, 1, 0.3, 1);          // drawing: a soft, quick-settling ease-out
const SMOOTH_OUT = bezier(0.22, 1, 0.36, 1);  // ink and wipes: --ease-smooth-out
const EASE_OUT = bezier(0, 0, 0.58, 1);       // character fades: ease-out, so the 200ms reads as 200ms
// the sequence: where each glyph, line and image starts across the build (and so where each fade lands)
const SEQUENCE = { linear: (x) => x, "ease-in": bezier(0.42, 0, 1, 1), "ease-out": bezier(0, 0, 0.58, 1), "ease-in-out": bezier(0.42, 0, 0.58, 1),
  "smooth-out": SMOOTH_OUT }; // --ease-smooth-out: most of the text in early, the last characters settling slowly
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const css = (el, name, fb) => { const v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fb; };

function svg(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
// half a rounded rect, from top centre to bottom centre, clockwise (dir 1) or counter-clockwise (dir 0)
function rrHalf(x, y, w, h, r, dir) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const X = (v) => f2(x + v), Y = (v) => f2(y + v), R = f2(r);
  return dir
    ? `M${X(w / 2)} ${Y(0)}H${X(w - r)}A${R} ${R} 0 0 1 ${X(w)} ${Y(r)}V${Y(h - r)}A${R} ${R} 0 0 1 ${X(w - r)} ${Y(h)}H${X(w / 2)}`
    : `M${X(w / 2)} ${Y(0)}H${X(r)}A${R} ${R} 0 0 0 ${X(0)} ${Y(r)}V${Y(h - r)}A${R} ${R} 0 0 0 ${X(r)} ${Y(h)}H${X(w / 2)}`;
}
// does `node` contain `el`, across shadow roots?
function holds(node, el) { for (let x = el; x; x = x.parentNode || x.host) if (x === node) return true; return false; }
// is this viewport rect empty page (nothing but the element's own containers)?
function isFree(el, x0, y0, x1, y1) {
  if (x0 < 0 || y0 < 0 || x1 > innerWidth || y1 > innerHeight + 400) return false;
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 4; j++) {
    const hit = document.elementFromPoint(lerp(x0, x1, i / 6), Math.min(innerHeight - 1, lerp(y0, y1, j / 4)));
    if (hit && hit !== document.body && hit !== document.documentElement && !holds(hit, el)) return false;
  }
  return true;
}

// ─── 1. glyph outlines: marching squares over a character drawn alone in its own font ───
// a: alpha 0..255, W × H; returns closed loops of [x, y] in pixel units
function marching(a, W, H) {
  const T = 128, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : a[y * W + x]);
  const pts = new Map(), adj = new Map();
  const pt = (key, x0, y0, v0, x1, y1, v1) => { if (!pts.has(key)) { const t = (T - v0) / (v1 - v0); pts.set(key, [x0 + (x1 - x0) * t + 0.5, y0 + (y1 - y0) * t + 0.5]); } return key; };
  const link = (p, q) => { (adj.get(p) || adj.set(p, []).get(p)).push(q); (adj.get(q) || adj.set(q, []).get(q)).push(p); };
  for (let y = -1; y < H; y++) for (let x = -1; x < W; x++) {
    const A = at(x, y), B = at(x + 1, y), C = at(x + 1, y + 1), D = at(x, y + 1);
    const i = (A >= T ? 8 : 0) | (B >= T ? 4 : 0) | (C >= T ? 2 : 0) | (D >= T ? 1 : 0);
    if (i === 0 || i === 15) continue;
    const top = () => pt(`h${x},${y}`, x, y, A, x + 1, y, B), bottom = () => pt(`h${x},${y + 1}`, x, y + 1, D, x + 1, y + 1, C);
    const left = () => pt(`v${x},${y}`, x, y, A, x, y + 1, D), right = () => pt(`v${x + 1},${y}`, x + 1, y, B, x + 1, y + 1, C);
    switch (i) {
      case 1: case 14: link(left(), bottom()); break;
      case 2: case 13: link(bottom(), right()); break;
      case 3: case 12: link(left(), right()); break;
      case 4: case 11: link(top(), right()); break;
      case 6: case 9: link(top(), bottom()); break;
      case 7: case 8: link(left(), top()); break;
      case 5: link(top(), right()); link(left(), bottom()); break;
      case 10: link(left(), top()); link(bottom(), right()); break;
    }
  }
  const loops = [], seen = new Set();
  for (const k of adj.keys()) {
    if (seen.has(k)) continue;
    const loop = []; let prev = null, cur = k;
    while (cur && !seen.has(cur)) {
      seen.add(cur); loop.push(pts.get(cur));
      const nb = adj.get(cur), nx = nb.find((n) => n !== prev && !seen.has(n)) || null;
      prev = cur; cur = nx;
    }
    if (loop.length > 3) loops.push(loop);
  }
  return loops;
}
function rdp(p, eps) {
  if (p.length < 3) return p;
  const [ax, ay] = p[0], [bx, by] = p[p.length - 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
  let idx = 0, dmax = 0;
  for (let i = 1; i < p.length - 1; i++) { const d = Math.abs((p[i][0] - ax) * dy - (p[i][1] - ay) * dx) / L; if (d > dmax) { dmax = d; idx = i; } }
  return dmax <= eps ? [p[0], p[p.length - 1]] : [...rdp(p.slice(0, idx + 1), eps).slice(0, -1), ...rdp(p.slice(idx), eps)];
}
function simplifyLoop(p, eps) {
  let far = 0, d = 0; p.forEach(([x, y], i) => { const k = (x - p[0][0]) ** 2 + (y - p[0][1]) ** 2; if (k > d) { d = k; far = i; } });
  return [...rdp(p.slice(0, far + 1), eps).slice(0, -1), ...rdp([...p.slice(far), p[0]], eps).slice(0, -1)];
}
let CV = null;
function glyphLoops(g) {
  const S = g.size < 64 ? 2 : 1, px = Math.ceil(g.size * 0.35), py = Math.ceil(g.size * 0.25);
  const W = Math.ceil((g.w + 2 * px) * S), H = Math.ceil((g.h + 2 * py) * S);
  if (!CV) CV = document.createElement("canvas");
  CV.width = W; CV.height = H;
  const ctx = CV.getContext("2d", { willReadFrequently: true });
  ctx.setTransform(S, 0, 0, S, 0, 0); ctx.font = g.font; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#000";
  ctx.fillText(g.ch, px, py + g.base - g.y);
  const d = ctx.getImageData(0, 0, W, H).data, a = new Uint8Array(W * H);
  for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
  return marching(a, W, H)
    .map((l) => simplifyLoop(l.map(([x, y]) => [g.x - px + x / S, g.y - py + y / S]), 0.3))
    .filter((l) => l.length > 2)
    .map((l) => { const xs = l.map((q) => q[0]), ys = l.map((q) => q[1]); return { l, size: (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)) }; })
    .filter((o) => o.size > 1.5)
    .sort((m, n) => n.size - m.size) // outer shapes first, then counters
    .map((o) => "M" + o.l.map(([x, y]) => `${f2(x)} ${f2(y)}`).join("L") + "Z");
}

// ─── 2. read the element: display glyphs, smaller text lines, images, and the blocks that hold them ───
function measure(el, opts) {
  const R = el.getBoundingClientRect(), rel = (r) => ({ x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height });
  const hidden = (n) => { for (let x = n; x && x !== el.parentNode; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === "none" || cs.visibility === "hidden") return true; } return false; };
  const glyphs = [], lines = [], words = [], images = [], hosts = [], metrics = new Map();
  // the block a text node is revealed through: its nearest non-inline ancestor inside el (or el)
  const hostOf = (n) => { let x = n.parentElement; while (x && x !== el && getComputedStyle(x).display.startsWith("inline")) x = x.parentElement; return x && holds(el, x) ? x : el; };
  const addHost = (h) => { if (!hosts.includes(h)) hosts.push(h); return h; };
  const mctx = document.createElement("canvas").getContext("2d");
  const metric = (font) => {
    if (metrics.has(font)) return metrics.get(font);
    mctx.font = font; const m = mctx.measureText("Hxgp");
    const v = { asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent, cap: mctx.measureText("H").actualBoundingBoxAscent, xh: mctx.measureText("x").actualBoundingBoxAscent, low: mctx.measureText("gjpqy").actualBoundingBoxDescent };
    metrics.set(font, v); return v;
  };
  // images
  // the variant picks what is generated (the rest stays as it is) and how text is drawn
  const V = opts.variant || "text", doImages = V === "image" || V === "auto", doText = V !== "image";
  const display = V === "text" ? 0 : V === "small-text" ? Infinity : opts.display;
  const imgs = !doImages ? [] : el.matches("img, video, canvas") ? [el] : [...el.querySelectorAll("img, video, canvas")];
  for (const im of imgs) {
    if (im.closest("[data-t-trace-skip]") || hidden(im)) continue;
    const r = im.getBoundingClientRect(); if (r.width < 40 || r.height < 40) continue;
    const cs = getComputedStyle(im);
    images.push({ el: im, ...rel(r), r: Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.width / 2, r.height / 2), fit: cs.objectFit, pos: cs.objectPosition });
  }
  // text
  if (doText && !el.matches("img, video, canvas")) {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (!n.nodeValue.trim() || n.parentElement.closest("script, style, noscript, template, svg, [data-t-trace-skip]") || hidden(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const rg = document.createRange();
    // display text is measured glyph by glyph, smaller text character by character (their fades). Every character
    // carries a word id: a word runs across inline elements and ends at whitespace or a new block.
    let wid = 0, open = false, lastHost = null;
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const cs = getComputedStyle(n.parentElement), size = parseFloat(cs.fontSize), host = addHost(hostOf(n));
      if (host !== lastHost || /^\s/.test(n.nodeValue)) open = false;
      lastHost = host;
      if (size >= display) {
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, m = metric(font), s = n.nodeValue, tt = cs.textTransform;
        for (let i = 0; i < s.length;) {
          const len = s.codePointAt(i) > 0xffff ? 2 : 1, ch = s.substr(i, len); i += len;
          if (/\s/.test(ch)) { open = false; continue; }
          if (!open) { wid++; open = true; }
          rg.setStart(n, i - len); rg.setEnd(n, i);
          const r = rg.getClientRects()[0]; if (!r || !r.width) continue;
          const b = rel(r), base = b.y + (b.h - (m.asc + m.desc)) / 2 + m.asc, c = tt === "uppercase" ? ch.toUpperCase() : tt === "lowercase" ? ch.toLowerCase() : ch;
          mctx.font = font; const k = mctx.measureText(c); // the glyph's own ink box, so its ink never reaches the line above or below
          b.ink = { x0: b.x - k.actualBoundingBoxLeft, x1: b.x + k.actualBoundingBoxRight, y0: base - k.actualBoundingBoxAscent, y1: base + k.actualBoundingBoxDescent };
          glyphs.push({ ch: tt === "uppercase" ? ch.toUpperCase() : tt === "lowercase" ? ch.toLowerCase() : ch, ...b, base, font, size, m, host, family: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), weight: cs.fontWeight, lh: parseFloat(cs.lineHeight) || size * 1.2, word: wid });
        }
      } else {
        let end = -1;
        for (const mt of n.nodeValue.matchAll(/\S/gu)) {
          if (end !== -1 && mt.index !== end) open = false; // whitespace inside the node ends the word
          if (!open) { wid++; open = true; }
          end = mt.index + mt[0].length;
          rg.setStart(n, mt.index); rg.setEnd(n, end);
          words.push({ rects: [...rg.getClientRects()].filter((q) => q.width).map(rel), host, word: wid });
        }
        rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) {
          const last = lines[lines.length - 1], y = q.top - R.top;
          if (last && last.host === host && Math.abs(last.y - y) < 2 && q.left - R.left - last.x2 < size) last.x2 = Math.max(last.x2, q.right - R.left);
          else lines.push({ x: q.left - R.left, x2: q.right - R.left, y, h: q.height, host });
        }
      }
      open = !/\s$/.test(n.nodeValue);
    }
  }
  // display lines: glyphs that share a baseline in the same block get one set of type guides
  const rows = [];
  for (const g of glyphs) {
    let row = rows.find((r) => r.host === g.host && Math.abs(r.base - g.base) < 2 && r.font === g.font);
    if (!row) rows.push((row = { host: g.host, base: g.base, font: g.font, m: g.m, x0: g.x, x1: g.x + g.w, size: g.size, family: g.family, weight: g.weight, lh: g.lh }));
    row.x0 = Math.min(row.x0, g.x); row.x1 = Math.max(row.x1, g.x + g.w);
  }
  return { w: R.width, h: R.height, glyphs, lines, words, images, hosts, rows };
}

// ─── 3. images: their own pixels, read for a contour sketch and a halftone ───
// the image as it is shown (object-fit cover, contain or fill, and object-position) at cols × rows; null if unreadable
function readImage(im, cols, rows) {
  try {
    const c = document.createElement("canvas"); c.width = cols; c.height = rows;
    const g = c.getContext("2d", { willReadFrequently: true }), src = im.el;
    const sw = src.naturalWidth || src.videoWidth || src.width, sh = src.naturalHeight || src.videoHeight || src.height;
    if (!sw || !sh) return null;
    let sx = 0, sy = 0, cw = sw, ch = sh, dx = 0, dy = 0, dw = cols, dh = rows;
    const [px, py = 0.5] = String(im.pos || "50% 50%").split(" ").map((v) => (/%$/.test(v) ? parseFloat(v) / 100 : 0.5));
    if (im.fit === "cover") { const k = Math.max(im.w / sw, im.h / sh); cw = im.w / k; ch = im.h / k; sx = (sw - cw) * px; sy = (sh - ch) * py; }
    else if (im.fit === "contain") { const k = Math.min(im.w / sw, im.h / sh); dw = (sw * k * cols) / im.w; dh = (sh * k * rows) / im.h; dx = (cols - dw) * px; dy = (rows - dh) * py; }
    g.imageSmoothingQuality = "high";
    g.drawImage(src, sx, sy, cw, ch, dx, dy, dw, dh);
    return g.getImageData(0, 0, cols, rows).data;
  } catch (e) { return null; } // a cross-origin image without CORS can't be read
}
// luminance 0..1, stretched between the image's own 1st and 99th percentile so a soft photo still has range
function luminance(d, n, cols) {
  const lum = new Float32Array(n), hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) {
    const v = d ? (d[i * 4 + 3] ? (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255 : 1) : 0.35 + 0.3 * ((i % cols) / cols);
    lum[i] = v; hist[Math.min(255, Math.round(v * 255))]++;
  }
  let lo = 0, hi = 255, acc = 0;
  for (let k = 0; k < 256; k++) { acc += hist[k]; if (acc >= n * 0.01) { lo = k; break; } }
  acc = 0; for (let k = 255; k >= 0; k--) { acc += hist[k]; if (acc >= n * 0.01) { hi = k; break; } }
  for (let i = 0; i < n; i++) lum[i] = clamp((lum[i] * 255 - lo) / Math.max(20, hi - lo));
  return lum;
}
function boxBlur(a, W, H) {
  const o = new Float32Array(a.length);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = x + i, Y = y + j; if (X >= 0 && Y >= 0 && X < W && Y < H) { s += a[Y * W + X]; n++; } }
    o[y * W + x] = s / n;
  }
  return o;
}
const chaikin = (p) => (p.length < 3 ? p : [p[0], ...p.slice(0, -1).flatMap((a, i) => { const b = p[i + 1]; return [[a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]]; }), p[p.length - 1]]);
const polyLen = (p) => p.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0);

// the contour sketch: lines of equal tone (shadows, midtones, highlights) through the softened photo, like a
// topographic drawing of it; edges of the image are left to the frame. Longest lines kept within `budget` px.
function sketch(im, light, budget) {
  const S = 3, cols = Math.max(2, Math.round(im.w / S)), rows = Math.max(2, Math.round(im.h / S)), sx = im.w / cols, sy = im.h / rows;
  const d = readImage(im, cols, rows); if (!d) return [];
  const lum = boxBlur(luminance(d, cols * rows, cols), cols, rows), out = [];
  for (const lv of [0.14, 0.28, 0.42, 0.56, 0.7, 0.84]) {
    const a = new Uint8Array(cols * rows);
    for (let i = 0; i < a.length; i++) a[i] = Math.round(clamp(0.5 + ((light ? lum[i] : 1 - lum[i]) - lv) * 4) * 255);
    for (const loop of marching(a, cols, rows)) {
      let run = [];
      const flush = () => { if (run.length > 3) out.push(run); run = []; };
      for (const [x, y] of loop) { if (x < 1.2 || y < 1.2 || x > cols - 1.2 || y > rows - 1.2) flush(); else run.push([x * sx, y * sy]); }
      flush();
    }
  }
  // long contours are cut into strokes of up to 240px, so the sketch builds up in many places at once
  const pieces = [];
  for (const p of out.map((q) => chaikin(rdp(q, 0.8)))) {
    let cur = [p[0]], L = 0;
    for (let i = 1; i < p.length; i++) {
      L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); cur.push(p[i]);
      if (L > 240 && p.length - i > 4) { pieces.push(cur); cur = [p[i]]; L = 0; }
    }
    pieces.push(cur);
  }
  const lines = pieces.map((p) => ({ p, L: polyLen(p), y: Math.min(...p.map((q) => q[1])) })).filter((o) => o.L > 16).sort((a, b) => b.L - a.L);
  const keep = []; let total = 0;
  for (const o of lines) { if (total + o.L > budget) continue; keep.push(o); total += o.L; }
  return keep.sort((a, b) => a.y + hashN(a.L) * 60 - b.y - hashN(b.L) * 60).map((o) => "M" + o.p.map(([x, y]) => `${f2(im.x + x)} ${f2(im.y + y)}`).join("L"));
}

// the halftone: one dot per cell, its area following how dark the photo is there (bright on a dark page), with the
// local contrast lifted so texture survives the screen; it sweeps in from the top left. Plus the cells' own colours.
function halftone(im, cell, light) {
  const cols = Math.max(1, Math.floor(im.w / cell)), rows = Math.max(1, Math.floor(im.h / cell)), ox = (im.w - cols * cell) / 2, oy = (im.h - rows * cell) / 2;
  const d = readImage(im, cols, rows), lum = luminance(d, cols * rows, cols), dots = [];
  const soft = boxBlur(boxBlur(boxBlur(lum, cols, rows), cols, rows), cols, rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, v = clamp(lum[i] + 2 * (lum[i] - soft[i])), dark = Math.pow(light ? v : 1 - v, 1.3); // shadows keep their steps
    if (dark < 0.04) continue;
    const x = (c + 0.5) / cols, y = (r + 0.5) / rows;
    dots.push({ x: ox + (c + 0.5) * cell, y: oy + (r + 0.5) * cell, r: Math.max(0.3, cell * 0.46 * Math.sqrt(dark)), at: 0.8 * ((x * 0.4 + y * 0.6)) + 0.2 * hashN(r * 12.9 + c * 78.2) });
  }
  dots.sort((a, b) => a.at - b.at);
  return { dots, d, cols, rows, ox, oy };
}

// ─── 4. the overlay ───
const MPAD = 64, MASK_PROPS = ["maskImage", "webkitMaskImage", "maskSize", "webkitMaskSize", "maskPosition", "webkitMaskPosition", "maskRepeat", "webkitMaskRepeat", "maskClip", "webkitMaskClip"];
function build(el, M, opts) {
  const DS = Math.max(0.2, +opts.dotScale || 1), R = el.getBoundingClientRect(), w = M.w, h = M.h, DOT_GAP = 4.6 * DS;
  const layer = document.createElement("div");
  layer.className = "t-tig" + (opts.mode === "trace-texts" ? " t-tig--texts" : "");
  layer.setAttribute("aria-hidden", "true");
  // the overlay goes into the page, or into opts.parent (a positioned element it should show and hide with)
  const P = opts.parent || document.body, PR = P === document.body ? { left: -scrollX, top: -scrollY } : P.getBoundingClientRect();
  Object.assign(layer.style, { left: f2(R.left - PR.left + (P === document.body ? 0 : P.scrollLeft)) + "px", top: f2(R.top - PR.top + (P === document.body ? 0 : P.scrollTop)) + "px", width: f2(w) + "px", height: f2(h) + "px" });
  const dpr = Math.min(2, devicePixelRatio || 1), cv = document.createElement("canvas");
  cv.className = "t-tig-canvas"; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = f2(w) + "px"; cv.style.height = f2(h) + "px";
  layer.appendChild(cv);
  const root = svg("svg", { class: "t-tig-svg", width: f2(w), height: f2(h), viewBox: `0 0 ${f2(w)} ${f2(h)}` }, layer);
  P.appendChild(layer); el.__tTigLayer = layer; // in the page first: SVG lengths only measure once rendered
  const G = { el, layer, root, cv, ctx: cv.getContext("2d"), w, h, M, glyphs: [], lines: [], images: [], rows: [] };
  G.ctx.scale(dpr, dpr);
  G.ink = css(el, "--tig-ink", "rgba(13, 13, 13, 0.5)"); G.lit = css(el, "--tig-strong", "#6c6c6c");
  const rgb = (G.ink.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number); G.light = rgb[0] + rgb[1] + rgb[2] > 384;
  const stroke = (d, parent, cls = "t-tig-wire", gap = DOT_GAP) => { const e = svg("path", { d, class: cls }, parent); return { el: e, L: e.getTotalLength(), gap }; };
  const head = (parent, r = 2.2) => svg("circle", { r: f2(r * DS), class: "t-tig-head", opacity: 0 }, parent);
  if (DS !== 1) layer.style.setProperty("--tig-dot", f2((parseFloat(css(el, "--tig-dot", "2.1")) || 2.1) * DS) + "px");
  const wires = svg("g", { class: "t-tig-wireframe" }, root);

  // type guides: cap height, x-height, baseline and descender for each display line, past both ends
  if (opts.guides !== false) M.rows.forEach((row, i) => {
    // the first line of each block carries the labels; the lines under it only their guides
    const first = M.rows.findIndex((r) => r.host === row.host && r.font === row.font) === i, E = 26, ys = [["CAP", row.base - row.m.cap], ["X", row.base - row.m.xh], ["BASE", row.base], ["DESC", row.base + row.m.low]];
    const g = svg("g", { opacity: 0 }, root);
    const guides = ys.map(([name, y], k) => ({ ...stroke(`M${f2(row.x0 - E)} ${f2(y)}H${f2(row.x1 + E)}`, g, "t-tig-guide", 6), name, y,
      label: Object.assign(svg("text", { x: f2(row.x1 + E + 6), y: f2(y + 3), class: "t-tig-label t-tig-label--small" }, g), { textContent: first ? `${name} ${Math.round(Math.abs(row.base - y)) || ""}`.trim() : "" }), k }));
    const spec = Object.assign(svg("text", { x: f2(row.x0 - E), y: f2(row.base - row.m.cap - 9), class: "t-tig-label" }, g), { textContent: first ? `${row.family.toUpperCase()} ${row.weight}  ${Math.round(row.size)}/${Math.round(row.lh)}` : "" });
    G.rows.push({ g, guides, spec, t0: PH.guides[0] + i * 0.035, row });
  });

  // glyphs: their own outlines, traced loop by loop
  // the easing describes the reveal's progress (how much of the text is in over time), so an item's start is the
  // time at which progress reaches its place in the order: the inverse of the curve
  // a preset name, a [x1, y1, x2, y2] curve, or a "cubic-bezier(…)" string
  const se = opts.sequenceEase, nums = Array.isArray(se) ? se : typeof se === "string" && /^cubic-bezier/.test(se) ? se.match(/-?[\d.]+/g).map(Number) : null;
  const ease = nums && nums.length === 4 ? bezier(...nums) : SEQUENCE[se] || SEQUENCE.linear;
  const seq = (f) => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (ease(m) < f) lo = m; else hi = m; } return (lo + hi) / 2; };
  const traced = M.glyphs.slice(0, opts.maxGlyphs), n = M.glyphs.length, span = PH.glyphs[1] - PH.glyphs[0], dur = Math.min(0.16, span * 0.45);
  M.glyphs.forEach((g, i) => {
    const t0 = PH.glyphs[0] + (n > 1 ? (span - dur) * seq(i / (n - 1)) : 0), gg = svg("g", {}, wires);
    let strokes = [];
    if (traced.includes(g)) { try { strokes = glyphLoops(g).map((d) => stroke(d, gg)); } catch (e) { strokes = []; } }
    strokes.forEach((s, k) => { s.idx = k; s.head = head(gg); });
    strokes.n = strokes.length;
    G.glyphs.push({ g: gg, strokes, b: g, t0, t1: t0 + dur, ti: t0 + dur * 0.8, host: g.host });
  });

  // smaller text: a dotted line through each line of it, like the wireframe skill
  const nl = M.lines.length, lspan = PH.lines[1] - PH.lines[0], ldur = Math.min(0.14, lspan * 0.5);
  M.lines.forEach((ln, i) => {
    const y = ln.y + ln.h * 0.56, s = stroke(`M${f2(ln.x)} ${f2(y)}H${f2(ln.x2)}`, wires);
    s.head = head(wires, 1.8); s.idx = 0;
    const t0 = PH.lines[0] + (nl > 1 ? (lspan - ldur) * seq(i / (nl - 1)) : 0);
    G.lines.push({ s, b: ln, t0, t1: t0 + ldur, ti: t0 + ldur * 0.7, host: ln.host });
  });

  // images: a dotted frame with handles and a label, a contour sketch of the photo in flowing dots, a fine halftone
  // of its own pixels arriving shadows first, the dots taking the photo's colours, then the photo itself over them
  M.images.forEach((im, i) => {
    const t0 = M.images.length > 1 ? lerp(PH.images[0], PH.images[1], seq(i / (M.images.length - 1))) : PH.images[0];
    const cell = Math.max(3, Math.min(5, Math.round(Math.sqrt(im.w * im.h) / 160)));
    const frame = [1, 0].map((dir) => Object.assign(stroke(rrHalf(im.x, im.y, im.w, im.h, im.r, dir), wires), { head: head(wires, 2.6) }));
    const handles = [[im.x, im.y], [im.x + im.w, im.y], [im.x + im.w, im.y + im.h], [im.x, im.y + im.h]].map(([x, y]) => ({ el: svg("rect", { x: -2.5, y: -2.5, width: 5, height: 5, class: "t-tig-handle", transform: `translate(${f2(x)} ${f2(y)}) scale(0)` }, root), x, y }));
    const label = svg("text", { x: f2(im.x), y: f2(im.y - 8), class: "t-tig-label", opacity: 0 }, root);
    const status = svg("text", { x: f2(im.x + im.w), y: f2(im.y - 8), class: "t-tig-label t-tig-label--small", "text-anchor": "end", opacity: 0 }, root);
    const sk = svg("g", { class: "t-tig-sketch" }, wires);
    const paths = sketch(im, G.light, (im.w + im.h) * 13), ns = paths.length, sd = 0.12, [a0, a1] = IMG.sketch;
    const lines = paths.map((d, k) => Object.assign(stroke(d, sk, "t-tig-wire", 3.4 * DS), { t0: t0 + a0 + (ns > 1 ? (a1 - a0 - sd) * (k / (ns - 1)) : 0), head: k % 3 ? null : head(sk, 1.6) }));
    // the two finished screens are drawn once: the grey dots as they settle, and the colour dot matrix
    const screen = (fill) => { const c = document.createElement("canvas"); c.width = Math.ceil(im.w * dpr); c.height = Math.ceil(im.h * dpr); const g = c.getContext("2d"); g.scale(dpr, dpr); if (fill) g.fillStyle = fill; return [c, g]; };
    const ht = halftone(im, cell, G.light), [settled, sg] = screen(G.ink), [colour, cg] = screen();
    if (ht.d) {
      const buckets = new Map(), cr = cell * 0.48;
      for (let r = 0; r < ht.rows; r++) for (let c = 0; c < ht.cols; c++) {
        const j = (r * ht.cols + c) * 4, key = `rgb(${ht.d[j] & 0xf8},${ht.d[j + 1] & 0xf8},${ht.d[j + 2] & 0xf8})`;
        (buckets.get(key) || buckets.set(key, []).get(key)).push([ht.ox + (c + 0.5) * cell, ht.oy + (r + 0.5) * cell]);
      }
      for (const [col, pts] of buckets) { cg.fillStyle = col; cg.beginPath(); for (const [x, y] of pts) { cg.moveTo(x + cr, y); cg.arc(x, y, cr, 0, Math.PI * 2); } cg.fill(); }
    }
    G.images.push({ im, frame, handles, label, status, sk, lines, dots: ht.dots, k: 0, settled, sg, colour: ht.d ? colour : null, cell, t0,
      prev: { opacity: im.el.style.opacity, filter: im.el.style.filter } });
  });

  // reticle on the glyph being traced, coordinate readout on its moving dot, particles landing on each glyph
  G.ret = svg("path", { class: "t-tig-reticle", opacity: 0 }, root); G.tag = svg("text", { class: "t-tig-label t-tig-label--tag", opacity: 0 }, root);
  G.read = svg("text", { class: "t-tig-label t-tig-label--small", opacity: 0 }, root);
  G.flyers = opts.particles === false ? [] : G.glyphs.filter((g) => g.strokes.length).map((g, i) => {
    const pt = g.strokes[0].el.getPointAtLength(0), ang = hashN(i * 9.1) * Math.PI * 2, dist = 28 + 50 * hashN(i * 4.7);
    return { el: svg("circle", { r: f2(1.6 * DS), class: "t-tig-flyer", opacity: 0 }, root), x0: pt.x + Math.cos(ang) * dist, y0: pt.y + Math.sin(ang) * dist, x1: pt.x, y1: pt.y, arr: g.t0, s0: g.t0 - 0.08 };
  });

  // the blocks the text is revealed through, with their own clip
  G.hosts = M.hosts.map((hel) => {
    const r = hel.getBoundingClientRect(), st = hel.style, W = r.width + 2 * MPAD, H = r.height + 2 * MPAD;
    const prev = {}; MASK_PROPS.forEach((k) => (prev[k] = st[k]));
    const setup = { maskSize: `${f2(W)}px ${f2(H)}px`, webkitMaskSize: `${f2(W)}px ${f2(H)}px`, maskPosition: `${-MPAD}px ${-MPAD}px`, webkitMaskPosition: `${-MPAD}px ${-MPAD}px`,
      maskRepeat: "no-repeat", webkitMaskRepeat: "no-repeat", maskClip: "no-clip", webkitMaskClip: "no-clip" };
    Object.assign(st, setup);
    return { el: hel, x: r.left - R.left, y: r.top - R.top, W, H, prev, setup };
  });
  // each glyph fades in through its own box: its cell across (its ink box at the ends of a line), its ink box down
  for (const g of G.glyphs) {
    const b = g.b, k = b.ink, row = M.rows.find((r) => r.host === b.host && Math.abs(r.base - b.base) < 2 && r.font === b.font);
    g.box = { x0: b.x <= row.x0 + 0.5 ? Math.min(b.x, k.x0) - 2 : b.x, x1: b.x + b.w >= row.x1 - 0.5 ? Math.max(b.x + b.w, k.x1) + 2 : b.x + b.w, y0: k.y0 - 2, y1: k.y1 + 2 };
  }
  // the real text fades in character by character (a display glyph `fadeDelay` after it is traced, a smaller
  // character that long after its line's dotted stroke passes it), or word by word (each word once its last would)
  // "drawn" is when the eased stroke looks finished (98% of its length), not when its time runs out: the ease-out
  // leaves a long, invisible tail
  const wait = Math.max(0, +(opts.fadeDelay ?? DEFAULTS.fadeDelay) || 0) / opts.duration;
  const inv = (f) => { let lo = 0, hi = 1; for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (OUT(m) < f) lo = m; else hi = m; } return hi; };
  const looks = inv(0.98);
  for (const g of G.glyphs) {
    const n = g.strokes.n || 1, q = Math.min(1, ((n - 1) * 0.75 + looks) / n); // the last loop starts at (n - 1) × 0.75 of n
    g.wi = g.t0 + (g.t1 - g.t0) * q + wait;
  }
  G.words = M.words.map((wd) => {
    const r0 = wd.rects[0] || { x: 0, y: 0, w: 0, h: 0 }, last = wd.rects[wd.rects.length - 1] || r0;
    const ln = G.lines.find((l) => l.host === wd.host && Math.abs(l.b.y - last.y) < 2 && last.x >= l.b.x - 1 && last.x <= l.b.x2 + 1) || G.lines[0];
    const f = ln ? clamp((last.x + last.w - ln.b.x) / Math.max(1, ln.b.x2 - ln.b.x)) : 1;
    return { rects: wd.rects, host: wd.host, word: wd.word, ln, wi: (ln ? ln.t0 + (ln.t1 - ln.t0) * inv(f) : PH.lines[0]) + wait };
  });
  // an even stagger instead of the tracing's rhythm: the first fade stays put, the rest follow every fadeStagger ms
  // (per word with fadeBy: "word"), but no character fades in before it is drawn
  if (opts.fadeStagger != null && +opts.fadeStagger >= 0) {
    const units = [...G.glyphs.map((g) => ({ o: g, word: g.b.word, t: g.wi })), ...G.words.map((w) => ({ o: w, word: w.word, t: w.wi }))].sort((a, b) => a.t - b.t);
    const base = units.length ? units[0].t : 0, step = +opts.fadeStagger / opts.duration, order = new Map();
    units.forEach((u) => { if (!order.has(u.word)) order.set(u.word, order.size); });
    // the same total as an even stagger, spread along the sequence easing
    const N = opts.fadeBy === "word" ? order.size : units.length;
    // never before the character's own drawing is done (plus fadeDelay): a short word traced slowly keeps its trace
    units.forEach((u, k) => { const j = opts.fadeBy === "word" ? order.get(u.word) : k; u.o.wi = Math.max(u.t, base + (N > 1 ? (N - 1) * step * seq(j / (N - 1)) : 0)); });
  }
  if (opts.fadeBy === "word") {
    const end = new Map();
    for (const o of [...G.glyphs.map((g) => ({ word: g.b.word, wi: g.wi })), ...G.words]) end.set(o.word, Math.max(end.get(o.word) || 0, o.wi));
    G.glyphs.forEach((g) => (g.wi = end.get(g.b.word))); G.words.forEach((w) => (w.wi = end.get(w.word)));
  }
  G.focus = opts.focus !== false; G.readout = opts.readout !== false;
  G.fade = Math.max(16, +opts.fade || DEFAULTS.fade);
  G.inkEnd = Math.max(0, ...G.glyphs.map((g) => g.wi), ...G.words.map((w) => w.wi), ...G.lines.map((l) => l.t1)) + G.fade / opts.duration;
  // gradient: one band per line of text, shown through a soft edge that sweeps left to right, reaching each
  // character's right side when that character would start to fade; the edge is as wide as the front travels in
  // `fade` ms, so every point still takes about `fade` to come in
  G.bands = [];
  if (opts.fadeBy === "gradient") {
    const fp = G.fade / opts.duration, band = (host, items, y0, y1) => {
      if (!items.length) return;
      items.sort((a, b) => a.x - b.x);
      let t = 0; const pts = items.map((o) => [(t = Math.max(t, o.t)), o.x]);
      const x0 = Math.min(...items.map((o) => o.x0)), x1 = Math.max(...items.map((o) => o.x));
      const v = (x1 - x0) / Math.max(1e-3, pts[pts.length - 1][0] - pts[0][0] + fp), soft = Math.max(6, Math.min(240, v * fp));
      pts.unshift([pts[0][0] - (pts[0][1] - x0) / Math.max(v, 1e-3), x0]); pts.push([pts[pts.length - 1][0] + fp, x1 + soft]);
      G.bands.push({ host, pts, soft, x0: x0 - 2, x1: x1 + soft, y0, y1 });
    };
    const rowsOf = new Map();
    for (const g of G.glyphs) { const k = [...rowsOf.keys()].find((r) => r.host === g.host && Math.abs(r.base - g.b.base) < 2) || { host: g.host, base: g.b.base }; (rowsOf.get(k) || rowsOf.set(k, []).get(k)).push(g); }
    for (const [r, gs] of rowsOf) band(r.host, gs.map((g) => ({ t: g.wi, x: g.box.x1, x0: g.box.x0 })), Math.min(...gs.map((g) => g.box.y0)), Math.max(...gs.map((g) => g.box.y1)));
    for (const l of G.lines) {
      const cs = G.words.filter((w) => w.ln === l).flatMap((w) => w.rects.map((r) => ({ t: w.wi, x: r.x + r.w, x0: r.x })));
      band(l.host, cs, l.b.y - 3, l.b.y + l.b.h + 3);
    }
  }
  if (opts.mode === "trace-texts") buildTexts(G, el, opts);
  return G;
}

function buildTexts(G, el, opts) {
  // the log goes beside the element where that space is empty, else under it; the step line under it
  const r = el.getBoundingClientRect(), PW = 230, gap = 40;
  const mk = (cls) => { const d = document.createElement("div"); d.className = cls; G.layer.appendChild(d); return d; };
  const where = isFree(el, r.left - gap - PW, r.top, r.left - gap, Math.min(r.bottom, r.top + 220)) ? "left"
    : isFree(el, r.right + gap, r.top, r.right + gap + PW, Math.min(r.bottom, r.top + 220)) ? "right"
    : isFree(el, r.left, r.bottom + 64, r.right, r.bottom + 170) ? "below" : null;
  if (where) {
    G.logEl = mk("t-tig-panel t-tig-panel--" + where);
    if (where === "left") G.logEl.style.right = `calc(100% + ${gap}px)`;
    if (where === "right") G.logEl.style.left = `calc(100% + ${gap}px)`;
  }
  G.stepEl = mk("t-tig-steps");
  if (!isFree(el, r.left, r.bottom + 16, r.right, r.bottom + 50)) G.stepEl.style.display = "none";
  G.steps = [...opts.steps, opts.done].filter(Boolean);
  G.stepEl.innerHTML = G.steps.map(() => `<div class="t-tig-step"><i></i><span></span></div>`).join("");
  [...G.stepEl.children].forEach((d, i) => (d.lastChild.textContent = G.steps[i]));
  const hex = (k) => "0x" + Math.floor(hashN(k * 5.3 + 17.1) * 65535).toString(16).padStart(4, "0");
  const sz = (b) => `${String(Math.round(b.w)).padStart(3, "0")}×${String(Math.round(b.h)).padStart(3, "0")}`;
  G.log = [
    ...G.images.map((m, i) => ({ head: `${hex(i + 90)}  image  ${sz(m.im)}  ${String(m.dots.length).padStart(5, " ")} DOTS  ${String(m.lines.length).padStart(2, " ")} LINES  `, t0: m.t0, t1: m.t0 + IMG.colour[1] })),
    ...G.glyphs.map((g, i) => ({ head: `${hex(i)}  glyph  "${g.b.ch}"  ${sz(g.b)}  ${String(g.strokes.length).padStart(2, " ")} PATHS  `, t0: g.t0, t1: g.t1 })),
    ...G.lines.map((l, i) => ({ head: `${hex(i + 50)}  line   ${sz({ w: l.b.x2 - l.b.x, h: l.b.h })}  `, t0: l.t0, t1: l.t1 })),
  ].sort((a, b) => a.t0 - b.t0);
}

// ─── 5. one frame: p = progress (0 → END), t = ms since start ───
const FLOW = 0.016;
function drawStroke(s, q, t) {
  const on = q > 0; s.el.style.opacity = on ? 1 : 0;
  if (on) {
    const n = Math.floor((s.L * Math.min(1, q)) / s.gap) + 1;
    if (n !== s.n) { s.n = n; s.el.style.strokeDasharray = `${`0 ${f2(s.gap)} `.repeat(n - 1)}0 ${f2(s.L + 10)}`; }
    s.el.style.strokeDashoffset = f2(-(t * FLOW) % s.gap);
  }
  if (s.head) {
    const live = (s.live = q > 0 && q < 1); s.head.setAttribute("opacity", live ? 1 : 0);
    if (live) { s.pt = s.el.getPointAtLength(Math.floor((s.L * q) / s.gap) * s.gap); s.head.setAttribute("cx", f2(s.pt.x)); s.head.setAttribute("cy", f2(s.pt.y)); }
  }
}

function frame(G, p, t, D) {
  const clean = 1 - smooth(PH.clean[0], PH.clean[1], p), ink = (x) => EASE_OUT(clamp(((p - x) * D) / G.fade)); // G.fade ms from x

  // type guides: drawn out early, gone once their line has its ink
  for (const R of G.rows) {
    const out = 1 - smooth(0.7, 0.9, p);
    R.g.setAttribute("opacity", f2(p > R.t0 ? out : 0));
    R.guides.forEach((g) => { const q = OUT(clamp((p - R.t0 - g.k * 0.025) / 0.18)); drawStroke(g, q, t); g.label.setAttribute("opacity", f2(smooth(0.6, 1, q))); });
    R.spec.setAttribute("opacity", f2(smooth(R.t0 + 0.04, R.t0 + 0.12, p)));
  }
  // glyphs: traced loop by loop, then the dots fade as the letter fades in
  let cur = null;
  for (const g of G.glyphs) {
    const q = clamp((p - g.t0) / (g.t1 - g.t0)), iq = ink(g.wi);
    g.strokes.forEach((s) => drawStroke(s, OUT(clamp(q * g.strokes.n - s.idx * 0.75)), t));
    g.g.setAttribute("opacity", f2((1 - 0.85 * smooth(0.2, 1, iq)) * clean));
    if (p >= g.t0 && p < g.t1 + 0.04) cur = g;
  }
  for (const l of G.lines) {
    drawStroke(l.s, OUT(clamp((p - l.t0) / (l.t1 - l.t0))), t);
    if (l.s.el.style.opacity === "1") l.s.el.style.opacity = f2((1 - 0.85 * ink(l.t1)) * clean);
  }

  // the text blocks: each glyph and each smaller character (or word, or line band) fades in through the block's mask
  for (const H of G.hosts) {
    if (p >= G.inkEnd) { if (!H.done) { H.done = true; Object.assign(H.el.style, H.prev); } continue; }
    let s = "";
    const add = (x, y, w, h, a) => { if (w > 0.2 && h > 0.2 && a > 0.003) s += `<rect x='${f2(x - H.x + MPAD)}' y='${f2(y - H.y + MPAD)}' width='${f2(w)}' height='${f2(h)}'${a < 0.997 ? ` fill-opacity='${a.toFixed(3)}'` : ""}/>`; };
    if (G.bands.length) {
      // gradient: each line's band through a linear gradient whose soft edge sits at the front
      G.bands.forEach((b, i) => {
        if (b.host !== H.el || p <= b.pts[0][0]) return;
        let f = b.pts[b.pts.length - 1][1];
        for (let k = 1; k < b.pts.length; k++) if (p < b.pts[k][0]) { const [ta, xa] = b.pts[k - 1], [tb, xb] = b.pts[k]; f = lerp(xa, xb, (p - ta) / Math.max(1e-6, tb - ta)); break; }
        const X = (x) => f2(x - H.x + MPAD), Y = (y) => f2(y - H.y + MPAD);
        s += `<linearGradient id='b${i}' gradientUnits='userSpaceOnUse' x1='${X(f - b.soft)}' y1='0' x2='${X(f)}' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#000' stop-opacity='0'/></linearGradient>`
          + `<rect x='${X(b.x0)}' y='${Y(b.y0)}' width='${f2(b.x1 - b.x0)}' height='${f2(b.y1 - b.y0)}' fill='url(#b${i})'/>`;
      });
    } else {
      for (const g of G.glyphs) if (g.host === H.el) add(g.box.x0, g.box.y0, g.box.x1 - g.box.x0, g.box.y1 - g.box.y0, ink(g.wi));
      for (const w of G.words) if (w.host === H.el) { const a = ink(w.wi); for (const r of w.rects) add(r.x - 0.5, r.y - 3, r.w + 1, r.h + 6, a); }
    }
    for (const m of G.images) if (holds(H.el, m.im.el)) add(m.im.x - 2, m.im.y - 2, m.im.w + 4, m.im.h + 4, 1); // images keep their own reveal
    if (s !== H.key) {
      H.key = s;
      const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${f2(H.W)}' height='${f2(H.H)}'>${s}</svg>`)}")`;
      H.el.style.maskImage = url; H.el.style.webkitMaskImage = url;
    }
  }

  // images: frame and handles, the contour sketch, the halftone settling shadows first, the colour dot matrix, the photo
  const { ctx } = G; ctx.clearRect(0, 0, G.w, G.h);
  for (const m of G.images) {
    const { im } = m, at = (r) => [m.t0 + r[0], m.t0 + r[1]], es = im.el.style;
    const fq = OUT(clamp((p - m.t0) / IMG.frame)), hq = clamp((p - at(IMG.screen)[0]) / (IMG.screen[1] - IMG.screen[0]));
    const cq = SMOOTH_OUT(clamp((p - at(IMG.colour)[0]) / (IMG.colour[1] - IMG.colour[0]))), pq = SMOOTH_OUT(clamp((p - at(IMG.photo)[0]) / (IMG.photo[1] - IMG.photo[0])));
    const gone = 1 - pq;
    m.frame.forEach((s) => { drawStroke(s, fq, t); if (s.el.style.opacity === "1") s.el.style.opacity = f2(gone * clean); });
    m.handles.forEach((hd) => hd.el.setAttribute("transform", `translate(${f2(hd.x)} ${f2(hd.y)}) scale(${f2(OUT(clamp((p - m.t0 - 0.06) / 0.1)) * gone)})`));
    m.label.setAttribute("opacity", f2(smooth(m.t0, m.t0 + 0.06, p) * gone));
    // a small image keeps only its size, so the label and the status beside it never meet
    m.label.textContent = `IMAGE ${Math.round(im.w * fq)}×${Math.round(im.h * fq)}` + (im.w < 300 ? "" : `  ${im.fit === "fill" ? "" : im.fit.toUpperCase() + "  "}${m.cell}PX SCREEN`);
    m.status.setAttribute("opacity", f2(smooth(m.t0 + 0.04, m.t0 + 0.1, p) * gone));
    // the sketch: tone lines traced in flowing dots, quieter as the dots arrive
    m.lines.forEach((s) => drawStroke(s, OUT(clamp((p - s.t0) / 0.12)), t));
    m.sk.setAttribute("opacity", f2((1 - 0.55 * hq) * (1 - 0.6 * cq) * gone * clean));
    // dots that have landed are drawn once into the settled screen; the ones landing now pop in large and dark
    if (hq > 0) {
      const land = (d) => clamp((hq - d.at * 0.8) / 0.2);
      let any = false; m.sg.beginPath();
      while (m.k < m.dots.length && land(m.dots[m.k]) >= 1) { const d = m.dots[m.k++]; m.sg.moveTo(d.x + d.r, d.y); m.sg.arc(d.x, d.y, d.r, 0, Math.PI * 2); any = true; }
      if (any) m.sg.fill();
    }
    // the status reads this frame's count, so a frame is the same however the timeline got there
    m.status.textContent = pq > 0 ? `RESOLVING ${Math.round(pq * 100)}%` : cq > 0 ? `COLOUR ${Math.round(cq * 100)}%` : hq > 0 ? `SCREEN ${String(Math.min(m.k, m.dots.length)).padStart(5, "0")} DOTS` : `SKETCH ${m.lines.filter((s) => p >= s.t0).length}/${m.lines.length}`;
    if (hq > 0 && pq < 1) {
      ctx.globalAlpha = gone * (m.colour ? 1 - cq : 1);
      ctx.drawImage(m.settled, im.x, im.y, im.w, im.h);
      ctx.beginPath(); ctx.fillStyle = G.lit;
      for (let j = m.k; j < m.dots.length; j++) {
        const d = m.dots[j], a = clamp((hq - d.at * 0.8) / 0.2); if (a <= 0) break;
        const r = d.r * OUT(a) * (1 + 0.25 * (1 - a));
        ctx.moveTo(im.x + d.x + r, im.y + d.y); ctx.arc(im.x + d.x, im.y + d.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      if (m.colour && cq > 0) { ctx.globalAlpha = gone * cq; ctx.drawImage(m.colour, im.x, im.y, im.w, im.h); }
      ctx.globalAlpha = 1;
    }
    // the photo fades in over its colour dots, sharpening from a soft blur
    if (pq >= 1) { if (!m.done) { m.done = true; Object.assign(es, m.prev); } }
    else { es.opacity = pq > 0 ? f2(pq) : "0"; es.filter = pq > 0 ? `blur(${f2(6 * (1 - pq))}px)` : m.prev.filter; }
    if (p >= m.t0 && p < m.t0 + IMG.frame) cur = cur || { b: { ch: null, ...im }, image: true };
  }

  // reticle and readouts on whatever is being drawn now
  const rOp = cur && G.focus ? 1 - smooth(0.78, 0.86, p) : 0;
  G.ret.setAttribute("opacity", f2(rOp)); G.tag.setAttribute("opacity", f2(rOp));
  if (cur) {
    const b = cur.b, P = 4, X = b.x - P, Y = (cur.image ? b.y : b.base - b.m.cap) - P, RW = b.w + 2 * P, RH = (cur.image ? b.h : b.m.cap) + 2 * P, l = Math.min(7, RW / 3, RH / 3);
    G.ret.setAttribute("d", `M${f2(X)} ${f2(Y + l)}V${f2(Y)}H${f2(X + l)}M${f2(X + RW - l)} ${f2(Y)}H${f2(X + RW)}V${f2(Y + l)}M${f2(X + RW)} ${f2(Y + RH - l)}V${f2(Y + RH)}H${f2(X + RW - l)}M${f2(X + l)} ${f2(Y + RH)}H${f2(X)}V${f2(Y + RH - l)}`);
    G.tag.setAttribute("x", f2(X)); G.tag.setAttribute("y", f2(Y + RH + 10));
    G.tag.textContent = cur.image ? "" : `"${b.ch}" ${Math.round(b.w)}×${Math.round(b.m.cap)}`;
  }
  let live = null; for (const g of G.glyphs) for (const s of g.strokes) if (s.live) live = s;
  if (!live) for (const m of G.images) for (const s of m.lines) if (s.live && s.head) live = s;
  if (!G.readout) live = null;
  G.read.setAttribute("opacity", live ? 1 : 0);
  if (live) { G.read.setAttribute("x", f2(live.pt.x + 6)); G.read.setAttribute("y", f2(live.pt.y - 5)); G.read.textContent = `${String(Math.round(live.pt.x)).padStart(3, "0")}·${String(Math.round(live.pt.y)).padStart(3, "0")}`; }
  for (const q of G.flyers) {
    const k = clamp((p - q.s0) / (q.arr - q.s0)), on = p >= q.s0 && p < q.arr + 0.01;
    q.el.setAttribute("opacity", on ? f2(smooth(0, 0.25, k)) : 0);
    if (on) { const e = OUT(k); q.el.setAttribute("cx", f2(lerp(q.x0, q.x1, e))); q.el.setAttribute("cy", f2(lerp(q.y0, q.y1, e))); }
  }
  if (G.steps) texts(G, p, t);
}

function texts(G, p, t) {
  const vis = smooth(0.03, 0.1, p) * (1 - smooth(0.9, 1.04, p));
  if (G.logEl) {
    G.logEl.style.opacity = f2(vis);
    const shown = G.log.filter((l) => p >= l.t0), done = G.log.filter((l) => p >= l.t1).length;
    const rows = shown.slice(-11).map((l) => {
      const k = clamp((p - l.t0) / 0.03), prog = clamp((p - l.t0) / (l.t1 - l.t0)), full = l.head + (prog >= 1 ? "[  ok  ]" : `[${"#".repeat(Math.round(prog * 6)).padEnd(6, ".")}]`);
      return full.slice(0, Math.ceil(full.length * k));
    });
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const html = `<div class="t-tig-panel-head">AGENT.LOG // ${String(done).padStart(2, "0")}/${String(G.log.length).padStart(2, "0")}</div>` + rows.map((r) => `<div>${esc(r)}</div>`).join("");
    if (G.logSig !== html) { G.logSig = html; G.logEl.innerHTML = html; }
  }
  const n = G.steps.length, gone = smooth(0.98, 1.05, p);
  [...G.stepEl.children].forEach((s, i) => {
    const t0 = i < n - 1 ? (i / (n - 1)) * 0.92 : 0.92, t1 = i < n - 1 ? ((i + 1) / (n - 1)) * 0.92 : Infinity;
    const qi = OUT(clamp((p - t0) / 0.06)), qs = OUT(clamp((p - t1) / 0.05)), q = qi * (1 - Math.max(qs, gone));
    s.style.opacity = f2(q); s.style.transform = `translate(-50%, ${f2(5 * (1 - qi) - 5 * qs)}px)`;
    s.style.filter = q > 0.01 && q < 0.99 ? `blur(${f2(2 * (1 - q))}px)` : "none";
    s.classList.toggle("is-done", i === n - 1);
  });
}

// ─── 6. run ───
function generate(el, options = {}) {
  const opts = Object.assign({}, DEFAULTS, options);
  if (typeof el === "string") el = document.querySelector(el);
  if (!el) throw new Error("TextImageGeneration: no element");
  if (el.__tTig) el.__tTig.cancel();
  const prev = { opacity: el.__tTigOpacity !== undefined ? el.__tTigOpacity : el.style.opacity, transition: el.style.transition };
  let resolve, raf = 0, timer = 0, G = null, stopped = false;
  const finished = new Promise((r) => (resolve = r));
  const finish = () => {
    if (stopped) return; stopped = true; cancelAnimationFrame(raf); clearTimeout(timer);
    if (el.__tTigLayer) el.__tTigLayer.remove();
    if (G) { G.hosts.forEach((H) => Object.assign(H.el.style, H.prev)); G.images.forEach((m) => Object.assign(m.im.el.style, m.prev)); }
    Object.assign(el.style, prev); el.__tTig = null; if (opts.onDone) opts.onDone(el); resolve(el);
  };
  const run = { finished, cancel: finish, element: el };
  el.__tTig = run;

  if (reduced()) {
    el.style.opacity = 0;
    timer = setTimeout(() => { el.style.transition = "opacity 200ms ease-out"; el.style.opacity = prev.opacity || ""; timer = setTimeout(finish, 220); }, opts.delay);
    return run;
  }
  el.style.opacity = 0; // hidden until its drawing starts
  timer = setTimeout(() => requestAnimationFrame(() => {
    if (stopped) return;
    const D = (opts.duration = Math.max(800, +opts.duration || DEFAULTS.duration));
    try {
      G = build(el, measure(el, opts), opts);
      frame(G, 0, 0, D); // text blocks and images hidden behind their masks before the element shows
      el.style.opacity = prev.opacity || "";
    } catch (e) { console.warn("TextImageGeneration: could not build the drawing, showing the element", e); return finish(); }
    const t0 = performance.now();
    const tick = (now) => {
      if (stopped) return;
      const t = now - t0, p = t / D;
      frame(G, p, t, D);
      if (p >= Math.max(END, G.inkEnd + 0.01)) return finish(); // a long fade delay runs past the build
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }), opts.delay);
  return run;
}

// A scrubbable build for video tools and timelines: nothing runs on its own, seek(ms) draws the build at that time
// (backwards too). Before 0 the element is hidden, from `end` on it is as it was. destroy() restores it.
//   const tl = timeline(el, { duration: 3000, parent: sceneEl }); tl.seek(1200); ... tl.destroy();
function timeline(el, options = {}) {
  const opts = Object.assign({}, DEFAULTS, options);
  if (typeof el === "string") el = document.querySelector(el);
  if (!el) throw new Error("TextImageGeneration: no element");
  if (el.__tTig) el.__tTig.cancel();
  const D = (opts.duration = Math.max(800, +opts.duration || DEFAULTS.duration));
  const prev = { opacity: el.style.opacity };
  const G = build(el, measure(el, opts), opts), end = Math.max(END, G.inkEnd + 0.01) * D;
  let last = -Infinity, state = "";
  const restore = () => { G.hosts.forEach((H) => Object.assign(H.el.style, H.prev)); G.images.forEach((m) => Object.assign(m.im.el.style, m.prev)); el.style.opacity = prev.opacity; };
  // going back in time: the drawn-once parts (settled halftone dots, finished blocks) start again
  const rewind = () => {
    for (const m of G.images) { m.k = 0; m.done = false; m.sg.clearRect(0, 0, m.im.w, m.im.h); }
    for (const H of G.hosts) { H.done = false; H.key = null; Object.assign(H.el.style, H.setup); }
  };
  const tl = {
    element: el, duration: D, end,
    seek(ms) {
      if (ms < last) rewind();
      last = ms;
      if (ms < 0) { if (state !== "before") { state = "before"; rewind(); G.layer.style.display = "none"; } el.style.opacity = 0; return; }
      if (ms >= end) { if (state !== "after") { state = "after"; G.layer.style.display = "none"; restore(); } return; }
      if (state !== "during") { state = "during"; G.layer.style.display = ""; el.style.opacity = prev.opacity; }
      frame(G, ms / D, ms, D);
    },
    destroy() { G.layer.remove(); restore(); el.__tTig = null; },
  };
  el.__tTig = { cancel: tl.destroy };
  tl.seek(-1);
  return tl;
}

// Plays every [data-t-trace] element once it scrolls into view.
// data-t-trace="trace" | "trace-texts", optional data-t-trace-variant (text | small-text | image | auto), data-t-trace-duration / -delay / -fade / -fade-delay / -fade-stagger (ms) and data-t-trace-fade-by.
function auto(root = document) {
  const els = [...root.querySelectorAll("[data-t-trace]")].filter((e) => !e.__tTigAuto);
  const play = (e) => generate(e, { mode: e.dataset.tTrace || "trace", variant: e.dataset.tTraceVariant || "text", duration: +e.dataset.tTraceDuration || undefined, delay: +e.dataset.tTraceDelay || 0,
    fade: +e.dataset.tTraceFade || undefined, fadeBy: e.dataset.tTraceFadeBy || "character", fadeDelay: e.dataset.tTraceFadeDelay !== undefined ? +e.dataset.tTraceFadeDelay : undefined,
    fadeStagger: e.dataset.tTraceFadeStagger !== undefined ? +e.dataset.tTraceFadeStagger : null });
  els.forEach((e) => { e.__tTigAuto = true; e.__tTigOpacity = e.style.opacity; e.style.opacity = 0; });
  if (!("IntersectionObserver" in window)) { els.forEach(play); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); play(en.target); } }), { threshold: 0.3 });
  els.forEach((e) => io.observe(e));
}

if (typeof window !== "undefined") window.TextImageGeneration = { generate, auto, timeline };

return { generate, timeline, auto };
})();

// ─── ui-generation.js, unchanged apart from its module wrapper ───
const UIGeneration = (() => {
/*
 * transitions.dev / UI generation
 *
 * Plays an "agent is generating this" animation over any element, built from the element's own structure:
 * a dot field ripples out, construction guides and corner handles appear, the outline and every part
 * (boxes, text lines, icon paths) are traced in small flowing dots, then the real UI is revealed behind a
 * scan line with a fade and a smooth ease-out.
 *
 * Variants (variant option)
 *   "ui"              the default: the component's dotted wireframe (outline, boxes, text lines, icons), then the reveal
 *   "text"            big type: every glyph traced along its real outline, then fading in    } handled by
 *   "small-text"      a dotted line through each line of text, the characters fading in      } text-image-generation.js,
 *   "image"           a frame, a tone sketch, a halftone of its pixels, colour dots, the photo } which ships alongside
 *   "auto"            text by size and images, in one block                                  }
 *
 * Modes
 *   "skeleton"        the dotted drawing and the reveal
 *   "skeleton-texts"  the same, plus generation texts: an agent log, the motion CSS being written, a step line
 *
 * Usage
 *   import { generate } from "./ui-generation.js";
 *   const run = generate(el, { mode: "skeleton-texts" });
 *   await run.finished;          // resolves when the real UI is fully in
 *   run.cancel();                // stops and shows the element as it is
 *
 *   <div data-t-generate="skeleton"> ... </div>   + UIGeneration.auto()   (plays when it scrolls into view)
 *
 * No dependencies. Works with any framework: call it after the element has rendered.
 * Respects prefers-reduced-motion (a plain fade instead).
 */


const NS = "http://www.w3.org/2000/svg";
const TEXT_IMAGE = ["text", "small-text", "image", "auto"]; // the variants text-image-generation.js draws
// the text and image variants take the same modes: skeleton → trace, skeleton-texts → trace-texts
const toTrace = (o) => Object.assign({}, o, { mode: /texts$/.test(o.mode || "") ? "trace-texts" : "trace" });
// a scrubbable build of the text and image variants (seek(ms)), for video tools: see 03-text.md
const timeline = (el, options = {}) => TIG.timeline(el, toTrace(Object.assign({ variant: "text" }, options)));

// ─── timing: phases of a build, as fractions of `duration` (the reveal runs a little past 1) ───
const PH = {
  dots: [0, 0.3], probe: [0.02, 0.24], guides: [0.04, 0.3], outline: [0.1, 0.42],
  parts: [0.28, 0.74], reveal: [0.74, 1.055], clean: [0.84, 1.04],
};
const END = 1.09; // the build is over (and the overlay removed) at duration × END

const DEFAULTS = {
  mode: "skeleton",          // "skeleton" | "skeleton-texts"
  duration: 2400,            // ms for the drawing; the whole run is about duration × 1.09
  delay: 0,                  // ms before it starts
  steps: ["Planning layout", "Drawing structure", "Writing styles", "Adding motion"],
  done: "Ready",             // last step, shown when the UI is in (skeleton-texts)
  code: null,                // lines for the motion CSS panel; null = derived from the element
  title: null,               // name used in the generated CSS header; null = from aria-label / heading
  maxParts: 60,              // most parts traced (largest first when there are more)
  keys: 5,                   // key elements that get guides, handles and a size label
  onDone: null,
};

// ─── small math ───
const clamp = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = (a, b, x) => { const q = clamp((x - a) / (b - a)); return q * q * (3 - 2 * q); };
const win = (r, p) => clamp((p - r[0]) / (r[1] - r[0]));
const f2 = (n) => (+n).toFixed(2);
const hashN = (x) => { const v = Math.sin(x * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
function bezier(x1, y1, x2, y2) {
  const cx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const cy = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, m = 0.5; for (let i = 0; i < 28; i++) { m = (lo + hi) / 2; if (cx(m) < x) lo = m; else hi = m; } return cy(m); };
}
const OUT = bezier(0.16, 1, 0.3, 1);          // drawing: a soft, quick-settling ease-out
const SMOOTH_OUT = bezier(0.22, 1, 0.36, 1);  // reveal: --ease-smooth-out

function svg(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function rrPath(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${f2(x + r)} ${f2(y)}H${f2(x + w - r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + w)} ${f2(y + r)}V${f2(y + h - r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + w - r)} ${f2(y + h)}H${f2(x + r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x)} ${f2(y + h - r)}V${f2(y + r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + r)} ${f2(y)}Z`;
}
// half an outline, from top centre to bottom centre, clockwise (dir 1) or counter-clockwise (dir 0)
function rrHalf(x, y, w, h, r, dir) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const X = (v) => f2(x + v), Y = (v) => f2(y + v), R = f2(r);
  return dir
    ? `M${X(w / 2)} ${Y(0)}H${X(w - r)}A${R} ${R} 0 0 1 ${X(w)} ${Y(r)}V${Y(h - r)}A${R} ${R} 0 0 1 ${X(w - r)} ${Y(h)}H${X(w / 2)}`
    : `M${X(w / 2)} ${Y(0)}H${X(r)}A${R} ${R} 0 0 0 ${X(0)} ${Y(r)}V${Y(h - r)}A${R} ${R} 0 0 0 ${X(r)} ${Y(h)}H${X(w / 2)}`;
}
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── 1. read the element: boxes, text lines, icon geometry, key elements ───
function measure(el, opts) {
  const R = el.getBoundingClientRect(), area = R.width * R.height, parts = [];
  const rel = (r) => ({ x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height });
  const alpha = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return c && c !== "transparent" ? 1 : 0; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? +p[3] : 1; };
  // (el itself is hidden while it builds, so the walk stops at it)
  const hidden = (n) => { for (let x = n; x && x !== el; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.05) return true; } return false; };
  // the card's radius: its own, or that of a child that fills it
  let radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  const walk = (node) => {
    for (const c of node.children) {
      if (c.matches("script, style, template, [data-t-generate-skip]") || hidden(c)) continue;
      const r = c.getBoundingClientRect(), cs = getComputedStyle(c);
      if (!r.width || !r.height) { walk(c); continue; }
      if (Math.abs(r.width - R.width) < 2 && Math.abs(r.height - R.height) < 2) radius = Math.max(radius, parseFloat(cs.borderTopLeftRadius) || 0);
      if (c instanceof SVGSVGElement) {
        if (r.width <= 120 && r.height <= 120) {
          const paths = [];
          for (const g of c.querySelectorAll("path, circle, ellipse, rect, line, polyline, polygon")) {
            if (g.closest("defs, clipPath, mask, symbol") || hidden(g)) continue;
            const m = g.getScreenCTM(); if (!m) continue;
            const attrs = {}; for (const a of ["d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2", "points"]) if (g.hasAttribute(a)) attrs[a] = g.getAttribute(a);
            paths.push({ tag: g.tagName.toLowerCase(), attrs, m: [m.a, m.b, m.c, m.d, m.e - R.left, m.f - R.top] });
          }
          if (paths.length) parts.push({ kind: "icon", ...rel(r), paths, name: "svg" });
        }
        continue;
      }
      const big = r.width * r.height > area * 0.6, blurred = /blur/.test(cs.filter);
      const boxy = !big && !blurred && (alpha(cs.backgroundColor) > 0.02 || parseFloat(cs.borderTopWidth) > 0 || /^(IMG|CANVAS|VIDEO|INPUT|BUTTON|TEXTAREA|SELECT)$/.test(c.tagName) || cs.backgroundImage !== "none");
      if (boxy) {
        const interactive = /^(BUTTON|INPUT|A|SELECT|TEXTAREA)$/.test(c.tagName) || /button|tab|switch|checkbox|slider/.test(c.getAttribute("role") || "");
        const name = c.tagName === "INPUT" || c.tagName === "TEXTAREA" ? "input" : c.tagName === "BUTTON" || c.getAttribute("role") === "button" ? "button" : /^(IMG|CANVAS|VIDEO)$/.test(c.tagName) ? "image" : "frame";
        parts.push({ kind: "box", ...rel(r), r: Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.width / 2, r.height / 2), interactive, name, el: c });
      }
      for (const n of c.childNodes) {
        if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); const lines = [];
        for (const q of rg.getClientRects()) {
          const last = lines[lines.length - 1], y = q.top - R.top;
          if (last && Math.abs(last.y - y) < 2) last.x2 = Math.max(last.x2, q.right - R.left); else lines.push({ x: q.left - R.left, x2: q.right - R.left, y, h: q.height });
        }
        if (lines.length) parts.push({ kind: "text", lines, x: Math.min(...lines.map((l) => l.x)), y: lines[0].y, w: Math.max(...lines.map((l) => l.x2 - l.x)), h: lines.reduce((a, l) => a + l.h, 0), name: "text", el: c });
      }
      walk(c);
    }
  };
  walk(el);
  // the same box twice (a button and the span that fills it) is drawn once
  for (let i = parts.length - 1; i > 0; i--) {
    const p = parts[i]; if (p.kind !== "box") continue;
    if (parts.some((q, j) => j < i && q.kind === "box" && Math.abs(q.x - p.x) < 1.5 && Math.abs(q.y - p.y) < 1.5 && Math.abs(q.w - p.w) < 1.5 && Math.abs(q.h - p.h) < 1.5)) parts.splice(i, 1);
  }
  // too many parts: keep the largest, in document order
  if (parts.length > opts.maxParts) {
    const keep = new Set([...parts].sort((a, b) => b.w * b.h - a.w * a.h).slice(0, opts.maxParts));
    for (let i = parts.length - 1; i >= 0; i--) if (!keep.has(parts[i])) parts.splice(i, 1);
  }
  // key elements: interactive boxes first, then the largest boxes
  const boxes = parts.filter((p) => p.kind === "box");
  [...boxes.filter((b) => b.interactive), ...boxes.filter((b) => !b.interactive).sort((a, b) => b.w * b.h - a.w * a.h)].slice(0, opts.keys).forEach((k) => (k.key = true));
  return { w: R.width, h: R.height, r: Math.min(radius, R.width / 2, R.height / 2), parts };
}

// ─── 2. the motion CSS the texts panel streams: the element's own values on the transitions.dev token scale ───
function deriveCode(el, M, title) {
  const hex = (c) => { const m = String(c).match(/[\d.]+/g); if (!m || (m[3] !== undefined && +m[3] === 0)) return null; return "#" + m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, "0")).join(""); };
  const name = (title || el.getAttribute("aria-label") || (el.querySelector("h1,h2,h3,h4,strong,b") || {}).textContent || "component").trim().toLowerCase().slice(0, 32);
  const MOTION = { button: "transition: scale var(--duration-quick) var(--ease-smooth-out);", input: "transition: box-shadow var(--duration-fast) var(--ease-smooth-out);",
    text: "animation: rise-in var(--duration-fast) var(--ease-smooth-out);", image: "transition: opacity var(--duration-slow) var(--ease-in-out);", frame: "transition: opacity var(--duration-fast) var(--ease-smooth-out);" };
  const code = [`/* ${name} / motion */`, ":root {", "  --duration-quick: 150ms;", "  --duration-fast: 250ms;", "  --duration-slow: 400ms;", "  --ease-smooth-out: cubic-bezier(.22, 1, .36, 1);", "  --ease-in-out: ease-in-out;", "}"];
  M.parts.filter((p) => p.el && p.kind !== "icon").slice(0, 12).forEach((p, i) => {
    const cs = getComputedStyle(p.el), r = parseFloat(cs.borderTopLeftRadius) || 0;
    code.push(`.${p.name}-${String(i + 1).padStart(2, "0")} {`);
    if (p.kind === "box" && r) code.push(`  border-radius: ${r > 400 ? 999 : Math.round(r)}px;`);
    if (p.kind === "text") { code.push(`  font: ${parseFloat(cs.fontSize)}px/${Math.round(parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4)}px;`); const c = hex(cs.color); if (c) code.push(`  color: ${c};`); }
    const bg = p.kind === "box" && hex(cs.backgroundColor); if (bg) code.push(`  background: ${bg};`);
    code.push(`  ${MOTION[p.name] || MOTION.frame}`, "}");
  });
  return code;
}

// ─── 3. build the overlay ───
function buildOverlay(el, M, opts) {
  const R = el.getBoundingClientRect(), w = M.w, h = M.h, MG = 44, SP = 15, DOT_GAP = 4.8, GUIDE_GAP = 6.5;
  const layer = document.createElement("div");
  layer.className = "t-gen" + (opts.mode === "skeleton-texts" ? " t-gen--texts" : "");
  layer.setAttribute("aria-hidden", "true"); // decoration only: assistive tech reads the real element
  Object.assign(layer.style, { left: f2(R.left + scrollX) + "px", top: f2(R.top + scrollY) + "px", width: f2(w) + "px", height: f2(h) + "px" });
  const root = svg("svg", { class: "t-gen-svg", width: f2(w), height: f2(h), viewBox: `0 0 ${f2(w)} ${f2(h)}` }, layer);
  document.body.appendChild(layer); el.__tGenLayer = layer; // in the page first: SVG geometry can only be measured once it renders
  const G = { el, layer, root, w, h, M: MG, n: (buildOverlay.n = (buildOverlay.n || 0) + 1), parts: [], keys: [] };
  const defs = svg("defs", {}, root);

  // dot field + matrix rain columns
  const dots = svg("g", {}, root); G.dots = []; let maxD = 0;
  for (let x = -Math.floor(MG / SP) * SP; x <= w + MG; x += SP) for (let y = -Math.floor(MG / SP) * SP; y <= h + MG; y += SP) {
    const d = Math.hypot(x - w / 2, y - h / 2), out = Math.max(0, -x, x - w, -y, y - h), col = Math.round(x / SP);
    G.dots.push({ el: svg("circle", { cx: x, cy: y, r: 1.1, class: "t-gen-dot" }, dots), x, y, d, edge: 1 - clamp(out / MG), inside: out === 0,
      v: 0.07 + 0.09 * hashN(col * 7.13 + G.n * 31.7), ph: hashN(col * 3.71 + G.n * 11.3) * 900, tr: 50 + 70 * hashN(col * 1.91 + G.n) });
    maxD = Math.max(maxD, d);
  }
  G.maxD = maxD; G.span = h + 2 * MG;

  const stroke = (d, parent, cls = "t-gen-wire", extra = {}) => { const e = svg("path", Object.assign({ d, class: cls }, extra), parent); return { el: e, L: e.getTotalLength(), gap: cls === "t-gen-guide" ? GUIDE_GAP : DOT_GAP }; };
  const head = (parent, r = 2.4) => svg("circle", { r, class: "t-gen-head", opacity: 0 }, parent);

  // probe, guides, size label
  G.probe = svg("path", { d: `M0 ${-MG}V${f2(h + MG)}`, class: "t-gen-guide t-gen-guide--dashed", opacity: 0 }, root);
  G.guides = [[-MG, 0, w + MG, 0], [w, -MG, w, h + MG], [w + MG, h, -MG, h], [0, h + MG, 0, -MG]].map(([a, b, c, d]) => stroke(`M${f2(a)} ${f2(b)}L${f2(c)} ${f2(d)}`, root, "t-gen-guide"));
  G.dim = svg("text", { x: 0, y: -10, class: "t-gen-label" }, root);

  // wireframe: wiped away behind the scan line
  const clip = svg("clipPath", { id: "t-gen-clip-" + G.n }, defs);
  G.clipRect = svg("rect", { x: -MG - 10, y: -MG, width: w + 2 * MG + 20, height: h + 2 * MG }, clip);
  const glow = svg("linearGradient", { id: "t-gen-glow-" + G.n, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  svg("stop", { offset: 0, class: "t-gen-glow-stop", "stop-opacity": 0 }, glow); svg("stop", { offset: 1, class: "t-gen-glow-stop", "stop-opacity": 0.12 }, glow);
  const wire = svg("g", { "clip-path": `url(#t-gen-clip-${G.n})`, class: "t-gen-wireframe" }, root); G.wire = wire;
  G.outline = [1, 0].map((dir) => Object.assign(stroke(rrHalf(0, 0, w, h, M.r, dir), wire), { head: head(wire, 2.8) }));

  for (const P of M.parts) {
    const strokes = [];
    if (P.kind === "box" && P.key) [1, 0].forEach((dir) => strokes.push(Object.assign(stroke(rrHalf(P.x, P.y, P.w, P.h, P.r, dir), wire), { together: true })));
    else if (P.kind === "box") strokes.push(stroke(rrPath(P.x, P.y, P.w, P.h, P.r), wire));
    if (P.kind === "text") for (const ln of P.lines) {
      const y = ln.y + ln.h * 0.56, s = stroke(`M${f2(ln.x)} ${f2(y)}H${f2(ln.x2)}`, wire);
      s.caps = [svg("circle", { cx: f2(ln.x), cy: f2(y), r: 1.7, class: "t-gen-head", opacity: 0 }, wire), svg("circle", { cx: f2(ln.x2), cy: f2(y), r: 1.7, class: "t-gen-head", opacity: 0 }, wire)];
      strokes.push(s);
    }
    if (P.kind === "icon") for (const src of P.paths) {
      const [a, b, c, d] = src.m, k = Math.sqrt(Math.abs(a * d - b * c)) || 1;
      const g = svg("g", { transform: `matrix(${src.m.map((v) => (+v).toFixed(3)).join(" ")})`, style: `stroke-width:${(1.8 / k).toFixed(3)}` }, wire);
      const e = svg(src.tag, Object.assign({}, src.attrs, { class: "t-gen-wire" }), g);
      strokes.push({ el: e, L: e.getTotalLength ? e.getTotalLength() : 0, gap: 3.6, k, local: g });
    }
    if (!strokes.length) continue;
    strokes.forEach((s) => (s.head = head(s.local || wire, 2.4 / (s.k || 1))));
    let ix = -1; strokes.forEach((s, i) => (s.idx = s.together && i > 0 && strokes[i - 1].together ? ix : ++ix)); strokes.n = ix + 1;
    G.parts.push({ strokes, b: { x: P.x, y: P.y, w: P.w, h: P.h }, name: P.name, key: !!P.key });
  }
  const N = G.parts.length, span = PH.parts[1] - PH.parts[0], dur = Math.min(0.2, span * 0.6);
  G.parts.forEach((pt, i) => { pt.t0 = PH.parts[0] + (N > 1 ? (span - dur) * (i / (N - 1)) : 0); pt.t1 = pt.t0 + dur; });

  // key elements: their own guides, corner handles and size label
  for (const pt of G.parts) {
    if (!pt.key) continue;
    const { x, y, w: bw, h: bh } = pt.b, E = 16;
    G.keys.push({ pt,
      guides: [[x - E, y, x + bw + E, y], [x + bw, y - E, x + bw, y + bh + E], [x + bw + E, y + bh, x - E, y + bh], [x, y + bh + E, x, y - E]].map(([a, b, c, d]) => stroke(`M${f2(a)} ${f2(b)}L${f2(c)} ${f2(d)}`, root, "t-gen-guide", { opacity: 0 })),
      handles: [[x, y], [x + bw, y], [x + bw, y + bh], [x, y + bh]].map(([hx, hy]) => ({ el: svg("rect", { x: -2, y: -2, width: 4, height: 4, class: "t-gen-handle", transform: `translate(${f2(hx)} ${f2(hy)}) scale(0)` }, root), x: hx, y: hy })),
      dim: svg("text", { x: f2(x), y: f2(y - 5), class: "t-gen-label t-gen-label--small", opacity: 0 }, root) });
  }

  // particles that land on the outline as it is drawn there
  const inv = (f) => { let lo = 0, hi = 1; for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (OUT(m) < f) lo = m; else hi = m; } return lo; };
  G.flyers = [];
  for (let i = 0; i < 44; i++) {
    const half = G.outline[i % 2], f = 0.06 + 0.9 * (Math.floor(i / 2) / 21), pt = half.el.getPointAtLength(half.L * f);
    const ang = hashN(i * 9.1 + G.n) * Math.PI * 2, dist = 30 + 70 * hashN(i * 4.7 + G.n * 2), arr = PH.outline[0] + (PH.outline[1] - PH.outline[0]) * inv(f);
    G.flyers.push({ el: svg("circle", { r: 1.6, class: "t-gen-flyer", opacity: 0 }, root), x0: pt.x + Math.cos(ang) * dist, y0: pt.y + Math.sin(ang) * dist, x1: pt.x, y1: pt.y, arr, s0: arr - 0.09 });
  }

  // reticle, card handles, coordinate readout, scan line
  G.ret = svg("path", { class: "t-gen-reticle", opacity: 0 }, root); G.tag = svg("text", { class: "t-gen-label t-gen-label--tag", opacity: 0 }, root);
  G.handles = [[0, 0, 0.17], [w, 0, 0.17], [w, h, 0.37], [0, h, 0.37]].map(([x, y, at]) => ({ el: svg("rect", { x: -2.5, y: -2.5, width: 5, height: 5, class: "t-gen-handle", transform: `translate(${f2(x)} ${f2(y)}) scale(0)` }, root), x, y, at }));
  G.read = svg("text", { class: "t-gen-label t-gen-label--small", opacity: 0 }, root);
  G.scan = svg("g", { opacity: 0 }, root);
  svg("rect", { x: 0, y: -28, width: w, height: 28, fill: `url(#t-gen-glow-${G.n})` }, G.scan);
  G.scanLine = svg("path", { d: `M-18 0H${f2(w + 18)}`, class: "t-gen-guide t-gen-guide--scan" }, G.scan);
  svg("circle", { cx: 0, cy: 0, r: 2.3, class: "t-gen-head" }, G.scan); svg("circle", { cx: w, cy: 0, r: 2.3, class: "t-gen-head" }, G.scan);

  // generation texts
  if (opts.mode === "skeleton-texts") buildTexts(G, el, M, opts);
  return G;
}

// does `node` contain `el`, across shadow roots (so web components and shadow-DOM hosts count as containers)?
function holds(node, el) { for (let x = el; x; x = x.parentNode || x.host) if (x === node) return true; return false; }

// is this viewport rect empty page (nothing but the element's own containers)? Overlays never count: they take no input.
function isFree(el, x0, y0, x1, y1) {
  if (x0 < 0 || y0 < 0 || x1 > innerWidth || y1 > innerHeight + 400) return false;
  for (let i = 0; i <= 3; i++) for (let j = 0; j <= 4; j++) {
    const x = lerp(x0, x1, i / 3), y = Math.min(innerHeight - 1, lerp(y0, y1, j / 4)), hit = document.elementFromPoint(x, y);
    if (hit && hit !== document.body && hit !== document.documentElement && !holds(hit, el)) return false;
  }
  return true;
}

function buildTexts(G, el, M, opts) {
  // panels beside the element where that space is empty, else one strip under it, else only the step line
  const r = el.getBoundingClientRect(), PW = Math.min(260, (innerWidth - r.width) / 2 - G.M - 24), gap = G.M + 14;
  const side = PW >= 150 && isFree(el, r.left - gap - PW, r.top, r.left - gap, r.bottom) && isFree(el, r.right + gap, r.top, r.right + gap + PW, r.bottom);
  const below = !side && isFree(el, r.left, r.bottom + 20, r.right, r.bottom + 150);
  G.textMode = side ? "side" : below ? "below" : "steps";
  const hexId = (k) => "0x" + Math.floor(hashN(k * 5.3 + G.n * 17.1) * 65535).toString(16).padStart(4, "0");
  G.logLines = G.parts.map((pt, i) => ({ head: `${hexId(i)}  ${pt.name.padEnd(7, " ")} ${String(Math.round(pt.b.x)).padStart(3, "0")},${String(Math.round(pt.b.y)).padStart(3, "0")}  ${(Math.round(pt.b.w) + "×" + Math.round(pt.b.h)).padEnd(7, " ")}`, t0: pt.t0, t1: pt.t1 }));
  G.code = opts.code || deriveCode(el, M, opts.title); G.codeChars = G.code.reduce((a, l) => a + l.length + 1, 0);
  const mk = (cls) => { const d = document.createElement("div"); d.className = cls; G.layer.appendChild(d); return d; };
  if (side) {
    G.logEl = mk("t-gen-panel t-gen-panel--log"); G.codeEl = mk("t-gen-panel t-gen-panel--code");
    G.logEl.style.right = `calc(100% + ${G.M + 14}px)`; G.codeEl.style.left = `calc(100% + ${G.M + 14}px)`;
    G.logEl.style.maxWidth = G.codeEl.style.maxWidth = PW + "px";
  } else if (below) {
    G.logEl = mk("t-gen-panel t-gen-panel--below");
  }
  G.stepEl = mk("t-gen-steps");
  if (!side && !below && !isFree(el, r.left, r.bottom + 20, r.right, r.bottom + 50)) G.stepEl.style.display = "none"; // no room at all: the drawing speaks for itself
  G.steps = [...opts.steps, opts.done].filter(Boolean);
  G.stepEl.innerHTML = G.steps.map((s) => `<div class="t-gen-step"><i></i><span></span></div>`).join("");
  [...G.stepEl.children].forEach((d, i) => (d.lastChild.textContent = G.steps[i]));
}

// ─── 4. one frame of the build: p = progress (0 → END), t = ms since start ───
const FLOW = 0.016;
function drawStroke(s, q, t) {
  const on = q > 0; s.el.style.opacity = on ? 1 : 0;
  if (on) {
    const gap = s.gap / (s.k || 1), n = Math.floor((s.L * Math.min(1, q)) / gap) + 1;
    if (n !== s.n) { s.n = n; s.el.style.strokeDasharray = `${`0 ${f2(gap)} `.repeat(n - 1)}0 ${f2(s.L + 10)}`; }
    s.el.style.strokeDashoffset = f2(-((t * FLOW) / (s.k || 1)) % gap);
  }
  if (s.head) {
    const live = (s.live = q > 0 && q < 1); s.head.setAttribute("opacity", live ? 1 : 0);
    if (live) { const gap = s.gap / (s.k || 1); s.pt = s.el.getPointAtLength(Math.floor((s.L * q) / gap) * gap); s.head.setAttribute("cx", f2(s.pt.x)); s.head.setAttribute("cy", f2(s.pt.y)); }
  }
  if (s.caps) { s.caps[0].setAttribute("opacity", on ? 1 : 0); s.caps[1].setAttribute("opacity", q >= 1 ? 1 : 0); }
}

function frame(G, p, t, D) {
  const { w, h } = G, clean = 1 - smooth(PH.clean[0], PH.clean[1], p);
  // the real element: wiped in behind the scan line, fading and sharpening on a smooth ease-out
  const sq = SMOOTH_OUT(win(PH.reveal, p)), y = sq * (h + 6) - 3, fq = SMOOTH_OUT(win([PH.reveal[0], PH.reveal[1] + 0.03], p)), es = G.el.style;
  const pad = 80; // keeps the element's own shadow inside the clip
  es.opacity = p < PH.reveal[0] ? 0 : f2(fq);
  // past the bottom edge as the scan finishes, so the shadow below the element comes in with it (no pop when the clip goes)
  const yc = y + smooth(0.6, 1, sq) * pad;
  es.clipPath = p >= PH.reveal[1] ? G.prev.clipPath : `inset(-${pad}px -${pad}px ${f2(h - yc - 1)}px -${pad}px)`;
  es.filter = fq > 0 && fq < 0.99 ? `blur(${f2(3 * (1 - fq))}px)` : G.prev.filter;
  G.clipRect.setAttribute("y", f2(p < PH.reveal[0] ? -999 : y)); G.clipRect.setAttribute("height", f2(h + 999));
  G.wire.setAttribute("opacity", f2(1 - 0.6 * fq));
  G.scan.setAttribute("opacity", f2(p >= PH.reveal[0] && p < PH.reveal[1] ? smooth(0, 0.12, sq) * (1 - smooth(0.85, 1, sq)) : 0));
  G.scan.setAttribute("transform", `translate(0 ${f2(y)})`);
  G.scanLine.style.strokeDashoffset = f2(-(t * FLOW * 2) % 5);

  // dot field: ripple from the centre, matrix rain down the columns, lit by the probe and the reticle
  const R = OUT(win(PH.dots, p)) * (G.maxD + 60), rainOn = smooth(0.04, 0.2, p) * (1 - smooth(0.62, 0.86, p));
  const pw = win(PH.probe, p), probeX = lerp(-G.M, w + G.M, OUT(pw)), probeOp = pw > 0 && pw < 1 ? smooth(0, 0.1, pw) * (1 - smooth(0.85, 1, pw)) : 0;
  G.probe.setAttribute("transform", `translate(${f2(probeX)} 0)`); G.probe.setAttribute("opacity", f2(probeOp * 0.8));
  let rb = null, rOp = 0;
  const at = G.parts.reduce((k, pt, i) => (p >= pt.t0 ? i : k), -1);
  if (at >= 0 && p < PH.reveal[0] + 0.06) {
    const pt = G.parts[at], from = at ? G.parts[at - 1].b : { x: 0, y: 0, w, h }, q = OUT(clamp((p - pt.t0) / 0.05)), P = 5;
    rb = { x: lerp(from.x, pt.b.x, q) - P, y: lerp(from.y, pt.b.y, q) - P, w: lerp(from.w, pt.b.w, q) + 2 * P, h: lerp(from.h, pt.b.h, q) + 2 * P };
    rOp = smooth(PH.parts[0], PH.parts[0] + 0.04, p) * (1 - smooth(PH.reveal[0], PH.reveal[0] + 0.06, p));
    const l = Math.min(7, rb.w / 3, rb.h / 3), { x: X, y: Y, w: RW, h: RH } = rb;
    G.ret.setAttribute("d", `M${f2(X)} ${f2(Y + l)}V${f2(Y)}H${f2(X + l)}M${f2(X + RW - l)} ${f2(Y)}H${f2(X + RW)}V${f2(Y + l)}M${f2(X + RW)} ${f2(Y + RH - l)}V${f2(Y + RH)}H${f2(X + RW - l)}M${f2(X + l)} ${f2(Y + RH)}H${f2(X)}V${f2(Y + RH - l)}`);
    G.tag.setAttribute("x", f2(X)); G.tag.setAttribute("y", f2(Y - 4)); G.tag.textContent = `${pt.name} ${Math.round(pt.b.w)}×${Math.round(pt.b.h)}`;
  }
  G.ret.setAttribute("opacity", f2(rOp)); G.tag.setAttribute("opacity", f2(rOp));
  for (const d of G.dots) {
    const lag = R - d.d, env = clamp(lag / 50), front = p < PH.dots[1] + 0.05 ? Math.exp(-(((lag - 6) / 14) ** 2)) : 0;
    const headY = ((t * d.v + d.ph) % (G.span + d.tr)) - G.M, back = headY - d.y;
    const rain = back >= 0 && back < d.tr ? (1 - back / d.tr) ** 1.6 * rainOn * env * d.edge : 0;
    const near = rb ? Math.max(0, 1 - Math.max(rb.x - d.x, d.x - rb.x - rb.w, rb.y - d.y, d.y - rb.y - rb.h, 0) / 16) * (d.x > rb.x && d.x < rb.x + rb.w && d.y > rb.y && d.y < rb.y + rb.h ? 1 : 0.6) : 0;
    const probe = probeOp > 0 ? Math.exp(-(((d.x - probeX) / 9) ** 2)) * probeOp * env : 0;
    const lit = Math.max(front, rain, near * rOp * 0.8, probe), under = d.inside && p >= PH.reveal[0] && d.y < y ? 0 : 1; // gone where the real UI is in
    d.el.setAttribute("opacity", f2(Math.max(env * 0.5 * d.edge, lit * d.edge) * clean * under));
    d.el.setAttribute("r", f2(1.05 + lit * 0.85));
    d.el.classList.toggle("is-lit", lit > 0.35);
  }

  // guides, size label, outline, card handles, particles
  const gOp = 0.5 * (1 - smooth(0.66, 0.92, p));
  G.guides.forEach((g, i) => { const q = OUT(clamp((p - PH.guides[0] - i * 0.03) / (PH.guides[1] - PH.guides[0] - 0.09))); drawStroke(g, q, t); g.el.style.opacity = q > 0 ? gOp : 0; });
  const oq = OUT(win(PH.outline, p));
  G.dim.textContent = `${Math.round(w * oq)} × ${Math.round(h * oq)}   t+${(Math.min(p, 1) * D / 1000).toFixed(2)}s`;
  G.dim.setAttribute("opacity", f2(p > PH.outline[0] ? (1 - smooth(0.66, 0.9, p)) * 0.9 : 0));
  G.outline.forEach((s) => drawStroke(s, oq, t));
  G.handles.forEach((hd) => hd.el.setAttribute("transform", `translate(${f2(hd.x)} ${f2(hd.y)}) scale(${f2(OUT(clamp((p - hd.at) / 0.1)) * (1 - smooth(0.82, 0.96, p)))})`));
  for (const q of G.flyers) {
    const k = clamp((p - q.s0) / (q.arr - q.s0)), on = p >= q.s0 && p < q.arr + 0.01;
    q.el.setAttribute("opacity", on ? f2(smooth(0, 0.25, k)) : 0);
    if (on) { const e = OUT(k); q.el.setAttribute("cx", f2(lerp(q.x0, q.x1, e))); q.el.setAttribute("cy", f2(lerp(q.y0, q.y1, e))); }
  }
  // every part traced in order, icons stroke by stroke; key elements get guides, handles and a size label
  for (const pt of G.parts) { const q = clamp((p - pt.t0) / (pt.t1 - pt.t0)); pt.strokes.forEach((s) => drawStroke(s, OUT(clamp(q * pt.strokes.n - s.idx * 0.75)), t)); }
  const kOut = 1 - smooth(PH.reveal[0] - 0.02, PH.reveal[0] + 0.1, p);
  for (const K of G.keys) {
    const t0 = K.pt.t0 - 0.03, hq = OUT(clamp((p - K.pt.t0 - 0.04) / 0.08)), oq2 = OUT(clamp((p - K.pt.t0) / (K.pt.t1 - K.pt.t0)));
    K.guides.forEach((g, i) => { const q = OUT(clamp((p - t0 - i * 0.012) / 0.1)); drawStroke(g, q, t); g.el.style.opacity = q > 0 ? f2(0.5 * kOut) : 0; });
    K.handles.forEach((hd) => hd.el.setAttribute("transform", `translate(${f2(hd.x)} ${f2(hd.y)}) scale(${f2(hq * kOut)})`));
    K.dim.setAttribute("opacity", f2(p > t0 ? 0.9 * kOut : 0)); K.dim.textContent = `${Math.round(K.pt.b.w * oq2)} × ${Math.round(K.pt.b.h * oq2)}`;
  }
  // coordinate readout on the line being drawn
  let cur = null; for (const s of [...G.outline, ...G.parts.flatMap((pt) => pt.strokes)]) if (s.live && !s.local) cur = s;
  G.read.setAttribute("opacity", cur ? 1 : 0);
  if (cur) { G.read.setAttribute("x", f2(cur.pt.x + 6)); G.read.setAttribute("y", f2(cur.pt.y - 5)); G.read.textContent = `${String(Math.round(cur.pt.x)).padStart(3, "0")}·${String(Math.round(cur.pt.y)).padStart(3, "0")}`; }

  if (G.logLines) texts(G, p, t, D);
}

function texts(G, p, t, D) {
  const vis = smooth(0.03, 0.1, p) * (1 - smooth(0.9, 1.04, p)), blink = Math.floor(t / 260) % 2;
  // agent log: one line per part with its own progress bar
  const rows = G.textMode === "side" ? Math.max(6, Math.floor(G.h / 11)) : 6, shown = G.logLines.filter((l) => p >= l.t0);
  const done = G.logLines.filter((l) => p >= l.t1).length;
  const logRows = shown.slice(-rows).map((l) => {
    const k = clamp((p - l.t0) / 0.035), prog = clamp((p - l.t0) / (l.t1 - l.t0)), full = l.head + (prog >= 1 ? "[  ok  ]" : `[${"#".repeat(Math.round(prog * 6)).padEnd(6, ".")}]`);
    return full.slice(full.length - Math.ceil(full.length * k));
  });
  const head = `AGENT.LOG // PARTS ${String(done).padStart(2, "0")}/${String(G.logLines.length).padStart(2, "0")}`;
  if (G.logEl) G.logEl.style.opacity = f2(vis);
  // motion CSS: streams at a steady rate through the drawing
  const sk = clamp((p - 0.12) / 0.72), typed = Math.floor(G.codeChars * sk); let left = typed; const lines = [];
  for (const ln of G.code) { if (left <= 0) break; lines.push(ln.slice(0, left)); left -= ln.length + 1; }
  const tok = Math.round(typed / 3.4), secs = Math.max(0.1, (Math.min(p, 1) - 0.12) * D / 1000), caret = sk > 0 && sk < 1 && blink ? "_" : "";
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const codeHtml = lines.slice(-(G.textMode === "side" ? Math.max(8, Math.floor(G.h / 11)) : 4)).map((ln, i, a) => {
    const m = ln.match(/^(\s*)([\w-]+)(:)(.*)$/), c = i === a.length - 1 ? caret : "";
    return m ? `<div>${esc(m[1])}<b>${esc(m[2])}</b>:<em>${esc(m[4])}</em>${c}</div>` : `<div class="${/^\/\*/.test(ln) ? "is-comment" : /^[.:]/.test(ln) ? "is-selector" : ""}">${esc(ln)}${c}</div>`;
  }).join("");
  const foot = sk > 0 ? `${Math.round(tok / secs)} TOK/S · ${lines.length} LN · ${sk < 1 ? "WRITING" : "READY"}` : "";
  const logHtml = `<div class="t-gen-panel-head">${head}</div>` + logRows.map((r) => `<div>${esc(r)}</div>`).join("");
  if (G.codeEl) {
    G.codeEl.style.opacity = f2(vis);
    const sig = typed + "|" + caret; if (G.codeSig !== sig) { G.codeSig = sig; G.codeEl.innerHTML = `<div class="t-gen-panel-head">MOTION.CSS // ${String(tok).padStart(4, "0")} TOKENS</div>${codeHtml}<div class="t-gen-panel-foot">${foot}</div>`; }
    if (G.logSig !== logRows.join("|")) { G.logSig = logRows.join("|"); G.logEl.innerHTML = logHtml; }
  } else if (G.logEl) {
    const sig = logRows.join("|") + typed; if (G.logSig !== sig) { G.logSig = sig; G.logEl.innerHTML = logHtml + `<div class="t-gen-panel-foot">${foot}</div>`; }
  }
  // step line: each step for its share of the drawing, the last once the UI is in
  const n = G.steps.length, gone = smooth(0.98, 1.06, p);
  [...G.stepEl.children].forEach((s, i) => {
    const t0 = i < n - 1 ? (i / (n - 1)) * 0.95 : 0.95, t1 = i < n - 1 ? ((i + 1) / (n - 1)) * 0.95 : Infinity;
    const qi = OUT(clamp((p - t0) / 0.06)), qs = OUT(clamp((p - t1) / 0.05)), q = qi * (1 - Math.max(qs, gone));
    s.style.opacity = f2(q); s.style.transform = `translate(-50%, ${f2(5 * (1 - qi) - 5 * qs)}px)`;
    s.style.filter = q > 0.01 && q < 0.99 ? `blur(${f2(2 * (1 - q))}px)` : "none";
    s.classList.toggle("is-done", i === n - 1);
  });
}

// ─── 5. run ───
function generate(el, options = {}) {
  if (TEXT_IMAGE.includes(options.variant)) return TIG.generate(el, toTrace(options));
  const opts = Object.assign({}, DEFAULTS, options);
  if (typeof el === "string") el = document.querySelector(el);
  if (!el) throw new Error("UIGeneration: no element");
  if (el.__tGen) el.__tGen.cancel();
  const prev = { opacity: el.__tGenOpacity !== undefined ? el.__tGenOpacity : el.style.opacity, clipPath: el.style.clipPath, filter: el.style.filter, transition: el.style.transition };
  const restore = () => Object.assign(el.style, prev);
  let resolve, raf = 0, timer = 0, G = null, stopped = false;
  const finished = new Promise((r) => (resolve = r));
  const finish = () => { if (stopped) return; stopped = true; cancelAnimationFrame(raf); clearTimeout(timer); if (G) G.layer.remove(); restore(); el.__tGen = null; if (opts.onDone) opts.onDone(el); resolve(el); };
  const run = { finished, cancel: finish, element: el };
  el.__tGen = run;

  // reduced motion: no drawing, a plain fade
  if (reduced()) {
    el.style.opacity = 0;
    timer = setTimeout(() => { el.style.transition = "opacity 200ms ease-out"; el.style.opacity = prev.opacity || ""; timer = setTimeout(finish, 220); }, opts.delay);
    return run;
  }
  el.style.opacity = 0; // hidden until its reveal
  timer = setTimeout(() => {
    requestAnimationFrame(() => {
      if (stopped) return;
      try { const M = measure(el, opts); G = buildOverlay(el, M, opts); G.prev = prev; }
      catch (e) { if (el.__tGenLayer) el.__tGenLayer.remove(); G = null; console.warn("UIGeneration: could not build the overlay, showing the element", e); return finish(); }
      const D = Math.max(400, +opts.duration || DEFAULTS.duration), t0 = performance.now();
      const tick = (now) => {
        if (stopped) return;
        const t = now - t0, p = t / D;
        frame(G, p, t, D);
        if (p >= END) return finish();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
  }, opts.delay);
  return run;
}

// Plays every [data-t-generate] element once it scrolls into view.
// data-t-generate="skeleton" | "skeleton-texts", optional data-t-generate-variant (ui | text | small-text | image | auto)
// and data-t-generate-duration / -delay (ms).
function auto(root = document) {
  const els = [...root.querySelectorAll("[data-t-generate]")].filter((e) => !e.__tGenAuto);
  const play = (e) => generate(e, { mode: e.dataset.tGenerate || "skeleton", variant: e.dataset.tGenerateVariant || "ui", duration: +e.dataset.tGenerateDuration || undefined, delay: +e.dataset.tGenerateDelay || 0 });
  els.forEach((e) => { e.__tGenAuto = true; e.__tGenOpacity = e.__tTigOpacity = e.style.opacity; e.style.opacity = 0; }); // hidden until it plays
  if (!("IntersectionObserver" in window)) { els.forEach(play); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); play(en.target); } }), { threshold: 0.35 });
  els.forEach((e) => io.observe(e));
}

if (typeof window !== "undefined") window.UIGeneration = { generate, auto, timeline };

return { generate, timeline, auto };
})();

export const { generate, timeline, auto } = UIGeneration;
