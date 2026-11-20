import { bezier, clamp, ease, prog } from './engine'
import { H, PLATE_RISE, W } from './layers'
import type { Target } from './hit'

/**
 * What a layer does once it is open. The scene's own animation follows the scroll; this follows the clock, because it is a response
 * to a click: it plays out in time, and runs backwards (faster) when the layer closes.
 *
 * Two layers have one:
 *  - the rationale plate is a 2 x 2 platform, and two of its quadrants come out of it as glass cubes (clip 05: the quadrant's outline
 *    square is the lid; it lifts, glass walls fade in over a near-black cavity, and the contents grow from the cavity floor). One cube
 *    holds a 4 x 4 x 4 lattice, the other a pane and three bars.
 *  - the Excel tiles turn into wireframe spreadsheets (see Sheet.tsx).
 *  - the bottom plate (feedback and lessons) lets a book rise out of it: the cover swings open and its pages flip, in a loop
 *    (see PlateBook.tsx; the flipping itself is CSS, in iso.css).
 *
 * Times are frames of the reference clip (23.976 fps), counted from the click. The camera takes about 1.15 s (27 frames) to arrive,
 * so each reveal starts as it is nearly there.
 */

export const PLATE_TOPIC = 'rationale'
export const SHEET_TOPIC = 'excel'
export const BOOK_TOPIC = 'lessons'
/** Frames a reveal takes to finish playing. The book's last frame is when its page loop starts. */
export const BOOK_END = 74
export const REVEALS = [
  [PLATE_TOPIC, 78],
  [SHEET_TOPIC, 78],
  [BOOK_TOPIC, BOOK_END],
] as const
/** Closing runs this many times faster than opening: it is a dismissal, like the camera's. */
export const REVEAL_CLOSE = 2.4

/* ------------------------------------------------------------------------------------------------------------------
 * The platform: geometry (world px, in the plate's own coordinates: x east, y south, z up from its top face)
 * ---------------------------------------------------------------------------------------------------------------- */

export const QUAD_W = W / 2
export const QUAD_H = H / 2
/** A cube's footprint: also the inset outline square on every quadrant. */
export const CUBE = 300
/** The lid is a slab this thick. */
export const LID_T = 14
/** A lid at rest sits this far above the plate, so the two never fight for the same pixel. */
const LID_REST = 3

export type CubeKind = 'bars' | 'lattice'
/**
 * The four quadrants and their colours. A lid is exactly its quadrant's colour (the clip's rule). From the stack's angle the north-west
 * quadrant is the back and the north-east the right, so the two cubes stand side by side at the back, as in the clip.
 */
export const QUADS = [
  { id: 'nw', x: 0, y: 0, colour: '#5b8cf5', south: '#7ba4f8', east: '#3e64c8', cube: 'lattice' as CubeKind },
  { id: 'ne', x: QUAD_W, y: 0, colour: '#2c4fb8', south: '#4666c6', east: '#1b3590', cube: 'bars' as CubeKind },
  { id: 'sw', x: 0, y: QUAD_H, colour: '#b9d7fb' },
  { id: 'se', x: QUAD_W, y: QUAD_H, colour: '#e7ecf4' },
] as const

/** The lattice: 4 x 4 x 4 small cubes, well inside the glass. */
export const LAT = { n: 4, size: 34, pitch: 62, zPitch: 58, z0: 12 }
export const LAT_OFF = (CUBE - (3 * LAT.pitch + LAT.size)) / 2

/**
 * The bars cube: three thin strips and one wider pane, all standing planes facing south, so from the stack's angle they read as narrow
 * upright strips side by side, as in the clip. Positions are fractions of the footprint, heights fractions of the cube's height.
 */
export const FINS = [
  { x: 0.56, h: 0.84 },
  { x: 0.68, h: 0.7 },
  { x: 0.8, h: 0.78 },
] as const
export const FIN_W = 0.07
export const FIN_Y = 0.3
export const PANE = { x: 0.1, y: 0.62, w: 0.36, h: 0.62 } as const

/** The quadrants that carry a cube, with the cube's centre in plate coordinates. */
export const CUBE_QUADS = QUADS.filter((q): q is Extract<(typeof QUADS)[number], { cube: CubeKind }> => 'cube' in q)

/* ------------------------------------------------------------------------------------------------------------------
 * The book: geometry (plate coordinates, like the platform's: x east, y south, z up from the plate's top face).
 *
 * It is built like a real one. Each half is a cover board with a block of pages on it, the two halves are the same thickness, and the
 * left half (board and pages together) is hinged to the right one at the spine, so the cover is always under its own pages. It starts
 * closed, the left half folded over the right; opening swings that half to the left. The leaves hinge on the spine at the height of the
 * two blocks' tops, so they always touch it. Closed, the book is `2 * BOOK_T` thick.
 * ---------------------------------------------------------------------------------------------------------------- */

