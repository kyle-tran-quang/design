import { useEffect, useRef, useState } from "react"

/**
 * ScrollRotateIcon — rotating logo button for work pages.
 *
 * On hover it reveals a project-navigation dropdown with all five case studies
 * and a "Back to Home" footer link. The current page is highlighted in orange.
 *
 * The icon image and Mikado font are embedded as data URIs so this component
 * is fully self-contained with no external asset dependencies.
 */

const iconSrc = "data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%0A%3Cg clip-path=%22url%28%23clip0_2002_118%29%22%3E%0A%3Cpath d=%22M10.8759 3.33639C13.0293 2.26414 14.6883 6.69064 17.05 6.18692C19.4119 5.68268 24.3081 1.2254 26.5944 1.89165C28.8807 2.55803 26.7173 6.87434 28.7233 8.0911C30.7296 9.30768 37.4352 9.35678 38.5154 11.3704C39.5955 13.3841 34.8783 15.0638 35.3533 17.2888C35.8287 19.5139 40.4163 24.0423 39.6567 26.2241C38.897 28.4059 34.3917 26.4622 33.0572 28.3915C31.723 30.3213 31.5777 35.3867 28.9826 36.6789C26.8293 37.7508 25.5409 34.3923 23.1791 34.8965C20.8172 35.401 16.9278 38.9043 14.6417 38.238C11.8913 37.3065 13.5128 34.2089 11.5068 32.9922C9.50059 31.7755 2.79487 31.7265 1.71474 29.7129C0.634579 27.6992 5.35182 26.0195 4.87681 23.7945C4.40138 21.5694 -0.18668 17.0412 0.572511 14.8593C1.33218 12.6774 5.83854 14.6214 7.17292 12.6918C8.50709 10.762 8.72278 4.40921 10.8759 3.33639ZM11.9876 18.5497C10.0143 18.8369 8.64671 20.6692 8.93388 22.6425C9.22106 24.6159 11.0541 25.9823 13.0275 25.6952C15.0007 25.4079 16.3674 23.5758 16.0803 21.6025C15.7931 19.6292 13.9609 18.2627 11.9876 18.5497ZM28.1331 17.6586C27.0967 17.8096 26.1595 18.3422 25.5271 19.1392C25.102 19.6751 24.8375 20.3008 24.7535 20.9502C24.6854 21.4766 25.1873 21.8463 25.7126 21.7698C26.2377 21.6932 26.5801 21.1806 26.7779 20.6881C26.8458 20.519 26.9395 20.3581 27.0567 20.2104C27.3812 19.8014 27.862 19.5278 28.3938 19.4503C28.9257 19.3729 29.4653 19.498 29.893 19.7976C30.0475 19.9058 30.1831 20.0333 30.2965 20.1761C30.6265 20.5918 31.1006 20.9856 31.6259 20.9092C32.1512 20.8328 32.5269 20.3355 32.3116 19.8502C32.0459 19.2518 31.6141 18.7274 31.0539 18.3349C30.2205 17.7511 29.1695 17.5078 28.1331 17.6586Z%22 fill=%22%23FA680C%22/%3E%0A%3C/g%3E%0A%3Cdefs%3E%3CclipPath id=%22clip0_2002_118%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22white%22/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E"

/** All five case study pages in display order. */
const PROJECTS = [
  { name: "Breadslice",    slug: "breadslice" },
  { name: "Unblok",        slug: "unblok" },
  { name: "Car Doctor",    slug: "cardoctor" },
  { name: "Car Doctor DS", slug: "cardoctor-ds" },
  { name: "MAS Pricing",   slug: "mas-pricing" },
]

type Props = {
  size?: number
  /** Rotation degrees per scrolled pixel. */
  speed?: number
  /** Lerp smoothing factor (0–1). Higher = snappier. */
  smoothing?: number
  className?: string
  onAngle?: (angle: number) => void
}

export default function ScrollRotateIcon({
  size = 40,
  speed = 0.15,
  smoothing = 0.1,
  className,
  onAngle,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [open, setOpen] = useState(false)
  const speedRef = useRef(speed)
  const smoothingRef = useRef(smoothing)
  const onAngleRef = useRef(onAngle)
  speedRef.current = speed
  smoothingRef.current = smoothing
  onAngleRef.current = onAngle

  // Derive relative path prefix from current URL.
  const isWorkPage =
    typeof window !== "undefined" &&
    (window.location.pathname.includes("/work/") ||
      window.location.href.includes("/work/"))
  const workPrefix = isWorkPage ? "./" : "./work/"
  const homeHref = isWorkPage ? "../index.html" : "./index.html"

  // Determine which project is currently active (if any).
  const currentSlug =
    typeof window !== "undefined"
      ? PROJECTS.find((p) =>
          window.location.pathname.endsWith(p.slug + ".html")
        )?.slug ?? null
      : null

  useEffect(() => {
    const el = imgRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let current = window.scrollY * speedRef.current
    let raf = 0

    const render = () => {
      const target = window.scrollY * speedRef.current
      current += (target - current) * smoothingRef.current
      if (Math.abs(target - current) < 0.01) current = target
      el.style.transform = `rotate(${current}deg)`
      onAngleRef.current?.(current)
      raf = current === target ? 0 : requestAnimationFrame(render)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render)
    }

    kick()
    window.addEventListener("scroll", kick, { passive: true })
    return () => {
      window.removeEventListener("scroll", kick)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      className={className}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <img
        ref={imgRef}
        src={iconSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          willChange: "transform",
          cursor: "pointer",
        }}
      />

      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%) translateY(16px)",
            width: 208,
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: 6,
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            pointerEvents: "auto",
            textAlign: "left",
            animation: "navReveal 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          <style>{`
            @keyframes navReveal {
              from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.96); }
              to   { opacity: 1; transform: translateX(-50%) translateY(16px) scale(1); }
            }
            .sri-item { transition: background-color 0.15s ease, color 0.15s ease; }
            .sri-item:hover { background-color: #D0D0D0 !important; color: #FA680C !important; }
          `}</style>

          {PROJECTS.map((p) => {
            const active = p.slug === currentSlug
            return (
              <a
                key={p.slug}
                href={`${workPrefix}${p.slug}.html`}
                role="menuitem"
                className="sri-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderRadius: 4,
                  textDecoration: "none",
                  backgroundColor: active ? "rgba(0,0,0,0.05)" : "transparent",
                  color: active ? "#FA680C" : "#ADA9A3",
                  fontFamily: "'Mikado', Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: "16.9px",
                  letterSpacing: "-0.0059em",
                }}
              >
                {p.name}
              </a>
            )
          })}

          <div
            style={{
              height: 1,
              backgroundColor: "rgba(0,0,0,0.05)",
              margin: "4px 6px",
            }}
          />

          <a
            href={homeHref}
            role="menuitem"
            className="sri-item"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 12px",
              borderRadius: 4,
              textDecoration: "none",
              backgroundColor: "transparent",
              color: "#ADA9A3",
              fontFamily: "'Mikado', Inter, sans-serif",
              fontSize: 13,
              fontWeight: 400,
              lineHeight: "16.9px",
              letterSpacing: "-0.0059em",
            }}
          >
            Back to Home
          </a>
        </div>
      )}
    </div>
  )
}
