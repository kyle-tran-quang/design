/**
 * Frame-driven isometric engine, ported from the isometric-3d-ui-showcase skill (stage.js + stage 02).
 *
 * Everything here is a pure function of a frame number, so the scene is scrubbable, deterministic and
 * screenshot-testable. Frames are in the reference clips' units (23.976 fps); scroll is mapped onto them.
 */

export const FPS = 24000 / 1001

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const RAD = Math.PI / 180

export type Ease = (t: number) => number

/** CSS-style cubic-bezier easing, solved with Newton and a bisection fallback. */
export function bezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const X = (t: number) => ((ax * t + bx) * t + cx) * t
  const Y = (t: number) => ((ay * t + by) * t + cy) * t
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const err = X(t) - x
      if (Math.abs(err) < 1e-6) return Y(t)
      const d = dX(t)
      if (Math.abs(d) < 1e-6) break
      t -= err / d
    }
    let lo = 0
    let hi = 1
    t = x
    for (let i = 0; i < 24; i++) {
      const v = X(t)
      if (Math.abs(v - x) < 1e-6) break
      if (v < x) lo = t
      else hi = t
      t = (lo + hi) / 2
    }
    return Y(t)
  }
}

/** Named curves measured from the reference clips (see the skill's references/motion-spec.md). */
export const ease = {
  linear: ((t) => t) as Ease,
  standard: bezier(0.4, 0, 0.2, 1),
  /** UI rise-in: very fast start, long settle. */
  expoOut: bezier(0.1, 0.1, 0.1, 1),
  out: bezier(0, 0, 0.2, 1),
  outCubic: ((t) => 1 - Math.pow(1 - t, 3)) as Ease,
  inOut: bezier(0.65, 0, 0.35, 1),
  /** Flat to dimetric tilt. */
  tilt: bezier(0.42, 0, 0.45, 1),
  /** Lids and modules. */
  decel: bezier(0, 0, 0.3, 1),
}

/** Progress of frame f through [a, b], eased and clamped to 0..1. */
export const prog = (f: number, a: number, b: number, e: Ease = ease.linear) => e(clamp((f - a) / (b - a)))

/** Monotone cubic Hermite interpolation: smooth, and never overshoots between samples. */
export function pchip(xs: readonly number[], ys: readonly number[]) {
  const n = xs.length
  const h: number[] = []
  const d: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i]
    d[i] = (ys[i + 1] - ys[i]) / h[i]
  }
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i])
  return (x: number) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (x > xs[i + 1]) i++
    const t = (x - xs[i]) / h[i]
    const t2 = t * t
    const t3 = t2 * t
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h[i] * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h[i] * m[i + 1]
    )
  }
}

/** Camera state for one frame. `s` is the card's on-screen size in stage px; `cx`/`cy` the world origin on screen. */
export type Camera = { s: number; rotZ: number; elev: number; cx: number; cy: number }

/** World point (x east, y south, z up) to stage px. The same math the browser applies to the CSS transform. */
export function project(cam: Camera, W: number, x: number, y: number, z: number): [number, number] {
  const S = cam.s / W
  const th = cam.rotZ * RAD
  const ph = (90 - cam.elev) * RAD
  const xr = x * Math.cos(th) - y * Math.sin(th)
  const yr = x * Math.sin(th) + y * Math.cos(th)
  return [cam.cx + S * xr, cam.cy + S * (yr * Math.cos(ph) - z * Math.sin(ph))]
}
