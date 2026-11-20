import { clamp, ease, lerp, prog } from './engine'

/**
 * The Beat A (flat assemble) + Beat B (tilt) timeline for the Sales Configurator face.
 * Frames are the reference clip's (23.976 fps). Every function is pure: same frame, same result.
 */

/** Scene frames. The clip's own camera table drives the tilt; it is shifted so the tilt begins after the build. */
export const BUILD_START = 0
export const BUILD_END = 78
/**
 * The tilt starts while the last of the UI is still rising in (the footer and the last tiles land around frame 66), so the
 * reader is not scrolling through a flat, finished screen waiting for the camera. It cannot start earlier than the blueprint
 * grid's fade-in (frame 40) without the grid being cut short.
 */
export const TILT_START = 40
/** Frames the tilt uses from the camera table (clip f3 to f46 covers the tilt and look-at pan). */
export const CAM_OFFSET = TILT_START - 3
export const SCENE_END = TILT_START + 276

/** Per-role entrance windows in frames: [start, end]. Roles are staggered in reading order, as in the clip. */
type Window = readonly [number, number]
const ROLE: Record<string, Window> = {
  header: [6, 20],
  title: [16, 30],
  stats: [22, 36],
  trayBg: [26, 40],
  node: [30, 44],
  review: [44, 58],
  heading: [28, 42],
  tile: [36, 50],
  env: [46, 60],
  more: [50, 62],
  tab: [40, 54],
  footer: [56, 70],
}

/** How far each role rises from, in px (UI content rises in from below, expo-out). */
const RISE: Record<string, number> = {
  header: 40, title: 60, stats: 60, trayBg: 70, node: 90, review: 60, heading: 50, tile: 80, env: 80, more: 60, tab: 60, footer: 60,
}

/** Per-item stagger inside a role, in frames. */
const STAGGER: Record<string, number> = { node: 3, tile: 2.2, tab: 2.4, env: 3, more: 6, heading: 8 }

export type LeafState = { opacity: number; dy: number; lift: number }

/**
 * @param role  the leaf's data-a
 * @param index the leaf's data-i (its order inside the role)
 * @param z     the leaf's resting height in px
 */
export function leafAt(f: number, role: string, index: number, z: number): LeafState {
  const w = ROLE[role] ?? ([0, 14] as const)
  const delay = (STAGGER[role] ?? 0) * index
  const p = prog(f, w[0] + delay, w[1] + delay, ease.expoOut)
  // Heights open as the camera tilts: flat view stays a clean screen, then the leaves float up to their z-level.
  const t = prog(f, TILT_START + 6, TILT_START + 52, ease.inOut)
  return { opacity: clamp(p * 1.8), dy: (1 - p) * (RISE[role] ?? 40), lift: z * t }
}

/**
 * How wide the face reads compared with the clip's card at the same camera frame (1 = the same width). The face is
 * landscape (1200 x 916), so it is scaled up from the square card: at 1.2 it spans about 1010 stage px flat (readable
 * UI text) and its tilted footprint at the end matches the clip's stack (about 520 px across).
 */
export const FACE_FIT = 1.2
/** One of the clip's world px, in this scene's world px (the face's design px). Multiply clip measurements by it. */
export const CLIP_TO_WORLD = 1200 / (843 * FACE_FIT)

/** Base plate colour: the face materialises from backdrop-grey to white (clip 01: #c3cddc to #fafafa, ease-out). */
export function plateAt(f: number) {
  const k = prog(f, 0, 22, ease.out)
  const mix = (a: number, b: number) => Math.round(lerp(a, b, k))
  // The flat beat's hard-offset slab shadow goes at the cut to 3D; a proper floor shadow takes over in the stack.
  const slab = prog(f, 0, 30, ease.outCubic) * (1 - prog(f, TILT_START - 4, TILT_START + 14))
  return { colour: `rgb(${mix(214, 244)},${mix(215, 244)},${mix(219, 245)})`, shadow: slab }
}

/** Blueprint backdrop (flat beat) and floor lattice (3D beat): the first hands over to the second as the camera tilts. */
export function backdropAt(f: number) {
  const flat = prog(f, 14, 40, ease.out) * (1 - prog(f, TILT_START, TILT_START + 16))
  const floor = prog(f, TILT_START + 4, TILT_START + 40, ease.out)
  return { flat, floor }
}

/** Camera frame for scene frame f: held flat, then the clip's tilt. */
export const camFrame = (f: number) => clamp(f - CAM_OFFSET, 0, 316)

