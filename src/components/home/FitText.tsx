type FitTextProps = {
  text: string
  /** Width of the drawing box; the text is stretched to fill it exactly. */
  width: number
  /** Extra space between glyphs, in viewBox units (negative tightens). */
  letterSpacing?: number
  className?: string
}

/**
 * Display text that always spans its container edge to edge, like Framer's
 * "fit text". Drawn in SVG so the fit doesn't depend on font metrics.
 */
export default function FitText({ text, width, letterSpacing, className }: FitTextProps) {
  return (
    <svg viewBox={`0 0 ${width} 149`} className={className} overflow="visible" aria-hidden="true">
      <text
        x="0"
        y="128.6"
        textLength={width}
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        className="font-display"
        fontSize="175"
        letterSpacing={letterSpacing}
      >
        {text}
      </text>
    </svg>
  )
}