export const BOOK = {
  /** One page's width and height. */
  pw: 320,
  ph: 440,
  /** A half's cover board and its block of pages. */
  board: 8,
  pages: 44,
  /** How far the board overhangs the pages on its three free edges. */
  over: 8,
  /** Pages that flip (they are loose sheets on top of the two blocks). */
  leaves: 3,
  /** The gap between leaves lying in a stack, so two never share a plane. */
  eps: 1.5,
  /** Where the spine is: the plate's centre. */
  cx: W / 2,
  cy: H / 2,
} as const
/** A half's thickness: board plus pages. The leaves hinge at this height. */
export const BOOK_T = BOOK.board + BOOK.pages
/** The most the book ever stands above the plate: the left half upright, or a page at the middle of a flip. */
export const BOOK_EXTENT = BOOK_T + BOOK.pw + BOOK.over

/* ------------------------------------------------------------------------------------------------------------------
 * The platform: timeline
 * ---------------------------------------------------------------------------------------------------------------- */

/** When each cube starts (frames after the click). The right-hand cube leads and the other follows 14 frames later (the clip staggers by 10 to 16). */
const CUBE_AT: Record<CubeKind, number> = { bars: 22, lattice: 36 }

export function cubeAt(t: number, kind: CubeKind) {
  const a = CUBE_AT[kind]
  return {
    /** The cavity under the lid goes dark as the lid starts to lift. */
    flatten: prog(t, a, a + 5, ease.out),
    /** The lid lifts, decelerating, with no overshoot. */
    lift: prog(t, a + 2, a + 20, ease.decel),
    /** The glass walls fade in as they grow with the lid. */
    walls: prog(t, a + 5, a + 18, ease.out),
    /** Frames since the contents started growing from the cavity floor. */
    content: t - (a + 12),
  }
}

/** How far the cubes' lids have risen, 0..1. */
export const riseAt = (t: number) => Math.max(cubeAt(t, 'bars').lift, cubeAt(t, 'lattice').lift)

/** The book's timeline: a shade grows under it, it rises out of the plate closed, then the left half swings open. The pages then flip by themselves (iso.css). */
export function bookAt(t: number) {
  return {
    shade: prog(t, 16, 30, ease.out),
    lift: prog(t, 22, 44, ease.decel),
    open: prog(t, 46, 70, ease.inOut),
  }
}

/** Height of what comes out of a topic's plate above it right now, in world px (0 while nothing has opened). */
export function revealRise(topic: string, t: number) {
  if (t <= 0) return 0
  if (topic === PLATE_TOPIC) return LID_REST + PLATE_RISE * riseAt(t)
  if (topic === BOOK_TOPIC) return BOOK_EXTENT * bookAt(t).lift
  return 0
}
/** The most it ever is: the camera frames the plate and what comes out of it together. */
export const REVEAL_RISE: Record<string, number> = { [PLATE_TOPIC]: LID_REST + PLATE_RISE, [BOOK_TOPIC]: BOOK_EXTENT }

/** The boxes that come out of a topic's own target: for the camera's framing and the dim's cut-out. Nothing for topics without a reveal. */
export function revealTargets(tg: Target, rise: number): Target[] {
  if (rise <= 0) return []
  if (tg.topic === BOOK_TOPIC) return [{ ...tg, id: `${tg.id}:book`, x: tg.x, y: tg.y, w: 2 * (BOOK.pw + BOOK.over), h: BOOK.ph + 2 * BOOK.over, z: tg.z + rise, t: rise }]
  if (tg.topic !== PLATE_TOPIC) return []
  return CUBE_QUADS.map((q) => ({
    ...tg,
    id: `${tg.id}:${q.id}`,
    x: tg.x - tg.w / 2 + q.x + QUAD_W / 2,
    y: tg.y - tg.h / 2 + q.y + QUAD_H / 2,
    w: CUBE,
    h: CUBE,
    z: tg.z + rise,
    t: rise,
  }))
}

/** A lattice cube's growth, 0..1. They come up from the floor, bottom layer first, each over 8 frames. */
export function latticeAt(content: number, i: number, j: number, k: number) {
  const d = k * 3.2 + (6 - i - j) * 0.7
  return prog(content, d, d + 8, ease.out)
}

/** A fin's (or the pane's) growth from the cavity floor, 1 to 2 frames apart, 10 frames each (the clip's bars). */
export const finAt = (content: number, i: number) => ease.decel(clamp((content - i * 1.5) / 10))

