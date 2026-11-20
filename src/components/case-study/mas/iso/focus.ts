import { clamp, type Camera } from './engine'
import { FACE_FIT } from './scene'
import { FACE_TARGET, LAYERS, MODULES, TOPICS, TOPIC_IDS, W } from './layers'
import { corners, hull, targetsAt, type Pt, type Target } from './hit'
import type { Rect } from './panelLayout'
import { REVEAL_RISE, revealTargets } from './reveal'

/**
 * The focus move: what the scene does when a topic is opened. It follows clip 05's second move: one camera move that
 * dollies in on the subject while the orbit shifts a few degrees (azimuth +3.6, elevation +1.4), and a rack focus coupled to it,
 * so the subject stays sharp and everything else falls out of focus. Here the layers in front of the subject also lift out of
 * its way (clip 05 does it by letting them leave the top of the frame as the camera pushes in).
 *
 * Everything in this file is a pure function of the scene's numbers; IsoShowcase turns it into motion.
 */

/** The pieces of the scene that make up each topic. A topic's pieces hover, outline, focus and peel together. */
export const MEMBERS: Record<string, string[]> = Object.fromEntries(TOPICS.map((t) => [t.id, [] as string[]]))
MEMBERS[FACE_TARGET.id].push(FACE_TARGET.id)
for (const l of LAYERS) MEMBERS[l.topic].push(l.id)
for (const m of MODULES) MEMBERS[m.id].push(m.id)

const isModule = (id: string) => MODULES.some((m) => m.id === id)

/** How far down the stack a piece is, in W units. The Configurator face is the top of it. */
export function depthOf(id: string): number {
  if (id === FACE_TARGET.id) return -1
  const layer = LAYERS.find((l) => l.id === id)
  if (layer) return layer.depth
  return 99
}

/** The pieces that can be lifted out of the way, top of the stack first. */
export const PEELABLE: readonly string[] = [FACE_TARGET.id, ...LAYERS.map((l) => l.id)].sort((a, b) => depthOf(a) - depthOf(b))

/** The pieces that sit in front of a topic and have to clear it. Nothing for a module, which is on the floor beside the stack. */
export function aboveOf(topic: string): string[] {
  const mem = MEMBERS[topic] ?? []
  if (!mem.length || mem.some(isModule)) return []
  const d = Math.min(...mem.map(depthOf))
  return PEELABLE.filter((id) => depthOf(id) < d - 1e-6)
}

/** For each topic, the set of pieces in front of it: the stack opens there when it is hovered. Static, so built once. */
export const ABOVE: Record<string, ReadonlySet<string>> = Object.fromEntries(TOPIC_IDS.map((t) => [t, new Set(aboveOf(t))]))

/** How far a peeled piece rises, in world px: more than the footprint's projected height, so it clears the subject. */
export const PEEL_LIFT = 1.15 * W

/** Opacity of a peeled piece: it fades over the first three quarters of its rise, so it is gone before it reaches the top. */
export function peelFade(p: number): number {
  const t = clamp((p - 0.12) / 0.6)
  return 1 - t * t * (3 - 2 * t)
}

/** A camera pose, relative to the scene's own camera. */
export type Pose = { zoom: number; dx: number; dy: number; rot: number; elev: number }
export const REST: Pose = { zoom: 1, dx: 0, dy: 0, rot: 0, elev: 0 }

/**
 * The camera angle an open layer is read from, as absolute angles. The finished stack is seen at 36.8 degrees of elevation and
 * 55.4 of yaw, which foreshortens a layer's text to 0.79x along its lines with the baseline at 38 degrees, so the Configurator and
 * the two module screens, the things a reader actually reads, are hard to read. This is nearly flat to the screen (text undistorted
 * along its length, 94 % of its area kept, the baseline 15 degrees off horizontal) but not fully flat, so it still reads as a
 * tilted plane and the 3D scene does not collapse into a 2D card. The move there is an orbit, like clip 05's second move,
 * only larger.
 */
export const READ_POSE = { rotZ: 16, elev: 70 } as const
/**
 * Layers whose story is in the scene itself are read from nearer the stack's own angle. The rationale plate and the lessons plate
 * have no text to read: what they show is cubes and a book coming out of them, and from 70 degrees up a height is squashed to a third
 * of what it is at 42.
 */
export const READ_POSES: Record<string, { rotZ: number; elev: number }> = { rationale: { rotZ: 44, elev: 42 }, lessons: { rotZ: 44, elev: 42 } }
/** The subject fills this much of the free area, and the dolly never goes past these. */
const FILL = 0.84
const ZOOM_MIN = 0.55
const ZOOM_MAX = 2.4

/**
 * The pose that frames `topic` in `free` (an area of the stage, in stage px), seen from the scene's final camera.
 * `zOf` gives each piece's resting height with the focus lift already applied.
 */
export function framePose(topic: string, base: Camera, zOf: (id: string) => number, free: Rect): Pose {
  // the offsets that take the rest camera to the reading angles
  const read = READ_POSES[topic] ?? READ_POSE
  const rot = read.rotZ - base.rotZ
  const elev = read.elev - base.elev
  const cam: Camera = { ...base, s: base.s * FACE_FIT, rotZ: read.rotZ, elev: read.elev }
  const pts: Pt[] = []
  for (const tg of targetsAt(zOf)) {
    if (tg.topic !== topic) continue
    pts.push(...corners(cam, tg))
    // a topic with a reveal is framed with what comes out of it
    for (const c of revealTargets(tg, REVEAL_RISE[topic] ?? 0)) pts.push(...corners(cam, c))
  }
  if (!pts.length) return REST
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)]
  const zoom = clamp(Math.min((free.w * FILL) / (x1 - x0), (free.h * FILL) / (y1 - y0)), ZOOM_MIN, ZOOM_MAX)
  // Zooming scales about the world origin's screen position (cx, cy); then pan so the subject's centre lands on the free area's.
  const bx = (x0 + x1) / 2
  const by = (y0 + y1) / 2
  return {
    zoom,
    dx: free.x + free.w / 2 - base.cx - zoom * (bx - base.cx),
    dy: free.y + free.h / 2 - base.cy - zoom * (by - base.cy),
    rot,
    elev,
  }
}

/** The silhouette of a topic on screen: the convex hull of every piece's box. */
export function silhouette(topic: string, cam: Camera, zOf: (id: string) => number): Pt[] {
  const pts: Pt[] = []
  for (const tg of targetsAt(zOf)) if (tg.topic === topic) pts.push(...corners(cam, tg))
  return hull(pts)
}

/** Where a topic's label hangs from, in world px: the middle of its north edge, at the height of its nearest piece. */
export function anchorOf(topic: string, targets: readonly Target[]): [number, number, number] | null {
  const tgs = targets.filter((t) => t.topic === topic).sort((a, b) => b.order - a.order)
  if (!tgs.length) return null
  const left = Math.min(...tgs.map((t) => t.x - t.w / 2))
  const right = Math.max(...tgs.map((t) => t.x + t.w / 2))
  const north = Math.min(...tgs.map((t) => t.y - t.h / 2))
  return [(left + right) / 2, north, tgs[0].z]
}
