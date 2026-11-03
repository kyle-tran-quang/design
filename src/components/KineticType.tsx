import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/*
 * Text whose letters fill with tiny flowers, bursts, clovers and leaves that
 * bloom in a wave from left to right, on a loop.
 *
 * Each glyph is drawn to a canvas, a distance transform finds how deep every
 * pixel sits inside the letter, and shapes are packed into the deepest spots
 * first so they read as the letterform.
 */

const svg = (body: string, w: number, h: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`)}")`

const SHAPES = {
  flower: {
    color: '#FA680C',
    ratio: 7.62753 / 7.42138,
    mask: svg(
      '<path d="M6.71688 3.71069C8.97486 6.48406 6.66415 8.7323 3.81376 6.53534C0.963357 8.7323 -1.34733 6.48404 0.910647 3.71069C-1.34733 0.93732 0.963379 -1.31092 3.81376 0.886035C6.66417 -1.31092 8.97486 0.937342 6.71688 3.71069Z"/>',
      7.62753,
      7.42138,
    ),
  },
  burst: {
    color: '#FA0C34',
    ratio: 7.62754 / 7.42139,
    mask: svg(
      '<path d="M7.62754 3.71069C7.62754 3.29502 7.30436 2.9529 6.88916 2.90892C7.22613 2.66884 7.3302 2.21534 7.11659 1.85535C6.90298 1.49535 6.44727 1.3563 6.06511 1.5202C6.23357 1.14835 6.09065 0.70498 5.72065 0.49714C5.35066 0.289301 4.88456 0.390556 4.63781 0.718422C4.59261 0.314445 4.24099 0 3.81377 0C3.38654 0 3.03492 0.314445 2.98972 0.718422C2.74298 0.390556 2.27688 0.289301 1.90688 0.49714C1.53689 0.70498 1.39397 1.14835 1.56242 1.5202C1.18025 1.3563 0.724562 1.49535 0.51095 1.85535C0.297337 2.21534 0.401405 2.66884 0.738378 2.90892C0.32318 2.9529 0 3.29502 0 3.71069C0 4.12637 0.32318 4.46849 0.738378 4.51247C0.401405 4.75254 0.297337 5.20604 0.51095 5.56604C0.724562 5.92604 1.18027 6.06509 1.56242 5.90119C1.39397 6.27304 1.53689 6.71641 1.90688 6.92425C2.27688 7.13209 2.74298 7.03083 2.98972 6.70297C3.03492 7.10694 3.38654 7.42139 3.81377 7.42139C4.24099 7.42139 4.59261 7.10694 4.63781 6.70297C4.88456 7.03083 5.35066 7.13211 5.72065 6.92425C6.09065 6.71641 6.23357 6.27302 6.06511 5.90119C6.44729 6.06509 6.90298 5.92604 7.11659 5.56604C7.3302 5.20604 7.22613 4.75254 6.88916 4.51247C7.30436 4.46849 7.62754 4.12637 7.62754 3.71069Z"/>',
      7.62754,
      7.42139,
    ),
  },
  clover: {
    color: '#3E3BF4',
    ratio: 7.58052 / 7.16358,
    mask: svg(
      '<path d="M6.05347 3.58179C6.92478 3.41392 7.58052 2.68411 7.58052 1.80912C7.58052 0.809971 6.72555 0 5.67092 0C4.72573 0 3.943 0.65121 3.79028 1.50548C3.63756 0.65121 2.85484 0 1.90964 0C0.85497 0 0 0.809971 0 1.80912C0 2.68411 0.655759 3.41392 1.52705 3.58179C0.655736 3.74966 0 4.47949 0 5.35449C0 6.35363 0.85497 7.16358 1.90962 7.16358C2.85479 7.16358 3.63752 6.51239 3.79026 5.65812C3.94298 6.51239 4.7257 7.16358 5.6709 7.16358C6.72555 7.16358 7.5805 6.35361 7.5805 5.35449C7.5805 4.47949 6.92478 3.74966 6.05347 3.58179ZM3.79026 5.05085C3.6587 4.31501 3.06024 3.72976 2.2922 3.58179C3.06024 3.43382 3.6587 2.84859 3.79026 2.11275C3.92182 2.84859 4.52031 3.43382 5.28835 3.58179C4.52031 3.72976 3.92182 4.31501 3.79026 5.05085Z"/>',
      7.58052,
      7.16358,
    ),
  },
  leaf: {
    color: '#37C38E',
    ratio: 7.63917 / 7.43271,
    mask: svg(
      '<path d="M7.63915 0C5.52966 0 3.8196 1.66386 3.8196 3.71634C5.9291 3.71634 7.63915 2.05248 7.63915 0Z"/><path d="M0 0C0 2.05248 1.71008 3.71634 3.81955 3.71634C1.71008 3.71634 0 5.3802 0 7.43268C2.1095 7.43268 3.81955 5.76883 3.81955 3.71634C3.81955 1.66386 2.1095 0 0 0Z"/><path d="M3.81958 3.71636C3.81958 5.76885 5.52966 7.43271 7.63913 7.43271C7.63913 5.38022 5.92908 3.71636 3.81958 3.71636Z"/>',
      7.63917,
      7.43271,
    ),
  },
} as const

type ShapeName = keyof typeof SHAPES
const SHAPE_NAMES = Object.keys(SHAPES) as ShapeName[]
const MAX_SAMPLES = 2500

type Bloom = { shape: ShapeName; x: number; y: number; r: number; rot: number; delay: number }

/** Small seeded PRNG (mulberry32) so the layout is stable between renders. */
function random(seed: number) {
  let t = seed | 0
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

/** Two-pass chamfer distance from each inked pixel to the nearest blank one. */
function distanceInside(alpha: Uint8ClampedArray, w: number, h: number) {
  const d = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) d[i] = alpha[i * 4 + 3] > 127 ? 1e6 : 0
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x])
  const diag = Math.SQRT2
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (d[i]) d[i] = Math.min(d[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + diag, at(x + 1, y - 1) + diag)
    }
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x
      if (d[i]) d[i] = Math.min(d[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + diag, at(x - 1, y + 1) + diag)
    }
  return d
}

