/**
 * A critically damped spring for one number. Camera moves, the rack-focus veil and the layer peel all use it instead of a
 * fixed-length tween because the reader can change their mind mid-move (click another layer, press Esc): a spring keeps its
 * velocity when the target changes, so the motion bends instead of restarting. It also starts with zero slope and settles
 * softly, which is the shape of the reference clip's ease-in-out camera moves.
 *
 * The update is the exact solution for a critically damped spring, so it is stable at any frame time.
 */
export type Spring = { x: number; v: number }

export const spring = (x = 0): Spring => ({ x, v: 0 })

/**
 * Advances `s` toward `target` over `dt` seconds. `omega` is the stiffness: it settles in about 6 / omega seconds
 * (omega 6 is roughly one second). Returns true while it is still moving.
 */
export function step(s: Spring, target: number, dt: number, omega: number, eps = 0.0008): boolean {
  const d = s.x - target
  if (Math.abs(d) < eps && Math.abs(s.v) < eps * 6) {
    s.x = target
    s.v = 0
    return false
  }
  const e = Math.exp(-omega * dt)
  const c = s.v + omega * d
  s.x = target + (d + c * dt) * e
  s.v = (s.v - omega * c * dt) * e
  return true
}

/** Jumps straight to `target` (reduced motion). */
export function snap(s: Spring, target: number) {
  s.x = target
  s.v = 0
}

/**
 * A timed move along a cubic-bezier, for the camera. A spring is front-loaded (it covers half the distance in a quarter of the
 * time) while the reference clip's camera moves start slowly: its second move reaches 50 % at 45 % of the way through. A bezier
 * fitted to the clip reproduces that, so the camera uses one.
 *
 * Retargeting mid-move does not restart from rest: the new move begins with the speed the old one had, and eases that speed
 * out as it goes (a Hermite blend), so a second click bends the motion instead of stopping and restarting it.
 */
export type Tween = {
  from: number
  to: number
  /** Progress through the move, 0..1. */
  t: number
  dur: number
  /** Current value and current speed (units per second). */
  x: number
  v: number
  /** The speed this move inherited when it started. Fixed for the whole move: it is what the cubic bump below is built from. */
  v0: number
}

export const tween = (x = 0): Tween => ({ from: x, to: x, t: 1, dur: 1, x, v: 0, v0: 0 })

/** Starts moving to `to` over `dur` seconds from the current value, keeping the current speed. */
export function aim(m: Tween, to: number, dur: number) {
  if (Math.abs(to - m.to) < 1e-9) return
  m.from = m.x
  m.to = to
  m.t = 0
  m.dur = dur
  m.v0 = m.v
}

/** Advances by `dt` seconds along `ease`. Returns true while it is still moving. */
export function advance(m: Tween, dt: number, ease: (t: number) => number): boolean {
  if (m.t >= 1) {
    m.x = m.to
    m.v = 0
    return false
  }
  const prev = m.x
  m.t = Math.min(1, m.t + dt / m.dur)
  const e = ease(m.t)
  // The inherited speed carries on as t(1-t)^2: slope 1 at the start (so the first step continues at v0) and zero, with zero
  // value, at the end (so the move still lands exactly on `to`).
  const carry = m.v0 * m.dur * m.t * (1 - m.t) * (1 - m.t)
  m.x = m.from + (m.to - m.from) * e + carry
  m.v = dt > 0 ? (m.x - prev) / dt : 0
  return m.t < 1
}