/* ------------------------------------------------------------------------------------------------------------------
 * The platform: painter
 * ---------------------------------------------------------------------------------------------------------------- */

type CubeParts = { cavity: HTMLElement | null; lid: HTMLElement | null; lidWalls: HTMLElement[]; walls: [string, HTMLElement][] }
type Parts = {
  last: string
  cubes: Record<CubeKind, CubeParts>
  lattice: { el: HTMLElement; i: number; j: number; k: number }[]
  fins: (HTMLElement | null)[]
  pane: HTMLElement | null
}
const parts = new WeakMap<HTMLElement, Parts>()

function partsOf(root: HTMLElement): Parts {
  let p = parts.get(root)
  if (p) return p
  const one = (from: ParentNode, sel: string) => from.querySelector<HTMLElement>(sel)
  const cube = (kind: CubeKind): CubeParts => {
    const r = one(root, `[data-pm="cube"][data-kind="${kind}"]`) ?? root
    return {
      cavity: one(r, '[data-pm="cavity"]'),
      lid: one(r, '[data-pm="lid"]'),
      lidWalls: Array.from(r.querySelectorAll<HTMLElement>('[data-pm="lidwall"]')),
      walls: Array.from(r.querySelectorAll<HTMLElement>('[data-pm="wall"]')).map((el) => [el.dataset.side ?? 'S', el] as [string, HTMLElement]),
    }
  }
  p = {
    last: '',
    cubes: { bars: cube('bars'), lattice: cube('lattice') },
    lattice: Array.from(root.querySelectorAll<HTMLElement>('[data-pm="lc"]')).map((el) => ({ el, i: +(el.dataset.i ?? 0), j: +(el.dataset.j ?? 0), k: +(el.dataset.k ?? 0) })),
    fins: [0, 1, 2].map((i) => one(root, `[data-pm="fin"][data-i="${i}"]`)),
    pane: one(root, '[data-pm="pane"]'),
  }
  parts.set(root, p)
  return p
}

/**
 * Puts the platform's cubes at time `t` (frames since the layer was opened). `fade` is the plate's own opacity (it fades when the
 * pieces above it part or it peels away): the cubes are 3D, so they cannot take an opacity themselves, and are simply gone below half.
 * Cheap to call every frame: it does nothing if neither has changed.
 */
export function paintPlate(root: HTMLElement, t: number, fade = 1) {
  const p = partsOf(root)
  const shown = fade > 0.5
  const key = `${t.toFixed(3)}|${shown}`
  if (p.last === key) return
  p.last = key
  root.style.visibility = shown ? '' : 'hidden'
  root.dataset.open = t > 0 ? '1' : '0'

  for (const kind of ['bars', 'lattice'] as const) {
    const c = cubeAt(t, kind)
    const part = p.cubes[kind]
    const rise = PLATE_RISE * c.lift
    if (part.cavity) part.cavity.style.opacity = c.flatten.toFixed(3)
    if (part.lid) part.lid.style.transform = `translateZ(${(LID_REST + rise).toFixed(2)}px)`
    // the lid's own edge grows out of the plate as it lifts, so it never dips below the surface it came from
    const edge = clamp(rise / LID_T, 0, 1).toFixed(3)
    for (const el of part.lidWalls) el.style.transform = el.dataset.side === 'S' ? `rotateX(-90deg) scaleY(${edge})` : `rotateY(90deg) scaleX(${edge})`
    // glass walls stand on the cavity floor and grow with the lid: N and S are planes facing south, E and W planes facing east
    const grow = Math.max(c.lift, 0.0001).toFixed(4)
    for (const [side, el] of part.walls) {
      el.style.opacity = c.walls.toFixed(3)
      el.style.transform = side === 'S' || side === 'N' ? `rotateX(90deg) scaleY(${grow})` : `rotateY(-90deg) scaleX(${grow})`
    }
  }

  const lat = cubeAt(t, 'lattice')
  for (const cu of p.lattice) {
    const s = lat.content > 0 ? latticeAt(lat.content, cu.i, cu.j, cu.k) : 0
    cu.el.style.display = s > 0.001 ? '' : 'none'
    // scale3d about the cube's bottom centre (its transform-origin), so it grows up from the floor
    if (s > 0.001) cu.el.style.transform = `translateZ(${LAT.z0 + LAT.size + cu.k * LAT.zPitch}px) scale3d(${s.toFixed(3)},${s.toFixed(3)},${s.toFixed(3)})`
  }

  const bars = cubeAt(t, 'bars')
  const grown = (i: number) => (bars.content > 0 ? finAt(bars.content, i) : 0)
  p.fins.forEach((el, i) => {
    if (!el) return
    const g = grown(i)
    el.style.visibility = g > 0.001 ? '' : 'hidden'
    el.style.transform = `rotateX(90deg) scaleY(${Math.max(g, 0.0001).toFixed(4)})`
  })
  if (p.pane) {
    const g = grown(3)
    p.pane.style.visibility = g > 0.001 ? '' : 'hidden'
    p.pane.style.transform = `rotateX(90deg) scaleY(${Math.max(g, 0.0001).toFixed(4)})`
  }
}

