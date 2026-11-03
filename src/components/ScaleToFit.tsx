import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type ScaleToFitProps = {
  /** Width the content is designed at. */
  width: number
  /** Below this scale the content stops shrinking and scrolls sideways instead. */
  minScale?: number
  className?: string
  children: ReactNode
}

/** Renders fixed-width content scaled down to fit its container, keeping the layout height in sync. */
export default function ScaleToFit({ width, minScale = 0.5, className, children }: ScaleToFitProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number>()
  const [scrolls, setScrolls] = useState(false)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const measure = () => {
      const fit = outer.clientWidth / width
      const next = Math.max(minScale, Math.min(1, fit))
      setScale(next)
      setHeight(inner.offsetHeight * next)
      setScrolls(fit < minScale)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [width, minScale])

  return (
    // Only a scroll box once the content can't shrink any further. Otherwise sub-pixel rounding (for example at
    // Windows display scaling) would overflow it by a fraction of a pixel and show both scrollbars.
    <div ref={outerRef} className={`${scrolls ? 'overflow-x-auto' : ''} ${className ?? ''}`}>
      <div style={{ width: width * scale, height }}>
        <div ref={innerRef} style={{ width, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
