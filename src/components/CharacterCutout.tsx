import { useEffect, useId, useRef, type CSSProperties } from 'react'
import { hasFinePointer, isLowPower, watchVisibility } from '@/lib/performance'

/*
 * Paths are taken verbatim from the Figma frames Idle (1:2), Blink (1:7) and Happy (1:12).
 * The frames are split into layers so the body can spin independently of the eyes.
 *
 * Cutout version: the eyes are punched out of the body with an SVG mask, so whatever sits
 * behind the component shows through them. Self-contained; it does not depend on Character.tsx.
 */
const VIEWBOX = 120.065
const BODY =
  'M78.1097 2.26694C79.0933 2.2207 80.2668 2.5405 81.0814 3.11445C84.4386 5.47961 82.9368 13.919 83.6878 17.8581C83.9815 19.3988 84.569 20.8877 85.777 21.8767C87.5109 23.296 90.2477 23.914 92.3597 24.4228C98.3427 25.864 108.78 27.0399 113.629 30.4753C114.745 31.2664 115.784 32.3806 116.037 33.8283C116.781 38.0831 109.537 43.1443 107.366 46.5697C106.454 48.0083 105.869 49.563 106.123 51.3292C106.358 52.9655 107.274 54.6126 108.04 56.0287C111.287 62.0346 117.95 70.052 119.161 76.6422C119.432 78.1141 119.347 79.5937 118.519 80.8613C116.093 84.5697 107.659 83.1672 103.717 83.9888C102.294 84.2854 100.826 84.8397 99.7988 85.9681C96.2911 89.8215 94.9837 102.878 91.0485 109.011C89.7174 111.085 87.7423 113.12 85.3204 113.578C81.9778 114.21 78.8738 111.031 76.3154 109.187C74.6813 108.009 72.8285 107.136 70.8159 107.2C64.7359 107.39 55.059 116.546 47.7303 117.99C45.3598 118.457 43.5013 118.047 41.5282 116.611C37.0081 112.676 39.5388 105.228 35.183 101.751C33.3413 100.281 30.7295 99.6343 28.5204 99.085C22.6321 97.621 11.6432 96.4565 6.94934 92.8773C5.86698 92.0519 4.91947 90.9104 4.71866 89.4703C4.14905 85.3856 11.02 80.4091 13.2242 77.1825C14.0777 75.9332 14.819 74.4301 14.7257 72.8453C14.3495 66.4604 2.78188 54.8785 1.57881 46.6289C1.36799 45.1832 1.48017 43.6456 2.33865 42.4413C4.7402 39.0723 12.2983 40.1822 15.9274 39.6825C17.6449 39.4461 19.5561 38.9807 20.8342 37.6566C25.2409 33.0913 25.545 15.8049 30.4112 9.18843C31.3301 7.93893 32.7272 6.77359 34.259 6.5958C37.9993 6.16169 42.0285 11.5736 44.7541 13.8394C46.2073 15.0474 48.0546 16.2806 49.9669 16.2716C56.4745 16.2412 68.7676 3.42996 78.1097 2.26694Z'
