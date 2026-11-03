import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react'
import CarDoctor, { type GenerateFn } from './CarDoctorScreen'
import {
  CINEMATIC,
  containerCss,
  easeInOutCubic,
  morphDuration,
  prefersReducedMotion,
  removeCurtain,
  takeHandoff,
  zoomStart,
} from './cinematic'

// The case-page cinematic: a full-screen frame that takes over from the card page's curtain, plays the
// CarDoctor blueprint-to-hi-fi generation at 50% of the curtain's width, zooms quickly to 70% as the
// screen turns hi-fi while the frame goes from dark to light grey, then slides up to show the page.
// Ported from CarDoctorCinematicStandalone.tsx; the only addition is `onOut`, so the page's own entrance
// effects can start as the frame slides away.

type Pads = { desktop: number; tablet: number; mobile: number }

/** What a cinematic screen receives. Each region plays the generation runtime `stagger` ms after the previous one. */
export type CinematicScreenProps = {
  generate: GenerateFn
  asset: (name: string) => string
  enabled?: boolean
  delay?: number
  duration?: number
  stagger?: number
  onFinished?: () => void
}

type CinematicProps = {
  /** The composition that generates. Defaults to the CarDoctor three-card row. */
  Screen?: ComponentType<CinematicScreenProps>
  /** How many regions the screen generates, and the gap between their starts (ms); they set the timeline. */
  regions?: number
  stagger?: number
  generate: GenerateFn
  asset: (name: string) => string
  dark?: string
  light?: string
  /** The screen's fill once hi-fi; fades in with the zoom so the blueprint still draws on the dark frame. */
  fill?: string
  /** Per-region build time for the generation runtime (ms). */
  regionDuration?: number
  pad?: Pads
  /** "handoff": play only when arriving from a card link to this page. "always": play on every mount. */
  trigger?: 'handoff' | 'always'
  /** The current page path for the handoff check. Defaults to location.pathname. */
  path?: string
  /** Show the finished composition in place without playing (the Framer canvas preview). */
  still?: boolean
  /** Called when the frame starts sliding out (or fading, with reduced motion). */
  onOut?: () => void
  onDone?: () => void
}

type Phase = 'idle' | 'play' | 'out' | 'done'
type Layer = { el: HTMLElement; s0: number }

const SCOPE = '.cin-frame'
const STATIC_CSS = [
  '.cin-frame .cin-container{height:100vh;height:100dvh}',
  '.cin-frame.is-inline .cin-container{height:100%}',
  // The screen paints its own #ECECEC page; here the frame owns the background (dark blueprint, then light grey).
  '.cin-frame .cin-stage [data-name="Frame 1948756531"]{background-color:transparent!important}',
].join("\n")

