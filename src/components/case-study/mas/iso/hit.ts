import { project, type Camera } from './engine'
import { FACE_TARGET, LAYERS, MODULES, topicOf, W } from './layers'

/**
 * Hit-testing in screen space. Native 3D hit-testing is unreliable with overlapping, translucent plates in a CSS 3D
 * scene, and the camera is orthographic anyway, so each target's three visible faces (top, south wall, east wall) are
 * projected with the same `project()` the camera uses and tested as quads. Targets are tried nearest the viewer first,
 * so a plate on top of another wins where they overlap.
 */

export type Pt = readonly [number, number]
export type Quad = readonly [Pt, Pt, Pt, Pt]

export type Target = {
  /** The piece of the scene: a plate, the face, or a module. */
  id: string
  /** The topic it belongs to: what hover, outline, focus and the panel work in. */
  topic: string
  /** Footprint centre and size in world px, and the top surface's z, and thickness. */
  x: number
  y: number
  w: number
  h: number
  /** Height of the top face (world px) and the thickness below it. */
  z: number
  t: number
  /** Painted order: higher draws nearer the viewer, so it is tested first. */
  order: number
}

/** The faces of a box as screen quads: [top, south wall, east wall]. */
export function faces(cam: Camera, tg: Target): Quad[] {
  const l = tg.x - tg.w / 2
  const r = tg.x + tg.w / 2
  const n = tg.y - tg.h / 2
  const s = tg.y + tg.h / 2
  const P = (x: number, y: number, z: number): Pt => project(cam, W, x, y, z)
  const z0 = tg.z
  const z1 = tg.z - tg.t
  return [
    [P(l, n, z0), P(r, n, z0), P(r, s, z0), P(l, s, z0)],
    // the south wall hangs from the bottom (+y) edge, the east wall from the right (+x) edge
    [P(l, s, z0), P(r, s, z0), P(r, s, z1), P(l, s, z1)],
    [P(r, n, z0), P(r, s, z0), P(r, s, z1), P(r, n, z1)],
  ]
}

/** All eight corners of a target's box, projected. */
export function corners(cam: Camera, tg: Target): Pt[] {
  const out: Pt[] = []
  for (const x of [tg.x - tg.w / 2, tg.x + tg.w / 2]) {
    for (const y of [tg.y - tg.h / 2, tg.y + tg.h / 2]) {
      for (const z of [tg.z, tg.z - tg.t]) out.push(project(cam, W, x, y, z))
    }
  }
  return out
}

/** Convex hull (monotone chain), counter-clockwise on screen. A box under an orthographic camera projects to its hull. */
export function hull(points: readonly Pt[]): Pt[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Pt[] = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop()
    lower.push(q)
  }
  const upper: Pt[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop()
    upper.push(q)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

/** Point in a convex or concave quad (ray casting). */
export function inQuad(p: Pt, q: Quad): boolean {
  let inside = false
  for (let i = 0, j = q.length - 1; i < q.length; j = i++) {
    const [xi, yi] = q[i]
    const [xj, yj] = q[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** Which topic is under a screen point, or null. `targets` must already carry this frame's z. */
export function pick(cam: Camera, targets: readonly Target[], p: Pt): string | null {
  const byNear = [...targets].sort((a, b) => b.order - a.order)
  for (const tg of byNear) {
    if (faces(cam, tg).some((q) => inQuad(p, q))) return tg.topic
  }
  return null
}

/** Static description of every target; `z` is filled in per frame by the showcase. */
export function targetsAt(zOf: (id: string) => number): Target[] {
  const out: Target[] = []
  // layers: higher up (smaller depth) is nearer the viewer in the dimetric view
  for (const l of LAYERS) {
    out.push({ id: l.id, topic: l.topic, x: l.x, y: l.y, w: l.w, h: l.h, z: zOf(l.id), t: l.thick * W, order: 100 - l.depth * 100 })
  }
  // the Configurator face is the nearest thing to the viewer
  out.push({ id: FACE_TARGET.id, topic: topicOf(FACE_TARGET.id), x: FACE_TARGET.x, y: FACE_TARGET.y, w: FACE_TARGET.w, h: FACE_TARGET.h, z: zOf(FACE_TARGET.id), t: FACE_TARGET.thick * W, order: 200 })
  for (const m of MODULES) {
    out.push({ id: m.id, topic: m.id, x: m.x, y: m.y, w: m.w, h: m.h, z: zOf(m.id), t: m.thick * W, order: 0 })
  }
  return out
}