const EYES = {
  open: {
    left: {
      d: 'M37.3833 56.0574C43.1063 55.446 48.2425 59.547 48.8411 65.2055C49.4396 70.8641 45.2727 75.9264 39.5456 76.4983C33.8468 77.0672 28.7557 72.9734 28.1601 67.3427C27.5646 61.712 31.6887 56.6657 37.3833 56.0574Z',
      cx: 38.5,
      cy: 66.26,
    },
    right: {
      d: 'M83.8973 51.1898C89.6202 50.5784 94.7564 54.6794 95.355 60.3379C95.9535 65.9965 91.7866 71.0588 86.0595 71.6307C80.3607 72.1996 75.2696 68.1058 74.6741 62.4751C74.0785 56.8444 78.2026 51.7982 83.8973 51.1898Z',
      cx: 85.02,
      cy: 61.39,
    },
  },
  closed: {
    left: {
      d: 'M41.2389 72.4332C41.8983 72.3178 42.9851 71.848 43.6109 71.5224C47.1197 69.6971 49.9196 65.9649 49.9392 61.9163C49.9464 60.4327 48.5104 59.7101 47.1537 59.8822C44.4394 60.2268 44.2947 63.6258 42.7743 65.3112C41.442 66.8037 40.1717 67.2825 38.2378 67.4345C33.3526 67.4895 33.3461 63.2174 29.0579 63.5028C28.1102 64.0971 26.8731 65.2534 27.3953 66.4128C29.9671 72.1227 35.9705 73.6252 41.2389 72.4332Z',
      cx: 38.41,
      cy: 66.67,
    },
    right: {
      d: 'M86.0034 66.3053C86.6694 66.2386 87.7878 65.8499 88.4359 65.5711C92.0692 64.0084 95.1356 60.4918 95.4524 56.4556C95.5685 54.9765 94.1894 54.1504 92.8238 54.2225C90.0915 54.3668 89.6976 57.746 88.0576 59.3152C86.6192 60.7059 85.3172 61.0901 83.3774 61.0997C78.5013 60.7959 78.8085 56.5348 74.5109 56.5046C73.5222 57.0277 72.2035 58.0901 72.6392 59.2847C74.7848 65.1681 80.6617 67.1072 86.0034 66.3053Z',
      cx: 83.89,
      cy: 60.63,
    },
  },
  happy: {
    left: {
      d: 'M37.0795 60.1584C37.7387 60.0419 38.9206 60.1126 39.62 60.2051C43.541 60.7234 47.4465 63.276 48.8466 67.0748C49.3597 68.467 48.2565 69.6362 46.9225 69.9374C44.2535 70.5399 42.9575 67.3942 40.9533 66.3289C39.1916 65.3807 37.8341 65.3642 35.9645 65.8812C31.3538 67.4967 32.8056 71.5146 28.6774 72.7097C27.5838 72.4745 26.0264 71.8098 26.1216 70.5417C26.5904 64.2969 31.7207 60.8359 37.0795 60.1584Z',
      cx: 37.69,
      cy: 66.38,
    },
    right: {
      d: 'M85.5022 55.0316C86.1614 54.9151 87.3433 54.9858 88.0427 55.0783C91.9637 55.5965 95.8692 58.1492 97.2693 61.948C97.7824 63.3401 96.6791 64.5094 95.3452 64.8106C92.6762 65.413 91.3802 62.2674 89.3759 61.2021C87.6142 60.2539 86.2568 60.2373 84.3871 60.7544C79.7765 62.3699 81.2283 66.3877 77.1001 67.5829C76.0065 67.3477 74.4491 66.683 74.5443 65.4149C75.013 59.1701 80.1433 55.7091 85.5022 55.0316Z',
      cx: 86.12,
      cy: 61.25,
    },
  },
} as const

// Shared center of the body in every frame.
const CX = 60.4
const CY = 60.34
// Blink/Happy frames draw the body 3.26% taller than Idle (120.03 vs 116.24).
const BODY_STRETCH = 120.03 / 116.24 - 1

// Motion tuning
const IDLE_SPIN = 6 // deg/s, clockwise -> one turn per minute
const HAPPY_TURN = 360 // extra degrees spun during the happy state
const HAPPY_MS = 1000
const BLINK_MS = 240
const BLINK_GAP_MIN = 1600
const BLINK_GAP_RANGE = 1000
const DOUBLE_BLINK_CHANCE = 1 / 6
const EYE_TRAVEL_PX = 8 // max on-screen eye nudge
const EYE_FALLOFF_PX = 360 // pointer distance that reaches full travel
const LOOK_SETTLED = 0.005 // viewBox units; closer than this the eyes have stopped moving
const RECT_MAX_AGE_MS = 250 // re-measure now and then too, in case an entrance animation moved the character

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
const easeIn = (t: number) => t * t * t
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutBack = (t: number, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const scaleAround = (cx: number, cy: number, sx: number, sy: number) =>
  `translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`

// Inline (not Tailwind) so the reset survives in hosts without Tailwind, e.g. Framer.
const BUTTON_RESET: CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  display: 'block',
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: 0,
  background: 'transparent',
  boxShadow: 'none',
  outline: 'none',
  cursor: 'pointer',
  lineHeight: 0,
  WebkitTapHighlightColor: 'transparent',
}

