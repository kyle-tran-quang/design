import { useLayoutEffect, useRef, useState, type ComponentProps, type ComponentType } from 'react'
import CaseStudyCinematicExport from './MASCaseStudyCinematicStandalone'
import { isLowPower } from '@/lib/performance'

// Its Framer controls are typed as required, but each has a default.
const CaseStudyCinematic = CaseStudyCinematicExport as ComponentType<
  Partial<ComponentProps<typeof CaseStudyCinematicExport>>
>

// The standalone ships unscoped Tailwind utilities (.hidden, .flex, .grid ...). Unlayered, they would beat the
// page's own layered utilities (e.g. `hidden lg:flex`). Wrapping them in the `cinematic` layer, ordered between
// Tailwind's base and utilities in index.css, keeps the page's utilities in charge while the screen still wins
// over the page's base styles. A shadow root can't contain it: the cinematic moves its frame onto <body>.
const LAYERED = '/* layered:cinematic */'
// Figma-style font utilities, e.g. .font-\[\'IBM_Plex_Sans\:Bold\'\]{font-family:"IBM Plex Sans";font-weight:700}.
// The page's Tailwind emits the same class names with a bogus font-family, and its utilities outrank this layer,
// so these stay unlayered. They only match the screen's own elements.
const FONT_RULES = /\.font-\\\[\\'[^{]*\{[^}]*\}/g
// The export's Google Fonts @import, kept for its Framer copy. Quote-aware: the URL itself contains semicolons.
const IMPORT = /^\s*@import\s+(?:url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\s*\)|"[^"]*"|'[^']*')[^;]*;/

function layerCss(css: string) {
  if (css.startsWith(LAYERED)) return css
  // index.css self-hosts every face the import asks for (Plex Sans, Sans Condensed, Serif). Declared later, the
  // Google faces would replace the self-hosted ones, so drop it.
  const body = css.replace(IMPORT, '')
  const fonts = body.match(FONT_RULES) ?? []
  const rest = body.replace(FONT_RULES, '')
  // The page's body letter-spacing would otherwise inherit into the frame, which sits on <body>.
  return `${LAYERED}\n@layer cinematic {\n.cin-frame{letter-spacing:normal}\n${rest}\n}\n${fonts.join('\n')}`
}

type MasCinematicProps = {
  /** The frame starts sliding up (or fading, with reduced motion) to show the page. */
  onOut?: () => void
  onDone?: () => void
}

/**
 * The Maximo loading curtain, exactly as exported from Framer (MASCaseStudyCinematicStandalone.tsx): it covers
 * the page on load, draws the Sales Configurator screen as a white blueprint on dark, zooms in as it turns hi-fi,
 * then slides up. Esc or a click skips it. Unmounted once finished, taking its stylesheet with it.
 */
export default function MasCinematic({ onOut, onDone }: MasCinematicProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  // Low-power devices skip the curtain: drawing the blueprint is the costliest thing the page does on load, and the
  // export has no still mode that works on the page (its `still` frame is for Framer's canvas). Decided once.
  const [skip] = useState(isLowPower)
  const [playing, setPlaying] = useState(!skip)
  const onOutRef = useRef(onOut)
  onOutRef.current = onOut
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  // The page waits on these to start its own entrance, so a skipped curtain reports itself as already gone.
  useLayoutEffect(() => {
    if (!skip) return
    onOutRef.current?.()
    onDoneRef.current?.()
  }, [skip])

  useLayoutEffect(() => {
    if (skip) return
    // Before paint, so the unlayered stylesheet never applies.
    const style = rootRef.current?.querySelector('style')
    if (style) style.textContent = layerCss(style.textContent ?? '')

    // The standalone doesn't expose its phases, so follow its frame (already moved onto <body> by now):
    // it slides out with transform -100% (or fades to opacity 0), and is hidden with display:none when done.
    const frame = Array.from(document.body.children)
      .reverse()
      .find((el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains('cin-frame'))
    if (!frame) {
      onOutRef.current?.()
      return
    }
    let out = false
    const check = () => {
      const { transform, opacity, display } = frame.style
      if (!out && (display === 'none' || transform.includes('-100%') || opacity === '0')) {
        out = true
        onOutRef.current?.()
      }
      if (display === 'none') {
        observer.disconnect()
        setPlaying(false)
        onDoneRef.current?.()
      }
    }
    const observer = new MutationObserver(check)
    observer.observe(frame, { attributes: true, attributeFilter: ['style'] })
    check()
    return () => observer.disconnect()
  }, [skip])

  if (!playing) return null
  return (
    <div ref={rootRef}>
      <CaseStudyCinematic />
    </div>
  )
}
