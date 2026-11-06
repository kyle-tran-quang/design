import { useEffect, useId, useRef } from 'react'
import { isLowPower, watchVisibility } from '@/lib/performance'

/*
 * A pill with a plucky "string" inside. Hover across the line or drag it and it
 * springs back; three beads drift down the string on a loop.
 *
 * The string is simulated as a chain of points (a discretised wave equation)
 * stepped at a fixed rate, then drawn as a filled outline whose half-width
 * swells around each bead.
 *
 * The loop only runs while the pill is on screen, and sleeps once the string is
 * still and the beads aren't drifting (reduced motion, low-power mode); touching
 * the string wakes it.
 */

// Pill geometry (outer viewBox)
const PILL_W = 128.8
const PILL_H = 361
const PILL_STROKE = 17.4

// String geometry, in the inner viewBox "-42 -8 84 294"
const START = -8
const LENGTH = 294
const END = START + LENGTH
const POINTS = 32
const SEGMENT = LENGTH / (POINTS - 1)
const MAX_OFFSET = 28
const HALF_WIDTH = 0.65
const SAMPLE_STEP = 1.5

// Beads
const BEAD_SPACING = 44
const BEAD_CENTER = 139
const BEAD_REACH = 88
const BEAD_EDGE = 10
const BEAD_CORE = 4.7
const BEAD_CYCLE_MS = 1300
const BEAD_MOVE_MS = 700

// Physics
const TENSION = 46000
const ANCHOR = 20
const GRAB_STIFFNESS = 12000
const GRAB_DAMPING = 90
const GRAB_SPREAD = 2 * 2.3 ** 2
const VISCOSITY = 70
const DAMPING = 3.5
const DAMPING_REDUCED = 14
const STEP = 1 / 480
const FOLLOW = 1 - Math.exp(-STEP / 0.04)
// Below these the string reads as still and the loop can sleep.
const REST_OFFSET = 0.01
const REST_VELOCITY = 0.05

type StringState = { x: Float32Array; v: Float32Array }
type Grab = { u: number; target: number }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Bead size at position `u` along the string; beads shrink as they near the ends. */
function beadSize(u: number) {
  const d = Math.abs(u - BEAD_CENTER)
  if (d >= BEAD_REACH) return 0
  if (d >= BEAD_REACH / 2) return BEAD_EDGE * Math.sin((Math.PI * (BEAD_REACH - d)) / BEAD_REACH) ** 2
  return BEAD_CORE + 5.3 * Math.sin((Math.PI * d) / BEAD_REACH) ** 2
}

function step(state: StringState, dt: number, grab: Grab | null, damping: number) {
  const { x, v } = state
  const grabIndex = grab ? (grab.u - START) / SEGMENT : -1
  for (let i = 1; i < POINTS - 1; i++) {
    let force =
      TENSION * (x[i - 1] - 2 * x[i] + x[i + 1]) -
      ANCHOR * x[i] -
      damping * v[i] +
      VISCOSITY * (v[i - 1] - 2 * v[i] + v[i + 1])
    if (grab) {
      const weight = Math.exp(-((i - grabIndex) ** 2) / GRAB_SPREAD)
      force += weight * (GRAB_STIFFNESS * (grab.target - x[i]) - GRAB_DAMPING * v[i])
    }
    v[i] += force * dt
  }
  for (let i = 1; i < POINTS - 1; i++) x[i] = clamp(x[i] + v[i] * dt, -MAX_OFFSET, MAX_OFFSET)
}

function atRest({ x, v }: StringState) {
  for (let i = 1; i < POINTS - 1; i++) {
    if (Math.abs(x[i]) > REST_OFFSET || Math.abs(v[i]) > REST_VELOCITY) return false
  }
  return true
}

/** Catmull-Rom sample of the string's sideways offset at position `u`. */
function offsetAt(state: StringState, u: number) {
  const t = clamp((u - START) / SEGMENT, 0, POINTS - 1 - 1e-4)
  const i = Math.floor(t)
  const f = t - i
  const x = state.x
  const p0 = x[Math.max(0, i - 1)]
  const p1 = x[i]
  const p2 = x[i + 1]
  const p3 = x[Math.min(POINTS - 1, i + 2)]
  return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f)
}

function halfWidthAt(u: number, shift: number) {
  let width = HALF_WIDTH
  for (let k = -1; k <= 4; k++) {
    const center = 51 + BEAD_SPACING * k + shift
    const size = beadSize(center)
    if (size <= 0) continue
    const reach = 7 + size
    const d = Math.abs(u - center)
    if (d < reach) width += size * Math.cos((Math.PI * d) / (2 * reach)) ** 1.8
  }
  return width
}

function buildPath(state: StringState, shift: number) {
  const left: string[] = []
  const right: string[] = []
  for (let u = START; u <= END + 1e-3; u += SAMPLE_STEP) {
    const x = offsetAt(state, u)
    const w = halfWidthAt(u, shift)
    left.push(`${(x - w).toFixed(2)} ${u.toFixed(2)}`)
    right.push(`${(x + w).toFixed(2)} ${u.toFixed(2)}`)
  }
  return `M${left.join('L')}L${right.reverse().join('L')}Z`
}

type ElasticLineProps = {
  /** Pill outline colour. */
  outline?: string
  /** String colour near the ends. */
  mid?: string
  /** String colour through the middle. */
  center?: string
  /** Animate the beads drifting along the string. */
  drift?: boolean
  className?: string
}

