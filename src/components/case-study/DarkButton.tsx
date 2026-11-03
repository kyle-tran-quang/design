import type { ReactNode } from 'react'

type DarkButtonProps = {
  href: string
  icon: 'external' | 'back'
  children: ReactNode
  className?: string
}

function Icon({ name }: { name: DarkButtonProps['icon'] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-6 shrink-0"
    >
      {name === 'external' ? <path d="M7.5 16.5 16.5 7.5M8.5 7.5h8v8" /> : <path d="M10.25 6.75 4.75 12l5.5 5.25M5 12h14.25" />}
    </svg>
  )
}

/** Dark pill link used for "Launch prototype" and "Go back Home" (Framer Button: lighter on hover, black when pressed). */
export default function DarkButton({ href, icon, children, className = '' }: DarkButtonProps) {
  const external = icon === 'external'
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`group inline-flex items-center gap-2.5 rounded-xl bg-[#404040] py-2 pr-3.5 pl-4 type-body text-snow transition-colors duration-[400ms] hover:bg-[#5c5c5c] active:bg-black ${className}`}
    >
      <Icon name={icon} />
      {children}
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  )
}