type KineticTypeProps = {
  text: string
  className?: string
  /** Shapes per letter. */
  density?: number
  /** Seconds between neighbouring letters in the wave. */
  stagger?: number
  /** Seconds each shape spends blooming. */
  zoom?: number
  /** Pause at the end of each loop, in seconds. */
  rest?: number
  /** How far shapes may spill past the glyph edge, in px. */
  bleed?: number
  seed?: number
}

export default function KineticType({
  text,
  className = '',
  density = 60,
  stagger = 0.12,
  zoom = 1.6,
  rest = 0.8,
  bleed = 2,
  seed = 1,
}: KineticTypeProps) {
  const animationName = `kinetic-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rootRef = useRef<HTMLSpanElement>(null)
  const [blooms, setBlooms] = useState<Bloom[][] | null>(null)
  const [layoutVersion, setLayoutVersion] = useState(0)
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  const { cells, words } = useMemo(() => {
    const cells = Array.from(text).map((ch) => ({ ch: /\s/.test(ch) ? ' ' : ch, space: /\s/.test(ch) }))
    const words: { space: boolean; cells: number[] }[] = []
    cells.forEach((cell, i) => {
      const last = words[words.length - 1]
      if (cell.space) words.push({ space: true, cells: [i] })
      else if (last && !last.space) last.cells.push(i)
      else words.push({ space: false, cells: [i] })
    })
    return { cells, words }
  }, [text])

  const sweep = stagger * cells.length
  const loop = sweep + zoom + rest

  // Re-measure once fonts arrive and whenever the text resizes.
  useEffect(() => {
    const bump = () => setLayoutVersion((v) => v + 1)
    void document.fonts?.ready.then(bump)
    const observer = new ResizeObserver(bump)
    if (rootRef.current) observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const canvas = ctx.canvas
    const rand = random(seed * 9301 + 49297)
    const widths = cells.map((_, i) => letterRefs.current[i]?.getBoundingClientRect().width ?? 0)
    const total = widths.reduce((a, b) => a + b, 0)
    if (!total) return
    const edge = Math.max(0, Math.min(4, bleed))

    let offset = 0
    const next = cells.map(({ ch, space }, index) => {
      const el = letterRefs.current[index]
      const left = offset
      offset += widths[index]
      if (!el || space) return []

      const box = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      const size = parseFloat(style.fontSize)
      const w = Math.ceil(box.width)
      const h = Math.ceil(box.height)
      if (!w || !h) return []

      canvas.width = w
      canvas.height = h
      ctx.clearRect(0, 0, w, h)
      ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`
      ctx.textBaseline = 'alphabetic'
      const metrics = ctx.measureText(ch)
      const ascent = metrics.fontBoundingBoxAscent ?? size * 0.8
      const descent = metrics.fontBoundingBoxDescent ?? size * 0.2
      ctx.fillText(ch, 0, (h - (ascent + descent)) / 2 + ascent)

      const depth = distanceInside(ctx.getImageData(0, 0, w, h).data, w, h)
      const inked: number[] = []
      for (let i = 0; i < depth.length; i++) if (depth[i] > 0.5) inked.push(i)
      for (let i = inked.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[inked[i], inked[j]] = [inked[j], inked[i]]
      }
      inked.length = Math.min(inked.length, MAX_SAMPLES)

      const maxR = size * 0.15
      const minR = Math.max(2, size * 0.018)
      const placed: Bloom[] = []
      const anchors: Bloom[] = []
      // Small shapes inherit the timing of the nearest large one so clusters bloom together.
      const nearestDelay = (x: number, y: number) => {
        let delay = ((left + x) / total) * sweep
        let best = Infinity
        for (const a of anchors) {
          const dist = Math.hypot(a.x - x, a.y - y)
          if (dist < best) [best, delay] = [dist, a.delay]
        }
        return delay
      }
      const place = (i: number, scale: number, anchor: boolean) => {
        const x = i % w
        const y = (i - x) / w
        let r = Math.min(maxR * scale, depth[i] + edge)
        for (const p of placed) r = Math.min(r, Math.hypot(p.x - x, p.y - y) - p.r * 0.82)
        if (r < minR) return
        let shape = SHAPE_NAMES[Math.floor(rand() * SHAPE_NAMES.length)]
        const prev = placed[placed.length - 1]
        if (prev && shape === prev.shape)
          shape = SHAPE_NAMES[(SHAPE_NAMES.indexOf(shape) + 1 + Math.floor(rand() * 2)) % SHAPE_NAMES.length]
        const bloom: Bloom = {
          shape,
          x,
          y,
          r,
          rot: Math.round(rand() * 24) * 15,
          delay: anchor ? ((left + x) / total) * sweep : nearestDelay(x, y),
        }
        placed.push(bloom)
        if (anchor) anchors.push(bloom)
      }

      for (const i of [...inked].sort((a, b) => depth[b] - depth[a])) {
        if (placed.length >= density * 0.4) break
        place(i, 0.55 + rand() * 0.45, true)
      }
      for (const i of inked) {
        if (placed.length >= density) break
        place(i, 0.3 + rand() * 0.5, false)
      }
      return placed
    })
    setBlooms(next)
  }, [cells, layoutVersion, density, bleed, seed, sweep])

  const pct = (seconds: number) => `${((seconds / loop) * 100).toFixed(3)}%`
  const keyframes = `@keyframes ${animationName} {
  0% { scale: 0; rotate: calc(var(--rot) - 45deg); }
  ${pct(zoom * 0.35)}, ${pct(zoom * 0.6)} { scale: 1; rotate: var(--rot); }
  ${pct(zoom)}, 100% { scale: 0; rotate: calc(var(--rot) + 45deg); }
}`

  const renderCell = (index: number) => (
    <span
      key={index}
      ref={(el) => void (letterRefs.current[index] = el)}
      className={`relative inline-block ${cells[index].space ? 'whitespace-pre' : ''}`}
    >
      {cells[index].ch}
      {blooms?.[index]?.map((b, i) => {
        const shape = SHAPES[b.shape]
        const style: Record<string, string | number> = {
          left: b.x,
          top: b.y,
          width: b.r * 2,
          aspectRatio: shape.ratio,
          backgroundColor: shape.color,
          mask: `${shape.mask} center / contain no-repeat`,
          WebkitMask: `${shape.mask} center / contain no-repeat`,
          '--rot': `${b.rot}deg`,
          ...(reduced
            ? { rotate: `${b.rot}deg` }
            : { scale: 0, animation: `${animationName} ${loop}s ease-in-out ${b.delay}s infinite both` }),
        }
        return (
          <span
            key={i}
            className="pointer-events-none absolute z-[1] -translate-x-1/2 -translate-y-1/2"
            style={style as CSSProperties}
          />
        )
      })}
    </span>
  )

  return (
    <span ref={rootRef} role="text" aria-label={text} className={`inline-block ${className}`}>
      <style>{keyframes}</style>
      {words.map((word, i) =>
        word.space ? (
          <span key={`s${i}`} aria-hidden="true">
            {renderCell(word.cells[0])}
            <wbr />
          </span>
        ) : (
          <span key={`w${i}`} aria-hidden="true" className="inline-block whitespace-nowrap">
            {word.cells.map(renderCell)}
          </span>
        ),
      )}
    </span>
  )
}
