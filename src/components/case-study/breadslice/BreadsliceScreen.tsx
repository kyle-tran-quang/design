import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { CinematicScreenProps } from '../cardoctor/Cinematic'

// The Breadslice cinematic's screen: the case study's hero image (the three dark app screens on the bread-pattern
// backdrop, 1920×1080), shown whole at its own 16:9 rather than the hero band's crop, so every screen is in frame.
// The 1280×720 card sits in a stage with 64px of air so the zoomed-in card never touches the viewport's edges. It is
// a raster, so it plays the runtime's image variant: a contour sketch of its own tones, a halftone, a dot matrix of
// its own colours, then the image resolves.

type HiddenEl = HTMLDivElement & { __tTigOpacity?: string }

const ART = 'breadslice-hero.webp'
/**
 * The hero's 20px radius at its 1392px width, in proportion on the 1280px card. On the <img> too: the runtime
 * draws the image's outline with the image's own corner radius.
 */
const RADIUS = 'rounded-[18px]'

// The runtime reads the halftone ink and lit dots from the traced element, so they are set here for the dark frame;
// the frame's overlay host sets the rest of the --tig-* palette.
const darkInk = { '--tig-ink': 'rgba(255, 255, 255, 0.5)', '--tig-strong': '#ffffff' } as CSSProperties

export default function BreadsliceScreen({
  generate,
  asset,
  enabled = true,
  delay = 0,
  duration,
  onFinished,
}: CinematicScreenProps) {
  const cardRef = useRef<HiddenEl>(null)
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished
  // Hidden until the runtime takes over, so the finished image never flashes first.
  const [pending, setPending] = useState(enabled)
  const src = asset(ART)

  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el || !enabled) {
      setPending(false)
      return
    }
    // The runtime shows the element again (at __tTigOpacity) once its drawing has started.
    el.__tTigOpacity = el.style.opacity
    el.style.opacity = '0'
    setPending(false)

    let disposed = false
    let run: ReturnType<CinematicScreenProps['generate']> | null = null
    const img = el.querySelector('img')
    // The image variant samples the image's pixels, so it must be decoded first.
    Promise.resolve(img?.decode()).catch(() => undefined).then(() => {
      if (disposed) return
      run = generate(el, { variant: 'image', mode: 'skeleton', delay, ...(duration ? { duration } : {}) })
      run.finished.then(() => {
        if (!disposed) onFinishedRef.current?.()
      })
    })

    return () => {
      disposed = true
      run?.cancel()
      el.style.opacity = el.__tTigOpacity ?? ''
      delete el.__tTigOpacity
    }
  }, [enabled, generate, src, delay, duration])

  return (
    // Transparent: the cinematic frame owns the background (dark blueprint, then light grey).
    <div className="relative h-[848px] w-[1408px] shrink-0 p-16" style={darkInk}>
      <div ref={cardRef} className={`size-full overflow-hidden ${RADIUS}`} style={pending ? { opacity: 0 } : undefined}>
        <img
          src={src}
          alt="Breadslice's recording, slice list and collaboration screens"
          className={`block size-full max-w-none object-cover ${RADIUS}`}
          draggable={false}
        />
      </div>
    </div>
  )
}
