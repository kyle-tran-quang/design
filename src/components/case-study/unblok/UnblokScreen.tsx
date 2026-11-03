import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { CinematicScreenProps } from '../cardoctor/Cinematic'

// The Unblok cinematic's screen: the iPhone and Apple Watch render from Figma (RyZAivKDXMz4gAgBM6XHuz node 8:1003,
// 1024×1024, resampled to 2048×2048 so it stays crisp at the zoomed-in size on high-density screens), in the design's
// 40/40/8/8 container scaled with it. The square sits in a 1024 stage with 64px of air so the zoomed-in card never
// touches the viewport's edges. It is a photo, so it plays the runtime's image variant: a contour sketch of its own
// tones, a halftone, a dot matrix of its own colours, then the photo resolves and stays.

type HiddenEl = HTMLDivElement & { __tTigOpacity?: string }

const ART = 'unblok-cinematic.webp'
/** The design's 300px container radii (40 top, 8 bottom), scaled to the 896px card. */
const RADIUS = 'rounded-t-[119.5px] rounded-b-[23.9px]'

// The runtime reads the halftone ink and lit dots from the traced element, so they are set here for the dark frame;
// the frame's overlay host sets the rest of the --tig-* palette.
const darkInk = { '--tig-ink': 'rgba(255, 255, 255, 0.5)', '--tig-strong': '#ffffff' } as CSSProperties

export default function UnblokScreen({
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
  // Hidden until the runtime takes over, so the finished photo never flashes first. The flag sits on the root rather
  // than as an inline style on the card: the runtime shows the card again at its own inline opacity (empty), and
  // React must never rewrite that style afterwards, or the photo would vanish once the blueprint ends.
  const [pending, setPending] = useState(enabled)
  const src = asset(ART)

  useLayoutEffect(() => {
    const el = cardRef.current
    const img = el?.querySelector('img')
    if (!el || !img || !enabled) {
      setPending(false)
      return
    }
    // The runtime shows the element again (at __tTigOpacity) once its drawing has started, and leaves it so.
    el.__tTigOpacity = el.style.opacity
    el.style.opacity = '0'
    setPending(false)

    let disposed = false
    let run: ReturnType<CinematicScreenProps['generate']> | null = null
    // The runtime hides the <img> to fade it in itself, and hands its style back once the photo is fully in. What is
    // left of its run only fades an overlay that is already empty, so it ends there and the frame can slide up.
    let taken = false
    const resolved = new MutationObserver(() => {
      if (img.style.opacity) taken = true
      else if (taken) run?.cancel()
    })
    // The image variant samples the photo's pixels, so it must be decoded first.
    img.decode().catch(() => undefined).then(() => {
      if (disposed) return
      resolved.observe(img, { attributes: true, attributeFilter: ['style'] })
      run = generate(el, { variant: 'image', mode: 'skeleton', delay, ...(duration ? { duration } : {}) })
      run.finished.then(() => {
        resolved.disconnect()
        if (!disposed) onFinishedRef.current?.()
      })
    })

    return () => {
      disposed = true
      resolved.disconnect()
      run?.cancel()
      el.style.opacity = el.__tTigOpacity ?? ''
      delete el.__tTigOpacity
    }
  }, [enabled, generate, src, delay, duration])

  return (
    // Transparent: the cinematic frame owns the background (dark blueprint, then light grey).
    <div className="relative size-[1024px] shrink-0 p-16" style={darkInk} data-pending={pending ? '' : undefined}>
      <div ref={cardRef} className={`size-full overflow-hidden ${RADIUS} [[data-pending]_&]:opacity-0`}>
        <img
          src={src}
          alt="Unblok on iPhone and Apple Watch"
          className="block size-full max-w-none object-cover"
          draggable={false}
        />
      </div>
    </div>
  )
}
