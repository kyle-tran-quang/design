import type { ReactNode } from 'react'

type PillButtonProps = {
  href: string
  icon: 'external' | 'back'
  children: ReactNode
  className?: string
}

function Icon({ name }: { name: PillButtonProps['icon'] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-6 shrink-0"
    >
      {name === 'external' ? <path d="M7.5 16.5 16.5 7.5M8.5 7.5h8v8" /> : <path d="M10.25 6.75 4.75 12l5.5 5.25M5 12h14.25" />}
    </svg>
  )
}

/**
 * Chunky pill link for "Launch prototype" and "Go back Home". At rest it's a white pill with a black outline sitting on
 * a solid black slab, like a raised key. On hover it fills with the accent orange and presses down onto the slab quickly; on
 * hover exit it rises back up with a springy overshoot. On click it squashes slightly.
 *
 * The link itself never moves (its bottom padding is the slab's room), only the inner face does. That keeps the hit
 * area steady, so the pointer can't flicker in and out of hover along the top edge as the face travels down.
 */
export default function PillButton({ href, icon, children, className = '' }: PillButtonProps) {
  const external = icon === 'external'
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`group inline-block rounded-full pb-1.5 outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      <span
        className="inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-white py-2.5 pr-5 pl-6 font-normal text-ink shadow-[0_6px_0_0_var(--color-ink)] [transition:translate_380ms_var(--rise),scale_380ms_var(--rise),box-shadow_380ms_var(--rise),background-color_200ms_ease-out] [--rise:cubic-bezier(0.34,1.7,0.5,1)] type-body group-hover:translate-y-1.5 group-hover:bg-accent group-hover:shadow-[0_0_0_0_var(--color-ink)] group-hover:[transition:translate_110ms_ease-out,scale_110ms_ease-out,box-shadow_110ms_ease-out,background-color_150ms_ease-out] group-active:scale-[0.97] motion-reduce:[transition:none]"
      >
        <Icon name={icon} />
        {children}
        {external && <span className="sr-only">(opens in a new tab)</span>}
      </span>
    </a>
  )
}