/**
 * Scroll to frame, built from the scene itself.
 *
 * The camera's on-screen speed is very uneven: the tilt (frames 40 to 69) moves a corner 21 to 23 px per frame, while
 * everything after frame 84 moves under 5. A hand-placed list of stops cannot fit that: every attempt either starved the
 * tilt (one wheel notch threw the card 200 px) or spent the whole budget on the slow stretches. So the map is computed.
 * Each frame is given scroll in proportion to how much it moves on screen (plus a floor, so slow stretches still get
 * some), and the cumulative sum is inverted. The result is nearly constant on-screen speed per unit of scroll.
 */
import { project } from './engine'
import { cameraAt } from './timeline'

/** Scroll the scene itself takes, in viewport heights: frame 0 to SCENE_END. */
const SCENE_VH = 2.738
/**
 * Scroll held at the start, with the scene on frame 0 (the empty grey plate), while the problem statement is read. The statement is
 * gone by the end of it, and the first of the UI rises as the scene's own scroll begins.
 */
export const INTRO_VH = 0.8
/** Total scroll past the pin, in viewport heights: the intro, then the scene. */
export const TRACK_VH = INTRO_VH + SCENE_VH
/**
 * Extra scroll the finished pose is held for before the page moves on, in viewport heights. The scene reaches its last
 * frame at TRACK_VH, and hover, click and the story panel only work from there: without a hold the pin released the same
 * moment they became usable.
 */
export const HOLD_VH = 0.9
/**
 * The frame the layers become usable and the "you can click these" cue plays: just after the last module has landed (frame 271), while
 * its connectors are still growing and well before the scene's last frame (316). Reader scroll position at this frame is about 2.49
 * of the track's 2.738 viewport heights, so the cue arrives as the build finishes, not once the reader has scrolled to the end.
 */
export const READY_FRAME = CAM_OFFSET + 240
/**
 * Scroll reserved for the flat build before the tilt, in viewport heights. It is TILT_START frames at about 5.9 px per frame
 * on a 908 px viewport (the pace the build always had), so moving TILT_START means moving this and TRACK_VH by the same amount.
 */
const BUILD_VH = 0.258
/** Floor on a frame's weight, in px of on-screen motion: frames that barely move still get a little scroll. */
const WEIGHT_FLOOR = 3.2
/** Frames the dock and the modules take, which move the scene without moving the camera: given a fixed weight. */
const DOCK_WEIGHT = 5

const FACE_PTS = [[-600, -464], [600, -464], [600, 464], [-600, 464]] as const

function buildScrollMap() {
  const n = SCENE_END + 1
  const weight = new Array<number>(n).fill(0)
  let prev: [number, number][] | null = null
  for (let f = 0; f < n; f++) {
    const cam = cameraAt(camFrame(f))
    const pts = FACE_PTS.map(([x, y]) => project({ ...cam, s: cam.s * FACE_FIT }, 1200, x, y, 0))
    let speed = 0
    if (prev) speed = Math.max(...pts.map((p, i) => Math.hypot(p[0] - prev![i][0], p[1] - prev![i][1])))
    prev = pts
    // After the tilt the stack docks and the modules land: the camera is nearly still but the scene is busy.
    const busy = f > TILT_START + 40 ? DOCK_WEIGHT : 0
    weight[f] = f <= TILT_START ? 0 : Math.max(speed, busy, WEIGHT_FLOOR)
  }
  // smooth the weights so the speed per unit of scroll changes gradually, not in steps
  const smooth = weight.map((_, i) => {
    let a = 0
    let c = 0
    for (let k = -6; k <= 6; k++) {
      const w = 7 - Math.abs(k)
      a += (weight[clamp(i + k, 0, n - 1)] ?? 0) * w
      c += w
    }
    return a / c
  })
  const cum = new Array<number>(n).fill(0)
  for (let f = 1; f < n; f++) cum[f] = cum[f - 1] + smooth[f]
  const total = cum[n - 1]
  // scroll (vh) at each frame: the build gets BUILD_VH, the rest is shared by weight
  const scrollAt = cum.map((c, f) => (f <= TILT_START ? (BUILD_VH * f) / TILT_START : BUILD_VH + ((SCENE_VH - BUILD_VH) * c) / total))
  return scrollAt
}

const SCROLL_AT = buildScrollMap()

/**
 * How the scene chases the scroll. The scroll position that is shown follows the real one (frame-rate independent smoothing,
 * tau about 100 ms), and is then mapped to a frame, so the follow is in scroll space.
 *
 * It used to follow in frame space, capped at 80 frames per second so that a hard flick could not skip the tilt. But frames are
 * not worth the same scroll everywhere: the tilt takes about 25 px of scroll per frame and the layers and modules about 6, so
 * that one cap was 4x too tight for everything after the tilt (a flick back to the top took 3.6 s to arrive). Capping scroll speed
 * instead lets the slow stretches, where a frame costs little scroll, catch up as fast as the reader scrolls. The tilt guard is
 * about what the eye sees, so it was measured on screen: the fastest corner of the face moves at most 2330 px/s with the old cap
 * (frame 52) and about 2300 px/s with 2.1 viewport heights per second.
 */