/* ------------------------------------------------------------------------------------------------------------------
 * The book: painter
 * ---------------------------------------------------------------------------------------------------------------- */

type BookParts = { last: string; shade: HTMLElement | null; slide: HTMLElement | null; rise: HTMLElement | null; half: HTMLElement | null; leaves: HTMLElement | null }
const bookParts = new WeakMap<HTMLElement, BookParts>()

function bookPartsOf(root: HTMLElement): BookParts {
  let p = bookParts.get(root)
  if (p) return p
  const one = (sel: string) => root.querySelector<HTMLElement>(`[data-pm="${sel}"]`)
  p = { last: '', shade: one('shade'), slide: one('slide'), rise: one('rise'), half: one('half'), leaves: one('leaves') }
  bookParts.set(root, p)
  return p
}

/**
 * Puts the book at time `t` (frames since the layer was opened). Like the platform, it does nothing if neither `t` nor the plate's
 * fade has changed. Two writes move the whole book: its height (the book grows up out of the plate as one piece, by scaling z about the
 * plate's surface) and the angle of the left half. It sets `data-loop` once the book is open: from then on the pages flip on their own, in CSS.
 */
export function paintBook(root: HTMLElement, t: number, fade = 1) {
  const p = bookPartsOf(root)
  const shown = fade > 0.5
  const key = `${t.toFixed(3)}|${shown}`
  if (p.last === key) return
  p.last = key
  root.style.visibility = shown ? '' : 'hidden'
  root.dataset.open = t > 0 ? '1' : '0'
  root.dataset.loop = t >= BOOK_END ? '1' : '0'

  const b = bookAt(t)
  // the closed book is centred on the plate, and its spine is at the plate's centre once open: it slides half its width as the cover swings
  const wide = BOOK.pw + BOOK.over
  if (p.slide) p.slide.style.transform = `translateX(${(-(wide / 2) * (1 - b.open)).toFixed(2)}px)`
  if (p.shade) {
    p.shade.style.opacity = b.shade.toFixed(3)
    // as wide as the closed book, growing to the open one's
    p.shade.style.transform = `translateZ(1.5px) scaleX(${(0.5 + 0.5 * b.open).toFixed(4)})`
    p.shade.style.transformOrigin = '100% 50%'
  }
  // the leaves sit between the halves, so they are only shown once the cover has swung clear of them
  if (p.leaves) p.leaves.style.visibility = b.open >= 0.999 ? '' : 'hidden'
  if (p.rise) {
    p.rise.style.visibility = b.lift > 0.001 ? '' : 'hidden'
    p.rise.style.transform = `scale3d(1,1,${Math.max(b.lift, 0.0001).toFixed(4)})`
  }
  // closed, the left half lies folded over the right one (180 degrees); open, it lies flat on the left (0)
  if (p.half) p.half.style.transform = `rotateY(${(180 * (1 - b.open)).toFixed(2)}deg)`
}

/* ------------------------------------------------------------------------------------------------------------------
 * The spreadsheets
 * ---------------------------------------------------------------------------------------------------------------- */

/** One tile's progress, 0..1: the three tiles start 6 frames apart, left to right. Fast start, long settle. */
const SHEET_EASE = bezier(0.3, 0.05, 0.15, 1)
export const sheetAt = (t: number, i: number) => prog(t, 16 + i * 6, 16 + i * 6 + 46, SHEET_EASE)

/** Sets a sheet's progress. Everything inside it derives from the one custom property (see iso.css), so this is the only write. */
export function paintSheet(el: HTMLElement, t: number) {
  const p = sheetAt(t, +(el.dataset.i ?? 0))
  const key = p.toFixed(4)
  if (el.dataset.p === key) return
  el.dataset.p = key
  el.style.setProperty('--p', key)
  el.style.visibility = p > 0 ? '' : 'hidden'
  // the selection starts hopping from cell to cell once the sheet has filled in
  el.dataset.open = p > 0.92 ? '1' : '0'
}