type EyeKey = 'left' | 'right'

interface CharacterCutoutProps {
  /**
   * Defaults to '100%' so the character fills (and resizes with) its parent frame.
   * Pass a number for a fixed pixel size. The artwork always stays square and centered.
   */
  size?: number | string
  className?: string
}

/**
 * Framer reads these to make the component resizable on the canvas.
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 240
 * @framerIntrinsicHeight 240
 */
export default function CharacterCutout({ size = '100%', className = '' }: CharacterCutoutProps) {
  const maskId = `character-cutout-eyes-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const svgRef = useRef<SVGSVGElement>(null)
  const popRef = useRef<SVGGElement>(null)
  const stretchRef = useRef<SVGGElement>(null)
  const spinRef = useRef<SVGGElement>(null)
  const lookRef = useRef<SVGGElement>(null)
  const openRefs = useRef<Record<EyeKey, SVGGElement | null>>({ left: null, right: null })
  const closedRefs = useRef<Record<EyeKey, SVGGElement | null>>({ left: null, right: null })
  const happyRefs = useRef<Record<EyeKey, SVGGElement | null>>({ left: null, right: null })
  const happyStartRef = useRef<number | null>(null)
  const wakeRef = useRef<() => void>(() => {})

  /*
   * One loop drives the spin, the blinks, the click reaction and the eyes. It only runs while the character is on
   * screen. Without the idle spin (reduced motion, low-power mode) it sleeps between blinks and wakes on a timer,
   * a click or the pointer. The eyes follow a mouse or trackpad only; touch screens have no cursor to look at.
   */
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const lowPower = isLowPower()
    const tracking = hasFinePointer()
    const pointer = { x: 0, y: 0, active: false }
    const look = { x: 0, y: 0 }
    // The SVG's on-screen box, read lazily rather than every frame.
    let rect: DOMRect | null = null
    let rectAt = 0
    let angle = 0
    let spinStart: number | null = null
    let spinOffset = 0
    let skipHappyIntro = false
    let last = performance.now()
    let blinkStart: number | null = null
    let isDoubleBlink = false
    let nextBlink = last + BLINK_GAP_MIN + Math.random() * BLINK_GAP_RANGE
    let frame = 0
    let blinkTimer = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
      wake()
    }
    const onLeave = () => {
      pointer.active = false
      wake()
    }
    const invalidateRect = () => {
      rect = null
    }
    if (tracking) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      window.addEventListener('blur', onLeave)
      window.addEventListener('scroll', invalidateRect, { passive: true, capture: true })
      window.addEventListener('resize', invalidateRect)
    }

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(now - last, 50) / 1000
      last = now
      const reduced = motionQuery.matches
      const spinning = !reduced && !lowPower

      // Happy timeline (0..1), null when inactive
      let happyT: number | null = null
      if (happyStartRef.current !== null) {
        happyT = (now - happyStartRef.current) / HAPPY_MS
        if (happyT >= 1) {
          happyStartRef.current = null
          happyT = null
        }
      }
      const happy = happyT !== null

      // Spin: steady idle rotation plus one eased full turn while happy.
      // A re-click mid-turn folds the partial turn into the base angle so nothing jumps.
      if (happyStartRef.current !== null && happyStartRef.current !== spinStart) {
        // Re-clicking while already happy keeps the ^^ eyes instead of replaying the close
        skipHappyIntro = spinStart !== null
        angle += spinOffset
        spinStart = happyStartRef.current
      }
      if (!happy) spinStart = null
      spinOffset = happy && !reduced ? HAPPY_TURN * easeInOut(happyT!) : 0
      angle = (angle + (spinning ? IDLE_SPIN : 0) * dt) % 360
      spinRef.current?.setAttribute('transform', `rotate(${angle + spinOffset} ${CX} ${CY})`)

      // Eye tracking, disabled while happy
      let tx = 0
      let ty = 0
      if (pointer.active && !happy && !reduced) {
        if (!rect || now - rectAt > RECT_MAX_AGE_MS) {
          rect = svg.getBoundingClientRect()
          rectAt = now
        }
        const dx = pointer.x - (rect.left + rect.width / 2)
        const dy = pointer.y - (rect.top + rect.height / 2)
        const dist = Math.hypot(dx, dy)
        if (dist > 0.001) {
          const reach = easeOut(clamp01(dist / EYE_FALLOFF_PX)) * EYE_TRAVEL_PX
          // The square artwork is drawn at the frame's shorter side
          const unitsPerPx = VIEWBOX / Math.min(rect.width, rect.height)
          tx = (dx / dist) * reach * unitsPerPx
          ty = (dy / dist) * reach * unitsPerPx
        }
      }
      const follow = 1 - Math.exp(-dt * (happy ? 14 : 9))
      look.x += (tx - look.x) * follow
      look.y += (ty - look.y) * follow
      lookRef.current?.setAttribute('transform', `translate(${look.x} ${look.y})`)

      // Blink scheduling (no new blinks while happy; an in-progress blink finishes)
      if (happy) {
        nextBlink = Math.max(nextBlink, now + HAPPY_MS * (1 - happyT!) + 600)
      } else if (blinkStart === null && now >= nextBlink) {
        blinkStart = now
      }

      let openScale = 1
      let openAlpha = 1
      let closedAlpha = 0
      let closedScale = 0.4
      let blinkBell = 0
      if (blinkStart !== null) {
        const p = (now - blinkStart) / BLINK_MS
        if (p >= 1) {
          blinkStart = null
          if (!isDoubleBlink && Math.random() < DOUBLE_BLINK_CHANCE) {
            isDoubleBlink = true
            nextBlink = now + 110
          } else {
            isDoubleBlink = false
            nextBlink = now + BLINK_GAP_MIN + Math.random() * BLINK_GAP_RANGE
          }
        } else {
          // 0-0.34 squash closed, 0.3-0.42 arcs grow in, hold, 0.6-0.72 arcs shrink out, 0.62-1 reopen
          const closing = easeIn(range(p, 0, 0.34))
          const opening = easeOut(range(p, 0.62, 1))
          openScale = p < 0.62 ? lerp(1, 0.08, closing) : lerp(0.08, 1, opening)
          openAlpha = 1 - range(p, 0.26, 0.36) + range(p, 0.6, 0.7)
          const arcIn = easeOut(range(p, 0.28, 0.42))
          const arcOut = easeIn(range(p, 0.58, 0.72))
          closedAlpha = arcIn * (1 - arcOut)
          closedScale = lerp(0.4, 1, arcIn) * lerp(1, 0.4, arcOut)
          blinkBell = Math.sin(Math.PI * p)
        }
      }

      // Happy eyes, same choreography as the blink:
      // 0-110ms open eyes squash shut, 80-240ms ^^ arcs grow in with a little overshoot,
      // hold, 800-900ms arcs shrink away, 860-1000ms open eyes stretch back open
      let happyAlpha = 0
      let happyScaleX = 1
      let happyScaleY = 0.2
      let pop = 1
      if (happy) {
        const ms = happyT! * HAPPY_MS
        const closing = skipHappyIntro ? 1 : easeIn(range(ms, 0, 110))
        const closedFade = skipHappyIntro ? 1 : range(ms, 70, 110)
        const smileIn = skipHappyIntro ? 1 : range(ms, 80, 240)
        const smileOut = easeIn(range(ms, 800, 900))
        const reopening = easeOut(range(ms, 860, 1000))
        const reopenFade = range(ms, 860, 900)

        const reopen = ms >= 860
        openScale = Math.min(openScale, reopen ? lerp(0.08, 1, reopening) : lerp(1, 0.08, closing))
        openAlpha = Math.min(openAlpha, reopen ? reopenFade : 1 - closedFade)

        happyAlpha = easeOut(range(smileIn, 0, 0.5)) * (1 - smileOut)
        happyScaleY = lerp(0.2, 1, easeOutBack(smileIn)) * lerp(1, 0.2, smileOut)
        happyScaleX = lerp(0.85, 1, easeOut(smileIn)) * lerp(1, 0.9, smileOut)
        closedAlpha *= 1 - happyAlpha
        // Damped squish on click
        const s = happyT! * HAPPY_MS / 1000
        pop = 1 - 0.09 * Math.exp(-s * 7) * Math.cos(s * 22)
      } else {
        skipHappyIntro = false
      }

      const stretch = 1 + BODY_STRETCH * Math.max(blinkBell, happyAlpha)
      stretchRef.current?.setAttribute('transform', scaleAround(CX, CY, 1, stretch))
      popRef.current?.setAttribute('transform', scaleAround(CX, CY, pop, pop))

      for (const key of ['left', 'right'] as const) {
        const open = openRefs.current[key]
        const closed = closedRefs.current[key]
        const smile = happyRefs.current[key]
        const o = EYES.open[key]
        const c = EYES.closed[key]
        const h = EYES.happy[key]
        open?.setAttribute('transform', scaleAround(o.cx, o.cy, 1, openScale))
        open?.setAttribute('opacity', String(clamp01(openAlpha)))
        closed?.setAttribute('transform', scaleAround(c.cx, c.cy, 1, closedScale))
        closed?.setAttribute('opacity', String(closedAlpha))
        smile?.setAttribute('transform', scaleAround(h.cx, h.cy, happyScaleX, happyScaleY))
        smile?.setAttribute('opacity', String(happyAlpha))
      }

      if (!visible) return
      const looking = Math.abs(tx - look.x) > LOOK_SETTLED || Math.abs(ty - look.y) > LOOK_SETTLED
      if (spinning || happy || blinkStart !== null || looking) {
        frame = requestAnimationFrame(tick)
      } else {
        // Nothing is moving: sleep until the next blink is due.
        blinkTimer = window.setTimeout(wake, Math.max(0, nextBlink - now))
      }
    }

    function wake() {
      if (frame || !visible) return
      clearTimeout(blinkTimer)
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    wakeRef.current = wake

    const unwatch = watchVisibility(svg, (next) => {
      visible = next
      if (visible) {
        rect = null
        wake()
      } else {
        cancelAnimationFrame(frame)
        clearTimeout(blinkTimer)
        frame = 0
      }
    })

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(blinkTimer)
      unwatch()
      wakeRef.current = () => {}
      if (tracking) {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerdown', onMove)
        document.documentElement.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('blur', onLeave)
        window.removeEventListener('scroll', invalidateRect, { capture: true })
        window.removeEventListener('resize', invalidateRect)
      }
    }
  }, [])

  const makeHappy = () => {
    happyStartRef.current = performance.now()
    wakeRef.current()
  }

  return (
    <button
      type="button"
      onClick={makeHappy}
      aria-label="Character. Click to make it happy"
      className={className || undefined}
      style={{ ...BUTTON_RESET, width: size, height: size }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        fill="none"
        overflow="visible"
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        <g ref={popRef}>
          {/* Black in the mask removes body pixels; the eyes' animated opacity gives partial holes. */}
          <mask id={maskId} maskUnits="userSpaceOnUse" x={-20} y={-20} width={VIEWBOX + 40} height={VIEWBOX + 40}>
            <rect x={-20} y={-20} width={VIEWBOX + 40} height={VIEWBOX + 40} fill="white" />
            <g ref={lookRef} fill="black">
              {(['left', 'right'] as const).map((key) => (
                <g key={key}>
                  <g ref={(el) => void (openRefs.current[key] = el)}>
                    <path d={EYES.open[key].d} />
                  </g>
                  <g ref={(el) => void (closedRefs.current[key] = el)} opacity={0}>
                    <path d={EYES.closed[key].d} />
                  </g>
                  <g ref={(el) => void (happyRefs.current[key] = el)} opacity={0}>
                    <path d={EYES.happy[key].d} />
                  </g>
                </g>
              ))}
            </g>
          </mask>
          <g mask={`url(#${maskId})`}>
            <g ref={stretchRef}>
              <g ref={spinRef}>
                <path d={BODY} fill="#FB690C" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </button>
  )
}