export const FOLLOW_MS = 100
export const MAX_VH_PER_S = 2.1
export function followScroll(shownVh: number, goalVh: number, dtMs: number): number {
  const cap = (MAX_VH_PER_S * dtMs) / 1000
  return shownVh + clamp((goalVh - shownVh) * (1 - Math.exp(-dtMs / FOLLOW_MS)), -cap, cap)
}

/** How much of the problem statement shows at a scroll position (viewport heights past the pin): all of it, then gone before the scene moves. */
export function introAt(vh: number): number {
  return 1 - clamp((vh - INTRO_VH * 0.4) / (INTRO_VH * 0.3))
}

/**
 * Phone and tablet widths: the plate is too small to hold the statement, so it sits on a wider card of the plate's own colour. This is how
 * far that card has shrunk onto the plate (0 = the card, 1 = the plate itself), finishing as the scene starts to move.
 */
export function introCardAt(vh: number): number {
  return ease.inOut(clamp((vh - INTRO_VH * 0.62) / (INTRO_VH * 0.38)))
}

/** Scene frame for a scroll position (in viewport heights past the pin): frame 0 through the intro, then the scene. */
export function frameAtScroll(vh: number): number {
  const v = clamp(vh - INTRO_VH, 0, SCENE_VH)
  // SCROLL_AT is increasing: binary search, then interpolate inside the cell.
  let lo = 0
  let hi = SCROLL_AT.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (SCROLL_AT[mid] <= v) lo = mid
    else hi = mid
  }
  const span = SCROLL_AT[hi] - SCROLL_AT[lo]
  return span <= 0 ? lo : lo + (v - SCROLL_AT[lo]) / span
}

/* ------------------------------------------------------------------------------------------------------------------
 * Beat C: the layers rise from below the frame and dock.
 * ---------------------------------------------------------------------------------------------------------------- */

/** Every layer starts this many face-widths below its resting height, well off the bottom of the frame. */
const DROP = 3

/**
 * How far a plate sits below its resting height at scene frame f, in px.
 *
 * Until `enter` the plate is held DROP widths down, off the bottom of the frame. From `enter` it decelerates into
 * place with no overshoot: big plates use two exponential terms (a fast fall and a long tail; one term cannot fit
 * the clip), small tiles use one. The result is continuous at `enter` (it starts at DROP and falls) and reaches 0.
 */
export function lowerBy(f: number, enter: number, tau: number, big: boolean, width: number): number {
  if (f <= enter) return DROP * width
  const x = f - enter
  const decay = big ? 0.55 * Math.exp(-x / (tau * 0.5)) + 0.45 * Math.exp(-x / (tau * 1.6)) : Math.exp(-x / tau)
  const px = DROP * width * decay
  // The tail is asymptotic: past a point finish with a short eased settle so every plate lands exactly, not 25 px shy.
  const SETTLE = 150
  if (x > SETTLE) return px * (1 - ease.inOut(Math.min(1, (x - SETTLE) / 60)))
  return px
}

/** Floor shadow: arrives last, once the stack has docked. */
export function shadowAt(f: number) {
  return prog(f, CAM_OFFSET + 148, CAM_OFFSET + 170, ease.out)
}

/* ------------------------------------------------------------------------------------------------------------------
 * Beat D: the two side modules and their connectors.
 * ---------------------------------------------------------------------------------------------------------------- */

/** How far a module hovers above its own shadow, in W units (the clip: about 0.1 W above the floor). */
export const MODULE_HOVER = 0.035

/** A module grows out of the floor: scale 0.18 to 1 over 20 frames, ease-out, as in the clip (f188 to f208). */
export function moduleAt(f: number, enter: number) {
  const p = prog(f, enter, enter + 22, ease.out)
  return { scale: p <= 0 ? 0.0001 : lerp(0.18, 1, p), opacity: clamp(p * 3), shadow: prog(f, enter + 6, enter + 28) }
}

/** Connector lines grow along the floor after the module has landed (linear, as in the clip). */
export const connectorAt = (f: number, start: number) => prog(f, start, start + 14)

/** How far the stage's fitted box has moved from the whole stage to the finished pose's extent: 0 through the build and tilt, 1 once docked. */
export const fitAt = (f: number) => prog(f, CAM_OFFSET + 60, CAM_OFFSET + 200, ease.inOut)
