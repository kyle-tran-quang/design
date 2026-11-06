import { useEffect, useRef, useState } from "react"

type AutoplayVideoProps = {
  src: string
  /** Accessible name. Leave it out for a decorative clip (one with a visible caption), which is then hidden. */
  label?: string
  /**
   * Still shown until the clip loads, and in its place where autoplay is blocked (e.g. iOS Low Power Mode),
   * so a clip that replaces an animated image never shows up empty.
   */
  poster?: string
  className?: string
}

/** Muted looping clip that only plays while on screen. With reduced motion it waits for the user. */
export default function AutoplayVideo({
  src,
  label,
  poster,
  className,
}: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [nearby, setNearby] = useState(false)
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    const video = ref.current
    if (!video || nearby) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNearby(true)
        observer.disconnect()
      },
      { rootMargin: "600px" },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [nearby])

  useEffect(() => {
    const video = ref.current
    if (!video || reduced || !nearby) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [nearby, reduced])

  return (
    <video
      ref={ref}
      src={nearby ? src : undefined}
      poster={poster}
      aria-label={label}
      // With reduced motion it shows controls, which must stay reachable.
      aria-hidden={label || reduced ? undefined : true}
      muted
      loop
      playsInline
      preload={nearby ? "metadata" : "none"}
      controls={reduced}
      className={className}
    />
  )
}
