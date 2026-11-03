import type { ReactNode } from 'react'

type SectionIntroProps = {
  index: string
  title: string
  children: ReactNode
}

/** Tall title card that opens a section: "01/ Case studies" with its artwork. */
export default function SectionIntro({ index, title, children }: SectionIntroProps) {
  return (
    <div className="flex min-h-[25rem] shrink-0 flex-col justify-between gap-10 rounded-t-[40px] bg-cloud px-4 pt-12 pb-4 lg:h-[720px] lg:w-[342px] lg:self-center lg:pt-16">
      <h2 className="type-lede">
        <span className="block font-light text-accent">{index}</span>
        <span className="mt-1 block font-medium text-ink">{title}</span>
      </h2>
      {children}
    </div>
  )
}
