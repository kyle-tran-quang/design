import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react'

/** Matches the homepage's sideways layout; below it the contact cards stack in the page flow and stay put. */
const DESKTOP_QUERY = '(min-width: 64rem)'
/** Movement before a press counts as a drag, so clicks on links and buttons inside still go through. */
const DRAG_THRESHOLD_PX = 5
/** Past the edge of the area, the item follows the pointer at this fraction, then springs back on release. */
const RUBBER_BAND = 0.3
const EDGE_INSET_PX = 12
const LIFT_SCALE = 1.04
const LIFT = { type: 'spring', duration: 0.35, bounce: 0.3 } as const

/** The most recently picked-up item sits on top. */
let topLayer = 10

type Session = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  zoom: number
  dragging: boolean
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/** The homepage track is scaled with CSS zoom; pointer movement is divided by it so the item stays under the cursor. */
function zoomOf(element: HTMLElement) {
  return element.currentCSSZoom || parseFloat(getComputedStyle(element).getPropertyValue('--z')) || 1
}

const rubberBand = (value: number, min: number, max: number) =>
  value < min ? min - (min - value) * RUBBER_BAND : value > max ? max + (value - max) * RUBBER_BAND : value

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** After release the item glides on with the throw's momentum and bounces softly off the area's edges. */
function glide(value: MotionValue<number>, min: number, max: number) {
  animate(value, value.get(), {
    type: 'inertia',
    velocity: value.getVelocity(),
    min,
    max,
    power: 0.35,
    timeConstant: 280,
    bounceStiffness: 260,
    bounceDamping: 28,
  })
}

type DraggableProps = {
  /** The area the item is kept inside. */
  bounds: RefObject<HTMLElement | null>
  /** Layout classes (position, size) for the wrapper. */
  className?: string
  children: ReactNode
}

/**
 * Lets its content be picked up and moved around on desktop: it lifts slightly, tilts with the pointer's speed,
 * and can be thrown. Plain clicks still reach links and buttons inside; a click that ends a drag is swallowed.
 */
export default function Draggable({ bounds, className = '', children }: DraggableProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const session = useRef<Session | null>(null)
  const swallowClick = useRef(false)
  const [enabled, setEnabled] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  const [dragging, setDragging] = useState(false)
  const reduced = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const rotate = useTransform(useSpring(useVelocity(x), { stiffness: 300, damping: 40 }), [-2000, 2000], [-8, 8])

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const update = () => setEnabled(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Back in place when the layout stacks again below lg.
  useEffect(() => {
    if (enabled) return
    x.stop()
    y.stop()
    x.set(0)
    y.set(0)
  }, [enabled, x, y])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || !event.isPrimary || event.button !== 0) return
    // Catch an item that is still gliding from a throw.
    x.stop()
    y.stop()
    session.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: x.get(),
      originY: y.get(),
      zoom: 1,
      dragging: false,
      minX: -Infinity,
      maxX: Infinity,
      minY: -Infinity,
      maxY: Infinity,
    }
  }

  const pickUp = (current: Session) => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    current.dragging = true
    current.zoom = zoomOf(inner)
    // Captured only once it is a drag: capturing on press would retarget clicks away from the links inside.
    outer.setPointerCapture(current.pointerId)

    const area = bounds.current?.getBoundingClientRect()
    if (area) {
      const box = inner.getBoundingClientRect()
      const { originX, originY, zoom } = current
      current.minX = originX + (area.left + EDGE_INSET_PX - box.left) / zoom
      current.maxX = Math.max(current.minX, originX + (area.right - EDGE_INSET_PX - box.right) / zoom)
      current.minY = originY + (area.top + EDGE_INSET_PX - box.top) / zoom
      current.maxY = Math.max(current.minY, originY + (area.bottom - EDGE_INSET_PX - box.bottom) / zoom)
    }

    outer.style.zIndex = String(++topLayer)
    setDragging(true)
    if (!reduced) animate(scale, LIFT_SCALE, LIFT)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current
    if (!current || event.pointerId !== current.pointerId) return
    const dx = event.clientX - current.startX
    const dy = event.clientY - current.startY
    if (!current.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      pickUp(current)
    }
    x.set(rubberBand(current.originX + dx / current.zoom, current.minX, current.maxX))
    y.set(rubberBand(current.originY + dy / current.zoom, current.minY, current.maxY))
  }

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current
    if (!current || event.pointerId !== current.pointerId) return
    session.current = null
    if (!current.dragging) return

    swallowClick.current = true
    window.setTimeout(() => (swallowClick.current = false), 0)
    if (outerRef.current?.hasPointerCapture(current.pointerId)) outerRef.current.releasePointerCapture(current.pointerId)
    setDragging(false)

    if (reduced) {
      x.set(clamp(x.get(), current.minX, current.maxX))
      y.set(clamp(y.get(), current.minY, current.maxY))
      return
    }
    animate(scale, 1, LIFT)
    glide(x, current.minX, current.maxX)
    glide(y, current.minY, current.maxY)
  }

  return (
    <div
      ref={outerRef}
      className={`relative ${enabled ? 'touch-none select-none' : ''} ${dragging ? 'cursor-grabbing [&_*]:cursor-grabbing' : enabled ? 'cursor-grab' : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      // Links and images would otherwise start the browser's own drag-and-drop and cancel the pointer.
      onDragStart={(event) => enabled && event.preventDefault()}
      onClickCapture={(event) => {
        if (!swallowClick.current) return
        swallowClick.current = false
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <motion.div ref={innerRef} style={{ x, y, scale, rotate }}>
        {children}
      </motion.div>
    </div>
  )
}