export default function Cinematic({
  Screen = CarDoctor,
  regions = CINEMATIC.regions,
  stagger = CINEMATIC.regionStagger,
  generate,
  asset,
  dark = CINEMATIC.dark,
  light = CINEMATIC.light,
  fill = CINEMATIC.fill,
  regionDuration = CINEMATIC.regionDuration,
  pad = CINEMATIC.pad,
  trigger = 'handoff',
  path,
  still = false,
  onOut,
  onDone,
}: CinematicProps) {
  // "always" starts covered, also in server-rendered HTML, so the page never shows before the intro.
  const [phase, setPhase] = useState<Phase>(() =>
    !still && trigger === 'always' ? 'play' : 'idle',
  )
  const [reduced, setReduced] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const decided = useRef<boolean | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  // Imperative scale state, shared by the fit (resize) and the zoom clock: the screen's scale goes from `from`
  // (blueprint) to `to` (zoomed in) as `e` (the eased zoom progress) goes 0 -> 1.
  const scale = useRef({ from: 1, to: 1, e: 0, layers: [] as Layer[] })
  const finished = useRef(false)
  const endCheck = useRef<() => void>(() => {})
  const skipRef = useRef<() => void>(() => {})
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const onOutRef = useRef(onOut)
  onOutRef.current = onOut

  const visible = still || phase === 'play' || phase === 'out'

  const apply = () => {
    const stage = stageRef.current
    if (!stage) return
    const { from, to, e, layers } = scale.current
    const s = from + (to - from) * e
    stage.style.transform = `translate(-50%, -50%) scale(${s})`
    if (fillRef.current) fillRef.current.style.opacity = String(e)
    scale.current.layers = layers.filter((l) => l.el.isConnected)
    for (const l of scale.current.layers)
      l.el.style.transform = `scale(${s / l.s0})`
  }
  const current = () =>
    scale.current.from +
    (scale.current.to - scale.current.from) * scale.current.e

  // The frame lives on <body> while mounted, so no transformed or clipping ancestor (a Framer layer, the Library
  // canvas) can trap its fixed positioning. React keeps rendering into it; it goes back home before React removes it.
  // (Moved by hand rather than with react-dom's createPortal, so the Framer file needs only react and framer.)
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (still || !frame) return
    const home = frame.parentNode
    const next = frame.nextSibling
    document.body.appendChild(frame)
    return () => {
      if (home)
        home.insertBefore(frame, next && next.parentNode === home ? next : null)
    }
  }, [still])

  // Decide once, before paint, so the frame is on screen in the same frame the curtain is removed.
  useLayoutEffect(() => {
    if (still) return
    if (decided.current === null) {
      const flag = takeHandoff(path ?? location.pathname)
      decided.current = trigger === 'always' || flag !== null
    }
    if (!decided.current) {
      removeCurtain()
      return
    }
    const isReduced = prefersReducedMotion()
    scale.current.e = isReduced ? 1 : 0
    setReduced(isReduced)
    setPhase('play')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Size the screen to a share of the curtain's width (50% drawing, 70% zoomed in), never wider than the padded
  // container (max 1920px). On mobile the zoomed-in screen fills the padded width instead, and the blueprint keeps
  // the same 50:70 proportion. The height only guards against clipping.
  useLayoutEffect(() => {
    if (!visible) return
    const frame = frameRef.current
    const container = containerRef.current
    const box = boxRef.current
    const stage = stageRef.current
    if (!frame || !container || !box || !stage) return
    if (still) scale.current.e = 1
    const measure = () => {
      const fw = frame.clientWidth
      if (fw <= 0) return
      // Padding by the frame's own width rather than the viewport (the CSS media queries only cover first paint),
      // so a Framer canvas breakpoint gets the same padding as the site at that width.
      const { desktop, tablet } = CINEMATIC.breakpoints
      const padPx =
        fw >= desktop ? pad.desktop : fw >= tablet ? pad.tablet : pad.mobile
      container.style.setProperty('--cin-pad', `${padPx}px`)
      const cw = container.clientWidth - 2 * padPx
      const ch = container.clientHeight
      const w = stage.offsetWidth
      const h = stage.offsetHeight
      if (!w || !h || cw <= 0 || ch <= 0) return
      const fitHeight = ch / h
      if (fw < tablet) {
        const to = Math.min(cw / w, fitHeight)
        scale.current.to = to
        scale.current.from = to * (CINEMATIC.startWidth / CINEMATIC.endWidth)
      } else {
        const sized = (share: number) =>
          Math.min(Math.min(share * fw, cw) / w, fitHeight)
        scale.current.from = sized(CINEMATIC.startWidth)
        scale.current.to = sized(CINEMATIC.endWidth)
      }
      box.style.width = `${w * scale.current.to}px`
      box.style.height = `${h * scale.current.to}px`
      apply()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame)
    ro.observe(container)
    ro.observe(stage)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pad.desktop, pad.tablet, pad.mobile])

  // Scroll lock while the frame covers the page.
  useLayoutEffect(() => {
    if (still || !(phase === 'play' || phase === 'out')) return
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previous
    }
  }, [still, phase === 'play' || phase === 'out'])

  // The timeline, on one clock that starts with the first blueprint drawing: the screen holds at 50% while the
  // blueprint draws, then zooms quickly to 70% as the last region turns hi-fi; dark -> light runs alongside.
  useLayoutEffect(() => {
    if (phase !== 'play') return
    const frame = frameRef.current
    const box = boxRef.current
    const host = hostRef.current
    if (!frame || !box || !host) return
    window.scrollTo(0, 0)
    removeCurtain()

    const timers: number[] = []
    const later = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms))
    let raf = 0
    let ended = false
    const end = () => {
      if (ended) return
      ended = true
      later(() => setPhase('out'), CINEMATIC.hold)
    }

    if (reduced) {
      // Reduced motion: the finished screen on light grey, a short hold, then a fade.
      later(end, 800)
      return () => timers.forEach(clearTimeout)
    }

    const morph = morphDuration(regionDuration, regions, stagger)
    const zoomAt = zoomStart(regionDuration, regions, stagger)
    let started = false
    let zoomDone = false
    endCheck.current = () => {
      if (zoomDone && finished.current) end()
    }
    const startClock = () => {
      if (started) return
      started = true
      frame.style.transition = `background-color ${morph * (1 - CINEMATIC.lightFrom)}ms ${CINEMATIC.morphEase} ${morph * CINEMATIC.lightFrom}ms`
      frame.style.backgroundColor = light
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(
          1,
          Math.max(0, (now - t0 - zoomAt) / CINEMATIC.zoomDuration),
        )
        scale.current.e = easeInOutCubic(p)
        apply()
        if (p < 1) {
          raf = requestAnimationFrame(tick)
          return
        }
        zoomDone = true
        endCheck.current()
        later(end, 600) // the runtime's own finish is late or never comes: continue anyway
      }
      raf = requestAnimationFrame(tick)
    }

    // The runtime puts each region's blueprint on <body> (.t-gen for UI, .t-tig for text and images), measured on
    // screen at that moment. Move it into the frame and scale it with the stage, so it stays on the screen while it zooms.
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (
            !(node instanceof HTMLElement) ||
            !(node.classList.contains('t-gen') || node.classList.contains('t-tig'))
          )
            return
          const left = parseFloat(node.style.left) - scrollX
          const top = parseFloat(node.style.top) - scrollY
          const b = box.getBoundingClientRect()
          node.style.left = `${left}px`
          node.style.top = `${top}px`
          node.style.transformOrigin = `${b.left + b.width / 2 - left}px ${b.top + b.height / 2 - top}px`
          scale.current.layers.push({ el: node, s0: current() })
          host.appendChild(node)
          startClock()
        })
      }
    })
    observer.observe(document.body, { childList: true })
    later(startClock, 1500) // nothing drew (fonts or icons slow): run the clock anyway

    skipRef.current = () => {
      if (ended) return
      cancelAnimationFrame(raf)
      started = true
      frame.style.transition = 'none'
      frame.style.backgroundColor = light
      scale.current.e = 1
      apply()
      setSkipped(true)
      ended = true
      later(() => setPhase('out'), 120)
    }

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      skipRef.current = () => {}
      endCheck.current = () => {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduced])

  // Skip: Esc or a click on the frame jumps to the finished screen and the slide-out.
  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skipRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  // Slide out (or fade, for reduced motion), then unmount.
  useEffect(() => {
    if (phase !== 'out') return
    const frame = frameRef.current
    if (!frame) return
    onOutRef.current?.()
    const ms = reduced ? 200 : CINEMATIC.slideOut
    frame.style.transition = reduced
      ? `opacity ${ms}ms ease-out`
      : `transform ${ms}ms ${CINEMATIC.slideEase}`
    const raf = requestAnimationFrame(() => {
      if (reduced) frame.style.opacity = '0'
      else frame.style.transform = 'translate3d(0, -100%, 0)'
    })
    const timer = window.setTimeout(() => {
      setPhase('done')
      onDoneRef.current?.()
    }, ms + 40)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [phase, reduced])

  // Not playing: an empty, hidden frame (the same element, so it stays on <body> and is never removed there by React).
  if (!visible)
    return (
      <div
        ref={frameRef}
        className="cin-frame"
        aria-hidden="true"
        style={{ display: 'none' }}
      />
    )

  const overlayVars = {
    '--gen-line': 'rgba(255, 255, 255, 0.62)',
    '--gen-strong': '#ffffff',
    '--gen-ink': 'rgba(255, 255, 255, 0.24)',
    '--gen-surface': dark,
    '--gen-text': '#ffffff',
    '--gen-muted': 'rgba(255, 255, 255, 0.6)',
    '--tig-line': 'rgba(255, 255, 255, 0.62)',
    '--tig-strong': '#ffffff',
    '--tig-ink': 'rgba(255, 255, 255, 0.5)',
    '--tig-surface': dark,
    '--tig-text': '#ffffff',
    '--tig-muted': 'rgba(255, 255, 255, 0.6)',
  } as CSSProperties

  const frame = (
    <div
      ref={frameRef}
      className={`cin-frame${still ? ' is-inline' : ''}`}
      aria-hidden="true"
      onPointerDown={() => skipRef.current()}
      style={{
        position: still ? 'absolute' : 'fixed',
        inset: 0,
        zIndex: still ? undefined : CINEMATIC.zIndex,
        backgroundColor: still || reduced ? light : dark,
        overflow: 'hidden',
        transform: 'translate3d(0, 0, 0)',
        willChange: still ? undefined : 'transform',
      }}
    >
      <style>{`${STATIC_CSS}\n${containerCss(`${SCOPE} .cin-container`, pad)}`}</style>
      <div
        ref={containerRef}
        className="cin-container"
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: CINEMATIC.maxWidth,
          marginInline: 'auto',
          paddingInline: 'var(--cin-pad)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div ref={boxRef} style={{ position: 'relative', flex: 'none' }}>
          <div
            ref={stageRef}
            className="cin-stage"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transformOrigin: 'center',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Behind the screen (the stage's transform makes it a stacking context), fading in with the zoom. */}
            <div
              ref={fillRef}
              className="cin-fill"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                background: fill,
                opacity: still || reduced ? 1 : 0,
                pointerEvents: 'none',
              }}
            />
            <Screen
              generate={generate}
              asset={asset}
              enabled={!still && !reduced && !skipped}
              delay={CINEMATIC.beat}
              duration={regionDuration}
              stagger={stagger}
              onFinished={() => {
                finished.current = true
                endCheck.current()
              }}
            />
          </div>
        </div>
      </div>
      <div
        ref={hostRef}
        className="cin-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          ...overlayVars,
        }}
      />
    </div>
  )

  return frame
}