export default function ElasticLine({
  outline = 'var(--color-mist)',
  mid = 'var(--color-line)',
  center = 'var(--color-silver)',
  drift = true,
  className,
}: ElasticLineProps) {
  const gradientId = `elastic-line-${useId().replace(/:/g, '')}`
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const driftRef = useRef(drift)
  driftRef.current = drift
  const wakeRef = useRef<() => void>(() => {})

  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    if (!svg || !path) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowPower = isLowPower()
    const damping = reduced ? DAMPING_REDUCED : DAMPING
    const state: StringState = { x: new Float32Array(POINTS), v: new Float32Array(POINTS) }
    const pointer = { u: 0, v: 0 }
    let grab: Grab | null = null
    let pressed = false
    let shift = 0
    let frame = 0
    let visible = false
    let last = performance.now()
    let pending = 0
    const start = last

    const drifting = () => driftRef.current && !reduced && !lowPower

    const tick = (now: number) => {
      frame = 0
      pending += Math.min(0.05, (now - last) / 1000)
      last = now
      while (pending >= STEP) {
        if (grab) {
          grab.u += (pointer.u - grab.u) * FOLLOW
          grab.target += (pointer.v - grab.target) * FOLLOW
        }
        step(state, STEP, grab, damping)
        pending -= STEP
      }
      if (drifting()) {
        const t = (now - start) % BEAD_CYCLE_MS
        shift = t < BEAD_MOVE_MS ? easeInOutCubic(t / BEAD_MOVE_MS) * BEAD_SPACING : 0
      } else {
        shift = 0
      }
      path.setAttribute('d', buildPath(state, shift))
      // Keep going while something moves; otherwise sleep until the pointer touches the string.
      if (visible && (drifting() || grab || !atRest(state))) frame = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (frame || !visible) return
      last = performance.now()
      pending = 0
      frame = requestAnimationFrame(tick)
    }
    wakeRef.current = wake

    // Pointer position in string coordinates: v is sideways, u runs along the string.
    const toLocal = (event: PointerEvent) => {
      const matrix = svg.getScreenCTM()
      if (!matrix) return null
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
      return { v: p.x, u: p.y }
    }
    const clampU = (u: number) => clamp(u, 4, LENGTH - 20)
    const clampV = (v: number) => clamp(v, -MAX_OFFSET, MAX_OFFSET)

    const onMove = (event: PointerEvent) => {
      const p = toLocal(event)
      if (!p) return
      const inside = p.u > 0 && p.u < LENGTH - 16
      if (grab) {
        if (!pressed && (!inside || Math.abs(p.v) > 30)) {
          grab = null
          return
        }
        pointer.u = clampU(p.u)
        pointer.v = clampV(p.v)
      } else if (inside && Math.abs(p.v - offsetAt(state, p.u)) < 6 + halfWidthAt(p.u, shift)) {
        // Brushing across the string catches it.
        pointer.u = p.u
        pointer.v = p.v
        grab = { u: p.u, target: offsetAt(state, p.u) }
        wake()
      }
    }
    const onDown = (event: PointerEvent) => {
      const p = toLocal(event)
      if (!p) return
      pressed = true
      svg.setPointerCapture(event.pointerId)
      pointer.u = clampU(p.u)
      pointer.v = clampV(p.v)
      grab = { u: pointer.u, target: offsetAt(state, pointer.u) }
      wake()
    }
    const onUp = () => {
      pressed = false
      grab = null
    }
    const onLeave = () => {
      if (!pressed) grab = null
    }

    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerdown', onDown)
    svg.addEventListener('pointerup', onUp)
    svg.addEventListener('pointercancel', onUp)
    svg.addEventListener('pointerleave', onLeave)

    // Draw the resting string straight away, so it shows even before the loop first runs.
    path.setAttribute('d', buildPath(state, 0))
    const unwatch = watchVisibility(svg, (next) => {
      visible = next
      if (visible) {
        wake()
      } else if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    })

    return () => {
      cancelAnimationFrame(frame)
      unwatch()
      wakeRef.current = () => {}
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerdown', onDown)
      svg.removeEventListener('pointerup', onUp)
      svg.removeEventListener('pointercancel', onUp)
      svg.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Turning the drift back on has to restart a sleeping loop.
  useEffect(() => {
    wakeRef.current()
  }, [drift])

  const innerW = PILL_W - PILL_STROKE * 2
  const innerH = PILL_H - PILL_STROKE * 2

  return (
    <svg
      viewBox={`0 0 ${PILL_W} ${PILL_H}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      <rect
        x={PILL_STROKE / 2}
        y={PILL_STROKE / 2}
        width={PILL_W - PILL_STROKE}
        height={PILL_H - PILL_STROKE}
        rx={(PILL_W - PILL_STROKE) / 2}
        fill="none"
        stroke={outline}
        strokeWidth={PILL_STROKE}
      />
      <svg
        ref={svgRef}
        x={PILL_STROKE}
        y={PILL_STROKE}
        width={innerW}
        height={innerH}
        viewBox={`-42 ${START} 84 ${LENGTH}`}
        preserveAspectRatio="xMidYMid meet"
        className="cursor-grab touch-none select-none active:cursor-grabbing"
      >
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1={START} x2="0" y2={END}>
            <stop offset="0" stopColor={outline} />
            <stop offset="0.12" stopColor={mid} />
            <stop offset="0.3" stopColor={center} />
            <stop offset="0.7" stopColor={center} />
            <stop offset="0.88" stopColor={mid} />
            <stop offset="1" stopColor={outline} />
          </linearGradient>
        </defs>
        {/* Transparent hit area so hovering anywhere in the pill can catch the string. */}
        <rect x="-42" y={START} width="84" height={LENGTH} fill="transparent" />
        <path ref={pathRef} fill={`url(#${gradientId})`} />
      </svg>
    </svg>
  )
}
