/*
 * Two discs: an orange ring with a spinning rim and a grey eye that follows the cursor.
 * Renders the imported TwoDiscs component at its 2:1 design proportions.
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react"

const TwoDiscs = lazy(() => import("./TwoDiscs"))

export default function DiscRig({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [nearby, setNearby] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || nearby) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNearby(true)
        observer.disconnect()
      },
      { rootMargin: "600px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [nearby])

  return (
    <div
      ref={ref}
      className={`aspect-[2/1] ${className ?? ""}`}
      aria-hidden="true"
    >
      {nearby && (
        <Suspense fallback={null}>
          <TwoDiscs />
        </Suspense>
      )}
    </div>
  )
}
