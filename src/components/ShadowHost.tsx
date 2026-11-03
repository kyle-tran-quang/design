import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ShadowHostProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * Renders children inside an open shadow root, so components that ship their own
 * unscoped stylesheet (like Framer standalone exports) can't affect the page, and
 * the page's styles can't affect them.
 */
export default function ShadowHost({ children, className, style }: ShadowHostProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [root, setRoot] = useState<ShadowRoot | null>(null)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (host) setRoot(host.shadowRoot ?? host.attachShadow({ mode: 'open' }))
  }, [])

  return (
    <div ref={hostRef} className={className} style={style}>
      {root && createPortal(children, root)}
    </div>
  )
}
