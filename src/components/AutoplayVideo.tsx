import { useEffect, useRef, useState } from "react"

type AutoplayVideoProps = {
  src: string
  label: string
  className?: string
}

/** Muted looping clip that only plays while on screen. With reduced motion it waits for the user. */
export default function AutoplayVideo({
  src,
  label,
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
      aria-label={label}
      muted
      loop
      playsInline
      preload={nearby ? "metadata" : "none"}
      controls={reduced}
      className={className}
    />
  )
}
